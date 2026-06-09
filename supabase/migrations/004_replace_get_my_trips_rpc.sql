-- Replace get_my_trips with an explicit PL/pgSQL version.
--
-- The dashboard must not directly read trips or trip_members. This RPC returns
-- only trips where the current authenticated user has a membership row.

create or replace function public.get_my_trips()
returns table (
  id uuid,
  name text,
  destination text,
  starts_on date,
  ends_on date,
  metadata jsonb
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
    raise exception 'Authentication is required to load trips.';
  end if;

  return query
  select
    t.id,
    t.name,
    t.destination,
    t.starts_on,
    t.ends_on,
    t.metadata
  from public.trip_members as tm
  inner join public.trips as t
    on t.id = tm.trip_id
  where tm.user_id = current_user_id
  order by t.starts_on asc nulls last, t.created_at asc;
end;
$$;

revoke all on function public.get_my_trips() from public;

grant execute on function public.get_my_trips() to authenticated;
