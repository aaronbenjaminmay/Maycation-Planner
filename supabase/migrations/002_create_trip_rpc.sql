-- Atomic trip creation for Maycation Planner.
--
-- This function avoids the first-trip RLS bootstrap problem by creating the
-- trip, owner membership, and trip days inside one security definer function.

create or replace function public.create_trip_with_days(
  trip_name text,
  location text,
  starts_on date,
  ends_on date,
  travel_type text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  created_trip_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to create a trip.';
  end if;

  if nullif(btrim(trip_name), '') is null then
    raise exception 'Trip name is required.';
  end if;

  if starts_on is null or ends_on is null then
    raise exception 'Start date and end date are required.';
  end if;

  if ends_on < starts_on then
    raise exception 'End date must be on or after the start date.';
  end if;

  if travel_type is null
    or travel_type not in ('Plane', 'Road Trip', 'Train', 'Cruise', 'Other')
  then
    raise exception 'Travel type is not valid.';
  end if;

  insert into public.trips (
    name,
    destination,
    starts_on,
    ends_on,
    created_by,
    updated_by,
    metadata
  )
  values (
    btrim(trip_name),
    nullif(btrim(location), ''),
    starts_on,
    ends_on,
    current_user_id,
    current_user_id,
    jsonb_build_object('travel_type', travel_type)
  )
  returning id into created_trip_id;

  insert into public.trip_members (
    trip_id,
    user_id,
    role,
    created_by,
    updated_by
  )
  values (
    created_trip_id,
    current_user_id,
    'owner'::public.trip_member_role,
    current_user_id,
    current_user_id
  );

  insert into public.trip_days (
    trip_id,
    date,
    sort_order,
    created_by,
    updated_by
  )
  select
    created_trip_id,
    day::date,
    row_number() over (order by day)::integer - 1,
    current_user_id,
    current_user_id
  from generate_series(starts_on, ends_on, interval '1 day') as day;

  return created_trip_id;
end;
$$;

revoke all on function public.create_trip_with_days(
  text,
  text,
  date,
  date,
  text
) from public;

grant execute on function public.create_trip_with_days(
  text,
  text,
  date,
  date,
  text
) to authenticated;
