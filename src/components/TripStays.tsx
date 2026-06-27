import { type FormEvent, useState } from 'react'
import {
  createTripStay,
  deleteTripStay,
  formatStayDateRange,
  updateTripStay,
  type TripStay,
} from '../lib/stays'
import {
  createPlannerItem,
  formatTripDayDate,
  type Trip,
  type TripDay,
} from '../lib/trips'
import { searchPlaces, type PlaceValue } from '../lib/places'
import {
  Button,
  CardSurface,
  DetailHeader,
  EmptyState,
  FeedbackMessage,
  FormActions,
  FormGrid,
  Icon,
  IconButton,
  ModalSheet,
  PlaceInput,
  TextArea,
  TextInput,
} from './DesignSystem'

type TripStaysProps = {
  backgroundUrl?: string | null
  canEditStays: boolean
  onBack: () => void
  onStaysChanged: () => Promise<void>
  stays: TripStay[]
  trip: Trip
  tripDays: TripDay[]
}

type StayFormValues = {
  place: PlaceValue | null
  checkInDate: string
  checkInTime: string
  checkOutDate: string
  checkOutTime: string
  confirmationCode: string
  notes: string
}

type PendingOffer = {
  stayId: string
  placeName: string
  placeAddress: string
  confirmationCode: string
  checkInDate: string
  checkInTime: string
  checkOutDate: string
  checkOutTime: string
}

function emptyFormValues(): StayFormValues {
  return {
    place: null,
    checkInDate: '',
    checkInTime: '',
    checkOutDate: '',
    checkOutTime: '',
    confirmationCode: '',
    notes: '',
  }
}

function stayToFormValues(stay: TripStay): StayFormValues {
  return {
    place: {
      name: stay.place_name,
      address: stay.place_address ?? '',
      coordinates:
        stay.place_lat !== null && stay.place_lng !== null
          ? { lat: Number(stay.place_lat), lng: Number(stay.place_lng) }
          : undefined,
    },
    checkInDate: stay.check_in_date,
    checkInTime: stay.check_in_time ? stay.check_in_time.slice(0, 5) : '',
    checkOutDate: stay.check_out_date,
    checkOutTime: stay.check_out_time ? stay.check_out_time.slice(0, 5) : '',
    confirmationCode: stay.confirmation_code ?? '',
    notes: stay.notes ?? '',
  }
}

function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function TripStays({
  backgroundUrl,
  canEditStays,
  onBack,
  onStaysChanged,
  stays,
  trip,
  tripDays,
}: TripStaysProps) {
  // Stay form state
  const [editingStay, setEditingStay] = useState<TripStay | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formError, setFormError] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [form, setForm] = useState<StayFormValues>(emptyFormValues)

  // Reminder offer state
  const [pendingOffer, setPendingOffer] = useState<PendingOffer | null>(null)
  const [isCreatingReminders, setIsCreatingReminders] = useState(false)
  const [reminderError, setReminderError] = useState('')
  // Becomes true after first creation attempt — prevents duplicate creation on retry
  const [reminderAttempted, setReminderAttempted] = useState(false)

  function updateField<K extends keyof StayFormValues>(key: K, value: StayFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openAdd() {
    setEditingStay(null)
    setForm(emptyFormValues())
    setFormError('')
    setValidationMessage('')
    setIsFormOpen(true)
  }

  function openEdit(stay: TripStay) {
    setEditingStay(stay)
    setForm(stayToFormValues(stay))
    setFormError('')
    setValidationMessage('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingStay(null)
    setFormError('')
    setValidationMessage('')
  }

  function dismissOffer() {
    setPendingOffer(null)
    setReminderError('')
    setReminderAttempted(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationMessage('')
    setFormError('')

    if (!form.place || !form.place.name.trim()) {
      setValidationMessage('Property name is required.')
      return
    }

    if (!form.checkInDate || !form.checkOutDate) {
      setValidationMessage('Check-in and check-out dates are required.')
      return
    }

    if (form.checkOutDate <= form.checkInDate) {
      setValidationMessage('Check-out must be after check-in.')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingStay) {
        await updateTripStay({
          tripId: trip.id,
          stayId: editingStay.id,
          placeName: form.place?.name ?? '',
          placeAddress: form.place?.address,
          placeLat: form.place?.coordinates?.lat ?? null,
          placeLng: form.place?.coordinates?.lng ?? null,
          checkInDate: form.checkInDate,
          checkInTime: form.checkInTime,
          checkOutDate: form.checkOutDate,
          checkOutTime: form.checkOutTime,
          confirmationCode: form.confirmationCode,
          notes: form.notes,
        })

        closeForm()
        await onStaysChanged()
      } else {
        const newStayId = await createTripStay({
          tripId: trip.id,
          placeName: form.place?.name ?? '',
          placeAddress: form.place?.address,
          placeLat: form.place?.coordinates?.lat ?? null,
          placeLng: form.place?.coordinates?.lng ?? null,
          checkInDate: form.checkInDate,
          checkInTime: form.checkInTime,
          checkOutDate: form.checkOutDate,
          checkOutTime: form.checkOutTime,
          confirmationCode: form.confirmationCode,
          notes: form.notes,
        })

        closeForm()

        // Capture offer data from form values before any state reset
        setPendingOffer({
          stayId: newStayId,
          placeName: form.place?.name ?? '',
          placeAddress: form.place?.address ?? '',
          confirmationCode: form.confirmationCode,
          checkInDate: form.checkInDate,
          checkInTime: form.checkInTime,
          checkOutDate: form.checkOutDate,
          checkOutTime: form.checkOutTime,
        })

        await onStaysChanged()
      }
    } catch (err) {
      setFormError(getVisibleErrorMessage(err, 'Unable to save stay.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!editingStay) return

    setIsDeleting(true)
    setFormError('')

    try {
      await deleteTripStay(trip.id, editingStay.id)
      closeForm()
      await onStaysChanged()
    } catch (err) {
      setFormError(getVisibleErrorMessage(err, 'Unable to delete stay.'))
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleAcceptReminders() {
    if (!pendingOffer) return

    const checkInDay = tripDays.find((d) => d.date === pendingOffer.checkInDate) ?? null
    const checkOutDay = tripDays.find((d) => d.date === pendingOffer.checkOutDate) ?? null

    setIsCreatingReminders(true)
    setReminderError('')

    const sharedMetadata = {
      derived_from_stay: pendingOffer.stayId,
      managed_by_maycation: true,
    }

    const tasks: Array<{ label: string; promise: Promise<unknown> }> = []

    if (checkInDay) {
      tasks.push({
        label: 'Check-in',
        promise: createPlannerItem({
          kind: 'reservation',
          reservationType: 'lodging',
          title: `Check in to ${pendingOffer.placeName}`,
          startTime: pendingOffer.checkInTime,
          endTime: '',
          location: pendingOffer.placeName,
          address: pendingOffer.placeAddress,
          confirmationCode: pendingOffer.confirmationCode,
          notes: '',
          tripId: trip.id,
          tripDayId: checkInDay.id,
          metadata: sharedMetadata,
        }),
      })
    }

    if (checkOutDay) {
      tasks.push({
        label: 'Check-out',
        promise: createPlannerItem({
          kind: 'reservation',
          reservationType: 'lodging',
          title: `Check out of ${pendingOffer.placeName}`,
          startTime: pendingOffer.checkOutTime,
          endTime: '',
          location: pendingOffer.placeName,
          address: pendingOffer.placeAddress,
          confirmationCode: pendingOffer.confirmationCode,
          notes: '',
          tripId: trip.id,
          tripDayId: checkOutDay.id,
          metadata: sharedMetadata,
        }),
      })
    }

    const results = await Promise.allSettled(tasks.map((t) => t.promise))

    setIsCreatingReminders(false)
    setReminderAttempted(true)

    const failures = results
      .map((result, i) => ({ result, label: tasks[i]!.label }))
      .filter((entry): entry is { result: PromiseRejectedResult; label: string } =>
        entry.result.status === 'rejected'
      )

    if (failures.length > 0) {
      const failedLabels = failures.map((f) => f.label).join(' and ')
      const reason: unknown = failures[0]!.result.reason
      const errorMsg = reason instanceof Error ? reason.message : 'Unknown error'
      setReminderError(`${failedLabels} reminder could not be created: ${errorMsg}`)
    }

    // Refresh so successfully-created items appear in Day Detail
    await onStaysChanged()

    // Close the offer only if all attempts succeeded
    if (failures.length === 0) {
      dismissOffer()
    }
  }

  const bgStyle = backgroundUrl
    ? ({ '--trip-bg-image': `url(${backgroundUrl})` } as React.CSSProperties)
    : undefined
  const bgClass = backgroundUrl ? ' has-trip-bg' : ''

  // Compute offer availability (used in offer modal)
  const offerCheckInDay = pendingOffer
    ? (tripDays.find((d) => d.date === pendingOffer.checkInDate) ?? null)
    : null
  const offerCheckOutDay = pendingOffer
    ? (tripDays.find((d) => d.date === pendingOffer.checkOutDate) ?? null)
    : null
  const canCreateAnyReminder = offerCheckInDay !== null || offerCheckOutDay !== null

  return (
    <main className={`app-shell dashboard-shell${bgClass}`} style={bgStyle}>
      <section className="page-shell trips-panel">
        <DetailHeader
          onBack={onBack}
          title="Stays"
          action={
            canEditStays ? (
              <IconButton icon="add" label="Add stay" onClick={openAdd} />
            ) : undefined
          }
        />

        {stays.length === 0 ? (
          <EmptyState title="No stays yet">
            <p className="muted">
              Add your hotels and rentals. They'll appear as quick picks when you add travel items.
            </p>
          </EmptyState>
        ) : (
          <section className="planner-item-list" aria-label="Trip stays">
            {stays.map((stay) => (
              <StayCard
                key={stay.id}
                stay={stay}
                canEdit={canEditStays}
                onEdit={() => openEdit(stay)}
              />
            ))}
          </section>
        )}

        {isFormOpen ? (
          <ModalSheet
            ariaLabel={editingStay ? 'Edit stay' : 'Add stay'}
            eyebrow={editingStay ? 'Edit Stay' : 'Add Stay'}
            onClose={closeForm}
            title={editingStay ? editingStay.place_name : trip.name}
          >
            <form className="planner-item-form" onSubmit={handleSubmit}>
              <PlaceInput
                label="Property"
                value={form.place}
                onChange={(v) => updateField('place', v)}
                onSearchPlaces={searchPlaces}
                placeholder="Search for hotel, property…"
              />

              <FormGrid>
                <TextInput
                  label="Check-in date"
                  type="date"
                  value={form.checkInDate}
                  onChange={(v) => updateField('checkInDate', v)}
                  required
                />
                <TextInput
                  label="Check-in time"
                  type="time"
                  value={form.checkInTime}
                  onChange={(v) => updateField('checkInTime', v)}
                />
              </FormGrid>

              <FormGrid>
                <TextInput
                  label="Check-out date"
                  type="date"
                  value={form.checkOutDate}
                  onChange={(v) => updateField('checkOutDate', v)}
                  required
                />
                <TextInput
                  label="Check-out time"
                  type="time"
                  value={form.checkOutTime}
                  onChange={(v) => updateField('checkOutTime', v)}
                />
              </FormGrid>

              <TextInput
                label="Confirmation #"
                value={form.confirmationCode}
                onChange={(v) => updateField('confirmationCode', v)}
              />

              <TextArea
                label="Notes"
                value={form.notes}
                onChange={(v) => updateField('notes', v)}
                rows={3}
              />

              {validationMessage || formError ? (
                <FeedbackMessage tone="error">
                  {validationMessage || formError}
                </FeedbackMessage>
              ) : null}

              <FormActions
                leading={
                  editingStay ? (
                    <IconButton
                      disabled={isDeleting || isSubmitting}
                      icon="delete"
                      label={isDeleting ? 'Deleting stay' : 'Delete stay'}
                      onClick={() => void handleDelete()}
                      variant="destructive"
                    />
                  ) : undefined
                }
              >
                <Button variant="secondary" type="button" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isDeleting}>
                  {isSubmitting ? 'Saving…' : 'Save Stay'}
                </Button>
              </FormActions>
            </form>
          </ModalSheet>
        ) : null}

        {pendingOffer ? (
          <ModalSheet
            ariaLabel="Add reminders"
            eyebrow={pendingOffer.placeName}
            onClose={dismissOffer}
            title="Add reminders?"
          >
            <div className="planner-item-form">
              <ReminderLine
                label="Check in"
                date={pendingOffer.checkInDate}
                day={offerCheckInDay}
              />

              <ReminderLine
                label="Check out"
                date={pendingOffer.checkOutDate}
                day={offerCheckOutDay}
              />

              {reminderError ? (
                <FeedbackMessage tone="error">{reminderError}</FeedbackMessage>
              ) : null}

              <FormActions>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={dismissOffer}
                  disabled={isCreatingReminders}
                >
                  Skip
                </Button>
                {!reminderAttempted ? (
                  <Button
                    type="button"
                    onClick={() => void handleAcceptReminders()}
                    disabled={isCreatingReminders || !canCreateAnyReminder}
                  >
                    {isCreatingReminders ? 'Adding…' : 'Add reminders'}
                  </Button>
                ) : (
                  <Button type="button" onClick={dismissOffer}>
                    Close
                  </Button>
                )}
              </FormActions>
            </div>
          </ModalSheet>
        ) : null}
      </section>
    </main>
  )
}

function ReminderLine({
  date,
  day,
  label,
}: {
  date: string
  day: TripDay | null
  label: string
}) {
  if (day) {
    return (
      <p className="muted">
        <strong>{label}:</strong> {formatTripDayDate(date)}
      </p>
    )
  }

  return (
    <p className="muted">
      <strong>{label}:</strong> {formatTripDayDate(date)}{' '}
      <span style={{ opacity: 0.6 }}>(not in trip — skipped)</span>
    </p>
  )
}

function StayCard({
  canEdit,
  onEdit,
  stay,
}: {
  canEdit: boolean
  onEdit: () => void
  stay: TripStay
}) {
  return (
    <CardSurface className="planner-item-card">
      <div className="planner-item-card__content" style={{ alignSelf: 'start' }}>
        <p className="planner-item-time">
          {formatStayDateRange(stay.check_in_date, stay.check_out_date)}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="bed" size="small" />
          <strong>{stay.place_name}</strong>
        </div>
        {stay.place_address ? (
          <p className="muted">{stay.place_address}</p>
        ) : null}
        {stay.confirmation_code ? (
          <p className="muted">Conf #{stay.confirmation_code}</p>
        ) : null}
        {stay.notes ? <p className="muted">{stay.notes}</p> : null}
      </div>
      {canEdit ? (
        <div className="planner-item-card__controls" style={{ alignSelf: 'start' }}>
          <div className="planner-item-card__actions">
            <IconButton icon="edit" label="Edit stay" onClick={onEdit} />
          </div>
        </div>
      ) : null}
    </CardSurface>
  )
}
