-- Trip deletion for v0.9.0.
--
-- Deletes the trips row as the owner. All child records cascade automatically
-- via existing on-delete-cascade foreign keys on trip_members, trip_days,
-- planner_items, and trip_invites.

create policy "Owners can delete their trips"
  on public.trips
  for delete
  using (is_trip_owner(id));

create or replace function public.delete_trip(
  target_trip_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  deleted_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to delete a trip.';
  end if;

  if not is_trip_owner(target_trip_id) then
    raise exception 'Only the trip owner can delete a trip.';
  end if;

  delete from public.trips
  where id = target_trip_id
    and archived_at is null
  returning id into deleted_id;

  if deleted_id is null then
    raise exception 'Trip not found or could not be deleted.';
  end if;

  return deleted_id;
end;
$$;

revoke all on function public.delete_trip(uuid) from public;
revoke all on function public.delete_trip(uuid) from anon;
grant execute on function public.delete_trip(uuid) to authenticated;
