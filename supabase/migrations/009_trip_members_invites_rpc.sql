-- Trip member and invite foundation RPCs.
--
-- The client uses these functions instead of direct trip_members/trip_invites
-- writes so ownership checks stay centralized.

create or replace function public.get_trip_access(target_trip_id uuid)
returns table (
  role public.trip_member_role
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
    raise exception 'Authentication is required to load trip access.';
  end if;

  return query
  select tm.role
  from public.trip_members as tm
  where tm.trip_id = target_trip_id
    and tm.user_id = current_user_id
  limit 1;
end;
$$;

create or replace function public.get_trip_members(target_trip_id uuid)
returns table (
  id uuid,
  user_id uuid,
  display_name text,
  email text,
  role public.trip_member_role,
  joined_at timestamptz
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
    raise exception 'Authentication is required to load trip members.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.trip_id = target_trip_id
      and tm.user_id = current_user_id
  ) then
    raise exception 'Trip access is required to load trip members.';
  end if;

  return query
  select
    tm.id,
    tm.user_id,
    coalesce(tm.display_name_override, p.display_name, au.email),
    coalesce(p.email, au.email),
    tm.role,
    tm.joined_at
  from public.trip_members as tm
  left join public.profiles as p
    on p.user_id = tm.user_id
  left join auth.users as au
    on au.id = tm.user_id
  where tm.trip_id = target_trip_id
  order by
    case tm.role
      when 'owner'::public.trip_member_role then 0
      when 'editor'::public.trip_member_role then 1
      else 2
    end,
    coalesce(tm.display_name_override, p.display_name, au.email) asc nulls last;
end;
$$;

create or replace function public.get_trip_invites(target_trip_id uuid)
returns table (
  id uuid,
  email text,
  role public.trip_member_role,
  expires_at timestamptz,
  created_at timestamptz
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
    raise exception 'Authentication is required to load trip invites.';
  end if;

  if not public.is_trip_owner(target_trip_id) then
    raise exception 'Owner access is required to load trip invites.';
  end if;

  return query
  select
    ti.id,
    ti.email,
    ti.role,
    ti.expires_at,
    ti.created_at
  from public.trip_invites as ti
  where ti.trip_id = target_trip_id
    and ti.accepted_at is null
    and ti.expires_at > now()
  order by ti.created_at desc;
end;
$$;

create or replace function public.create_trip_invite(
  target_trip_id uuid,
  invite_email text,
  invite_role text default 'viewer'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  normalized_email text := lower(nullif(btrim(invite_email), ''));
  selected_role public.trip_member_role;
  existing_invite_id uuid;
  matching_user_id uuid;
  invite_id uuid;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to invite trip members.';
  end if;

  if not public.is_trip_owner(target_trip_id) then
    raise exception 'Owner access is required to invite trip members.';
  end if;

  if normalized_email is null then
    raise exception 'Email is required.';
  end if;

  if invite_role not in ('editor', 'viewer') then
    raise exception 'Invite role must be editor or viewer.';
  end if;

  selected_role := invite_role::public.trip_member_role;

  select au.id
  into matching_user_id
  from auth.users as au
  where lower(au.email) = normalized_email
  limit 1;

  if matching_user_id is not null
    and exists (
      select 1
      from public.trip_members as tm
      where tm.trip_id = target_trip_id
        and tm.user_id = matching_user_id
    )
  then
    raise exception 'That user is already a trip member.';
  end if;

  select ti.id
  into existing_invite_id
  from public.trip_invites as ti
  where ti.trip_id = target_trip_id
    and lower(ti.email) = normalized_email
    and ti.accepted_at is null
    and ti.expires_at > now()
  limit 1;

  if existing_invite_id is not null then
    raise exception 'A pending invite already exists for this email.';
  end if;

  insert into public.trip_invites (
    trip_id,
    email,
    role,
    token_hash,
    invited_by,
    expires_at
  )
  values (
    target_trip_id,
    normalized_email,
    selected_role,
    encode(digest(gen_random_uuid()::text || normalized_email || now()::text, 'sha256'), 'hex'),
    current_user_id,
    now() + interval '14 days'
  )
  on conflict (trip_id, email) do update
  set
    role = excluded.role,
    token_hash = excluded.token_hash,
    invited_by = excluded.invited_by,
    accepted_by = null,
    accepted_at = null,
    expires_at = excluded.expires_at,
    updated_at = now()
  returning id into invite_id;

  return invite_id;
end;
$$;

create or replace function public.update_trip_member_role(
  target_trip_id uuid,
  target_member_id uuid,
  new_role text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  existing_role public.trip_member_role;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to update trip members.';
  end if;

  if not public.is_trip_owner(target_trip_id) then
    raise exception 'Owner access is required to update trip members.';
  end if;

  if new_role not in ('editor', 'viewer') then
    raise exception 'Member role must be editor or viewer.';
  end if;

  select tm.role
  into existing_role
  from public.trip_members as tm
  where tm.id = target_member_id
    and tm.trip_id = target_trip_id;

  if existing_role is null then
    raise exception 'Trip member does not belong to this trip.';
  end if;

  if existing_role = 'owner'::public.trip_member_role
    and not exists (
      select 1
      from public.trip_members as tm
      where tm.trip_id = target_trip_id
        and tm.id <> target_member_id
        and tm.role = 'owner'::public.trip_member_role
    )
  then
    raise exception 'Cannot demote the final owner.';
  end if;

  update public.trip_members
  set
    role = new_role::public.trip_member_role,
    updated_by = current_user_id
  where id = target_member_id
    and trip_id = target_trip_id;

  return target_member_id;
end;
$$;

create or replace function public.remove_trip_member(
  target_trip_id uuid,
  target_member_id uuid
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
    raise exception 'Authentication is required to remove trip members.';
  end if;

  if not public.is_trip_owner(target_trip_id) then
    raise exception 'Owner access is required to remove trip members.';
  end if;

  if not exists (
    select 1
    from public.trip_members as tm
    where tm.id = target_member_id
      and tm.trip_id = target_trip_id
  ) then
    raise exception 'Trip member does not belong to this trip.';
  end if;

  delete from public.trip_members
  where id = target_member_id
    and trip_id = target_trip_id;

  return target_member_id;
end;
$$;

revoke all on function public.get_trip_access(uuid) from public;
revoke all on function public.get_trip_access(uuid) from anon;
grant execute on function public.get_trip_access(uuid) to authenticated;

revoke all on function public.get_trip_members(uuid) from public;
revoke all on function public.get_trip_members(uuid) from anon;
grant execute on function public.get_trip_members(uuid) to authenticated;

revoke all on function public.get_trip_invites(uuid) from public;
revoke all on function public.get_trip_invites(uuid) from anon;
grant execute on function public.get_trip_invites(uuid) to authenticated;

revoke all on function public.create_trip_invite(uuid, text, text) from public;
revoke all on function public.create_trip_invite(uuid, text, text) from anon;
grant execute on function public.create_trip_invite(uuid, text, text) to authenticated;

revoke all on function public.update_trip_member_role(uuid, uuid, text) from public;
revoke all on function public.update_trip_member_role(uuid, uuid, text) from anon;
grant execute on function public.update_trip_member_role(uuid, uuid, text) to authenticated;

revoke all on function public.remove_trip_member(uuid, uuid) from public;
revoke all on function public.remove_trip_member(uuid, uuid) from anon;
grant execute on function public.remove_trip_member(uuid, uuid) to authenticated;
