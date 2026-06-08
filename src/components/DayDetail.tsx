import { useState } from 'react'
import {
  createPlannerItem,
  deletePlannerItem,
  formatPlannerItemTimeInput,
  formatPlannerItemTimeRange,
  formatTripDayDate,
  updatePlannerItem,
  type CreatePlannerItemInput,
  type PlannerItem,
  type Trip,
  type TripDay,
} from '../lib/trips'
import { AddPlannerItemForm } from './AddPlannerItemForm'

type DayDetailProps = {
  canEditPlannerItems: boolean
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
  canEditPlannerItems,
  day,
  dayNumber,
  items,
  onBack,
  onItemCreated,
  trip,
}: DayDetailProps) {
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlannerItem | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [isSavingItem, setIsSavingItem] = useState(false)
  const [itemError, setItemError] = useState('')
  const [deleteError, setDeleteError] = useState('')

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

  async function handleUpdateItem(input: CreatePlannerItemInput) {
    if (!editingItem) {
      return
    }

    setItemError('')
    setIsSavingItem(true)

    try {
      await updatePlannerItem({
        ...input,
        itemId: editingItem.id,
      })
      setEditingItem(null)
      await onItemCreated()
    } catch (saveError) {
      setItemError(getVisibleErrorMessage(saveError, 'Unable to update item.'))
    } finally {
      setIsSavingItem(false)
    }
  }

  async function handleDeleteItem(item: PlannerItem) {
    const confirmed = window.confirm(`Delete "${item.title}"?`)

    if (!confirmed) {
      return
    }

    setDeleteError('')
    setDeletingItemId(item.id)

    try {
      await deletePlannerItem(trip.id, item.id)
      await onItemCreated()
    } catch (deleteFailure) {
      setDeleteError(
        getVisibleErrorMessage(deleteFailure, 'Unable to delete item.'),
      )
    } finally {
      setDeletingItemId(null)
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
          {canEditPlannerItems ? (
            <button type="button" onClick={() => setIsAddItemOpen(true)}>
              Add item
            </button>
          ) : (
            <span className="role-pill viewer">Viewer</span>
          )}
        </div>

        {items.length > 0 ? (
          <section className="planner-item-list" aria-label="Planner items">
            {deleteError ? <p className="feedback">{deleteError}</p> : null}
            {items.map((item) => (
              <article className="planner-item-card" key={item.id}>
                <div className="planner-item-card__content">
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
                </div>

                {canEditPlannerItems ? (
                  <div className="planner-item-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setItemError('')
                        setEditingItem(item)
                      }}
                      disabled={deletingItemId === item.id}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => void handleDeleteItem(item)}
                      disabled={deletingItemId === item.id}
                    >
                      {deletingItemId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </section>
        ) : (
          <section className="state-panel planner-item-empty">
            <h2>No plans yet</h2>
            <p className="muted">Add the first item for this trip day.</p>
          </section>
        )}

        {isAddItemOpen && canEditPlannerItems ? (
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

        {editingItem && canEditPlannerItems ? (
          <AddPlannerItemForm
            ariaLabel="Edit planner item"
            day={day}
            error={itemError}
            initialValues={{
              endTime: formatPlannerItemTimeInput(editingItem.ends_at),
              kind: editingItem.kind,
              location: editingItem.location_name ?? '',
              notes: editingItem.description ?? '',
              startTime: formatPlannerItemTimeInput(editingItem.starts_at),
              title: editingItem.title,
            }}
            isSubmitting={isSavingItem}
            onCancel={() => {
              setItemError('')
              setEditingItem(null)
            }}
            onSubmit={handleUpdateItem}
            submitLabel="Update Item"
            submittingLabel="Updating..."
            title="Edit Item"
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
