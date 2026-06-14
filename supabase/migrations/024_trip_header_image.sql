-- Custom trip header image for v1.2.
--
-- Adds header_image_path to trips, stored in the existing trip-backgrounds bucket
-- at path {trip_id}/header. Existing RLS policies (018) already cover any path
-- under {trip_id}/, so no new storage policies are required.
--
-- get_my_trips is dropped and recreated because the RETURNS TABLE signature changes.
-- set_trip_header_image mirrors set_trip_background.
-- delete_trip is updated to clean up the header storage object on trip deletion.

-- ── Schema column ─────────────────────────────────────────────────────────────

alter table public.trips
  add column header_image_path text;

-- ── get_my_trips: include header_image_path ───────────────────────────────────

drop function if exists public.get_my_trips();

create or replace function public.get_my_trips()
returns table (
  id uuid,
  name text,
  destination text,
  starts_on date,
  ends_on date,
  background_path text,
  header_image_path text,
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
    t.header_image_path,
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

-- ── set_trip_header_image ─────────────────────────────────────────────────────

create or replace function public.set_trip_header_image(
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
    raise exception 'Authentication is required to update trip header image.';
  end if;

  if not public.is_trip_owner(target_trip_id) then
    raise exception 'Owner access is required to update trip header image.';
  end if;

  update public.trips
  set
    header_image_path = storage_path,
    updated_at = now(),
    updated_by = current_user_id
  where id = target_trip_id
    and archived_at is null;
end;
$$;

revoke all on function public.set_trip_header_image(uuid, text) from public;
revoke all on function public.set_trip_header_image(uuid, text) from anon;
grant execute on function public.set_trip_header_image(uuid, text) to authenticated;

-- ── delete_trip: clean up header storage object ───────────────────────────────
-- Replaces the version from migration 019 to also remove the header image path.

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
      and name in (
        target_trip_id::text || '/background',
        target_trip_id::text || '/header'
      );
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
