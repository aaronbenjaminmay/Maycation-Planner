-- Add day_type to trip_days and reservation_type to planner_items.
-- Both fields drive icon and label display only — no filtering, sorting, or automation.
--
-- Uses PostgreSQL enum types, consistent with the existing planner_item_kind,
-- planner_item_status, and trip_member_role enums in this schema.

-- ── Enum types ─────────────────────────────────────────────────────────────────

create type public.trip_day_type as enum (
  'activity',
  'travel',
  'relax',
  'explore',
  'special'
);

create type public.reservation_type as enum (
  'activity',
  'food',
  'lodging',
  'transportation'
);

-- ── Schema columns ─────────────────────────────────────────────────────────────

alter table public.trip_days
  add column day_type public.trip_day_type not null default 'activity';

alter table public.planner_items
  add column reservation_type public.reservation_type not null default 'activity';

-- ── get_trip_days: surface day_type ───────────────────────────────────────────
-- Drop and recreate because the RETURNS TABLE signature changes.

drop function if exists public.get_trip_days(uuid);

create or replace function public.get_trip_days(target_trip_id uuid)
returns table (
  id uuid,
  trip_id uuid,
  date date,
  label text,
  sort_order integer,
  day_type public.trip_day_type
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
    raise exception 'Authentication is required to load trip days.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
  ) then
    raise exception 'Trip access is required to load trip days.';
  end if;

  return query
  select
    td.id,
    td.trip_id,
    td.date,
    td.label,
    td.sort_order,
    td.day_type
  from public.trip_days as td
  where td.trip_id = target_trip_id
  order by td.sort_order asc, td.date asc;
end;
$$;

revoke all on function public.get_trip_days(uuid) from public;
revoke all on function public.get_trip_days(uuid) from anon;
grant execute on function public.get_trip_days(uuid) to authenticated;

-- ── get_trip_planner_items: surface reservation_type ──────────────────────────
-- Drop the version from migration 021 (11-param signature) and recreate.

drop function if exists public.get_trip_planner_items(uuid);

create or replace function public.get_trip_planner_items(target_trip_id uuid)
returns table (
  id uuid,
  trip_id uuid,
  trip_day_id uuid,
  kind public.planner_item_kind,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  location_name text,
  location_address text,
  confirmation_code text,
  external_url text,
  status public.planner_item_status,
  sort_order numeric,
  metadata jsonb,
  reservation_type public.reservation_type
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
    raise exception 'Authentication is required to load planner items.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
  ) then
    raise exception 'Trip access is required to load planner items.';
  end if;

  return query
  select
    pi.id,
    pi.trip_id,
    pi.trip_day_id,
    pi.kind,
    pi.title,
    pi.description,
    pi.starts_at,
    pi.ends_at,
    pi.location_name,
    pi.location_address,
    pi.confirmation_code,
    pi.external_url,
    pi.status,
    pi.sort_order,
    pi.metadata,
    pi.reservation_type
  from public.planner_items as pi
  where pi.trip_id = target_trip_id
    and pi.deleted_at is null
  order by
    pi.trip_day_id asc nulls last,
    pi.sort_order asc,
    pi.starts_at asc nulls last,
    pi.created_at asc;
end;
$$;

revoke all on function public.get_trip_planner_items(uuid) from public;
revoke all on function public.get_trip_planner_items(uuid) from anon;
grant execute on function public.get_trip_planner_items(uuid) to authenticated;

-- ── create_planner_item: accept reservation_type ──────────────────────────────
-- Drop the 021 version (11-param) and add item_reservation_type as the 12th param.
-- All previous callers remain compatible: new param defaults to 'activity'.

drop function if exists public.create_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text);

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
  item_reservation_type text default 'activity'
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
    status, sort_order, reservation_type, created_by, updated_by
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
    current_user_id,
    current_user_id
  )
  returning id into created_item_id;

  return created_item_id;
end;
$$;

revoke all on function public.create_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text) from public;
revoke all on function public.create_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text) from anon;
grant execute on function public.create_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text) to authenticated;

-- ── update_planner_item: accept reservation_type ──────────────────────────────
-- Drop the 021 version (11-param) and add item_reservation_type as the 12th param.

drop function if exists public.update_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text);

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
  item_reservation_type text default 'activity'
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
    updated_by = current_user_id
  where id = target_item_id
    and trip_id = target_trip_id
    and deleted_at is null;

  return target_item_id;
end;
$$;

revoke all on function public.update_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text) from public;
revoke all on function public.update_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text) from anon;
grant execute on function public.update_planner_item(uuid, uuid, text, text, time, time, text, text, text, text, text, text) to authenticated;

-- ── update_trip_day: edit label and day_type ──────────────────────────────────

create or replace function public.update_trip_day(
  target_trip_id uuid,
  target_day_id uuid,
  day_label text,
  new_day_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required to update a trip day.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to update a trip day.';
  end if;

  if new_day_type not in ('activity', 'travel', 'relax', 'explore', 'special') then
    raise exception 'Day type is not valid.';
  end if;

  update public.trip_days
  set
    label = nullif(btrim(day_label), ''),
    day_type = new_day_type::public.trip_day_type,
    updated_by = current_user_id
  where id = target_day_id
    and trip_id = target_trip_id;
end;
$$;

revoke all on function public.update_trip_day(uuid, uuid, text, text) from public;
revoke all on function public.update_trip_day(uuid, uuid, text, text) from anon;
grant execute on function public.update_trip_day(uuid, uuid, text, text) to authenticated;
