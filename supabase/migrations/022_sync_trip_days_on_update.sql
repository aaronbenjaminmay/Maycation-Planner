-- Sync trip_days when trip date range is edited.
--
-- Replaces the update_trip function from migration 015. The original version
-- intentionally deferred day sync; this migration implements it.
--
-- Day sync strategy:
--   1. Delete trip_day rows outside the new date range.
--      planner_items.trip_day_id is set to null (ON DELETE SET NULL), so
--      planner item content is preserved as unattached items, not lost.
--   2. Recalculate sort_order for remaining days (two passes to avoid
--      transient violations on the trip_days_trip_id_sort_order_key unique
--      constraint while reordering in place).
--   3. Insert new trip_day rows for dates added by the edit.
--      ON CONFLICT DO NOTHING makes re-applying the same range a no-op.

create or replace function public.update_trip(
  target_trip_id uuid,
  trip_name text,
  location text,
  starts_on date,
  ends_on date,
  travel_type text
)
returns setof public.trips
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_name text := btrim(trip_name);
  normalized_location text := nullif(btrim(location), '');
  new_starts_on date := starts_on;
  new_ends_on date := ends_on;
  normalized_travel_type text := travel_type;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to update a trip.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to update trip basics.';
  end if;

  if nullif(normalized_name, '') is null then
    raise exception 'Trip name is required.';
  end if;

  if new_starts_on is null or new_ends_on is null then
    raise exception 'Start date and end date are required.';
  end if;

  if new_ends_on < new_starts_on then
    raise exception 'End date must be on or after the start date.';
  end if;

  if normalized_travel_type is null
    or normalized_travel_type not in ('Plane', 'Road Trip', 'Train', 'Cruise', 'Other')
  then
    raise exception 'Travel type is not valid.';
  end if;

  -- Update the trip row.
  update public.trips as t
  set
    name = normalized_name,
    destination = normalized_location,
    starts_on = new_starts_on,
    ends_on = new_ends_on,
    metadata = coalesce(t.metadata, '{}'::jsonb)
      || jsonb_build_object('travel_type', normalized_travel_type),
    updated_at = now(),
    updated_by = current_user_id
  where t.id = target_trip_id
    and t.archived_at is null;

  -- If the trip was not found or is archived, return an empty result set.
  -- The caller (trips.ts updateTrip) treats an empty result as a failure.
  if not found then
    return;
  end if;

  -- Remove trip_days that fall outside the new date range.
  -- The foreign key planner_items.trip_day_id is ON DELETE SET NULL, so any
  -- planner items assigned to removed days become unattached (trip_day_id = null)
  -- rather than being deleted.
  delete from public.trip_days
  where trip_id = target_trip_id
    and (date < new_starts_on or date > new_ends_on);

  -- Recalculate sort_order for all remaining days using two passes.
  -- Pass 1: shift to safe negative space to avoid transient collisions on the
  -- (trip_id, sort_order) unique constraint while the values are in flux.
  update public.trip_days
  set sort_order = -(date - new_starts_on)::integer - 1
  where trip_id = target_trip_id;

  -- Pass 2: set correct 0-indexed sort_order relative to the new start date,
  -- matching the same ordering convention used in create_trip_with_days.
  update public.trip_days
  set
    sort_order = (date - new_starts_on)::integer,
    updated_by = current_user_id
  where trip_id = target_trip_id;

  -- Insert new trip_day rows for dates that are now in range but do not yet
  -- exist. ON CONFLICT DO NOTHING makes re-applying the same range a no-op and
  -- safely skips days that were already in range before the edit.
  insert into public.trip_days (trip_id, date, sort_order, created_by, updated_by)
  select
    target_trip_id,
    day::date,
    (day::date - new_starts_on)::integer,
    current_user_id,
    current_user_id
  from generate_series(new_starts_on, new_ends_on, interval '1 day') as day
  on conflict (trip_id, date) do nothing;

  return query
  select * from public.trips
  where id = target_trip_id;
end;
$$;

revoke all on function public.update_trip(uuid, text, text, date, date, text) from public;
revoke all on function public.update_trip(uuid, text, text, date, date, text) from anon;
grant execute on function public.update_trip(uuid, text, text, date, date, text) to authenticated;
