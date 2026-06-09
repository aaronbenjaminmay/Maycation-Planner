-- Planner item foundation RPCs.
--
-- These functions keep planner item reads/writes behind explicit membership
-- checks and preserve the one canonical planner_items model.

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
  sort_order numeric
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
    pi.sort_order
  from public.planner_items as pi
  where pi.trip_id = target_trip_id
    and pi.deleted_at is null
  order by pi.trip_day_id asc nulls last, pi.sort_order asc, pi.starts_at asc nulls last, pi.created_at asc;
end;
$$;

create or replace function public.create_planner_item(
  target_trip_id uuid,
  target_trip_day_id uuid,
  item_kind text,
  item_title text,
  start_time time,
  end_time time,
  item_location text,
  item_notes text
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

  select
    td.date,
    t.timezone
  into
    day_date,
    trip_timezone
  from public.trip_days as td
  inner join public.trips as t
    on t.id = td.trip_id
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
    trip_id,
    trip_day_id,
    kind,
    title,
    description,
    starts_at,
    ends_at,
    timezone,
    location_name,
    status,
    sort_order,
    created_by,
    updated_by
  )
  values (
    target_trip_id,
    target_trip_day_id,
    item_kind::public.planner_item_kind,
    btrim(item_title),
    nullif(btrim(item_notes), ''),
    case
      when start_time is null then null
      else (day_date + start_time) at time zone trip_timezone
    end,
    case
      when end_time is null then null
      else (day_date + end_time) at time zone trip_timezone
    end,
    trip_timezone,
    nullif(btrim(item_location), ''),
    'planned'::public.planner_item_status,
    next_sort_order,
    current_user_id,
    current_user_id
  )
  returning id into created_item_id;

  return created_item_id;
end;
$$;

revoke all on function public.get_trip_planner_items(uuid) from public;
revoke all on function public.get_trip_planner_items(uuid) from anon;
grant execute on function public.get_trip_planner_items(uuid) to authenticated;

revoke all on function public.create_planner_item(
  uuid,
  uuid,
  text,
  text,
  time,
  time,
  text,
  text
) from public;

revoke all on function public.create_planner_item(
  uuid,
  uuid,
  text,
  text,
  time,
  time,
  text,
  text
) from anon;

grant execute on function public.create_planner_item(
  uuid,
  uuid,
  text,
  text,
  time,
  time,
  text,
  text
) to authenticated;
