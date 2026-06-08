-- Pending invite lookup and acceptance RPCs.

create or replace function public.get_my_pending_invites()
returns table (
  id uuid,
  trip_id uuid,
  trip_name text,
  destination text,
  starts_on date,
  ends_on date,
  role public.trip_member_role,
  created_at timestamptz,
  expires_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to load pending invites.';
  end if;

  select lower(btrim(au.email))
  into current_email
  from auth.users as au
  where au.id = current_user_id;

  if current_email is null then
    raise exception 'An email address is required to load pending invites.';
  end if;

  return query
  select
    ti.id,
    ti.trip_id,
    t.name,
    t.destination,
    t.starts_on,
    t.ends_on,
    ti.role,
    ti.created_at,
    ti.expires_at
  from public.trip_invites as ti
  inner join public.trips as t
    on t.id = ti.trip_id
  where lower(btrim(ti.email)) = current_email
    and ti.accepted_at is null
    and ti.expires_at > now()
    and not exists (
      select 1
      from public.trip_members as tm
      where tm.trip_id = ti.trip_id
        and tm.user_id = current_user_id
    )
  order by ti.created_at desc;
end;
$$;

create or replace function public.accept_trip_invite(invite_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  invite_record public.trip_invites%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to accept trip invites.';
  end if;

  select lower(btrim(au.email))
  into current_email
  from auth.users as au
  where au.id = current_user_id;

  if current_email is null then
    raise exception 'An email address is required to accept trip invites.';
  end if;

  select *
  into invite_record
  from public.trip_invites as ti
  where ti.id = invite_id
    and ti.accepted_at is null
    and ti.expires_at > now();

  if invite_record.id is null then
    raise exception 'Pending invite was not found.';
  end if;

  if lower(btrim(invite_record.email)) <> current_email then
    raise exception 'Invite email does not match the signed-in user.';
  end if;

  insert into public.trip_members (
    trip_id,
    user_id,
    role,
    invited_by,
    created_by,
    updated_by
  )
  values (
    invite_record.trip_id,
    current_user_id,
    invite_record.role,
    invite_record.invited_by,
    current_user_id,
    current_user_id
  )
  on conflict (trip_id, user_id) do nothing;

  update public.trip_invites
  set
    accepted_by = current_user_id,
    accepted_at = now()
  where id = invite_record.id;

  return invite_record.trip_id;
end;
$$;

create or replace function public.decline_trip_invite(invite_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  invite_record public.trip_invites%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication is required to decline trip invites.';
  end if;

  select lower(btrim(au.email))
  into current_email
  from auth.users as au
  where au.id = current_user_id;

  if current_email is null then
    raise exception 'An email address is required to decline trip invites.';
  end if;

  select *
  into invite_record
  from public.trip_invites as ti
  where ti.id = invite_id
    and ti.accepted_at is null
    and ti.expires_at > now();

  if invite_record.id is null then
    raise exception 'Pending invite was not found.';
  end if;

  if lower(btrim(invite_record.email)) <> current_email then
    raise exception 'Invite email does not match the signed-in user.';
  end if;

  update public.trip_invites
  set
    expires_at = now(),
    metadata = metadata || jsonb_build_object(
      'declined_at',
      now(),
      'declined_by',
      current_user_id
    )
  where id = invite_record.id;

  return invite_record.id;
end;
$$;

revoke all on function public.get_my_pending_invites() from public;
revoke all on function public.get_my_pending_invites() from anon;
grant execute on function public.get_my_pending_invites() to authenticated;

revoke all on function public.accept_trip_invite(uuid) from public;
revoke all on function public.accept_trip_invite(uuid) from anon;
grant execute on function public.accept_trip_invite(uuid) to authenticated;

revoke all on function public.decline_trip_invite(uuid) from public;
revoke all on function public.decline_trip_invite(uuid) from anon;
grant execute on function public.decline_trip_invite(uuid) to authenticated;
