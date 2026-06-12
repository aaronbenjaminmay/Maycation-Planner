-- Trip background image RPC for Phase 7B.
--
-- 1. Extends get_my_trips to include background_path.
-- 2. Adds set_trip_background to store or clear a background storage path.
-- 3. Replaces delete_trip to clean up background storage objects before deletion.
--
-- get_my_trips requires DROP before recreate because its return type changes.
-- set_trip_background is new; create or replace is safe.
-- delete_trip has the same signature; create or replace is safe.

drop function if exists public.get_my_trips();

create or replace function public.get_my_trips()
returns table (
  id uuid,
  name text,
  destination text,
  starts_on date,
  ends_on date,
  background_path text,
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
    t.background_path,
    t.metadata
  from public.trip_members as tm
  inner join public.trips as t
    on t.id = tm.trip_id
  where tm.user_id = current_user_id
  order by t.starts_on asc nulls last, t.created_at asc;
end;
$$;

revoke all on function public.get_my_trips() from public;
revoke all on function public.get_my_trips() from anon;
grant execute on function public.get_my_trips() to authenticated;

create or replace function public.set_trip_background(
  target_trip_id uuid,
  storage_path text
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
    raise exception 'Authentication is required to update trip background.';
  end if;

  if not public.is_trip_owner(target_trip_id) then
    raise exception 'Owner access is required to update trip background.';
  end if;

  update public.trips
  set
    background_path = storage_path,
    updated_at = now(),
    updated_by = current_user_id
  where id = target_trip_id
    and archived_at is null;
end;
$$;

revoke all on function public.set_trip_background(uuid, text) from public;
revoke all on function public.set_trip_background(uuid, text) from anon;
grant execute on function public.set_trip_background(uuid, text) to authenticated;

-- Replace delete_trip to clean up background storage objects before deletion.
-- Deleting from storage.objects removes access to the bytes.
-- The storage backend will eventually reconcile orphaned bytes.

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

  if not public.is_trip_owner(target_trip_id) then
    raise exception 'Only the trip owner can delete a trip.';
  end if;

  begin
    delete from storage.objects
    where bucket_id = 'trip-backgrounds'
      and name = target_trip_id::text || '/background';
  exception
    when others then
      null;
  end;

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
