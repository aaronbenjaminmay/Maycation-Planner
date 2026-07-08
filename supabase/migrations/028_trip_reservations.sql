-- Trip reservations: per-trip booked-experience records (Reservation Intelligence Foundation).
--
-- A Trip Reservation represents a single booked experience — a dining
-- reservation or an activity/ticket booking. Unlike a Trip Stay (which spans
-- a date range), a reservation is a single event on a single date, with an
-- optional time.
--
-- Scope is deliberately narrow: 'dining' and 'activity' only.
--   - Lodging remains exclusively trip_stays' domain.
--   - Transportation is reserved for a future, separate fact system.
-- This uses a dedicated enum (trip_reservation_type), NOT the existing
-- public.reservation_type enum used by planner_items — that enum (and the
-- manual reservation-kind planner item flow that uses it) is intentionally
-- left untouched. See "Type mapping" below for how the two vocabularies meet.
--
-- Derivation: creating a reservation automatically derives exactly one
-- planner item (not two, unlike Stay's check-in/check-out pair — a
-- reservation is a single event). This migration wires create_trip_reservation
-- to call the existing create_planner_item RPC internally, so both inserts
-- happen in one transaction — either both succeed or neither does.
--
-- Type mapping (trip_reservation_type -> planner_items.reservation_type):
--   'dining'   -> 'food'      (closest existing semantic value)
--   'activity' -> 'activity'  (direct passthrough)
--
-- Per DERIVATION_ENGINE.md, the derived item stores a one-directional soft
-- reference (metadata.derived_from_reservation) back to the fact. The fact
-- does NOT store the derived item's id — the planner_items metadata query
-- is the single source of truth for that relationship.
--
-- Slice 1 scope: data layer only. update_trip_reservation updates the fact
-- row only (does not yet sync the derived item — that is Slice 4).
-- delete_trip_reservation soft-deletes the fact only (does not yet cascade
-- or prompt about the derived item — that is also Slice 4).
--
-- All writes go through security definer RPCs. The RLS policies below
-- provide defense-in-depth for direct table access.

-- ── Enum type ─────────────────────────────────────────────────────────────────

create type public.trip_reservation_type as enum (
  'dining',
  'activity'
);

-- ── Table ─────────────────────────────────────────────────────────────────────

create table public.trip_reservations (
  id                uuid        primary key default gen_random_uuid(),
  trip_id           uuid        not null references public.trips(id) on delete cascade,
  reservation_type  public.trip_reservation_type not null,
  name              text        not null,
  place_name        text,
  place_address     text,
  place_lat         numeric,
  place_lng         numeric,
  reservation_date  date        not null,
  reservation_time  time,
  confirmation_code text,
  external_url      text,
  notes             text,
  created_by        uuid        references auth.users(id) on delete set null,
  updated_by        uuid        references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create index trip_reservations_trip_id_deleted_at_idx
  on public.trip_reservations (trip_id, deleted_at);

create index trip_reservations_trip_id_reservation_date_idx
  on public.trip_reservations (trip_id, reservation_date);

create trigger trip_reservations_set_updated_at
before update on public.trip_reservations
for each row
execute function public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.trip_reservations enable row level security;

create policy "Members can read trip reservations"
on public.trip_reservations
for select
to authenticated
using (public.is_trip_member(trip_id));

create policy "Owners and editors can create trip reservations"
on public.trip_reservations
for insert
to authenticated
with check (
  public.has_trip_role(
    trip_id,
    array['owner', 'editor']::public.trip_member_role[]
  )
);

create policy "Owners and editors can update trip reservations"
on public.trip_reservations
for update
to authenticated
using (
  public.has_trip_role(
    trip_id,
    array['owner', 'editor']::public.trip_member_role[]
  )
)
with check (
  public.has_trip_role(
    trip_id,
    array['owner', 'editor']::public.trip_member_role[]
  )
);

create policy "Owners can delete trip reservations"
on public.trip_reservations
for delete
to authenticated
using (public.is_trip_owner(trip_id));

-- ── get_trip_reservations ─────────────────────────────────────────────────────

create or replace function public.get_trip_reservations(target_trip_id uuid)
returns table (
  id                uuid,
  trip_id           uuid,
  reservation_type  public.trip_reservation_type,
  name              text,
  place_name        text,
  place_address     text,
  place_lat         numeric,
  place_lng         numeric,
  reservation_date  date,
  reservation_time  time,
  confirmation_code text,
  external_url      text,
  notes             text,
  created_at        timestamptz,
  updated_at        timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required to load trip reservations.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
  ) then
    raise exception 'Trip access is required to load trip reservations.';
  end if;

  return query
  select
    tr.id,
    tr.trip_id,
    tr.reservation_type,
    tr.name,
    tr.place_name,
    tr.place_address,
    tr.place_lat,
    tr.place_lng,
    tr.reservation_date,
    tr.reservation_time,
    tr.confirmation_code,
    tr.external_url,
    tr.notes,
    tr.created_at,
    tr.updated_at
  from public.trip_reservations as tr
  where tr.trip_id = target_trip_id
    and tr.deleted_at is null
  order by tr.reservation_date asc, tr.reservation_time asc nulls last;
end;
$$;

revoke all on function public.get_trip_reservations(uuid) from public;
revoke all on function public.get_trip_reservations(uuid) from anon;
grant execute on function public.get_trip_reservations(uuid) to authenticated;

-- ── create_trip_reservation ───────────────────────────────────────────────────
-- Creates the fact row, then derives exactly one planner item in the same
-- transaction (via a nested call to the existing create_planner_item RPC).
-- If either insert fails, both roll back.

create or replace function public.create_trip_reservation(
  target_trip_id            uuid,
  reservation_type_input    text,
  reservation_name          text,
  reservation_date_input    date,
  reservation_place_name    text    default null,
  reservation_place_address text    default null,
  reservation_place_lat     numeric default null,
  reservation_place_lng     numeric default null,
  reservation_time_input    time    default null,
  reservation_confirmation_code text default null,
  reservation_external_url  text    default null,
  reservation_notes         text    default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  created_reservation_id uuid;
  derived_day_id uuid;
  derived_planner_item_kind text := 'food';
  derived_item_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to create a trip reservation.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to create a trip reservation.';
  end if;

  if reservation_type_input not in ('dining', 'activity') then
    raise exception 'Reservation type is not valid.';
  end if;

  if nullif(btrim(reservation_name), '') is null then
    raise exception 'Reservation name is required.';
  end if;

  -- A reservation must land on an existing trip day so the derived planner
  -- item has somewhere to live. create_planner_item requires a non-null
  -- trip_day_id; there is no "unscheduled" state for a reservation fact.
  select td.id
  into derived_day_id
  from public.trip_days as td
  where td.trip_id = target_trip_id
    and td.date = reservation_date_input;

  if derived_day_id is null then
    raise exception 'Reservation date must fall within the trip''s dates.';
  end if;

  insert into public.trip_reservations (
    trip_id, reservation_type, name, place_name, place_address,
    place_lat, place_lng, reservation_date, reservation_time,
    confirmation_code, external_url, notes, created_by, updated_by
  )
  values (
    target_trip_id,
    reservation_type_input::public.trip_reservation_type,
    btrim(reservation_name),
    nullif(btrim(coalesce(reservation_place_name, '')), ''),
    nullif(btrim(coalesce(reservation_place_address, '')), ''),
    reservation_place_lat,
    reservation_place_lng,
    reservation_date_input,
    reservation_time_input,
    nullif(btrim(coalesce(reservation_confirmation_code, '')), ''),
    nullif(btrim(coalesce(reservation_external_url, '')), ''),
    nullif(btrim(coalesce(reservation_notes, '')), ''),
    current_user_id,
    current_user_id
  )
  returning id into created_reservation_id;

  -- Type mapping: trip_reservation_type -> planner_items.reservation_type
  if reservation_type_input = 'activity' then
    derived_planner_item_kind := 'activity';
  end if;

  select public.create_planner_item(
    target_trip_id,
    derived_day_id,
    'reservation',
    btrim(reservation_name),
    reservation_time_input,
    null,
    reservation_place_name,
    reservation_notes,
    reservation_confirmation_code,
    reservation_place_address,
    reservation_external_url,
    derived_planner_item_kind,
    jsonb_build_object(
      'derived_from_reservation', created_reservation_id,
      'managed_by_maycation', true,
      'destination_place_lat', reservation_place_lat,
      'destination_place_lng', reservation_place_lng
    )
  )
  into derived_item_id;

  return created_reservation_id;
end;
$$;

revoke all on function public.create_trip_reservation(uuid, text, text, date, text, text, numeric, numeric, time, text, text, text) from public;
revoke all on function public.create_trip_reservation(uuid, text, text, date, text, text, numeric, numeric, time, text, text, text) from anon;
grant execute on function public.create_trip_reservation(uuid, text, text, date, text, text, numeric, numeric, time, text, text, text) to authenticated;

-- ── update_trip_reservation ───────────────────────────────────────────────────
-- Slice 1 scope: updates the fact row only. Does not yet sync the derived
-- planner item — that wiring is Slice 4 (Hardening).

create or replace function public.update_trip_reservation(
  target_trip_id             uuid,
  target_reservation_id      uuid,
  reservation_type_input     text,
  reservation_name           text,
  reservation_date_input     date,
  reservation_place_name     text    default null,
  reservation_place_address  text    default null,
  reservation_place_lat      numeric default null,
  reservation_place_lng      numeric default null,
  reservation_time_input     time    default null,
  reservation_confirmation_code text default null,
  reservation_external_url   text    default null,
  reservation_notes          text    default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required to update a trip reservation.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to update a trip reservation.';
  end if;

  if not exists (
    select 1
    from public.trip_reservations as tr
    where tr.id = target_reservation_id
      and tr.trip_id = target_trip_id
      and tr.deleted_at is null
  ) then
    raise exception 'Trip reservation does not belong to this trip.';
  end if;

  if reservation_type_input not in ('dining', 'activity') then
    raise exception 'Reservation type is not valid.';
  end if;

  if nullif(btrim(reservation_name), '') is null then
    raise exception 'Reservation name is required.';
  end if;

  if not exists (
    select 1
    from public.trip_days as td
    where td.trip_id = target_trip_id
      and td.date = reservation_date_input
  ) then
    raise exception 'Reservation date must fall within the trip''s dates.';
  end if;

  update public.trip_reservations
  set
    reservation_type  = reservation_type_input::public.trip_reservation_type,
    name              = btrim(reservation_name),
    place_name        = nullif(btrim(coalesce(reservation_place_name, '')), ''),
    place_address     = nullif(btrim(coalesce(reservation_place_address, '')), ''),
    place_lat         = reservation_place_lat,
    place_lng         = reservation_place_lng,
    reservation_date  = reservation_date_input,
    reservation_time  = reservation_time_input,
    confirmation_code = nullif(btrim(coalesce(reservation_confirmation_code, '')), ''),
    external_url      = nullif(btrim(coalesce(reservation_external_url, '')), ''),
    notes             = nullif(btrim(coalesce(reservation_notes, '')), ''),
    updated_by        = current_user_id
  where id = target_reservation_id
    and trip_id = target_trip_id
    and deleted_at is null;

  return target_reservation_id;
end;
$$;

revoke all on function public.update_trip_reservation(uuid, uuid, text, text, date, text, text, numeric, numeric, time, text, text, text) from public;
revoke all on function public.update_trip_reservation(uuid, uuid, text, text, date, text, text, numeric, numeric, time, text, text, text) from anon;
grant execute on function public.update_trip_reservation(uuid, uuid, text, text, date, text, text, numeric, numeric, time, text, text, text) to authenticated;

-- ── delete_trip_reservation ───────────────────────────────────────────────────
-- Slice 1 scope: soft-deletes the fact row only. Does not yet cascade or
-- prompt about the derived planner item — that is Slice 4 (Hardening).

create or replace function public.delete_trip_reservation(
  target_trip_id        uuid,
  target_reservation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required to delete a trip reservation.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to delete a trip reservation.';
  end if;

  update public.trip_reservations
  set deleted_at = now()
  where id = target_reservation_id
    and trip_id = target_trip_id
    and deleted_at is null;

  return target_reservation_id;
end;
$$;

revoke all on function public.delete_trip_reservation(uuid, uuid) from public;
revoke all on function public.delete_trip_reservation(uuid, uuid) from anon;
grant execute on function public.delete_trip_reservation(uuid, uuid) to authenticated;
