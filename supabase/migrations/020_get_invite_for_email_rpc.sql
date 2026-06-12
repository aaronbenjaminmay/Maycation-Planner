-- RPC for invite email lookup used by the send-invite-email Edge Function.
--
-- Security definer: runs as the function owner, bypassing RLS on all
-- joined tables (trip_invites, trips, profiles, auth.users).
-- Authorization is enforced inside the function body via the WHERE clause:
-- the invite row is only returned when invited_by = auth.uid(), ensuring
-- the caller is the person who created the invite (always a trip owner).
--
-- This replaces the previous pattern where the Edge Function queried
-- trip_invites directly via a service role client, which failed with
-- 42501 (insufficient_privilege) due to RLS/grant resolution issues
-- in the Deno edge runtime.

create or replace function public.get_invite_for_email(target_invite_id uuid)
returns table (
  invite_id      uuid,
  invitee_email  text,
  role           public.trip_member_role,
  invited_by     uuid,
  trip_id        uuid,
  trip_name      text,
  trip_destination text,
  trip_starts_on date,
  trip_ends_on   date,
  inviter_name   text
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
    raise exception 'Authentication is required to look up invite details.';
  end if;

  return query
  select
    ti.id,
    ti.email,
    ti.role,
    ti.invited_by,
    ti.trip_id,
    t.name,
    t.destination,
    t.starts_on,
    t.ends_on,
    coalesce(p.display_name, p.email, au.email, 'A trip owner')
  from public.trip_invites as ti
  inner join public.trips as t
    on t.id = ti.trip_id
  left join public.profiles as p
    on p.user_id = ti.invited_by
  left join auth.users as au
    on au.id = ti.invited_by
  where ti.id = target_invite_id
    and ti.status = 'pending'::public.trip_invite_status
    and ti.invited_by = current_user_id;
end;
$$;

revoke all on function public.get_invite_for_email(uuid) from public;
revoke all on function public.get_invite_for_email(uuid) from anon;
grant execute on function public.get_invite_for_email(uuid) to authenticated;
