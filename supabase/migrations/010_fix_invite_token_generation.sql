-- Fix invite token generation to avoid digest(text, unknown).

create extension if not exists pgcrypto;

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
    encode(gen_random_bytes(32), 'hex'),
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

revoke all on function public.create_trip_invite(uuid, text, text) from public;
revoke all on function public.create_trip_invite(uuid, text, text) from anon;
grant execute on function public.create_trip_invite(uuid, text, text) to authenticated;
