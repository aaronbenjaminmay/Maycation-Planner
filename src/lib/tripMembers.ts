import { getSupabaseClient } from './supabaseClient'
import type { TripMemberRole } from './trips'

export type TripMember = {
  email: string | null
  display_name: string | null
  id: string
  joined_at: string
  role: TripMemberRole
  user_id: string
}

export type TripInvite = {
  created_at: string
  email: string
  expires_at: string
  id: string
  role: Exclude<TripMemberRole, 'owner'>
}

type SupabaseErrorLike = {
  code?: string
  details?: string
  hint?: string
  message?: string
}

async function logSupabaseError(context: string, error: SupabaseErrorLike) {
  if (import.meta.env.DEV) {
    const client = getSupabaseClient()
    const { data } = await client.auth.getSession()

    console.error(context, {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
      sessionUserId: data.session?.user.id ?? null,
    })
  }
}

function getSupabaseErrorMessage(error: SupabaseErrorLike) {
  return error.message || 'Supabase request failed.'
}

export async function loadTripAccess(tripId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client.rpc('get_trip_access', {
    target_trip_id: tripId,
  })

  if (error) {
    await logSupabaseError('Failed to load trip access', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return ((data ?? []) as { role: TripMemberRole }[])[0]?.role ?? null
}

export async function loadTripMembers(tripId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client.rpc('get_trip_members', {
    target_trip_id: tripId,
  })

  if (error) {
    await logSupabaseError('Failed to load trip members', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return (data ?? []) as TripMember[]
}

export async function loadTripInvites(tripId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client.rpc('get_trip_invites', {
    target_trip_id: tripId,
  })

  if (error) {
    await logSupabaseError('Failed to load trip invites', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return (data ?? []) as TripInvite[]
}

export async function createTripInvite(
  tripId: string,
  email: string,
  role: Exclude<TripMemberRole, 'owner'>,
) {
  const client = getSupabaseClient()
  const trimmedEmail = email.trim()

  if (!trimmedEmail) {
    throw new Error('Email is required.')
  }

  const { data: inviteId, error } = await client.rpc('create_trip_invite', {
    target_trip_id: tripId,
    invite_email: trimmedEmail,
    invite_role: role,
  })

  if (error) {
    await logSupabaseError('Failed to create trip invite', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return inviteId
}

export async function updateTripMemberRole(
  tripId: string,
  memberId: string,
  role: Exclude<TripMemberRole, 'owner'>,
) {
  const client = getSupabaseClient()
  const { data: updatedMemberId, error } = await client.rpc(
    'update_trip_member_role',
    {
      target_trip_id: tripId,
      target_member_id: memberId,
      new_role: role,
    },
  )

  if (error) {
    await logSupabaseError('Failed to update trip member role', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return updatedMemberId
}

export async function removeTripMember(tripId: string, memberId: string) {
  const client = getSupabaseClient()
  const { data: removedMemberId, error } = await client.rpc(
    'remove_trip_member',
    {
      target_trip_id: tripId,
      target_member_id: memberId,
    },
  )

  if (error) {
    await logSupabaseError('Failed to remove trip member', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return removedMemberId
}
