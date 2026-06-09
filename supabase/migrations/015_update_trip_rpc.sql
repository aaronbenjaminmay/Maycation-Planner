-- Trip basics editing for v0.8.0.
--
-- Date edits intentionally update only the trips row. Trip day regeneration,
-- deletion, and planner item movement are deferred until a dedicated day range
-- migration flow exists.

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

  return query
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
    and t.archived_at is null
  returning
    t.*;
end;
$$;

revoke all on function public.update_trip(uuid, text, text, date, date, text) from public;
revoke all on function public.update_trip(uuid, text, text, date, date, text) from anon;
grant execute on function public.update_trip(uuid, text, text, date, date, text) to authenticated;
