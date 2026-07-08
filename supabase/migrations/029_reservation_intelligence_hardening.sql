-- Reservation Intelligence Hardening (Slice 4): completes the Derivation
-- Engine lifecycle for trip_reservations — managed-state tracking, system
-- sync, and cascade-aware deletion.
--
-- Two things land here:
--
-- 1. update_planner_item now flips metadata.managed_by_maycation to false
--    whenever it edits an item that is currently managed AND carries a
--    derived_from_reservation reference. This is scoped specifically to
--    reservation-derived items — NOT a general change to every derived item.
--    Stay-derived check-in/check-out items are untouched by this migration:
--    they never flip today, and they still won't after this change, because
--    the condition below only matches metadata->>'derived_from_reservation'.
--    (Per DERIVATION_ENGINE.md, this flag-flip is meant to be universal to
--    all derived items, but Stay Intelligence itself never implemented it,
--    and this slice was scoped to not modify Stay Intelligence — so the
--    flip is intentionally narrowed here rather than applied retroactively
--    to a system this slice isn't meant to touch.)
--
-- 2. sync_reservation_derived_item is new: the "system sync" RPC described
--    in DERIVATION_ENGINE.md's Synchronization section. It updates only the
--    fact-derived fields (title, time/day, location, confirmation code,
--    external url, reservation type, destination coordinates) on a managed
--    derived item. It never touches description (user notes), sort_order,
--    status, metadata.completed, or managed_by_maycation itself. It is a
--    no-op if no derived item exists, or if the derived item is no longer
--    managed (customized) — callers should treat a null return as "nothing
--    to sync" rather than an error.
--
-- delete_trip_reservation and delete_planner_item are unchanged — the
-- "ask before removing the derived item" decision is a client-orchestrated
-- sequence of existing RPCs, not new server logic.

-- ── update_planner_item: flip managed_by_maycation for reservation-derived items ──

drop function if exists public.update_planner_item(uuid, uuid, text, text, time, integer, text, text, text, text, text, text, jsonb);

create or replace function public.update_planner_item(
  target_trip_id uuid,
  target_item_id uuid,
  item_kind text,
  item_title text,
  start_time time,
  end_time_minutes integer,
  item_location text,
  item_notes text,
  item_confirmation_code text default null,
  item_address text default null,
  item_url text default null,
  item_reservation_type text default 'activity',
  item_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  item_day_id uuid;
  day_date date;
  trip_timezone text;
  start_minutes integer;
  existing_metadata jsonb;
  merged_metadata jsonb;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to update planner items.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to update planner items.';
  end if;

  if item_kind not in ('travel', 'reservation', 'activity', 'note') then
    raise exception 'Planner item kind is not valid.';
  end if;

  if nullif(btrim(item_title), '') is null then
    raise exception 'Planner item title is required.';
  end if;

  if start_time is not null and end_time_minutes is not null then
    start_minutes := extract(hour from start_time)::integer * 60
                   + extract(minute from start_time)::integer;
    if end_time_minutes < start_minutes then
      raise exception 'End time must be on or after start time.';
    end if;
  end if;

  select pi.trip_day_id, pi.metadata
  into item_day_id, existing_metadata
  from public.planner_items as pi
  where pi.id = target_item_id
    and pi.trip_id = target_trip_id
    and pi.deleted_at is null;

  if item_day_id is null then
    raise exception 'Planner item does not belong to this trip.';
  end if;

  select td.date, t.timezone
  into day_date, trip_timezone
  from public.trip_days as td
  inner join public.trips as t on t.id = td.trip_id
  where td.id = item_day_id
    and td.trip_id = target_trip_id;

  if day_date is null then
    raise exception 'Planner item day does not belong to this trip.';
  end if;

  -- Merge: new keys override old; keys with JSON null value are removed.
  -- Keys not present in item_metadata (e.g. completed) are preserved.
  merged_metadata := (
    select coalesce(jsonb_object_agg(k, v), '{}')
    from jsonb_each(coalesce(existing_metadata, '{}') || coalesce(item_metadata, '{}')) as t(k, v)
    where v is distinct from 'null'::jsonb
  );

  -- A user-initiated edit to a managed, reservation-derived item releases
  -- it from Maycation's management (DERIVATION_ENGINE.md step 6). Scoped to
  -- derived_from_reservation only — see migration header.
  if existing_metadata ? 'derived_from_reservation'
     and coalesce(existing_metadata->>'managed_by_maycation', 'false') = 'true' then
    merged_metadata := merged_metadata || jsonb_build_object('managed_by_maycation', false);
  end if;

  update public.planner_items
  set
    kind = item_kind::public.planner_item_kind,
    title = btrim(item_title),
    description = nullif(btrim(item_notes), ''),
    starts_at = case when start_time is null then null
                     else (day_date + start_time) at time zone trip_timezone end,
    ends_at = case when end_time_minutes is null then null
                   else (day_date + make_interval(mins => end_time_minutes)) at time zone trip_timezone end,
    timezone = trip_timezone,
    location_name = nullif(btrim(item_location), ''),
    location_address = nullif(btrim(item_address), ''),
    confirmation_code = nullif(btrim(item_confirmation_code), ''),
    external_url = nullif(btrim(item_url), ''),
    reservation_type = coalesce(nullif(btrim(item_reservation_type), ''), 'activity')::public.reservation_type,
    metadata = merged_metadata,
    updated_by = current_user_id
  where id = target_item_id
    and trip_id = target_trip_id
    and deleted_at is null;

  return target_item_id;
end;
$$;

revoke all on function public.update_planner_item(uuid, uuid, text, text, time, integer, text, text, text, text, text, text, jsonb) from public;
revoke all on function public.update_planner_item(uuid, uuid, text, text, time, integer, text, text, text, text, text, text, jsonb) from anon;
grant execute on function public.update_planner_item(uuid, uuid, text, text, time, integer, text, text, text, text, text, text, jsonb) to authenticated;

-- ── sync_reservation_derived_item ─────────────────────────────────────────────
-- System-initiated sync: updates only fact-derived fields on a still-managed
-- derived item. No-op (returns null) if no derived item exists, or if the
-- derived item has been customized (managed_by_maycation = false).

create or replace function public.sync_reservation_derived_item(
  target_trip_id uuid,
  target_reservation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  fact record;
  derived_item_id uuid;
  derived_metadata jsonb;
  derived_day_id uuid;
  trip_timezone text;
  mapped_reservation_type text := 'food';
begin
  if current_user_id is null then
    raise exception 'Authentication is required to sync a trip reservation.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to sync a trip reservation.';
  end if;

  select tr.*
  into fact
  from public.trip_reservations as tr
  where tr.id = target_reservation_id
    and tr.trip_id = target_trip_id
    and tr.deleted_at is null;

  if fact.id is null then
    raise exception 'Trip reservation does not belong to this trip.';
  end if;

  select pi.id, pi.metadata
  into derived_item_id, derived_metadata
  from public.planner_items as pi
  where pi.trip_id = target_trip_id
    and pi.metadata->>'derived_from_reservation' = target_reservation_id::text
    and pi.deleted_at is null;

  -- Nothing to sync: no derived item, or the user has customized it.
  if derived_item_id is null
     or coalesce(derived_metadata->>'managed_by_maycation', 'false') <> 'true' then
    return null;
  end if;

  select td.id, t.timezone
  into derived_day_id, trip_timezone
  from public.trip_days as td
  inner join public.trips as t on t.id = td.trip_id
  where td.trip_id = target_trip_id
    and td.date = fact.reservation_date;

  if derived_day_id is null then
    raise exception 'Reservation date must fall within the trip''s dates.';
  end if;

  if fact.reservation_type = 'activity' then
    mapped_reservation_type := 'activity';
  end if;

  update public.planner_items
  set
    trip_day_id = derived_day_id,
    title = fact.name,
    starts_at = case when fact.reservation_time is null then null
                     else (fact.reservation_date + fact.reservation_time) at time zone trip_timezone end,
    ends_at = null,
    timezone = trip_timezone,
    location_name = fact.place_name,
    location_address = fact.place_address,
    confirmation_code = fact.confirmation_code,
    external_url = fact.external_url,
    reservation_type = mapped_reservation_type::public.reservation_type,
    metadata = derived_metadata || jsonb_build_object(
      'destination_place_lat', fact.place_lat,
      'destination_place_lng', fact.place_lng
    ),
    updated_by = current_user_id
  where id = derived_item_id;

  return derived_item_id;
end;
$$;

revoke all on function public.sync_reservation_derived_item(uuid, uuid) from public;
revoke all on function public.sync_reservation_derived_item(uuid, uuid) from anon;
grant execute on function public.sync_reservation_derived_item(uuid, uuid) to authenticated;
