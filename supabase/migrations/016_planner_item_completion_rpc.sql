-- Planner item completion support.
--
-- Completion is stored in planner_items.metadata.completed for now so the
-- canonical planner item model stays stable while v1 behavior settles.

drop function if exists public.get_trip_planner_items(uuid);

create or replace function public.get_trip_planner_items(target_trip_id uuid)
returns table (
  id uuid,
  trip_id uuid,
  trip_day_id uuid,
  kind public.planner_item_kind,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  location_name text,
  sort_order numeric,
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
    raise exception 'Authentication is required to load planner items.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
  ) then
    raise exception 'Trip access is required to load planner items.';
  end if;

  return query
  select
    pi.id,
    pi.trip_id,
    pi.trip_day_id,
    pi.kind,
    pi.title,
    pi.description,
    pi.starts_at,
    pi.ends_at,
    pi.location_name,
    pi.sort_order,
    pi.metadata
  from public.planner_items as pi
  where pi.trip_id = target_trip_id
    and pi.deleted_at is null
  order by pi.trip_day_id asc nulls last, pi.sort_order asc, pi.starts_at asc nulls last, pi.created_at asc;
end;
$$;

create or replace function public.toggle_planner_item_completion(
  target_trip_id uuid,
  planner_item_id uuid,
  is_completed boolean
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
    raise exception 'Authentication is required to update planner item completion.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to update planner item completion.';
  end if;

  update public.planner_items as pi
  set
    metadata = coalesce(pi.metadata, '{}'::jsonb)
      || jsonb_build_object('completed', coalesce(is_completed, false)),
    updated_by = current_user_id
  where pi.id = planner_item_id
    and pi.trip_id = target_trip_id
    and pi.deleted_at is null;

  if not found then
    raise exception 'Planner item does not belong to this trip.';
  end if;

  return planner_item_id;
end;
$$;

revoke all on function public.get_trip_planner_items(uuid) from public;
revoke all on function public.get_trip_planner_items(uuid) from anon;
grant execute on function public.get_trip_planner_items(uuid) to authenticated;

revoke all on function public.toggle_planner_item_completion(uuid, uuid, boolean) from public;
revoke all on function public.toggle_planner_item_completion(uuid, uuid, boolean) from anon;
grant execute on function public.toggle_planner_item_completion(uuid, uuid, boolean) to authenticated;
