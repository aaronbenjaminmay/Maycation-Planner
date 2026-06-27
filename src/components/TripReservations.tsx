import {
  formatPlannerItemTimeRange,
  formatTripDayDate,
  type PlannerItem,
  type ReservationType,
  type Trip,
  type TripDay,
} from '../lib/trips'
import {
  CardSurface,
  DetailHeader,
  EmptyState,
  Icon,
} from './DesignSystem'

const reservationTypeIconMap: Record<ReservationType, 'ticket' | 'utensils' | 'bed' | 'plane'> = {
  activity: 'ticket',
  food: 'utensils',
  lodging: 'bed',
  transportation: 'plane',
}

type TripReservationsProps = {
  backgroundUrl?: string | null
  onBack: () => void
  plannerItems: PlannerItem[]
  trip: Trip
  tripDays: TripDay[]
}

function sortChronologically(items: PlannerItem[]) {
  return [...items].sort((a, b) => {
    if (a.starts_at && b.starts_at) {
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    }
    if (a.starts_at) return -1
    if (b.starts_at) return 1
    return a.sort_order - b.sort_order
  })
}

export function TripReservations({
  backgroundUrl,
  onBack,
  plannerItems,
  trip: _trip,
  tripDays,
}: TripReservationsProps) {
  const reservations = sortChronologically(
    plannerItems.filter((item) => item.kind === 'reservation'),
  )

  const dayGroups = tripDays
    .map((day, index) => ({
      day,
      dayIndex: index,
      items: reservations.filter((item) => item.trip_day_id === day.id),
    }))
    .filter((group) => group.items.length > 0)

  const undated = reservations.filter((item) => !item.trip_day_id)

  const bgStyle = backgroundUrl
    ? ({ '--trip-bg-image': `url(${backgroundUrl})` } as React.CSSProperties)
    : undefined
  const bgClass = backgroundUrl ? ' has-trip-bg' : ''

  return (
    <main
      className={`app-shell dashboard-shell${bgClass}`}
      style={bgStyle}
    >
      <section className="page-shell trips-panel">
        <DetailHeader onBack={onBack} title="Reservations" />

        {reservations.length === 0 ? (
          <EmptyState title="No reservations yet">
            <p className="muted">
              Add reservation items from any day's plan to see them here.
            </p>
          </EmptyState>
        ) : null}

        {dayGroups.map(({ day, dayIndex, items }) => (
          <section
            key={day.id}
            className="planner-item-list"
            aria-label={`Day ${dayIndex + 1} reservations`}
          >
            <p className="eyebrow">
              {day.label ? `${day.label} · ` : `Day ${dayIndex + 1} · `}
              {formatTripDayDate(day.date)}
            </p>

            {items.map((item) => (
              <ReservationCard key={item.id} item={item} />
            ))}
          </section>
        ))}

        {undated.length > 0 ? (
          <section className="planner-item-list" aria-label="Unscheduled reservations">
            <p className="eyebrow">Unscheduled</p>
            {undated.map((item) => (
              <ReservationCard key={item.id} item={item} />
            ))}
          </section>
        ) : null}
      </section>
    </main>
  )
}

function ReservationCard({ item }: { item: PlannerItem }) {
  const timeRange = formatPlannerItemTimeRange(item)

  return (
    <CardSurface className="planner-item-card planner-item-card--single-column">
      <div className="planner-item-card__content">
        {timeRange ? (
          <p className="planner-item-time">{timeRange}</p>
        ) : null}
        <div className="icon-label">
          <Icon name={reservationTypeIconMap[item.reservation_type]} size="small" />
          <strong>{item.title}</strong>
        </div>
        {item.location_name ? (
          <p className="muted">{item.location_name}</p>
        ) : null}
        {item.location_address ? (
          <p className="muted">{item.location_address}</p>
        ) : null}
        {item.confirmation_code ? (
          <p className="muted">Conf #{item.confirmation_code}</p>
        ) : null}
        {item.description ? (
          <p className="muted">{item.description}</p>
        ) : null}
        {item.external_url ? (
          <a
            href={item.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            View booking
          </a>
        ) : null}
      </div>
    </CardSurface>
  )
}
