-- Planner item reordering within a single trip day.

create or replace function public.reorder_planner_item(
  target_trip_id uuid,
  planner_item_id uuid,
  direction text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_direction text := lower(btrim(direction));
  target_day_id uuid;
  target_sort_order numeric;
  target_created_at timestamptz;
  adjacent_item_id uuid;
  adjacent_sort_order numeric;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to reorder planner items.';
  end if;

  if normalized_direction not in ('up', 'down') then
    raise exception 'Reorder direction must be up or down.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
      and tm.role in ('owner'::public.trip_member_role, 'editor'::public.trip_member_role)
  ) then
    raise exception 'Owner or editor access is required to reorder planner items.';
  end if;

  select
    pi.trip_day_id,
    pi.sort_order,
    pi.created_at
  into
    target_day_id,
    target_sort_order,
    target_created_at
  from public.planner_items as pi
  where pi.id = planner_item_id
    and pi.trip_id = target_trip_id
    and pi.deleted_at is null
  for update;

  if target_day_id is null then
    raise exception 'Planner item does not belong to this trip day.';
  end if;

  if normalized_direction = 'up' then
    select
      pi.id,
      pi.sort_order
    into
      adjacent_item_id,
      adjacent_sort_order
    from public.planner_items as pi
    where pi.trip_id = target_trip_id
      and pi.trip_day_id = target_day_id
      and pi.deleted_at is null
      and pi.id <> planner_item_id
      and (
        pi.sort_order < target_sort_order
        or (
          pi.sort_order = target_sort_order
          and pi.created_at < target_created_at
        )
      )
    order by pi.sort_order desc, pi.created_at desc
    limit 1
    for update;
  else
    select
      pi.id,
      pi.sort_order
    into
      adjacent_item_id,
      adjacent_sort_order
    from public.planner_items as pi
    where pi.trip_id = target_trip_id
      and pi.trip_day_id = target_day_id
      and pi.deleted_at is null
      and pi.id <> planner_item_id
      and (
        pi.sort_order > target_sort_order
        or (
          pi.sort_order = target_sort_order
          and pi.created_at > target_created_at
        )
      )
    order by pi.sort_order asc, pi.created_at asc
    limit 1
    for update;
  end if;

  if adjacent_item_id is null then
    return false;
  end if;

  update public.planner_items
  set
    sort_order = case
      when id = planner_item_id then adjacent_sort_order
      when id = adjacent_item_id then target_sort_order
      else sort_order
    end,
    updated_by = current_user_id
  where id in (planner_item_id, adjacent_item_id)
    and trip_id = target_trip_id
    and trip_day_id = target_day_id
    and deleted_at is null;

  return true;
end;
$$;

revoke all on function public.reorder_planner_item(uuid, uuid, text) from public;
revoke all on function public.reorder_planner_item(uuid, uuid, text) from anon;
grant execute on function public.reorder_planner_item(uuid, uuid, text) to authenticated;
