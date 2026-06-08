import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { signOut } from '../lib/auth'
import { createTrip, loadTripsForUser, type CreateTripInput, type Trip } from '../lib/trips'
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
  const [isLoadingTrips, setIsLoadingTrips] = useState(true)
  const [isCreatingTrip, setIsCreatingTrip] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [error, setError] = useState('')
  const [createError, setCreateError] = useState('')
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null)

  const loadTrips = useCallback(async () => {
    setIsLoadingTrips(true)
    setError('')

    try {
      setTrips(await loadTripsForUser())
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

  async function handleSignOut() {
    setIsSigningOut(true)

    try {
      await signOut()
    } finally {
      setIsSigningOut(false)
    }
  }

  if (activeTrip) {
    return <TripDetail trip={activeTrip} onBack={() => setActiveTrip(null)} />
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

        {!isLoadingTrips && !error && trips.length === 0 && !isCreateOpen ? (
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
