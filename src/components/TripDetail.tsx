import { useCallback, useEffect, useState } from 'react'
import {
  formatPlannerItemTimeRange,
  formatTripDateRange,
  formatTripDayDate,
  loadPlannerItems,
  loadTripDays,
  type PlannerItem,
  type Trip,
  type TripDay,
  type TripMemberRole,
} from '../lib/trips'
import { loadTripAccess } from '../lib/tripMembers'
import { DayDetail } from './DayDetail'
import { TripSettings } from './TripSettings'

type TripDetailProps = {
  trip: Trip
  onBack: () => void
  onTripUpdated: (trip: Trip) => void
}

function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function TripDetail({ trip, onBack, onTripUpdated }: TripDetailProps) {
  const [tripDays, setTripDays] = useState<TripDay[]>([])
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([])
  const [isLoadingDays, setIsLoadingDays] = useState(true)
  const [activeDayId, setActiveDayId] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentRole, setCurrentRole] = useState<TripMemberRole | null>(null)
  const [error, setError] = useState('')
  const travelType = trip.metadata.travel_type ?? 'Other'

  const loadDays = useCallback(async () => {
    setIsLoadingDays(true)
    setError('')

    try {
      const [days, items] = await Promise.all([
        loadTripDays(trip.id),
        loadPlannerItems(trip.id),
      ])
      const role = await loadTripAccess(trip.id)
      setTripDays(days)
      setPlannerItems(items)
      setCurrentRole(role)
    } catch (loadError) {
      setError(
        getVisibleErrorMessage(loadError, 'Unable to load trip dashboard.'),
      )
    } finally {
      setIsLoadingDays(false)
    }
  }, [trip.id])

  useEffect(() => {
    void loadDays()
  }, [loadDays])

  function getItemsForDay(dayId: string) {
    return plannerItems.filter((item) => item.trip_day_id === dayId)
  }

  const activeDayIndex = tripDays.findIndex((day) => day.id === activeDayId)
  const activeDay = activeDayIndex >= 0 ? tripDays[activeDayIndex] : null
  const canEditPlannerItems =
    currentRole === 'owner' || currentRole === 'editor'

  if (isSettingsOpen) {
    return (
      <TripSettings
        currentRole={currentRole}
        onBack={() => setIsSettingsOpen(false)}
        onTripUpdated={onTripUpdated}
        trip={trip}
      />
    )
  }

  if (activeDay) {
    return (
      <DayDetail
        canEditPlannerItems={canEditPlannerItems}
        day={activeDay}
        dayNumber={activeDayIndex + 1}
        items={getItemsForDay(activeDay.id)}
        onBack={() => setActiveDayId(null)}
        onItemCreated={loadDays}
        trip={trip}
      />
    )
  }

  return (
    <main className="app-shell dashboard-shell">
      <section className="dashboard-panel trips-panel">
        <header className="trip-detail-header">
          <div className="trip-detail-nav">
            <button type="button" className="secondary-button" onClick={onBack}>
              Back
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsSettingsOpen(true)}
            >
              Settings
            </button>
          </div>

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
            <h2>Loading trip dashboard</h2>
            <p className="muted">Building your day-by-day dashboard.</p>
          </section>
        ) : null}

        {!isLoadingDays && error ? (
          <section className="state-panel">
            <h2>Could not load trip dashboard</h2>
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
            {tripDays.map((day, index) => {
              const dayItems = getItemsForDay(day.id)
              const previewItems = dayItems.slice(0, 2)

              return (
                <button
                  type="button"
                  className="trip-day-card"
                  key={day.id}
                  onClick={() => setActiveDayId(day.id)}
                >
                  <div className="trip-day-card__header">
                    <div>
                      <span className="trip-day-card__number">
                        Day {index + 1}
                      </span>
                      <h2>{day.label || formatTripDayDate(day.date)}</h2>
                      {day.label ? (
                        <p className="muted">{formatTripDayDate(day.date)}</p>
                      ) : null}
                    </div>
                    <span className="trip-day-card__count">
                      {dayItems.length}{' '}
                      {dayItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {previewItems.length > 0 ? (
                    <div className="day-preview-list">
                      {previewItems.map((item) => (
                        <span className="day-preview-item" key={item.id}>
                          <span className={`planner-item-kind ${item.kind}`}>
                            {getKindLabel(item.kind)}
                          </span>
                          <span>{item.title}</span>
                          {formatPlannerItemTimeRange(item) ? (
                            <span className="muted">
                              {formatPlannerItemTimeRange(item)}
                            </span>
                          ) : null}
                        </span>
                      ))}
                      {dayItems.length > previewItems.length ? (
                        <span className="muted">
                          +{dayItems.length - previewItems.length} more
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <p className="muted">No plans yet</p>
                  )}
                </button>
              )
            })}
          </section>
        ) : null}
      </section>
    </main>
  )
}

function getKindLabel(kind: PlannerItem['kind']) {
  switch (kind) {
    case 'activity':
      return 'Activity'
    case 'note':
      return 'Note'
    case 'reservation':
      return 'Reservation'
    case 'travel':
      return 'Travel'
  }
}
