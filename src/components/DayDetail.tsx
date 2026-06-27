import { type FormEvent, useState } from 'react'
import {
  createPlannerItem,
  deletePlannerItem,
  formatPlannerItemTimeRange,
  formatPlannerItemTimeInput,
  formatTripDayDate,
  togglePlannerItemCompletion,
  tripDayTypes,
  updatePlannerItem,
  updateTripDay,
  type CreatePlannerItemInput,
  type PlannerItem,
  type Trip,
  type TripDay,
  type TripDayType,
} from '../lib/trips'
import {
  AddPlannerItemForm,
  type PlannerItemFormValues,
} from './AddPlannerItemForm'
import type { PlaceValue } from '../lib/places'
import { type TripStay } from '../lib/stays'
import {
  Button,
  CardSurface,
  DetailHeader,
  EmptyState,
  FeedbackMessage,
  FormActions,
  Icon,
  IconButton,
  ModalSheet,
  SelectInput,
  StatusButton,
  TextInput,
} from './DesignSystem'

type DayDetailProps = {
  backgroundUrl?: string | null
  canEditPlannerItems: boolean
  day: TripDay
  dayNumber: number
  items: PlannerItem[]
  onBack: () => void
  onItemCreated: () => Promise<void>
  trip: Trip
  tripStays: TripStay[]
}

const dayTypeLabels: Record<TripDayType, string> = {
  activity: 'Activity',
  explore: 'Explore',
  relax: 'Relax',
  special: 'Special',
  travel: 'Travel',
}

const dayTypeIconMap = {
  activity: 'ticket',
  explore: 'compass',
  relax: 'tree-palm',
  special: 'star',
  travel: 'plane',
} as const

function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function DayDetail({
  backgroundUrl,
  canEditPlannerItems,
  day,
  dayNumber,
  items,
  onBack,
  onItemCreated,
  trip,
  tripStays,
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
  const [isDayEditOpen, setIsDayEditOpen] = useState(false)
  const [dayEditLabel, setDayEditLabel] = useState('')
  const [dayEditType, setDayEditType] = useState<TripDayType>('activity')
  const [isDayEditSubmitting, setIsDayEditSubmitting] = useState(false)
  const [dayEditError, setDayEditError] = useState('')

  function closeItemForm() {
    setIsItemFormOpen(false)
    setEditingItem(null)
    setItemFormError('')
  }

  function openDayEdit() {
    setDayEditLabel(day.label ?? '')
    setDayEditType(day.day_type)
    setDayEditError('')
    setIsDayEditOpen(true)
  }

  async function handleDayEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setDayEditError('')
    setIsDayEditSubmitting(true)

    try {
      await updateTripDay({
        tripId: trip.id,
        dayId: day.id,
        label: dayEditLabel,
        dayType: dayEditType,
      })
      setIsDayEditOpen(false)
      await onItemCreated()
    } catch (err) {
      setDayEditError(getVisibleErrorMessage(err, 'Unable to save day.'))
    } finally {
      setIsDayEditSubmitting(false)
    }
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
    <main
      className={`app-shell dashboard-shell day-detail-screen${backgroundUrl ? ' has-trip-bg' : ''}`}
      style={backgroundUrl ? ({ '--trip-bg-image': `url(${backgroundUrl})` } as React.CSSProperties) : undefined}
    >
      <section className="page-shell trips-panel">
        <DetailHeader
          meta={
            <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name={dayTypeIconMap[day.day_type]} size="small" />
              {formatTripDayDate(day.date)}
            </p>
          }
          onBack={onBack}
          action={
            canEditPlannerItems ? (
              <div style={{ display: 'flex', gap: 4 }}>
                <IconButton
                  icon="edit"
                  label="Edit day"
                  onClick={openDayEdit}
                />
                <IconButton
                  icon="add"
                  label="Add item"
                  onClick={() => {
                    setEditingItem(null)
                    setItemFormError('')
                    setIsItemFormOpen(true)
                  }}
                />
              </div>
            ) : null
          }
          title={day.label || `Day ${dayNumber}`}
        />

        {isDayEditOpen ? (
          <ModalSheet
            ariaLabel="Edit day"
            eyebrow="Edit Day"
            onClose={() => setIsDayEditOpen(false)}
            title={day.label || `Day ${dayNumber}`}
          >
            <form className="planner-item-form" onSubmit={handleDayEditSubmit}>
              <SelectInput
                label="Day type"
                value={dayEditType}
                onChange={(v) => setDayEditType(v as TripDayType)}
                options={tripDayTypes.map((t) => ({ value: t, label: dayTypeLabels[t] }))}
              />
              <TextInput
                label="Day Title"
                value={dayEditLabel}
                onChange={setDayEditLabel}
              />
              {dayEditError ? (
                <FeedbackMessage tone="error">{dayEditError}</FeedbackMessage>
              ) : null}
              <FormActions>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsDayEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isDayEditSubmitting}>
                  {isDayEditSubmitting ? 'Saving...' : 'Save Day'}
                </Button>
              </FormActions>
            </form>
          </ModalSheet>
        ) : null}

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
            tripStays={tripStays}
          />
        ) : null}

        {items.length > 0 ? (
          <section className="planner-item-list" aria-label="Planner items">
            {completionError ? (
              <FeedbackMessage tone="error">{completionError}</FeedbackMessage>
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
                    {item.kind === 'reservation' && item.location_address ? (
                      <p className="muted">{item.location_address}</p>
                    ) : null}
                    {item.kind === 'reservation' && item.confirmation_code ? (
                      <p className="muted">Conf #{item.confirmation_code}</p>
                    ) : null}
                    {item.description ? <p>{item.description}</p> : null}
                    {item.kind === 'reservation' && item.external_url ? (
                      <a
                        href={item.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="muted"
                        style={{ color: 'var(--accent)' }}
                      >
                        View booking
                      </a>
                    ) : null}
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
  let origin: PlaceValue | null = null
  let destination: PlaceValue | null = null

  if (item.kind === 'travel') {
    const startName = typeof item.metadata.start_place_name === 'string'
      ? item.metadata.start_place_name : null
    const startAddr = typeof item.metadata.start_place_address === 'string'
      ? item.metadata.start_place_address : null

    if (startName) {
      const startLat = typeof item.metadata.start_place_lat === 'number' ? item.metadata.start_place_lat : undefined
      const startLng = typeof item.metadata.start_place_lng === 'number' ? item.metadata.start_place_lng : undefined
      origin = {
        name: startName,
        address: startAddr ?? '',
        coordinates: startLat !== undefined && startLng !== undefined ? { lat: startLat, lng: startLng } : undefined,
      }
    }
    if (item.location_name) {
      const destLat = typeof item.metadata.destination_place_lat === 'number' ? item.metadata.destination_place_lat : undefined
      const destLng = typeof item.metadata.destination_place_lng === 'number' ? item.metadata.destination_place_lng : undefined
      destination = {
        name: item.location_name,
        address: item.location_address ?? '',
        coordinates: destLat !== undefined && destLng !== undefined ? { lat: destLat, lng: destLng } : undefined,
      }
    }
  }

  return {
    endTime: formatPlannerItemTimeInput(item.ends_at),
    kind: item.kind,
    location: item.location_name ?? '',
    notes: item.description ?? '',
    startTime: formatPlannerItemTimeInput(item.starts_at),
    title: item.title,
    confirmationCode: item.confirmation_code ?? '',
    address: item.location_address ?? '',
    externalUrl: item.external_url ?? '',
    reservationType: item.reservation_type,
    origin,
    destination,
  }
}
