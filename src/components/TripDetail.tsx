import { useCallback, useEffect, useState } from 'react'
import {
  formatTripDateRange,
  formatTripDayDate,
  loadTripDays,
  type Trip,
  type TripDay,
} from '../lib/trips'

type TripDetailProps = {
  trip: Trip
  onBack: () => void
}

function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function TripDetail({ trip, onBack }: TripDetailProps) {
  const [tripDays, setTripDays] = useState<TripDay[]>([])
  const [isLoadingDays, setIsLoadingDays] = useState(true)
  const [error, setError] = useState('')
  const travelType = trip.metadata.travel_type ?? 'Other'

  const loadDays = useCallback(async () => {
    setIsLoadingDays(true)
    setError('')

    try {
      setTripDays(await loadTripDays(trip.id))
    } catch (loadError) {
      setError(getVisibleErrorMessage(loadError, 'Unable to load trip days.'))
    } finally {
      setIsLoadingDays(false)
    }
  }, [trip.id])

  useEffect(() => {
    void loadDays()
  }, [loadDays])

  return (
    <main className="app-shell dashboard-shell">
      <section className="dashboard-panel trips-panel">
        <header className="trip-detail-header">
          <button type="button" className="secondary-button" onClick={onBack}>
            Back
          </button>

          <div>
            <p className="eyebrow">Trip Dashboard</p>
            <h1>{trip.name}</h1>
            <p className="muted">{trip.destination || 'Location not set'}</p>
          </div>
        </header>

        <section className="trip-summary" aria-label="Trip summary">
          <div>
            <span className="label">Dates</span>
            <strong>{formatTripDateRange(trip.starts_on, trip.ends_on)}</strong>
          </div>
          <div>
            <span className="label">Travel Type</span>
            <strong>{travelType}</strong>
          </div>
        </section>

        {isLoadingDays ? (
          <section className="state-panel">
            <h2>Loading trip days</h2>
            <p className="muted">Building your day-by-day dashboard.</p>
          </section>
        ) : null}

        {!isLoadingDays && error ? (
          <section className="state-panel">
            <h2>Could not load trip days</h2>
            <p className="muted">{error}</p>
            <button type="button" onClick={() => void loadDays()}>
              Try again
            </button>
          </section>
        ) : null}

        {!isLoadingDays && !error && tripDays.length === 0 ? (
          <section className="state-panel">
            <h2>No days found</h2>
            <p className="muted">This trip does not have generated days yet.</p>
          </section>
        ) : null}

        {!isLoadingDays && !error && tripDays.length > 0 ? (
          <section className="trip-day-list" aria-label="Trip days">
            {tripDays.map((day, index) => (
              <article className="trip-day-card" key={day.id}>
                <span className="trip-day-card__number">Day {index + 1}</span>
                <h2>{day.label || formatTripDayDate(day.date)}</h2>
                {day.label ? (
                  <p className="muted">{formatTripDayDate(day.date)}</p>
                ) : null}
                <p className="muted">No plans yet</p>
              </article>
            ))}
          </section>
        ) : null}
      </section>
    </main>
  )
}
