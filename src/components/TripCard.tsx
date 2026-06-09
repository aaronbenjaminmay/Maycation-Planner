import {
  formatTripDateRange,
  getTripDayCount,
  type Trip,
} from '../lib/trips'
import { DashboardCard, ProgressPill } from './DesignSystem'

type TripCardProps = {
  onSelect: (trip: Trip) => void
  trip: Trip
}

export function TripCard({ onSelect, trip }: TripCardProps) {
  const dayCount = getTripDayCount(trip.starts_on, trip.ends_on)
  const travelType = trip.metadata.travel_type ?? 'Other'

  return (
    <DashboardCard
      className="trip-card"
      eyebrow={travelType}
      onClick={() => onSelect(trip)}
      subtitle={trip.destination || 'Location not set'}
      title={trip.name}
      meta={
        <>
          <ProgressPill>{formatTripDateRange(trip.starts_on, trip.ends_on)}</ProgressPill>
          <ProgressPill>
            {dayCount} {dayCount === 1 ? 'day' : 'days'}
          </ProgressPill>
        </>
      }
    />
  )
}
