import { useCallback, useEffect, useState } from 'react'
import {
  formatTripDateRange,
  formatTripDayDate,
  getTripBackgroundUrl,
  getTripDayCount,
  loadPlannerItems,
  loadTripDays,
  type PlannerItem,
  type Trip,
  type TripDay,
  type TripMemberRole,
} from '../lib/trips'
import { loadTripAccess } from '../lib/tripMembers'
import {
  CardSurface,
  DayTile,
  DetailHeader,
  EmptyState,
  IconButton,
} from './DesignSystem'
import { DayDetail } from './DayDetail'
import { TripReservations } from './TripReservations'
import { TripSettings } from './TripSettings'

type TripDetailProps = {
  trip: Trip
  onBack: () => void
  onTripDeleted: () => void
  onTripUpdated: (trip: Trip) => void
}

function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function isPlannerItemCompleted(item: PlannerItem) {
  return item.metadata.completed === true
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getTodayStart() {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDashboardDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(parseDateInput(date))
}

function getTripPhase(trip: Trip) {
  const start = parseDateInput(trip.starts_on)
  const today = getTodayStart()
  const end = parseDateInput(trip.ends_on)

  if (today < start) {
    return 'before'
  }

  if (today > end) {
    return 'after'
  }

  return 'during'
}

function getPreTripCountdown(startsOn: string) {
  const start = parseDateInput(startsOn)
  const today = getTodayStart()

  if (start <= today) {
    return null
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000
  const days = Math.ceil((start.getTime() - today.getTime()) / millisecondsPerDay)

  return {
    days,
    label: days === 1 ? 'Starts tomorrow' : `Starts in ${days} days`,
  }
}

function sortItemsByPlanOrder(items: PlannerItem[]) {
  return [...items].sort((left, right) => {
    if (left.starts_at && right.starts_at) {
      return new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime()
    }

    if (left.starts_at) {
      return -1
    }

    if (right.starts_at) {
      return 1
    }

    return left.sort_order - right.sort_order
  })
}

export function TripDetail({ trip, onBack, onTripDeleted, onTripUpdated }: TripDetailProps) {
  const [tripDays, setTripDays] = useState<TripDay[]>([])
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([])
  const [isLoadingDays, setIsLoadingDays] = useState(true)
  const [activeDayId, setActiveDayId] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showReservations, setShowReservations] = useState(false)
  const [currentRole, setCurrentRole] = useState<TripMemberRole | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

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

  useEffect(() => {
    if (!trip.background_path) {
      setBackgroundUrl(null)
      return
    }

    let cancelled = false

    getTripBackgroundUrl(trip.background_path)
      .then((url) => {
        if (!cancelled) setBackgroundUrl(url)
      })
      .catch(() => {
        if (!cancelled) setBackgroundUrl(null)
      })

    return () => {
      cancelled = true
    }
  }, [trip.background_path])

  function getItemsForDay(dayId: string) {
    return plannerItems.filter((item) => item.trip_day_id === dayId)
  }

  const activeDayIndex = tripDays.findIndex((day) => day.id === activeDayId)
  const activeDay = activeDayIndex >= 0 ? tripDays[activeDayIndex] : null
  const canEditPlannerItems =
    currentRole === 'owner' || currentRole === 'editor'
  const completedItemCount = plannerItems.filter(isPlannerItemCompleted).length
  const tripPhase = getTripPhase(trip)
  const todayKey = formatDateKey(getTodayStart())
  const currentTripDay = tripDays.find((day) => day.date === todayKey) ?? null
  const currentTripDayIndex = currentTripDay
    ? tripDays.findIndex((day) => day.id === currentTripDay.id)
    : -1
  const todayItems = currentTripDay ? getItemsForDay(currentTripDay.id) : []
  const nextTodayItem =
    sortItemsByPlanOrder(todayItems).find((item) => !isPlannerItemCompleted(item)) ??
    null
  const reservationItems = sortItemsByPlanOrder(
    plannerItems.filter((item) => item.kind === 'reservation'),
  )
  const nextReservation =
    reservationItems.find((item) => {
      if (!item.starts_at) {
        return false
      }

      return new Date(item.starts_at) >= getTodayStart()
    }) ?? reservationItems[0] ?? null
  const tripDayCount =
    tripDays.length > 0 ? tripDays.length : getTripDayCount(trip.starts_on, trip.ends_on)
  const countdown = getPreTripCountdown(trip.starts_on)

  const bgStyle = backgroundUrl
    ? ({ '--trip-bg-image': `url(${backgroundUrl})` } as React.CSSProperties)
    : undefined
  const bgClass = backgroundUrl ? ' has-trip-bg' : ''

  if (isSettingsOpen) {
    return (
      <TripSettings
        backgroundUrl={backgroundUrl}
        currentRole={currentRole}
        onBack={() => setIsSettingsOpen(false)}
        onTripDeleted={onTripDeleted}
        onTripUpdated={onTripUpdated}
        trip={trip}
      />
    )
  }

  if (showReservations) {
    return (
      <TripReservations
        backgroundUrl={backgroundUrl}
        onBack={() => setShowReservations(false)}
        plannerItems={plannerItems}
        trip={trip}
        tripDays={tripDays}
      />
    )
  }

  if (activeDay) {
    return (
      <DayDetail
        backgroundUrl={backgroundUrl}
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
    <main
      className={`app-shell dashboard-shell trip-dashboard-screen${bgClass}`}
      style={bgStyle}
    >
      <section className="page-shell trip-dashboard">
        <DetailHeader
          action={
            <IconButton
              icon="settings"
              label="Trip Settings"
              onClick={() => setIsSettingsOpen(true)}
            />
          }
          meta={
            <p className="muted">
              {[formatTripDateRange(trip.starts_on, trip.ends_on), trip.destination]
                .filter(Boolean)
                .join(' • ')}
            </p>
          }
          onBack={onBack}
          title={trip.name}
        />

        {isLoadingDays ? (
          <EmptyState title="Loading trip dashboard">
            <p className="muted">Building your day-by-day dashboard.</p>
          </EmptyState>
        ) : null}

        {!isLoadingDays && error ? (
          <EmptyState
            title="Could not load trip dashboard"
            action={
              <button type="button" onClick={() => void loadDays()}>
                Try again
              </button>
            }
          >
            <p className="muted">{error}</p>
          </EmptyState>
        ) : null}

        {!isLoadingDays && !error ? (
          <CardSurface className="trip-intel-card">
            {tripPhase === 'before' && countdown ? (
              <div className="trip-intel-card__header">
                <div>
                  <span>Trip starts in</span>
                  <strong>
                    {countdown.days} {countdown.days === 1 ? 'day' : 'days'}
                  </strong>
                </div>
              </div>
            ) : null}

            {tripPhase === 'during' ? (
              <>
                <div className="trip-intel-card__header">
                  <div>
                    <span>Today</span>
                    <strong>
                      {currentTripDay
                        ? `Day ${currentTripDayIndex + 1}`
                        : 'No trip day found'}
                    </strong>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>Date</dt>
                    <dd>
                      {currentTripDay
                        ? currentTripDay.label || formatTripDayDate(currentTripDay.date)
                        : 'No matching day'}
                    </dd>
                  </div>
                  {nextTodayItem ? (
                  <div>
                    <dt>Next</dt>
                    <dd>{nextTodayItem.title}</dd>
                  </div>
                  ) : null}
                </dl>
              </>
            ) : null}

            {tripPhase === 'after' ? (
              <>
                <div className="trip-intel-card__header">
                  <strong>Trip complete</strong>
                </div>
                <dl>
                  <div>
                    <dt>Days</dt>
                    <dd>{tripDayCount}</dd>
                  </div>
                  <div>
                    <dt>Complete</dt>
                    <dd>
                      {completedItemCount} / {plannerItems.length || 0}
                    </dd>
                  </div>
                  <div>
                    <dt>Reservations</dt>
                    <dd>{reservationItems.length || '-'}</dd>
                  </div>
                </dl>
              </>
            ) : null}
          </CardSurface>
        ) : null}

        {!isLoadingDays && !error && tripDays.length === 0 ? (
          <EmptyState title="No days found">
            <p className="muted">This trip does not have generated days yet.</p>
          </EmptyState>
        ) : null}

        {!isLoadingDays && !error && tripDays.length > 0 ? (
          <section className="trip-destination-grid" aria-label="Trip days">
            {tripDays.map((day, index) => {
              const dayItems = getItemsForDay(day.id)
              const completedCount = dayItems.filter(isPlannerItemCompleted).length

              return (
                <DayTile
                  completedCount={completedCount}
                  date={formatDashboardDate(day.date)}
                  dayNumber={index + 1}
                  itemCount={dayItems.length}
                  key={day.id}
                  onOpen={() => setActiveDayId(day.id)}
                  subtitle={day.label || undefined}
                  title={day.label || `Day ${index + 1}`}
                />
              )
            })}

            <DayTile
              completedCount={reservationItems.filter(isPlannerItemCompleted).length}
              dayNumber={tripDays.length + 1}
              itemCount={reservationItems.length}
              onOpen={() => setShowReservations(true)}
              subtitle={nextReservation?.title ?? undefined}
              title="Reservations"
            />
          </section>
        ) : null}

      </section>
    </main>
  )
}
