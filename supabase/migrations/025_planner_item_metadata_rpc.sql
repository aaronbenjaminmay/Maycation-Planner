-- Extend create_planner_item and update_planner_item with an optional
-- item_metadata jsonb parameter.
--
-- CREATE: inserts the provided metadata (default empty object).
-- UPDATE: merges provided metadata into existing metadata; keys whose
--         new value is JSON null are removed, preserving fields written
--         by other RPCs (e.g. toggle_planner_item_completion → completed).
--
-- This is an additive, non-breaking change — all existing callers continue
-- to work because the new parameter defaults to '{}'::jsonb.

-- ── create_planner_item: add item_metadata ────────────────────────────────

drop function if exists public.create_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text);

create or replace function public.create_planner_item(
  target_trip_id uuid,
  target_trip_day_id uuid,
  item_kind text,
  item_title text,
  start_time time,
  end_time time,
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
  day_date date;
  trip_timezone text;
  next_sort_order numeric;
  created_item_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to create planner items.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to create planner items.';
  end if;

  if item_kind not in ('travel', 'reservation', 'activity', 'note') then
    raise exception 'Planner item kind is not valid.';
  end if;

  if nullif(btrim(item_title), '') is null then
    raise exception 'Planner item title is required.';
  end if;

  select td.date, t.timezone
  into day_date, trip_timezone
  from public.trip_days as td
  inner join public.trips as t on t.id = td.trip_id
  where td.id = target_trip_day_id
    and td.trip_id = target_trip_id;

  if day_date is null then
    raise exception 'Trip day does not belong to this trip.';
  end if;

  if start_time is not null
    and end_time is not null
    and end_time < start_time
  then
    raise exception 'End time must be on or after start time.';
  end if;

  select coalesce(max(pi.sort_order), -1) + 1
  into next_sort_order
  from public.planner_items as pi
  where pi.trip_id = target_trip_id
    and pi.trip_day_id = target_trip_day_id
    and pi.deleted_at is null;

  insert into public.planner_items (
    trip_id, trip_day_id, kind, title, description,
    starts_at, ends_at, timezone,
    location_name, location_address, confirmation_code, external_url,
    status, sort_order, reservation_type, metadata, created_by, updated_by
  )
  values (
    target_trip_id,
    target_trip_day_id,
    item_kind::public.planner_item_kind,
    btrim(item_title),
    nullif(btrim(item_notes), ''),
    case when start_time is null then null
         else (day_date + start_time) at time zone trip_timezone end,
    case when end_time is null then null
         else (day_date + end_time) at time zone trip_timezone end,
    trip_timezone,
    nullif(btrim(item_location), ''),
    nullif(btrim(item_address), ''),
    nullif(btrim(item_confirmation_code), ''),
    nullif(btrim(item_url), ''),
    'planned'::public.planner_item_status,
    next_sort_order,
    coalesce(nullif(btrim(item_reservation_type), ''), 'activity')::public.reservation_type,
    coalesce(item_metadata, '{}'),
    current_user_id,
    current_user_id
  )
  returning id into created_item_id;

  return created_item_id;
end;
$$;

revoke all on function public.create_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text, jsonb) from public;
revoke all on function public.create_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text, jsonb) from anon;
grant execute on function public.create_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text, jsonb) to authenticated;

-- ── update_planner_item: add item_metadata ────────────────────────────────

drop function if exists public.update_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text);

create or replace function public.update_planner_item(
  target_trip_id uuid,
  target_item_id uuid,
  item_kind text,
  item_title text,
  start_time time,
  end_time time,
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

  if start_time is not null
    and end_time is not null
    and end_time < start_time
  then
    raise exception 'End time must be on or after start time.';
  end if;

  select pi.trip_day_id
  into item_day_id
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

  update public.planner_items
  set
    kind = item_kind::public.planner_item_kind,
    title = btrim(item_title),
    description = nullif(btrim(item_notes), ''),
    starts_at = case when start_time is null then null
                     else (day_date + start_time) at time zone trip_timezone end,
    ends_at = case when end_time is null then null
                   else (day_date + end_time) at time zone trip_timezone end,
    timezone = trip_timezone,
    location_name = nullif(btrim(item_location), ''),
    location_address = nullif(btrim(item_address), ''),
    confirmation_code = nullif(btrim(item_confirmation_code), ''),
    external_url = nullif(btrim(item_url), ''),
    reservation_type = coalesce(nullif(btrim(item_reservation_type), ''), 'activity')::public.reservation_type,
    -- Merge: new keys override old; keys with JSON null value are removed.
    -- Keys not present in item_metadata (e.g. completed) are preserved.
    metadata = (
      select coalesce(jsonb_object_agg(k, v), '{}')
      from jsonb_each(coalesce(metadata, '{}') || coalesce(item_metadata, '{}')) as t(k, v)
      where v is distinct from 'null'::jsonb
    ),
    updated_by = current_user_id
  where id = target_item_id
    and trip_id = target_trip_id
    and deleted_at is null;

  return target_item_id;
end;
$$;

revoke all on function public.update_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text, jsonb) from public;
revoke all on function public.update_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text, jsonb) from anon;
grant execute on function public.update_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text, jsonb) to authenticated;
