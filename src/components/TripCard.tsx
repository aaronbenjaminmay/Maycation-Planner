import {
  formatTripDateRange,
  type Trip,
} from '../lib/trips'
import { DashboardCard, ProgressPill } from './DesignSystem'

type TripCardProps = {
  onSelect: (trip: Trip) => void
  trip: Trip
}

export function TripCard({ onSelect, trip }: TripCardProps) {
  const travelType = trip.metadata.travel_type

  return (
    <DashboardCard
      className="trip-card"
      eyebrow={travelType !== 'Other' ? travelType : undefined}
      onClick={() => onSelect(trip)}
      subtitle={trip.destination || undefined}
      title={trip.name}
      meta={
        <ProgressPill>{formatTripDateRange(trip.starts_on, trip.ends_on)}</ProgressPill>
      }
    />
  )
}
