import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { signOut } from '../lib/auth'
import { createTrip, loadTripsForUser, type CreateTripInput, type Trip } from '../lib/trips'
import {
  acceptTripInvite,
  declineTripInvite,
  loadMyPendingInvites,
  type PendingTripInvite,
} from '../lib/tripMembers'
import { CreateTripForm } from './CreateTripForm'
import { TripDetail } from './TripDetail'
import { TripCard } from './TripCard'

type TripsDashboardProps = {
  user: User
}

function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function TripsDashboard({ user }: TripsDashboardProps) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingTripInvite[]>([])
  const [isLoadingTrips, setIsLoadingTrips] = useState(true)
  const [isCreatingTrip, setIsCreatingTrip] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [busyInviteId, setBusyInviteId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [createError, setCreateError] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)

  const loadTrips = useCallback(async () => {
    setIsLoadingTrips(true)
    setError('')

    try {
      const [loadedTrips, loadedInvites] = await Promise.all([
        loadTripsForUser(),
        loadMyPendingInvites(),
      ])
      setTrips(loadedTrips)
      setPendingInvites(loadedInvites)
    } catch (loadError) {
      setError(getVisibleErrorMessage(loadError, 'Unable to load your trips.'))
    } finally {
      setIsLoadingTrips(false)
    }
  }, [])

  useEffect(() => {
    void loadTrips()
  }, [loadTrips])

  async function handleCreateTrip(input: CreateTripInput) {
    setCreateError('')
    setIsCreatingTrip(true)

    try {
      await createTrip(input)
      setIsCreateOpen(false)
      await loadTrips()
    } catch (creationError) {
      setCreateError(
        getVisibleErrorMessage(creationError, 'Unable to create this trip.'),
      )
    } finally {
      setIsCreatingTrip(false)
    }
  }

  async function handleAcceptInvite(inviteId: string) {
    setInviteError('')
    setBusyInviteId(inviteId)

    try {
      await acceptTripInvite(inviteId)
      await loadTrips()
    } catch (acceptError) {
      setInviteError(
        getVisibleErrorMessage(acceptError, 'Unable to accept invite.'),
      )
    } finally {
      setBusyInviteId(null)
    }
  }

  async function handleDeclineInvite(inviteId: string) {
    setInviteError('')
    setBusyInviteId(inviteId)

    try {
      await declineTripInvite(inviteId)
      setPendingInvites(await loadMyPendingInvites())
    } catch (declineError) {
      setInviteError(
        getVisibleErrorMessage(declineError, 'Unable to decline invite.'),
      )
    } finally {
      setBusyInviteId(null)
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  function handleTripUpdated(updatedTrip: Trip) {
    setActiveTrip(updatedTrip)
    setTrips((currentTrips) =>
      currentTrips.map((trip) =>
        trip.id === updatedTrip.id ? updatedTrip : trip,
      ),
    )
  }

  if (activeTrip) {
    return (
      <TripDetail
        trip={activeTrip}
        onBack={() => setActiveTrip(null)}
        onTripUpdated={handleTripUpdated}
      />
    )
  }

  return (
    <main className="app-shell dashboard-shell">
      <section className="dashboard-panel trips-panel">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Maycation Planner</p>
            <h1>My Trips</h1>
            <p className="muted">Signed in as {user.email}</p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            Sign out
          </button>
        </header>

        {isCreateOpen ? (
          <section className="create-trip-panel" aria-label="Create trip">
            <div>
              <h2>Create Trip</h2>
              <p className="muted">
                Set the basics now. Days will be generated automatically.
              </p>
            </div>
            <CreateTripForm
              error={createError}
              isSubmitting={isCreatingTrip}
              onCancel={() => {
                setCreateError('')
                setIsCreateOpen(false)
              }}
              onSubmit={handleCreateTrip}
            />
          </section>
        ) : null}

        {!isCreateOpen ? (
          <div className="toolbar">
            <button type="button" onClick={() => setIsCreateOpen(true)}>
              Create Trip
            </button>
          </div>
        ) : null}

        {isLoadingTrips ? (
          <section className="state-panel">
            <h2>Loading trips</h2>
            <p className="muted">Gathering your family travel plans.</p>
          </section>
        ) : null}

        {!isLoadingTrips && error ? (
          <section className="state-panel">
            <h2>Could not load trips</h2>
            <p className="muted">{error}</p>
            <button type="button" onClick={() => void loadTrips()}>
              Try again
            </button>
          </section>
        ) : null}

        {!isLoadingTrips && !error && pendingInvites.length > 0 ? (
          <section
            className="settings-panel"
            aria-label="Pending invitations"
          >
            <div>
              <h2>Pending Invitations</h2>
              <p className="muted">Trips shared with {user.email}</p>
            </div>

            {inviteError ? <p className="feedback">{inviteError}</p> : null}

            <div className="member-list">
              {pendingInvites.map((invite) => (
                <article className="member-card" key={invite.id}>
                  <div>
                    <strong>{invite.trip_name}</strong>
                    <p className="muted">
                      {formatInviteTripMeta(invite)}
                    </p>
                  </div>

                  <span className={`role-pill ${invite.role}`}>
                    {getRoleLabel(invite.role)}
                  </span>

                  <div className="member-actions">
                    <button
                      type="button"
                      onClick={() => void handleAcceptInvite(invite.id)}
                      disabled={busyInviteId === invite.id}
                    >
                      {busyInviteId === invite.id ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => void handleDeclineInvite(invite.id)}
                      disabled={busyInviteId === invite.id}
                    >
                      Decline
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {!isLoadingTrips &&
        !error &&
        trips.length === 0 &&
        pendingInvites.length === 0 &&
        !isCreateOpen ? (
          <section className="empty-state">
            <h2>No trips yet</h2>
            <p className="muted">
              Create your first family trip and Maycation Planner will build the
              day-by-day foundation for you.
            </p>
            <button type="button" onClick={() => setIsCreateOpen(true)}>
              Create Trip
            </button>
          </section>
        ) : null}

        {!isLoadingTrips && !error && trips.length > 0 ? (
          <section className="trip-list" aria-label="Trips">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onSelect={setActiveTrip} />
            ))}
          </section>
        ) : null}
      </section>
    </main>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatInviteTripMeta(invite: PendingTripInvite) {
  const location = invite.destination || 'Location not set'

  if (invite.starts_on && invite.ends_on) {
    return `${location} - ${formatDate(invite.starts_on)} - ${formatDate(
      invite.ends_on,
    )}`
  }

  return location
}

function getRoleLabel(role: PendingTripInvite['role']) {
  switch (role) {
    case 'editor':
      return 'Editor'
    case 'viewer':
      return 'Viewer'
  }
}
