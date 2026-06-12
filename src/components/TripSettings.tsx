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
  deleteTrip,
  travelTypes,
  updateTrip,
  type TravelType,
  type Trip,
  type TripMemberRole,
} from '../lib/trips'
import {
  Badge,
  Button,
  CardSurface,
  DetailHeader,
  EmptyState,
  FeedbackMessage,
  FormActions,
  FormGrid,
  IconButton,
  ModalSheet,
  SelectInput,
  TextInput,
  type BadgeTone,
} from './DesignSystem'

type TripSettingsProps = {
  currentRole: TripMemberRole | null
  onBack: () => void
  onTripDeleted: () => void
  onTripUpdated: (trip: Trip) => void
  trip: Trip
}

type InviteRole = Exclude<TripMemberRole, 'owner'>

const roleTones: Record<TripMemberRole, BadgeTone> = {
  owner: 'accent',
  editor: 'info',
  viewer: 'secondary',
}


function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function TripSettings({
  onBack,
  onTripDeleted,
  onTripUpdated,
  trip,
}: TripSettingsProps) {
  const [members, setMembers] = useState<TripMember[]>([])
  const [invites, setInvites] = useState<TripInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeletingTrip, setIsDeletingTrip] = useState(false)
  const [confirmTripName, setConfirmTripName] = useState('')
  const [deleteError, setDeleteError] = useState('')
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

  function closeInviteModal() {
    setInviteError('')
    setEmail('')
    setInviteRole('viewer')
    setIsInviteOpen(false)
  }

  function closeDeleteModal() {
    setDeleteError('')
    setConfirmTripName('')
    setIsDeleteOpen(false)
  }

  function closeEditModal() {
    setTripEditError('')
    setEditName(trip.name)
    setEditDestination(trip.destination ?? '')
    setEditStartsOn(trip.starts_on)
    setEditEndsOn(trip.ends_on)
    setEditTravelType(trip.metadata.travel_type ?? 'Other')
    setIsEditingTrip(false)
  }

  async function handleDeleteTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isOwner) {
      return
    }

    if (confirmTripName.trim() !== trip.name.trim()) {
      return
    }

    setDeleteError('')
    setIsDeletingTrip(true)

    try {
      await deleteTrip(trip.id)
      onTripDeleted()
    } catch (deleteFailure) {
      setDeleteError(
        getVisibleErrorMessage(deleteFailure, 'Unable to delete this trip.'),
      )
    } finally {
      setIsDeletingTrip(false)
    }
  }

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
      setIsInviteOpen(false)
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
          onBack={onBack}
          title="Settings"
        />

        {isInviteOpen ? (
          <ModalSheet
            ariaLabel="Invite user"
            onClose={closeInviteModal}
            title="Invite User"
          >
            <form className="invite-form" onSubmit={handleInvite}>
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                required
              />

              <SelectInput
                label="Role"
                value={inviteRole}
                onChange={(v) => setInviteRole(v as InviteRole)}
                options={[
                  { value: 'viewer', label: 'Viewer' },
                  { value: 'editor', label: 'Editor' },
                ]}
              />

              {inviteError ? (
                <FeedbackMessage tone="error">{inviteError}</FeedbackMessage>
              ) : null}

              <FormActions>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={closeInviteModal}
                  disabled={isInviting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? 'Inviting…' : 'Invite User'}
                </Button>
              </FormActions>
            </form>
          </ModalSheet>
        ) : null}

        {isDeleteOpen ? (
          <ModalSheet
            ariaLabel="Delete trip"
            onClose={closeDeleteModal}
            title="Delete Trip"
          >
            <form className="trip-form" onSubmit={handleDeleteTrip}>
              <p className="muted">
                This will permanently delete <strong>{trip.name}</strong> and all associated days, activities, and members. This cannot be undone.
              </p>

              <TextInput
                label="Type trip name to confirm"
                value={confirmTripName}
                onChange={setConfirmTripName}
                required
              />

              {deleteError ? (
                <FeedbackMessage tone="error">{deleteError}</FeedbackMessage>
              ) : null}

              <FormActions>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={isDeletingTrip}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={isDeletingTrip || confirmTripName.trim() !== trip.name.trim()}
                >
                  {isDeletingTrip ? 'Deleting…' : 'Delete Trip'}
                </Button>
              </FormActions>
            </form>
          </ModalSheet>
        ) : null}

        {isEditingTrip ? (
          <ModalSheet
            ariaLabel="Edit trip"
            onClose={closeEditModal}
            title="Edit Trip"
          >
            <form className="trip-form" onSubmit={handleTripUpdate}>
              <TextInput
                label="Trip Name"
                value={editName}
                onChange={setEditName}
                required
              />

              <TextInput
                label="Location"
                value={editDestination}
                onChange={setEditDestination}
              />

              <FormGrid>
                <TextInput
                  label="Start Date"
                  type="date"
                  value={editStartsOn}
                  onChange={setEditStartsOn}
                  required
                />
                <TextInput
                  label="End Date"
                  type="date"
                  value={editEndsOn}
                  onChange={setEditEndsOn}
                  required
                />
              </FormGrid>

              <SelectInput
                label="Travel Type"
                value={editTravelType}
                onChange={(v) => setEditTravelType(v as TravelType)}
                options={travelTypes.map((type) => ({ value: type, label: type }))}
              />

              {tripEditError ? (
                <FeedbackMessage tone="error">{tripEditError}</FeedbackMessage>
              ) : null}

              <FormActions>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={closeEditModal}
                  disabled={isSavingTrip}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSavingTrip}>
                  {isSavingTrip ? 'Saving…' : 'Save Trip'}
                </Button>
              </FormActions>
            </form>
          </ModalSheet>
        ) : null}

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
            <div className="settings-action-row">
              <h2>Invite User</h2>
              <IconButton
                icon="user-plus"
                label="Invite user"
                onClick={() => setIsInviteOpen(true)}
              />
            </div>
          </CardSurface>
        ) : null}

        {!isLoading && !error && canEditTrip ? (
          <CardSurface className="settings-panel" aria-label="Edit trip">
            <div className="settings-action-row">
              <h2>Edit Trip</h2>
              <IconButton
                icon="edit"
                label="Edit trip basics"
                onClick={() => setIsEditingTrip(true)}
              />
            </div>
          </CardSurface>
        ) : null}

        {!isLoading && !error ? (
          <CardSurface className="settings-panel" aria-label="Trip members">
            <div>
              <h2>Members</h2>
            </div>

            {memberError ? <p className="feedback">{memberError}</p> : null}

            <div className="member-list">
              {members.map((member) => (
                <div className="member-row" key={member.id}>
                  <div>
                    <strong>{getMemberName(member)}</strong>
                    {member.display_name && member.display_name !== member.email ? (
                      <p className="muted">{member.email}</p>
                    ) : null}
                  </div>

                  <Badge tone={roleTones[member.role]}>
                    {getRoleLabel(member.role)}
                  </Badge>

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

        {!isLoading && !error && isOwner && invites.some((i) => i.status === 'pending') ? (
          <CardSurface className="settings-panel" aria-label="Pending invites">
            <div>
              <h2>Pending Invites</h2>
            </div>

            <div className="member-list">
              {invites.filter((i) => i.status === 'pending').map((invite) => (
                <div className="member-row" key={invite.id}>
                  <div>
                    <strong>{invite.email}</strong>
                    <p className="muted">
                      Expires {formatInviteDate(invite.expires_at)}
                    </p>
                  </div>
                  <Badge tone={roleTones[invite.role]}>
                    {getRoleLabel(invite.role)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardSurface>
        ) : null}

        {!isLoading && !error && isOwner ? (
          <CardSurface className="settings-panel" aria-label="Delete trip">
            <div className="settings-action-row">
              <h2>Delete Trip</h2>
              <Button
                variant="destructive"
                type="button"
                onClick={() => setIsDeleteOpen(true)}
              >
                Delete
              </Button>
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
