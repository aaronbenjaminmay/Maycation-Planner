import { type FormEvent, useCallback, useEffect, useState } from 'react'
import {
  createTripInvite,
  loadTripAccess,
  loadTripInvites,
  loadTripMembers,
  removeTripMember,
  updateTripMemberRole,
  type TripInvite,
  type TripMember,
} from '../lib/tripMembers'
import { getSupabaseClient } from '../lib/supabaseClient'
import {
  travelTypes,
  updateTrip,
  type TravelType,
  type Trip,
  type TripMemberRole,
} from '../lib/trips'
import { CardSurface, DetailHeader, EmptyState, IconButton } from './DesignSystem'

type TripSettingsProps = {
  currentRole: TripMemberRole | null
  onBack: () => void
  onTripUpdated: (trip: Trip) => void
  trip: Trip
}

type InviteRole = Exclude<TripMemberRole, 'owner'>

function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function TripSettings({
  onBack,
  onTripUpdated,
  trip,
}: TripSettingsProps) {
  const [members, setMembers] = useState<TripMember[]>([])
  const [invites, setInvites] = useState<TripInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [isEditingTrip, setIsEditingTrip] = useState(false)
  const [isSavingTrip, setIsSavingTrip] = useState(false)
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<InviteRole>('viewer')
  const [editName, setEditName] = useState(trip.name)
  const [editDestination, setEditDestination] = useState(trip.destination ?? '')
  const [editStartsOn, setEditStartsOn] = useState(trip.starts_on)
  const [editEndsOn, setEditEndsOn] = useState(trip.ends_on)
  const [editTravelType, setEditTravelType] = useState<TravelType>(
    trip.metadata.travel_type ?? 'Other',
  )
  const [error, setError] = useState('')
  const [tripEditError, setTripEditError] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [memberError, setMemberError] = useState('')
  const [settingsRole, setSettingsRole] = useState<TripMemberRole | null>(null)
  const isOwner = settingsRole === 'owner'
  const canEditTrip = settingsRole === 'owner' || settingsRole === 'editor'
  const ownerCount = members.filter((member) => member.role === 'owner').length

  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const loadedRole = await loadTripAccess(trip.id)
      const loadedMembers = await loadTripMembers(trip.id)
      setSettingsRole(loadedRole)
      setMembers(loadedMembers)

      if (loadedRole === 'owner') {
        setInvites(await loadTripInvites(trip.id))
      } else {
        setInvites([])
      }
    } catch (loadError) {
      setError(
        getVisibleErrorMessage(loadError, 'Unable to load trip settings.'),
      )
    } finally {
      setIsLoading(false)
    }
  }, [trip.id])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  useEffect(() => {
    setEditName(trip.name)
    setEditDestination(trip.destination ?? '')
    setEditStartsOn(trip.starts_on)
    setEditEndsOn(trip.ends_on)
    setEditTravelType(trip.metadata.travel_type ?? 'Other')
  }, [trip])

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return
    }

    let isMounted = true

    async function logTripSettingsRole() {
      try {
        const client = getSupabaseClient()
        const { data } = await client.auth.getSession()

        if (!isMounted) {
          return
        }

        const currentUserId = data.session?.user.id ?? null
        const currentMember = currentUserId
          ? members.find((member) => member.user_id === currentUserId) ?? null
          : null

        console.info('Trip Settings role debug', {
          authUserEmail: data.session?.user.email ?? null,
          authUserId: currentUserId,
          currentMember,
          isOwner,
          settingsRole,
          tripId: trip.id,
        })
      } catch (logError) {
        console.info('Trip Settings role debug unavailable', {
          isOwner,
          logError,
          settingsRole,
          tripId: trip.id,
        })
      }
    }

    void logTripSettingsRole()

    return () => {
      isMounted = false
    }
  }, [isOwner, members, settingsRole, trip.id])

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isOwner) {
      return
    }

    setInviteError('')
    setIsInviting(true)

    try {
      await createTripInvite(trip.id, email, inviteRole)
      setEmail('')
      setInviteRole('viewer')
      await loadSettings()
    } catch (inviteFailure) {
      setInviteError(
        getVisibleErrorMessage(inviteFailure, 'Unable to send invite.'),
      )
    } finally {
      setIsInviting(false)
    }
  }

  async function handleTripUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canEditTrip) {
      return
    }

    setTripEditError('')

    if (!editName.trim()) {
      setTripEditError('Trip name is required.')
      return
    }

    if (!editStartsOn || !editEndsOn) {
      setTripEditError('Start date and end date are required.')
      return
    }

    if (editEndsOn < editStartsOn) {
      setTripEditError('End date must be on or after the start date.')
      return
    }

    setIsSavingTrip(true)

    try {
      const updatedTrip = await updateTrip({
        tripId: trip.id,
        name: editName,
        destination: editDestination,
        startsOn: editStartsOn,
        endsOn: editEndsOn,
        travelType: editTravelType,
      })
      onTripUpdated(updatedTrip)
      setIsEditingTrip(false)
    } catch (updateFailure) {
      setTripEditError(
        getVisibleErrorMessage(updateFailure, 'Unable to update this trip.'),
      )
    } finally {
      setIsSavingTrip(false)
    }
  }

  async function handleRoleChange(member: TripMember, role: InviteRole) {
    if (!isOwner) {
      return
    }

    setMemberError('')
    setBusyMemberId(member.id)

    try {
      await updateTripMemberRole(trip.id, member.id, role)
      await loadSettings()
    } catch (roleFailure) {
      setMemberError(
        getVisibleErrorMessage(roleFailure, 'Unable to update member role.'),
      )
    } finally {
      setBusyMemberId(null)
    }
  }

  async function handleRemoveMember(member: TripMember) {
    if (!isOwner) {
      return
    }

    const confirmed = window.confirm(`Remove ${getMemberName(member)}?`)

    if (!confirmed) {
      return
    }

    setMemberError('')
    setBusyMemberId(member.id)

    try {
      await removeTripMember(trip.id, member.id)
      await loadSettings()
    } catch (removeFailure) {
      setMemberError(
        getVisibleErrorMessage(removeFailure, 'Unable to remove member.'),
      )
    } finally {
      setBusyMemberId(null)
    }
  }

  return (
    <main className="app-shell dashboard-shell">
      <section className="page-shell trips-panel">
        <DetailHeader
          eyebrow="Trip Settings"
          meta={
            <p className="muted">
              {isOwner
                ? 'Manage invitations and member roles.'
                : 'View trip membership.'}
            </p>
          }
          onBack={onBack}
          title={trip.name}
        />

        {isLoading ? (
          <EmptyState title="Loading settings">
            <p className="muted">Gathering trip members.</p>
          </EmptyState>
        ) : null}

        {!isLoading && error ? (
          <EmptyState
            title="Could not load settings"
            action={
              <button type="button" onClick={() => void loadSettings()}>
                Try again
              </button>
            }
          >
            <p className="muted">{error}</p>
          </EmptyState>
        ) : null}

        {!isLoading && !error && isOwner ? (
          <CardSurface className="settings-panel" aria-label="Invite user">
            <div>
              <h2>Invite User</h2>
              <p className="muted">Invite a family member by email.</p>
            </div>

            <form className="invite-form" onSubmit={handleInvite}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label>
                Role
                <select
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(event.target.value as InviteRole)
                  }
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
              </label>

              {inviteError ? <p className="feedback">{inviteError}</p> : null}

              <IconButton
                disabled={isInviting}
                icon="user-plus"
                label={isInviting ? 'Creating invite' : 'Create Invite'}
                type="submit"
                variant="primary"
              />
            </form>
          </CardSurface>
        ) : null}

        {!isLoading && !error && canEditTrip ? (
          <CardSurface className="settings-panel" aria-label="Edit trip">
            <div>
              <h2>Edit Trip</h2>
              <p className="muted">
                Update the trip basics shared across the dashboard.
              </p>
            </div>

            {!isEditingTrip ? (
              <IconButton
                icon="edit"
                label="Edit trip basics"
                onClick={() => setIsEditingTrip(true)}
              />
            ) : (
              <form className="trip-form" onSubmit={handleTripUpdate}>
                <label>
                  Trip Name
                  <input
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Location
                  <input
                    type="text"
                    value={editDestination}
                    onChange={(event) => setEditDestination(event.target.value)}
                  />
                </label>

                <div className="form-grid">
                  <label>
                    Start Date
                    <input
                      type="date"
                      value={editStartsOn}
                      onChange={(event) => setEditStartsOn(event.target.value)}
                      required
                    />
                  </label>

                  <label>
                    End Date
                    <input
                      type="date"
                      value={editEndsOn}
                      onChange={(event) => setEditEndsOn(event.target.value)}
                      required
                    />
                  </label>
                </div>

                <label>
                  Travel Type
                  <select
                    value={editTravelType}
                    onChange={(event) =>
                      setEditTravelType(event.target.value as TravelType)
                    }
                  >
                    {travelTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <p className="muted">
                  Changing dates does not update existing trip days yet.
                </p>

                {tripEditError ? (
                  <p className="feedback">{tripEditError}</p>
                ) : null}

                <div className="form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setTripEditError('')
                      setIsEditingTrip(false)
                    }}
                    disabled={isSavingTrip}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isSavingTrip}>
                    {isSavingTrip ? 'Saving...' : 'Save Trip'}
                  </button>
                </div>
              </form>
            )}
          </CardSurface>
        ) : null}

        {!isLoading && !error ? (
          <CardSurface className="settings-panel" aria-label="Trip members">
            <div>
              <h2>Members</h2>
              <p className="muted">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
            </div>

            {memberError ? <p className="feedback">{memberError}</p> : null}

            <div className="member-list">
              {members.map((member) => (
                <div className="member-row" key={member.id}>
                  <div>
                    <strong>{getMemberName(member)}</strong>
                    <p className="muted">{member.email || 'Email not set'}</p>
                  </div>

                  <span className={`role-pill ${member.role}`}>
                    {getRoleLabel(member.role)}
                  </span>

                  {isOwner ? (
                    <div className="member-actions">
                      {member.role === 'viewer' ? (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => void handleRoleChange(member, 'editor')}
                          disabled={busyMemberId === member.id}
                        >
                          Make editor
                        </button>
                      ) : null}

                      {member.role === 'editor' ? (
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => void handleRoleChange(member, 'viewer')}
                          disabled={busyMemberId === member.id}
                        >
                          Make viewer
                        </button>
                      ) : null}

                      {canRemoveMember(member, ownerCount) ? (
                        <IconButton
                          icon="delete"
                          label={
                            busyMemberId === member.id
                              ? 'Removing member'
                              : 'Remove member'
                          }
                          variant="destructive"
                          onClick={() => void handleRemoveMember(member)}
                          disabled={busyMemberId === member.id}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </CardSurface>
        ) : null}

        {!isLoading && !error && isOwner && invites.length > 0 ? (
          <CardSurface className="settings-panel" aria-label="Trip invites">
            <div>
              <h2>Invites</h2>
              <p className="muted">Invitation history and current status.</p>
            </div>

            <div className="member-list">
              {invites.map((invite) => (
                <div className="member-row" key={invite.id}>
                  <div>
                    <strong>{invite.email}</strong>
                    <p className="muted">
                      Expires {formatInviteDate(invite.expires_at)}
                    </p>
                  </div>
                  <div className="invite-status-group">
                    <span className={`role-pill ${invite.role}`}>
                      {getRoleLabel(invite.role)}
                    </span>
                    <span className={`status-pill ${invite.status}`}>
                      {getInviteStatusLabel(invite.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardSurface>
        ) : null}
      </section>
    </main>
  )
}

function canRemoveMember(member: TripMember, ownerCount: number) {
  return member.role !== 'owner' || ownerCount > 1
}

function formatInviteDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getMemberName(member: TripMember) {
  return member.display_name || member.email || 'Trip member'
}

function getRoleLabel(role: TripMemberRole) {
  switch (role) {
    case 'editor':
      return 'Editor'
    case 'owner':
      return 'Owner'
    case 'viewer':
      return 'Viewer'
  }
}

function getInviteStatusLabel(status: TripInvite['status']) {
  switch (status) {
    case 'accepted':
      return 'Accepted'
    case 'declined':
      return 'Declined'
    case 'expired':
      return 'Expired'
    case 'pending':
      return 'Pending'
    case 'revoked':
      return 'Revoked'
  }
}
