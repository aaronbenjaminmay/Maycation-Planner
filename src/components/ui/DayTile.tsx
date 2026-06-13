import { type TripDayType } from '../../lib/trips'
import { CardSurface } from './CardSurface'
import { Icon, type IconName } from './Icon'
import { ProgressPill } from './ProgressPill'

type DayTileProps = {
  completedCount: number
  date?: string
  dayNumber: number
  dayType?: TripDayType
  itemCount: number
  onOpen: () => void
  subtitle?: string
  title: string
}

const dayTypeIconMap: Record<TripDayType, IconName> = {
  activity: 'ticket',
  explore: 'compass',
  relax: 'tree-palm',
  special: 'star',
  travel: 'plane',
}

export function DayTile({
  completedCount,
  date,
  dayNumber,
  dayType,
  itemCount,
  onOpen,
  subtitle,
  title,
}: DayTileProps) {
  const pillTone = completedCount === itemCount && itemCount > 0 ? 'complete' : 'default'
  const iconName = dayType ? dayTypeIconMap[dayType] : 'calendar'

  return (
    <CardSurface as="button" className="day-tile" onClick={onOpen}>
      <div className="day-tile__content">
        <span className="day-tile__icon" aria-hidden="true">
          <Icon name={iconName} size="large" />
        </span>
        <div className="day-tile__header">
          <div className="day-tile__text">
            <h2>{title}</h2>
            {date ? (
              <p className="muted day-tile__summary">{date}</p>
            ) : subtitle ? (
              <p className="muted day-tile__summary">{subtitle}</p>
            ) : null}
            {date ? <span className="day-tile__day-label">Day {dayNumber}</span> : null}
          </div>
          {itemCount > 0 ? (
            <div className="day-tile__stats">
              <ProgressPill tone={pillTone}>
                {completedCount} / {itemCount}
              </ProgressPill>
            </div>
          ) : null}
        </div>
      </div>
    </CardSurface>
  )
}
