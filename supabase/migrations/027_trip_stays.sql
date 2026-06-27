-- Trip stays: per-trip lodging records.
--
-- A Trip Stay represents a continuous booking at one property.
-- Check-in and check-out dates use a half-open interval convention:
--   [check_in_date, check_out_date)
-- The family sleeps at this property from check_in_date through
-- check_out_date - 1. They leave on check_out_date.
--
-- This enables same-day hotel switches: one stay's check_out_date
-- equals the next stay's check_in_date with no overlap and no gap.
--
-- Overlap enforcement is in the RPCs. A PostgreSQL daterange exclusion
-- constraint (btree_gist) is the upgrade path if RPC-level checks
-- prove insufficient.
--
-- All writes go through security definer RPCs. The RLS policies
-- below provide defense-in-depth for direct table access.

-- ── Table ─────────────────────────────────────────────────────────────────────

create table public.trip_stays (
  id                uuid        primary key default gen_random_uuid(),
  trip_id           uuid        not null references public.trips(id) on delete cascade,
  place_name        text        not null,
  place_address     text,
  place_lat         numeric,
  place_lng         numeric,
  check_in_date     date        not null,
  check_in_time     time,
  check_out_date    date        not null,
  check_out_time    time,
  confirmation_code text,
  notes             text,
  created_by        uuid        references auth.users(id) on delete set null,
  updated_by        uuid        references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  constraint trip_stays_date_range_check check (check_out_date > check_in_date)
);

create index trip_stays_trip_id_deleted_at_idx
  on public.trip_stays (trip_id, deleted_at);

create index trip_stays_trip_id_check_in_date_idx
  on public.trip_stays (trip_id, check_in_date);

create trigger trip_stays_set_updated_at
before update on public.trip_stays
for each row
execute function public.set_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────

alter table public.trip_stays enable row level security;

create policy "Members can read trip stays"
on public.trip_stays
for select
to authenticated
using (public.is_trip_member(trip_id));

create policy "Owners and editors can create trip stays"
on public.trip_stays
for insert
to authenticated
with check (
  public.has_trip_role(
    trip_id,
    array['owner', 'editor']::public.trip_member_role[]
  )
);

create policy "Owners and editors can update trip stays"
on public.trip_stays
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

create policy "Owners can delete trip stays"
on public.trip_stays
for delete
to authenticated
using (public.is_trip_owner(trip_id));

-- ── get_trip_stays ────────────────────────────────────────────────────────────

create or replace function public.get_trip_stays(target_trip_id uuid)
returns table (
  id                uuid,
  trip_id           uuid,
  place_name        text,
  place_address     text,
  place_lat         numeric,
  place_lng         numeric,
  check_in_date     date,
  check_in_time     time,
  check_out_date    date,
  check_out_time    time,
  confirmation_code text,
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
    raise exception 'Authentication is required to load trip stays.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
  ) then
    raise exception 'Trip access is required to load trip stays.';
  end if;

  return query
  select
    ts.id,
    ts.trip_id,
    ts.place_name,
    ts.place_address,
    ts.place_lat,
    ts.place_lng,
    ts.check_in_date,
    ts.check_in_time,
    ts.check_out_date,
    ts.check_out_time,
    ts.confirmation_code,
    ts.notes,
    ts.created_at,
    ts.updated_at
  from public.trip_stays as ts
  where ts.trip_id = target_trip_id
    and ts.deleted_at is null
  order by ts.check_in_date asc;
end;
$$;

revoke all on function public.get_trip_stays(uuid) from public;
revoke all on function public.get_trip_stays(uuid) from anon;
grant execute on function public.get_trip_stays(uuid) to authenticated;

-- ── create_trip_stay ──────────────────────────────────────────────────────────

create or replace function public.create_trip_stay(
  target_trip_id         uuid,
  stay_place_name        text,
  stay_check_in_date     date,
  stay_check_out_date    date,
  stay_place_address     text    default null,
  stay_place_lat         numeric default null,
  stay_place_lng         numeric default null,
  stay_check_in_time     time    default null,
  stay_check_out_time    time    default null,
  stay_confirmation_code text    default null,
  stay_notes             text    default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  created_stay_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to create a trip stay.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to create a trip stay.';
  end if;

  if nullif(btrim(stay_place_name), '') is null then
    raise exception 'Property name is required.';
  end if;

  if stay_check_out_date <= stay_check_in_date then
    raise exception 'Check-out date must be after check-in date.';
  end if;

  -- Half-open interval overlap: [check_in_date, check_out_date)
  -- Two intervals overlap if A.start < B.end AND A.end > B.start
  if exists (
    select 1
    from public.trip_stays as ts
    where ts.trip_id = target_trip_id
      and ts.deleted_at is null
      and ts.check_in_date < stay_check_out_date
      and ts.check_out_date > stay_check_in_date
  ) then
    raise exception 'This stay overlaps with an existing stay for this trip.';
  end if;

  insert into public.trip_stays (
    trip_id, place_name, place_address, place_lat, place_lng,
    check_in_date, check_in_time, check_out_date, check_out_time,
    confirmation_code, notes, created_by, updated_by
  )
  values (
    target_trip_id,
    btrim(stay_place_name),
    nullif(btrim(coalesce(stay_place_address, '')), ''),
    stay_place_lat,
    stay_place_lng,
    stay_check_in_date,
    stay_check_in_time,
    stay_check_out_date,
    stay_check_out_time,
    nullif(btrim(coalesce(stay_confirmation_code, '')), ''),
    nullif(btrim(coalesce(stay_notes, '')), ''),
    current_user_id,
    current_user_id
  )
  returning id into created_stay_id;

  return created_stay_id;
end;
$$;

revoke all on function public.create_trip_stay(uuid, text, date, date, text, numeric, numeric, time, time, text, text) from public;
revoke all on function public.create_trip_stay(uuid, text, date, date, text, numeric, numeric, time, time, text, text) from anon;
grant execute on function public.create_trip_stay(uuid, text, date, date, text, numeric, numeric, time, time, text, text) to authenticated;

-- ── update_trip_stay ──────────────────────────────────────────────────────────

create or replace function public.update_trip_stay(
  target_trip_id         uuid,
  target_stay_id         uuid,
  stay_place_name        text,
  stay_check_in_date     date,
  stay_check_out_date    date,
  stay_place_address     text    default null,
  stay_place_lat         numeric default null,
  stay_place_lng         numeric default null,
  stay_check_in_time     time    default null,
  stay_check_out_time    time    default null,
  stay_confirmation_code text    default null,
  stay_notes             text    default null
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
    raise exception 'Authentication is required to update a trip stay.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to update a trip stay.';
  end if;

  if not exists (
    select 1
    from public.trip_stays as ts
    where ts.id = target_stay_id
      and ts.trip_id = target_trip_id
      and ts.deleted_at is null
  ) then
    raise exception 'Trip stay does not belong to this trip.';
  end if;

  if nullif(btrim(stay_place_name), '') is null then
    raise exception 'Property name is required.';
  end if;

  if stay_check_out_date <= stay_check_in_date then
    raise exception 'Check-out date must be after check-in date.';
  end if;

  -- Overlap check excludes the row being updated
  if exists (
    select 1
    from public.trip_stays as ts
    where ts.trip_id = target_trip_id
      and ts.id <> target_stay_id
      and ts.deleted_at is null
      and ts.check_in_date < stay_check_out_date
      and ts.check_out_date > stay_check_in_date
  ) then
    raise exception 'This stay overlaps with an existing stay for this trip.';
  end if;

  update public.trip_stays
  set
    place_name        = btrim(stay_place_name),
    place_address     = nullif(btrim(coalesce(stay_place_address, '')), ''),
    place_lat         = stay_place_lat,
    place_lng         = stay_place_lng,
    check_in_date     = stay_check_in_date,
    check_in_time     = stay_check_in_time,
    check_out_date    = stay_check_out_date,
    check_out_time    = stay_check_out_time,
    confirmation_code = nullif(btrim(coalesce(stay_confirmation_code, '')), ''),
    notes             = nullif(btrim(coalesce(stay_notes, '')), ''),
    updated_by        = current_user_id
  where id = target_stay_id
    and trip_id = target_trip_id
    and deleted_at is null;

  return target_stay_id;
end;
$$;

revoke all on function public.update_trip_stay(uuid, uuid, text, date, date, text, numeric, numeric, time, time, text, text) from public;
revoke all on function public.update_trip_stay(uuid, uuid, text, date, date, text, numeric, numeric, time, time, text, text) from anon;
grant execute on function public.update_trip_stay(uuid, uuid, text, date, date, text, numeric, numeric, time, time, text, text) to authenticated;

-- ── delete_trip_stay ──────────────────────────────────────────────────────────

create or replace function public.delete_trip_stay(
  target_trip_id uuid,
  target_stay_id uuid
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
    raise exception 'Authentication is required to delete a trip stay.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to delete a trip stay.';
  end if;

  update public.trip_stays
  set deleted_at = now()
  where id = target_stay_id
    and trip_id = target_trip_id
    and deleted_at is null;

  return target_stay_id;
end;
$$;

revoke all on function public.delete_trip_stay(uuid, uuid) from public;
revoke all on function public.delete_trip_stay(uuid, uuid) from anon;
grant execute on function public.delete_trip_stay(uuid, uuid) to authenticated;
