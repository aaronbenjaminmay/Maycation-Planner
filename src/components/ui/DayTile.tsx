import { CardSurface } from './CardSurface'
import { Icon } from './Icon'
import { ProgressPill } from './ProgressPill'

type DayTileProps = {
  completedCount: number
  date?: string
  dayNumber: number
  itemCount: number
  onOpen: () => void
  subtitle?: string
  title: string
}

export function DayTile({
  completedCount,
  date,
  dayNumber,
  itemCount,
  onOpen,
  subtitle,
  title,
}: DayTileProps) {
  const pillTone = completedCount === itemCount && itemCount > 0 ? 'complete' : 'default'

  return (
    <CardSurface as="button" className="day-tile" onClick={onOpen}>
      <div className="day-tile__content">
        <span className="day-tile__icon" aria-hidden="true">
          <Icon name="calendar" size="large" />
        </span>
        <div className="day-tile__header">
          <div>
            <h2>{date ?? title}</h2>
            {subtitle ? <p className="muted day-tile__summary">{subtitle}</p> : null}
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
