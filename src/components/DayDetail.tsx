import { useState } from 'react'
import {
  createPlannerItem,
  formatPlannerItemTimeRange,
  formatTripDayDate,
  type CreatePlannerItemInput,
  type PlannerItem,
  type Trip,
  type TripDay,
} from '../lib/trips'
import { AddPlannerItemForm } from './AddPlannerItemForm'

type DayDetailProps = {
  day: TripDay
  dayNumber: number
  items: PlannerItem[]
  onBack: () => void
  onItemCreated: () => Promise<void>
  trip: Trip
}

function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function DayDetail({
  day,
  dayNumber,
  items,
  onBack,
  onItemCreated,
  trip,
}: DayDetailProps) {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [isSavingItem, setIsSavingItem] = useState(false)
  const [itemError, setItemError] = useState('')

  async function handleCreateItem(input: CreatePlannerItemInput) {
    setItemError('')
    setIsSavingItem(true)

    try {
      await createPlannerItem(input)
      setIsAddItemOpen(false)
      await onItemCreated()
    } catch (saveError) {
      setItemError(getVisibleErrorMessage(saveError, 'Unable to save item.'))
    } finally {
      setIsSavingItem(false)
    }
  }

  return (
    <main className="app-shell dashboard-shell">
      <section className="dashboard-panel trips-panel">
        <header className="trip-detail-header">
          <button type="button" className="secondary-button" onClick={onBack}>
            Back
          </button>

          <div>
            <p className="eyebrow">{trip.name}</p>
            <h1>Day {dayNumber}</h1>
            <p className="muted">{formatTripDayDate(day.date)}</p>
            {day.label ? <p className="day-title">{day.label}</p> : null}
          </div>
        </header>

        <div className="day-detail-toolbar">
          <div>
            <span className="label">Planner Items</span>
            <strong>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </strong>
          </div>
          <button type="button" onClick={() => setIsAddItemOpen(true)}>
            Add item
          </button>
        </div>

        {items.length > 0 ? (
          <section className="planner-item-list" aria-label="Planner items">
            {items.map((item) => (
              <article className="planner-item-card" key={item.id}>
                <span className={`planner-item-kind ${item.kind}`}>
                  {getKindIcon(item.kind)} {getKindLabel(item.kind)}
                </span>
                <strong>{item.title}</strong>
                {formatPlannerItemTimeRange(item) ? (
                  <p className="muted">{formatPlannerItemTimeRange(item)}</p>
                ) : null}
                {item.location_name ? (
                  <p className="muted">{item.location_name}</p>
                ) : null}
                {item.description ? <p>{item.description}</p> : null}
              </article>
            ))}
          </section>
        ) : (
          <section className="state-panel planner-item-empty">
            <h2>No plans yet</h2>
            <p className="muted">Add the first item for this trip day.</p>
          </section>
        )}

        {isAddItemOpen ? (
          <AddPlannerItemForm
            day={day}
            error={itemError}
            isSubmitting={isSavingItem}
            onCancel={() => {
              setItemError('')
              setIsAddItemOpen(false)
            }}
            onSubmit={handleCreateItem}
            tripId={trip.id}
          />
        ) : null}
      </section>
    </main>
  )
}

function getKindIcon(kind: PlannerItem['kind']) {
  switch (kind) {
    case 'activity':
      return 'A'
    case 'note':
      return 'N'
    case 'reservation':
      return 'R'
    case 'travel':
      return 'T'
  }
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
