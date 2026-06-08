import {
  formatTripDateRange,
  getTripDayCount,
  type Trip,
} from '../lib/trips'

type TripCardProps = {
  onSelect: (trip: Trip) => void
  trip: Trip
}

export function TripCard({ onSelect, trip }: TripCardProps) {
  const dayCount = getTripDayCount(trip.starts_on, trip.ends_on)
  const travelType = trip.metadata.travel_type ?? 'Other'

  return (
    <button type="button" className="trip-card" onClick={() => onSelect(trip)}>
      <span className="trip-card__type">{travelType}</span>
      <span className="trip-card__name">{trip.name}</span>
      <span className="trip-card__meta">
        {trip.destination || 'Location not set'}
      </span>
      <span className="trip-card__meta">
        {formatTripDateRange(trip.starts_on, trip.ends_on)}
      </span>
      <span className="trip-card__count">
        {dayCount} {dayCount === 1 ? 'day' : 'days'}
      </span>
    </button>
  )
}
