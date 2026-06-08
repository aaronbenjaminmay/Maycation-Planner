import { type FormEvent, useCallback, useEffect, useState } from 'react'
import {
  createTripInvite,
  loadTripInvites,
  loadTripMembers,
  removeTripMember,
  updateTripMemberRole,
  type TripInvite,
  type TripMember,
} from '../lib/tripMembers'
import type { Trip, TripMemberRole } from '../lib/trips'

type TripSettingsProps = {
  currentRole: TripMemberRole | null
  onBack: () => void
  trip: Trip
}

type InviteRole = Exclude<TripMemberRole, 'owner'>

function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function TripSettings({
  currentRole,
  onBack,
  trip,
}: TripSettingsProps) {
  const [members, setMembers] = useState<TripMember[]>([])
  const [invites, setInvites] = useState<TripInvite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<InviteRole>('viewer')
  const [error, setError] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [memberError, setMemberError] = useState('')
  const isOwner = currentRole === 'owner'
  const ownerCount = members.filter((member) => member.role === 'owner').length

  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const loadedMembers = await loadTripMembers(trip.id)
      setMembers(loadedMembers)

      if (isOwner) {
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
  }, [isOwner, trip.id])

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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

  async function handleRoleChange(member: TripMember, role: InviteRole) {
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
      <section className="dashboard-panel trips-panel">
        <header className="trip-detail-header">
          <button type="button" className="secondary-button" onClick={onBack}>
            Back
          </button>

          <div>
            <p className="eyebrow">Trip Settings</p>
            <h1>{trip.name}</h1>
            <p className="muted">
              {isOwner
                ? 'Manage invitations and member roles.'
                : 'View trip membership.'}
            </p>
          </div>
        </header>

        {isLoading ? (
          <section className="state-panel">
            <h2>Loading settings</h2>
            <p className="muted">Gathering trip members.</p>
          </section>
        ) : null}

        {!isLoading && error ? (
          <section className="state-panel">
            <h2>Could not load settings</h2>
            <p className="muted">{error}</p>
            <button type="button" onClick={() => void loadSettings()}>
              Try again
            </button>
          </section>
        ) : null}

        {!isLoading && !error && isOwner ? (
          <section className="settings-panel" aria-label="Invite user">
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

              <button type="submit" disabled={isInviting}>
                {isInviting ? 'Inviting...' : 'Create Invite'}
              </button>
            </form>
          </section>
        ) : null}

        {!isLoading && !error ? (
          <section className="settings-panel" aria-label="Trip members">
            <div>
              <h2>Members</h2>
              <p className="muted">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
            </div>

            {memberError ? <p className="feedback">{memberError}</p> : null}

            <div className="member-list">
              {members.map((member) => (
                <article className="member-card" key={member.id}>
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
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => void handleRemoveMember(member)}
                          disabled={busyMemberId === member.id}
                        >
                          {busyMemberId === member.id ? 'Removing...' : 'Remove'}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {!isLoading && !error && isOwner && invites.length > 0 ? (
          <section className="settings-panel" aria-label="Trip invites">
            <div>
              <h2>Invites</h2>
              <p className="muted">Invitation history and current status.</p>
            </div>

            <div className="member-list">
              {invites.map((invite) => (
                <article className="member-card" key={invite.id}>
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
                </article>
              ))}
            </div>
          </section>
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
