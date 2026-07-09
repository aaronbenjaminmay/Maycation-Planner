import { useCallback, useEffect, useState } from 'react'
import {
  formatTripDateRange,
  formatTripDayDate,
  getTripBackgroundUrl,
  getTripHeaderImageUrl,
  getTripDayCount,
  loadPlannerItems,
  loadTripDays,
  type PlannerItem,
  type Trip,
  type TripDay,
  type TripDayType,
  type TripMemberRole,
} from '../lib/trips'
import { loadTripStays, type TripStay } from '../lib/stays'
import { loadTripReservations, type TripReservation } from '../lib/reservations'
import { type IconName } from './ui/Icon'
import { loadTripAccess } from '../lib/tripMembers'
import {
  Button,
  CardSurface,
  DayTile,
  DetailHeader,
  EmptyState,
  IconButton,
} from './DesignSystem'
import { DayDetail } from './DayDetail'
import { TripReservations } from './TripReservations'
import { TripSettings } from './TripSettings'
import { TripStays } from './TripStays'

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

function computeCountdownDiff(diffMs: number) {
  const d = Math.max(0, diffMs)
  return {
    days:      Math.floor(d / 86_400_000),
    hours:     Math.floor((d % 86_400_000) / 3_600_000),
    minutes:   Math.floor((d % 3_600_000)  / 60_000),
    seconds:   Math.floor((d % 60_000)     / 1_000),
    isStarted: d === 0,
  }
}

function useLiveCountdown(startsOn: string) {
  const [remaining, setRemaining] = useState(() => {
    const target = parseDateInput(startsOn)
    return computeCountdownDiff(target.getTime() - Date.now())
  })

  useEffect(() => {
    const target = parseDateInput(startsOn)

    const id = setInterval(() => {
      const diff = target.getTime() - Date.now()
      const next = computeCountdownDiff(diff)
      setRemaining(next)
      if (next.isStarted) clearInterval(id)
    }, 1000)

    return () => clearInterval(id)
  }, [startsOn])

  return remaining
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

const dayTypeIconMap: Record<TripDayType, IconName> = {
  activity: 'ticket',
  explore: 'compass',
  relax: 'tree-palm',
  special: 'star',
  travel: 'plane',
}

export function TripDetail({ trip, onBack, onTripDeleted, onTripUpdated }: TripDetailProps) {
  const [tripDays, setTripDays] = useState<TripDay[]>([])
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([])
  const [tripStays, setTripStays] = useState<TripStay[]>([])
  const [tripReservations, setTripReservations] = useState<TripReservation[]>([])
  const [isLoadingDays, setIsLoadingDays] = useState(true)
  const [activeDayId, setActiveDayId] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showReservations, setShowReservations] = useState(false)
  const [showStays, setShowStays] = useState(false)
  const [currentRole, setCurrentRole] = useState<TripMemberRole | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null)
  const [headerImageFailed, setHeaderImageFailed] = useState(false)
  const [error, setError] = useState('')

  const loadDays = useCallback(async () => {
    setIsLoadingDays(true)
    setError('')

    try {
      const [days, items, stays, reservations] = await Promise.all([
        loadTripDays(trip.id),
        loadPlannerItems(trip.id),
        loadTripStays(trip.id),
        loadTripReservations(trip.id),
      ])
      const role = await loadTripAccess(trip.id)
      setTripDays(days)
      setPlannerItems(items)
      setTripStays(stays)
      setTripReservations(reservations)
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
  }, [loadDays, trip.starts_on, trip.ends_on])

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

  useEffect(() => {
    if (!trip.header_image_path) {
      setHeaderImageUrl(null)
      setHeaderImageFailed(false)
      return
    }

    let cancelled = false

    getTripHeaderImageUrl(trip.header_image_path)
      .then((url) => {
        if (!cancelled) {
          setHeaderImageUrl(url)
          setHeaderImageFailed(false)
        }
      })
      .catch(() => {
        if (!cancelled) setHeaderImageUrl(null)
      })

    return () => {
      cancelled = true
    }
  }, [trip.header_image_path])

  function getItemsForDay(dayId: string) {
    return sortItemsByPlanOrder(plannerItems.filter((item) => item.trip_day_id === dayId))
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
  // Sourced from trip_reservations facts, not planner_items — Stay-derived
  // check-in/check-out planner items (kind='reservation') are not reservation
  // facts and must not be counted or previewed here.
  const nextTripReservation =
    tripReservations.find((reservation) => reservation.reservation_date >= todayKey) ??
    tripReservations[0] ??
    null
  const tripDayCount =
    tripDays.length > 0 ? tripDays.length : getTripDayCount(trip.starts_on, trip.ends_on)
  const remaining = useLiveCountdown(trip.starts_on)

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
        canEditReservations={canEditPlannerItems}
        onBack={() => setShowReservations(false)}
        onReservationsChanged={loadDays}
        plannerItems={plannerItems}
        reservations={tripReservations}
        trip={trip}
        tripDays={tripDays}
        tripStays={tripStays}
      />
    )
  }

  if (showStays) {
    return (
      <TripStays
        backgroundUrl={backgroundUrl}
        canEditStays={canEditPlannerItems}
        onBack={() => setShowStays(false)}
        onStaysChanged={loadDays}
        stays={tripStays}
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
        tripStays={tripStays}
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
          titleContent={
            headerImageUrl && !headerImageFailed ? (
              <div className="trip-header-image-wrapper">
                <img
                  src={headerImageUrl}
                  alt={trip.name}
                  className="trip-header-image"
                  onError={() => setHeaderImageFailed(true)}
                />
              </div>
            ) : undefined
          }
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
              <Button type="button" onClick={() => void loadDays()}>
                Try again
              </Button>
            }
          >
            <p className="muted">{error}</p>
          </EmptyState>
        ) : null}

        {!isLoadingDays && !error ? (
          <CardSurface className="trip-intel-card">
            {tripPhase === 'before' ? (
              <div className="pretrip-countdown">
                <span className="pretrip-countdown__eyebrow">Trip starts in</span>
                <div className="pretrip-countdown__grid">
                  <div className="pretrip-countdown__unit">
                    <span className="pretrip-countdown__value">{remaining.days}</span>
                    <span className="pretrip-countdown__label">Days</span>
                  </div>
                  <div className="pretrip-countdown__unit">
                    <span className="pretrip-countdown__value">{String(remaining.hours).padStart(2, '0')}</span>
                    <span className="pretrip-countdown__label">Hours</span>
                  </div>
                  <div className="pretrip-countdown__unit">
                    <span className="pretrip-countdown__value">{String(remaining.minutes).padStart(2, '0')}</span>
                    <span className="pretrip-countdown__label">Minutes</span>
                  </div>
                  <div className="pretrip-countdown__unit">
                    <span className="pretrip-countdown__value">{String(remaining.seconds).padStart(2, '0')}</span>
                    <span className="pretrip-countdown__label">Seconds</span>
                  </div>
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
                    <dd>{tripReservations.length || '-'}</dd>
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
                  iconName={dayTypeIconMap[day.day_type]}
                  itemCount={dayItems.length}
                  key={day.id}
                  onOpen={() => setActiveDayId(day.id)}
                  title={day.label || `Day ${index + 1}`}
                />
              )
            })}

            <DayTile
              completedCount={0}
              dayNumber={tripDays.length + 1}
              iconName="ticket"
              itemCount={tripReservations.length}
              onOpen={() => setShowReservations(true)}
              subtitle={nextTripReservation?.name ?? undefined}
              title="Reservations"
            />

            <DayTile
              completedCount={0}
              dayNumber={tripDays.length + 2}
              iconName="bed"
              itemCount={tripStays.length}
              onOpen={() => setShowStays(true)}
              subtitle={tripStays[0]?.place_name ?? undefined}
              title="Stays"
            />
          </section>
        ) : null}

      </section>
    </main>
  )
}
