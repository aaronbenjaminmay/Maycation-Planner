-- Safe trip day loading for the authenticated trip detail dashboard.

create or replace function public.get_trip_days(target_trip_id uuid)
returns table (
  id uuid,
  trip_id uuid,
  date date,
  label text,
  sort_order integer
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
    td.sort_order
  from public.trip_days as td
  where td.trip_id = target_trip_id
  order by td.sort_order asc, td.date asc;
end;
$$;

revoke all on function public.get_trip_days(uuid) from public;
revoke all on function public.get_trip_days(uuid) from anon;
grant execute on function public.get_trip_days(uuid) to authenticated;
