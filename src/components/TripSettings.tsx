import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import {
  createTripInvite,
  loadTripAccess,
  loadTripInvites,
  loadTripMembers,
  removeTripMember,
  sendInviteEmail,
  updateTripMemberRole,
  type TripInvite,
  type TripMember,
} from '../lib/tripMembers'
import { getSupabaseClient } from '../lib/supabaseClient'
import {
  deleteTrip,
  getTripHeaderImageUrl,
  setTripBackground,
  setTripHeaderImage,
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
  backgroundUrl?: string | null
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
  backgroundUrl,
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
  const [inviteSuccessEmail, setInviteSuccessEmail] = useState<string | null>(null)
  const [memberError, setMemberError] = useState('')
  const [isBgOpen, setIsBgOpen] = useState(false)
  const [isUploadingBg, setIsUploadingBg] = useState(false)
  const [isRemovingBg, setIsRemovingBg] = useState(false)
  const [bgError, setBgError] = useState('')
  const bgInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingHeaderImg, setIsUploadingHeaderImg] = useState(false)
  const [isRemovingHeaderImg, setIsRemovingHeaderImg] = useState(false)
  const [headerImgError, setHeaderImgError] = useState('')
  const [localHeaderImageUrl, setLocalHeaderImageUrl] = useState<string | null>(null)
  const headerImgInputRef = useRef<HTMLInputElement>(null)
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
    if (isEditingTrip) return
    setEditName(trip.name)
    setEditDestination(trip.destination ?? '')
    setEditStartsOn(trip.starts_on)
    setEditEndsOn(trip.ends_on)
    setEditTravelType(trip.metadata.travel_type ?? 'Other')
  }, [trip, isEditingTrip])

  useEffect(() => {
    if (!trip.header_image_path) {
      setLocalHeaderImageUrl(null)
      return
    }
    let cancelled = false
    getTripHeaderImageUrl(trip.header_image_path)
      .then((url) => { if (!cancelled) setLocalHeaderImageUrl(url) })
      .catch(() => { if (!cancelled) setLocalHeaderImageUrl(null) })
    return () => { cancelled = true }
  }, [trip.header_image_path])

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
    setInviteSuccessEmail(null)
  }

  function closeDeleteModal() {
    setDeleteError('')
    setConfirmTripName('')
    setIsDeleteOpen(false)
  }

  function closeEditModal() {
    setTripEditError('')
    setHeaderImgError('')
    setEditName(trip.name)
    setEditDestination(trip.destination ?? '')
    setEditStartsOn(trip.starts_on)
    setEditEndsOn(trip.ends_on)
    setEditTravelType(trip.metadata.travel_type ?? 'Other')
    setIsEditingTrip(false)
    if (headerImgInputRef.current) headerImgInputRef.current.value = ''
  }

  async function handleHeaderImgFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setHeaderImgError('')

    if (file.size > 10 * 1024 * 1024) {
      setHeaderImgError('Image must be 10 MB or smaller.')
      if (headerImgInputRef.current) headerImgInputRef.current.value = ''
      return
    }

    setIsUploadingHeaderImg(true)

    try {
      const client = getSupabaseClient()
      const storagePath = `${trip.id}/header`

      const { error: uploadError } = await client.storage
        .from('trip-backgrounds')
        .upload(storagePath, file, { upsert: true, contentType: file.type })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      await setTripHeaderImage(trip.id, storagePath)
      onTripUpdated({ ...trip, header_image_path: storagePath })
    } catch (err) {
      setHeaderImgError(getVisibleErrorMessage(err, 'Unable to upload header image.'))
    } finally {
      setIsUploadingHeaderImg(false)
      if (headerImgInputRef.current) headerImgInputRef.current.value = ''
    }
  }

  async function handleRemoveHeaderImg() {
    setHeaderImgError('')
    setIsRemovingHeaderImg(true)

    try {
      const client = getSupabaseClient()
      await client.storage.from('trip-backgrounds').remove([`${trip.id}/header`])
      await setTripHeaderImage(trip.id, null)
      onTripUpdated({ ...trip, header_image_path: null })
    } catch (err) {
      setHeaderImgError(getVisibleErrorMessage(err, 'Unable to remove header image.'))
    } finally {
      setIsRemovingHeaderImg(false)
    }
  }

  function closeBgModal() {
    setBgError('')
    setIsBgOpen(false)
    if (bgInputRef.current) {
      bgInputRef.current.value = ''
    }
  }

  async function handleBgFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setBgError('')

    if (file.size > 10 * 1024 * 1024) {
      setBgError('Image must be 10 MB or smaller.')
      if (bgInputRef.current) bgInputRef.current.value = ''
      return
    }

    setIsUploadingBg(true)

    try {
      const client = getSupabaseClient()
      const storagePath = `${trip.id}/background`

      const { error: uploadError } = await client.storage
        .from('trip-backgrounds')
        .upload(storagePath, file, { upsert: true, contentType: file.type })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      await setTripBackground(trip.id, storagePath)
      onTripUpdated({ ...trip, background_path: storagePath })
      closeBgModal()
    } catch (err) {
      setBgError(getVisibleErrorMessage(err, 'Unable to upload background image.'))
    } finally {
      setIsUploadingBg(false)
      if (bgInputRef.current) bgInputRef.current.value = ''
    }
  }

  async function handleRemoveBg() {
    setBgError('')
    setIsRemovingBg(true)

    try {
      const client = getSupabaseClient()

      await client.storage
        .from('trip-backgrounds')
        .remove([`${trip.id}/background`])

      await setTripBackground(trip.id, null)
      onTripUpdated({ ...trip, background_path: null })
      closeBgModal()
    } catch (err) {
      setBgError(getVisibleErrorMessage(err, 'Unable to remove background image.'))
    } finally {
      setIsRemovingBg(false)
    }
  }

  async function handleDeleteTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isOwner) {
      return
    }

    if (confirmTripName.trim() !== 'DELETE') {
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
      const sentEmail = email.trim()
      const inviteId = await createTripInvite(trip.id, sentEmail, inviteRole)
      await sendInviteEmail(inviteId)
      setEmail('')
      setInviteRole('viewer')
      setIsInviteOpen(false)
      setInviteSuccessEmail(sentEmail)
      await loadSettings()
    } catch (inviteFailure) {
      setInviteError(
        getVisibleErrorMessage(inviteFailure, 'Unable to send invite. Please try again.'),
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
    <main
      className={`app-shell dashboard-shell${backgroundUrl ? ' has-trip-bg' : ''}`}
      style={backgroundUrl ? ({ '--trip-bg-image': `url(${backgroundUrl})` } as React.CSSProperties) : undefined}
    >
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
                label="Type DELETE to confirm"
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
                  disabled={isDeletingTrip || confirmTripName.trim() !== 'DELETE'}
                >
                  {isDeletingTrip ? 'Deleting…' : 'Delete Trip'}
                </Button>
              </FormActions>
            </form>
          </ModalSheet>
        ) : null}

        {isBgOpen ? (
          <ModalSheet
            ariaLabel="Background image"
            onClose={closeBgModal}
            title="Background Image"
          >
            <input
              ref={bgInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
              style={{ display: 'none' }}
              onChange={(e) => void handleBgFileChange(e)}
            />

            {backgroundUrl ? (
              <img
                src={backgroundUrl}
                alt="Current trip background"
                className="bg-preview"
              />
            ) : null}

            {bgError ? (
              <FeedbackMessage tone="error">{bgError}</FeedbackMessage>
            ) : null}

            <FormActions>
              {trip.background_path ? (
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => void handleRemoveBg()}
                  disabled={isRemovingBg || isUploadingBg}
                >
                  {isRemovingBg ? 'Removing…' : 'Remove Image'}
                </Button>
              ) : null}
              <Button
                variant="secondary"
                type="button"
                onClick={closeBgModal}
                disabled={isUploadingBg || isRemovingBg}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => bgInputRef.current?.click()}
                disabled={isUploadingBg || isRemovingBg}
              >
                {isUploadingBg
                  ? 'Uploading…'
                  : trip.background_path
                    ? 'Replace Image'
                    : 'Upload Image'}
              </Button>
            </FormActions>
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

              <input
                ref={headerImgInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
                style={{ display: 'none' }}
                onChange={(e) => void handleHeaderImgFileChange(e)}
              />

              <div className="upload-field">
                <p className="upload-field__label">Header Image</p>
                <p className="muted">Replaces the trip title on the dashboard when set.</p>
                {localHeaderImageUrl ? (
                  <img
                    src={localHeaderImageUrl}
                    alt="Current header image"
                    className="header-img-preview"
                  />
                ) : null}
                {headerImgError ? (
                  <FeedbackMessage tone="error">{headerImgError}</FeedbackMessage>
                ) : null}
                <div style={{ display: 'flex', gap: 8 }}>
                  {trip.header_image_path ? (
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => void handleRemoveHeaderImg()}
                      disabled={isRemovingHeaderImg || isUploadingHeaderImg || isSavingTrip}
                    >
                      {isRemovingHeaderImg ? 'Removing…' : 'Remove'}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => headerImgInputRef.current?.click()}
                    disabled={isUploadingHeaderImg || isRemovingHeaderImg || isSavingTrip}
                  >
                    {isUploadingHeaderImg
                      ? 'Uploading…'
                      : trip.header_image_path
                        ? 'Replace'
                        : 'Upload Image'}
                  </Button>
                </div>
              </div>

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
              <Button type="button" onClick={() => void loadSettings()}>
                Try again
              </Button>
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
            {inviteSuccessEmail ? (
              <FeedbackMessage tone="success">
                Invite sent to {inviteSuccessEmail}
              </FeedbackMessage>
            ) : null}
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

        {!isLoading && !error && isOwner ? (
          <CardSurface className="settings-panel" aria-label="Background image">
            <div className="settings-action-row">
              <h2>Background Image</h2>
              <IconButton
                icon="image"
                label="Manage background image"
                onClick={() => setIsBgOpen(true)}
              />
            </div>
          </CardSurface>
        ) : null}

        {!isLoading && !error ? (
          <CardSurface className="settings-panel" aria-label="Trip members">
            <div>
              <h2>Members</h2>
            </div>

            {memberError ? <FeedbackMessage tone="error">{memberError}</FeedbackMessage> : null}

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
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => void handleRoleChange(member, 'editor')}
                          disabled={busyMemberId === member.id}
                        >
                          Make editor
                        </Button>
                      ) : null}

                      {member.role === 'editor' ? (
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => void handleRoleChange(member, 'viewer')}
                          disabled={busyMemberId === member.id}
                        >
                          Make viewer
                        </Button>
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
