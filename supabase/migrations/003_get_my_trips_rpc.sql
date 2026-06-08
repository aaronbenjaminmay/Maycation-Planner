-- Safe trip loading for the authenticated user.
--
-- This avoids client-side relationship query issues under RLS by returning only
-- trips where auth.uid() has a trip_members row.

create or replace function public.get_my_trips()
returns table (
  id uuid,
  name text,
  destination text,
  starts_on date,
  ends_on date,
  metadata jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select
    trips.id,
    trips.name,
    trips.destination,
    trips.starts_on,
    trips.ends_on,
    trips.metadata
  from public.trip_members
  inner join public.trips
    on trips.id = trip_members.trip_id
  where trip_members.user_id = auth.uid()
    and auth.uid() is not null
  order by trips.starts_on asc nulls last, trips.created_at asc;
$$;

revoke all on function public.get_my_trips() from public;

grant execute on function public.get_my_trips() to authenticated;
