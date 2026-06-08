-- Planner item edit/delete RPCs.
--
-- Mutations stay behind explicit owner/editor checks and never depend on
-- title, notes, or inferred card type.

create or replace function public.update_planner_item(
  target_trip_id uuid,
  target_item_id uuid,
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

  select
    td.date,
    t.timezone
  into
    day_date,
    trip_timezone
  from public.trip_days as td
  inner join public.trips as t
    on t.id = td.trip_id
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
    starts_at = case
      when start_time is null then null
      else (day_date + start_time) at time zone trip_timezone
    end,
    ends_at = case
      when end_time is null then null
      else (day_date + end_time) at time zone trip_timezone
    end,
    timezone = trip_timezone,
    location_name = nullif(btrim(item_location), ''),
    updated_by = current_user_id
  where id = target_item_id
    and trip_id = target_trip_id
    and deleted_at is null;

  return target_item_id;
end;
$$;

create or replace function public.delete_planner_item(
  target_trip_id uuid,
  target_item_id uuid
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
    raise exception 'Authentication is required to delete planner items.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to delete planner items.';
  end if;

  update public.planner_items
  set
    deleted_at = now(),
    updated_by = current_user_id
  where id = target_item_id
    and trip_id = target_trip_id
    and deleted_at is null;

  if not found then
    raise exception 'Planner item does not belong to this trip.';
  end if;

  return target_item_id;
end;
$$;

revoke all on function public.update_planner_item(
  uuid,
  uuid,
  text,
  text,
  time,
  time,
  text,
  text
) from public;

revoke all on function public.update_planner_item(
  uuid,
  uuid,
  text,
  text,
  time,
  time,
  text,
  text
) from anon;

grant execute on function public.update_planner_item(
  uuid,
  uuid,
  text,
  text,
  time,
  time,
  text,
  text
) to authenticated;

revoke all on function public.delete_planner_item(uuid, uuid) from public;
revoke all on function public.delete_planner_item(uuid, uuid) from anon;
grant execute on function public.delete_planner_item(uuid, uuid) to authenticated;
