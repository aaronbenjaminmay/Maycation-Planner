import { useState } from 'react'
import {
  createPlannerItem,
  deletePlannerItem,
  formatPlannerItemTimeRange,
  formatPlannerItemTimeInput,
  formatTripDayDate,
  togglePlannerItemCompletion,
  updatePlannerItem,
  type CreatePlannerItemInput,
  type PlannerItem,
  type Trip,
  type TripDay,
} from '../lib/trips'
import {
  AddPlannerItemForm,
  type PlannerItemFormValues,
} from './AddPlannerItemForm'
import {
  CardSurface,
  DetailHeader,
  EmptyState,
  IconButton,
  StatusButton,
} from './DesignSystem'

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
  const [isItemFormOpen, setIsItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlannerItem | null>(null)
  const [isSubmittingItem, setIsSubmittingItem] = useState(false)
  const [itemFormError, setItemFormError] = useState('')
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)
  const [pendingCompletionItemId, setPendingCompletionItemId] = useState<
    string | null
  >(null)
  const [completionOverrides, setCompletionOverrides] = useState<
    Record<string, boolean>
  >({})
  const [completionError, setCompletionError] = useState('')

  function closeItemForm() {
    setIsItemFormOpen(false)
    setEditingItem(null)
    setItemFormError('')
  }

  async function handleItemSubmit(input: CreatePlannerItemInput) {
    setItemFormError('')
    setIsSubmittingItem(true)

    try {
      if (editingItem) {
        await updatePlannerItem({
          ...input,
          itemId: editingItem.id,
        })
      } else {
        await createPlannerItem(input)
      }

      closeItemForm()
      await onItemCreated()
    } catch (itemFailure) {
      setItemFormError(
        getVisibleErrorMessage(itemFailure, 'Unable to save planner item.'),
      )
    } finally {
      setIsSubmittingItem(false)
    }
  }

  async function handleDeleteItem(item: PlannerItem) {
    const confirmed = window.confirm(`Delete ${item.title}?`)

    if (!confirmed) {
      return false
    }

    setCompletionError('')
    setDeletingItemId(item.id)

    try {
      await deletePlannerItem(trip.id, item.id)
      await onItemCreated()
      return true
    } catch (deleteFailure) {
      setCompletionError(
        getVisibleErrorMessage(deleteFailure, 'Unable to delete planner item.'),
      )
      return false
    } finally {
      setDeletingItemId(null)
    }
  }

  async function handleToggleCompletion(item: PlannerItem) {
    setCompletionError('')
    setPendingCompletionItemId(item.id)

    const currentValue = getPlannerItemCompletedValue(item)
    const nextValue = !currentValue
    setCompletionOverrides((currentOverrides) => ({
      ...currentOverrides,
      [item.id]: nextValue,
    }))

    try {
      await togglePlannerItemCompletion(trip.id, item.id, nextValue)
      await onItemCreated()
      setCompletionOverrides((currentOverrides) => {
        const nextOverrides = { ...currentOverrides }
        delete nextOverrides[item.id]
        return nextOverrides
      })
    } catch (completionFailure) {
      setCompletionOverrides((currentOverrides) => ({
        ...currentOverrides,
        [item.id]: currentValue,
      }))
      setCompletionError(
        getVisibleErrorMessage(
          completionFailure,
          'Unable to update item completion.',
        ),
      )
    } finally {
      setPendingCompletionItemId(null)
    }
  }

  function getPlannerItemCompletedValue(item: PlannerItem) {
    return completionOverrides[item.id] ?? isPlannerItemCompleted(item)
  }

  return (
    <main className="app-shell dashboard-shell day-detail-screen">
      <section className="page-shell trips-panel">
        <DetailHeader
          meta={
            <>
              <p className="muted">{formatTripDayDate(day.date)}</p>
              {day.label ? <p className="day-title">{day.label}</p> : null}
            </>
          }
          onBack={onBack}
          action={
            canEditPlannerItems ? (
              <IconButton
                icon="add"
                label="Add item"
                onClick={() => {
                  setEditingItem(null)
                  setItemFormError('')
                  setIsItemFormOpen(true)
                }}
                variant="primary"
              />
            ) : null
          }
          title={`Day ${dayNumber}`}
        />

        {isItemFormOpen ? (
          <AddPlannerItemForm
            ariaLabel={editingItem ? 'Edit planner item' : 'Add planner item'}
            day={day}
            error={itemFormError}
            initialValues={
              editingItem ? getPlannerItemFormValues(editingItem) : undefined
            }
            isSubmitting={isSubmittingItem}
            isDeleting={editingItem ? deletingItemId === editingItem.id : false}
            onCancel={closeItemForm}
            onDelete={
              editingItem
                ? async () => {
                    const didDelete = await handleDeleteItem(editingItem)

                    if (didDelete) {
                      closeItemForm()
                    }
                  }
                : undefined
            }
            onSubmit={handleItemSubmit}
            submitLabel={editingItem ? 'Save Item' : 'Save Item'}
            submittingLabel="Saving..."
            title={editingItem ? 'Edit Item' : 'Add Item'}
            tripId={trip.id}
          />
        ) : null}

        {items.length > 0 ? (
          <section className="planner-item-list" aria-label="Planner items">
            {completionError ? (
              <p className="feedback">{completionError}</p>
            ) : null}
            {items.map((item) => {
              const isCompleted = getPlannerItemCompletedValue(item)

              return (
                <CardSurface
                  className={`planner-item-card ${
                    isCompleted ? 'completed' : ''
                  }`}
                  key={item.id}
                >
                  <div className="planner-item-card__content">
                    {formatPlannerItemTimeRange(item) ? (
                      <p className="planner-item-time">
                        {formatPlannerItemTimeRange(item)}
                      </p>
                    ) : null}
                    <strong>{item.title}</strong>
                    {item.location_name ? (
                      <p className="muted">{item.location_name}</p>
                    ) : null}
                    {item.description ? <p>{item.description}</p> : null}
                  </div>

                  <div className="planner-item-card__controls">
                    <StatusButton
                      disabled={pendingCompletionItemId === item.id}
                      isComplete={isCompleted}
                      label={item.title}
                      onToggle={
                        canEditPlannerItems
                          ? () => void handleToggleCompletion(item)
                          : undefined
                      }
                      readOnly={!canEditPlannerItems}
                    />

                    {canEditPlannerItems ? (
                    <div className="planner-item-card__actions">
                      <IconButton
                        icon="edit"
                        label={`Edit ${item.title}`}
                        onClick={() => {
                          setEditingItem(item)
                          setItemFormError('')
                          setIsItemFormOpen(true)
                        }}
                      />
                    </div>
                    ) : null}
                  </div>
                </CardSurface>
              )
            })}
          </section>
        ) : (
          <EmptyState title="No plans yet">
            <p className="muted">Add the first item for this trip day.</p>
          </EmptyState>
        )}
      </section>
    </main>
  )
}

function isPlannerItemCompleted(item: PlannerItem) {
  return item.metadata.completed === true
}

function getPlannerItemFormValues(item: PlannerItem): PlannerItemFormValues {
  return {
    endTime: formatPlannerItemTimeInput(item.ends_at),
    kind: item.kind,
    location: item.location_name ?? '',
    notes: item.description ?? '',
    startTime: formatPlannerItemTimeInput(item.starts_at),
    title: item.title,
  }
}
