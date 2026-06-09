-- Stabilize trip invite lifecycle before email-link invites.
--
-- token_hash remains in place for compatibility with existing constraints and
-- for a future true hashed-token flow. invite_token stores the current raw
-- UUID-text token used by the app's non-email-link invite foundation.

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'trip_invite_status'
  ) then
    create type public.trip_invite_status as enum (
      'pending',
      'accepted',
      'declined',
      'expired',
      'revoked'
    );
  end if;
end;
$$;

alter table public.trip_invites
  add column if not exists status public.trip_invite_status;

alter table public.trip_invites
  add column if not exists declined_at timestamptz;

alter table public.trip_invites
  add column if not exists revoked_at timestamptz;

alter table public.trip_invites
  add column if not exists last_sent_at timestamptz;

alter table public.trip_invites
  add column if not exists invite_token text;

update public.trip_invites
set
  status = case
    when accepted_at is not null then 'accepted'::public.trip_invite_status
    when expires_at <= now() then 'expired'::public.trip_invite_status
    else 'pending'::public.trip_invite_status
  end,
  last_sent_at = coalesce(last_sent_at, created_at),
  invite_token = coalesce(invite_token, token_hash)
where status is null
  or last_sent_at is null
  or invite_token is null;

alter table public.trip_invites
  alter column status set default 'pending'::public.trip_invite_status;

alter table public.trip_invites
  alter column status set not null;

create index if not exists trip_invites_trip_id_status_idx
  on public.trip_invites (trip_id, status);

create index if not exists trip_invites_email_status_idx
  on public.trip_invites (lower(email), status);

create unique index if not exists trip_invites_invite_token_key
  on public.trip_invites (invite_token)
  where invite_token is not null;

drop function if exists public.get_trip_invites(uuid);

create or replace function public.get_trip_invites(target_trip_id uuid)
returns table (
  id uuid,
  email text,
  role public.trip_member_role,
  status public.trip_invite_status,
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
    case
      when ti.status = 'pending'::public.trip_invite_status
        and ti.expires_at <= now()
      then 'expired'::public.trip_invite_status
      else ti.status
    end,
    ti.expires_at,
    ti.created_at
  from public.trip_invites as ti
  where ti.trip_id = target_trip_id
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
  generated_token text := gen_random_uuid()::text;
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
  where lower(btrim(au.email)) = normalized_email
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
    and lower(btrim(ti.email)) = normalized_email
    and ti.status = 'pending'::public.trip_invite_status
    and ti.expires_at > now()
  limit 1;

  if existing_invite_id is not null then
    raise exception 'A pending invite already exists for this email.';
  end if;

  insert into public.trip_invites (
    trip_id,
    email,
    role,
    status,
    token_hash,
    invite_token,
    invited_by,
    accepted_by,
    accepted_at,
    declined_at,
    revoked_at,
    expires_at,
    last_sent_at
  )
  values (
    target_trip_id,
    normalized_email,
    selected_role,
    'pending'::public.trip_invite_status,
    generated_token,
    generated_token,
    current_user_id,
    null,
    null,
    null,
    null,
    now() + interval '14 days',
    now()
  )
  on conflict (trip_id, email) do update
  set
    role = excluded.role,
    status = excluded.status,
    token_hash = excluded.token_hash,
    invite_token = excluded.invite_token,
    invited_by = excluded.invited_by,
    accepted_by = null,
    accepted_at = null,
    declined_at = null,
    revoked_at = null,
    expires_at = excluded.expires_at,
    last_sent_at = excluded.last_sent_at,
    updated_at = now()
  returning id into invite_id;

  return invite_id;
end;
$$;

drop function if exists public.get_my_pending_invites();

create or replace function public.get_my_pending_invites()
returns table (
  id uuid,
  trip_id uuid,
  trip_name text,
  destination text,
  starts_on date,
  ends_on date,
  role public.trip_member_role,
  status public.trip_invite_status,
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
    ti.status,
    ti.created_at,
    ti.expires_at
  from public.trip_invites as ti
  inner join public.trips as t
    on t.id = ti.trip_id
  where lower(btrim(ti.email)) = current_email
    and ti.status = 'pending'::public.trip_invite_status
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
    and ti.status = 'pending'::public.trip_invite_status
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
    status = 'accepted'::public.trip_invite_status,
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
    and ti.status = 'pending'::public.trip_invite_status
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
    status = 'declined'::public.trip_invite_status,
    declined_at = now(),
    metadata = metadata || jsonb_build_object(
      'declined_by',
      current_user_id
    )
  where id = invite_record.id;

  return invite_record.id;
end;
$$;

revoke all on function public.get_trip_invites(uuid) from public;
revoke all on function public.get_trip_invites(uuid) from anon;
grant execute on function public.get_trip_invites(uuid) to authenticated;

revoke all on function public.create_trip_invite(uuid, text, text) from public;
revoke all on function public.create_trip_invite(uuid, text, text) from anon;
grant execute on function public.create_trip_invite(uuid, text, text) to authenticated;

revoke all on function public.get_my_pending_invites() from public;
revoke all on function public.get_my_pending_invites() from anon;
grant execute on function public.get_my_pending_invites() to authenticated;

revoke all on function public.accept_trip_invite(uuid) from public;
revoke all on function public.accept_trip_invite(uuid) from anon;
grant execute on function public.accept_trip_invite(uuid) to authenticated;

revoke all on function public.decline_trip_invite(uuid) from public;
revoke all on function public.decline_trip_invite(uuid) from anon;
grant execute on function public.decline_trip_invite(uuid) to authenticated;
