import { type FormEvent, useState } from 'react'
import {
  deletePlannerItem,
  formatTripDayDate,
  type PlannerItem,
  type Trip,
  type TripDay,
} from '../lib/trips'
import {
  createTripReservation,
  deleteTripReservation,
  syncReservationDerivedItem,
  tripReservationTypes,
  updateTripReservation,
  type TripReservation,
  type TripReservationType,
} from '../lib/reservations'
import { searchPlaces, type PlaceValue } from '../lib/places'
import { getActiveStayForDay, stayCoordinates, type TripStay } from '../lib/stays'
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
  SelectInput,
  TextArea,
  TextInput,
} from './DesignSystem'

const tripReservationTypeIconMap: Record<TripReservationType, 'ticket' | 'utensils'> = {
  dining: 'utensils',
  activity: 'ticket',
}

const tripReservationTypeLabels: Record<TripReservationType, string> = {
  dining: 'Dining',
  activity: 'Activity',
}

type TripReservationsProps = {
  backgroundUrl?: string | null
  canEditReservations: boolean
  onBack: () => void
  onReservationsChanged: () => Promise<void>
  plannerItems: PlannerItem[]
  reservations: TripReservation[]
  trip: Trip
  tripDays: TripDay[]
  tripStays: TripStay[]
}

type ReservationFormValues = {
  reservationType: TripReservationType
  name: string
  place: PlaceValue | null
  reservationDate: string
  reservationTime: string
  confirmationCode: string
  externalUrl: string
  notes: string
}

type PendingDelete = {
  reservation: TripReservation
  derivedItem: PlannerItem
}

function emptyReservationFormValues(): ReservationFormValues {
  return {
    reservationType: 'dining',
    name: '',
    place: null,
    reservationDate: '',
    reservationTime: '',
    confirmationCode: '',
    externalUrl: '',
    notes: '',
  }
}

function reservationToFormValues(reservation: TripReservation): ReservationFormValues {
  return {
    reservationType: reservation.reservation_type,
    name: reservation.name,
    place: reservation.place_name
      ? {
          name: reservation.place_name,
          address: reservation.place_address ?? '',
          coordinates:
            reservation.place_lat !== null && reservation.place_lng !== null
              ? { lat: reservation.place_lat, lng: reservation.place_lng }
              : undefined,
        }
      : null,
    reservationDate: reservation.reservation_date,
    reservationTime: reservation.reservation_time
      ? reservation.reservation_time.slice(0, 5)
      : '',
    confirmationCode: reservation.confirmation_code ?? '',
    externalUrl: reservation.external_url ?? '',
    notes: reservation.notes ?? '',
  }
}

function getVisibleErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function formatReservationTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

export function TripReservations({
  backgroundUrl,
  canEditReservations,
  onBack,
  onReservationsChanged,
  plannerItems,
  reservations,
  trip,
  tripDays,
  tripStays,
}: TripReservationsProps) {
  const [editingReservation, setEditingReservation] = useState<TripReservation | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formError, setFormError] = useState('')
  const [validationMessage, setValidationMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [noticeMessage, setNoticeMessage] = useState('')
  const [form, setForm] = useState<ReservationFormValues>(emptyReservationFormValues)
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

  function findDerivedItem(reservationId: string): PlannerItem | null {
    return (
      plannerItems.find((item) => item.metadata?.derived_from_reservation === reservationId) ??
      null
    )
  }

  function updateField<K extends keyof ReservationFormValues>(
    key: K,
    value: ReservationFormValues[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function openAdd() {
    setEditingReservation(null)
    setForm(emptyReservationFormValues())
    setFormError('')
    setValidationMessage('')
    setSuccessMessage('')
    setNoticeMessage('')
    setIsFormOpen(true)
  }

  function openEdit(reservation: TripReservation) {
    setEditingReservation(reservation)
    setForm(reservationToFormValues(reservation))
    setFormError('')
    setValidationMessage('')
    setSuccessMessage('')
    setNoticeMessage('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingReservation(null)
    setFormError('')
    setValidationMessage('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationMessage('')
    setFormError('')

    if (!form.name.trim()) {
      setValidationMessage('Reservation name is required.')
      return
    }

    if (!form.reservationDate) {
      setValidationMessage('Reservation date is required.')
      return
    }

    if (!tripDays.some((day) => day.date === form.reservationDate)) {
      setValidationMessage("Reservation date must fall within the trip's dates.")
      return
    }

    setIsSubmitting(true)

    try {
      if (editingReservation) {
        await updateTripReservation({
          tripId: trip.id,
          reservationId: editingReservation.id,
          reservationType: form.reservationType,
          name: form.name,
          placeName: form.place?.name,
          placeAddress: form.place?.address,
          placeLat: form.place?.coordinates?.lat ?? null,
          placeLng: form.place?.coordinates?.lng ?? null,
          reservationDate: form.reservationDate,
          reservationTime: form.reservationTime,
          confirmationCode: form.confirmationCode,
          externalUrl: form.externalUrl,
          notes: form.notes,
        })

        const derivedItem = findDerivedItem(editingReservation.id)
        closeForm()

        if (derivedItem && derivedItem.metadata?.managed_by_maycation === true) {
          await syncReservationDerivedItem(trip.id, editingReservation.id)
          setSuccessMessage('Reservation updated. Itinerary item kept in sync.')
          setNoticeMessage('')
        } else if (derivedItem) {
          setSuccessMessage('Reservation updated.')
          setNoticeMessage('Your itinerary item was customized, so it was left unchanged.')
        } else {
          setSuccessMessage('Reservation updated.')
          setNoticeMessage('')
        }

        await onReservationsChanged()
      } else {
        await createTripReservation({
          tripId: trip.id,
          reservationType: form.reservationType,
          name: form.name,
          placeName: form.place?.name,
          placeAddress: form.place?.address,
          placeLat: form.place?.coordinates?.lat ?? null,
          placeLng: form.place?.coordinates?.lng ?? null,
          reservationDate: form.reservationDate,
          reservationTime: form.reservationTime,
          confirmationCode: form.confirmationCode,
          externalUrl: form.externalUrl,
          notes: form.notes,
        })

        closeForm()
        setSuccessMessage('Reservation added to your itinerary.')
        setNoticeMessage('')
        await onReservationsChanged()
      }
    } catch (err) {
      setFormError(getVisibleErrorMessage(err, 'Unable to save reservation.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDeleteClick() {
    if (!editingReservation) return

    const derivedItem = findDerivedItem(editingReservation.id)
    const reservation = editingReservation
    closeForm()

    if (derivedItem) {
      setPendingDelete({ reservation, derivedItem })
    } else {
      void performDelete(reservation, null, false)
    }
  }

  async function performDelete(
    reservation: TripReservation,
    derivedItem: PlannerItem | null,
    removeItem: boolean,
  ) {
    setIsDeleting(true)
    setFormError('')

    try {
      if (derivedItem && removeItem) {
        await deletePlannerItem(trip.id, derivedItem.id)
      }
      await deleteTripReservation(trip.id, reservation.id)
      setPendingDelete(null)
      setSuccessMessage('Reservation deleted.')
      setNoticeMessage('')
      await onReservationsChanged()
    } catch (err) {
      setFormError(getVisibleErrorMessage(err, 'Unable to delete reservation.'))
    } finally {
      setIsDeleting(false)
    }
  }

  const bgStyle = backgroundUrl
    ? ({ '--trip-bg-image': `url(${backgroundUrl})` } as React.CSSProperties)
    : undefined
  const bgClass = backgroundUrl ? ' has-trip-bg' : ''

  const activeStay = getActiveStayForDay(tripStays, form.reservationDate)
  const activeStayCoordinates = stayCoordinates(activeStay)

  return (
    <main
      className={`app-shell dashboard-shell${bgClass}`}
      style={bgStyle}
    >
      <section className="page-shell trips-panel">
        <DetailHeader
          onBack={onBack}
          title="Reservations"
          action={
            canEditReservations ? (
              <IconButton icon="add" label="Add reservation" onClick={openAdd} />
            ) : undefined
          }
        />

        {successMessage ? (
          <FeedbackMessage tone="success">{successMessage}</FeedbackMessage>
        ) : null}

        {noticeMessage ? (
          <FeedbackMessage tone="neutral">{noticeMessage}</FeedbackMessage>
        ) : null}

        {isFormOpen ? (
          <ModalSheet
            ariaLabel={editingReservation ? 'Edit reservation' : 'Add reservation'}
            eyebrow={editingReservation ? 'Edit Reservation' : 'Add Reservation'}
            onClose={closeForm}
            title={editingReservation ? editingReservation.name : trip.name}
          >
            <form className="form-body" onSubmit={handleSubmit}>
              <SelectInput
                label="Type"
                value={form.reservationType}
                onChange={(v) => updateField('reservationType', v as TripReservationType)}
                options={tripReservationTypes.map((t) => ({
                  value: t,
                  label: tripReservationTypeLabels[t],
                }))}
              />

              <TextInput
                label="Name"
                value={form.name}
                onChange={(v) => updateField('name', v)}
                required
              />

              <PlaceInput
                label="Place"
                value={form.place}
                onChange={(v) => updateField('place', v)}
                onSearchPlaces={(q) => searchPlaces(q, activeStayCoordinates)}
                hint="Optional — for navigation and address details"
              />

              <FormGrid>
                <TextInput
                  label="Date"
                  type="date"
                  value={form.reservationDate}
                  onChange={(v) => updateField('reservationDate', v)}
                  required
                />
                <TextInput
                  label="Time"
                  type="time"
                  value={form.reservationTime}
                  onChange={(v) => updateField('reservationTime', v)}
                />
              </FormGrid>

              <TextInput
                label="Confirmation #"
                value={form.confirmationCode}
                onChange={(v) => updateField('confirmationCode', v)}
              />

              <TextInput
                label="Booking link"
                value={form.externalUrl}
                onChange={(v) => updateField('externalUrl', v)}
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
                  editingReservation ? (
                    <IconButton
                      disabled={isDeleting || isSubmitting}
                      icon="delete"
                      label="Delete reservation"
                      onClick={handleDeleteClick}
                      variant="destructive"
                    />
                  ) : undefined
                }
              >
                <Button variant="secondary" type="button" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving…' : 'Save Reservation'}
                </Button>
              </FormActions>
            </form>
          </ModalSheet>
        ) : null}

        {pendingDelete ? (
          <ModalSheet
            ariaLabel="Remove related itinerary item?"
            eyebrow={pendingDelete.reservation.name}
            onClose={() => setPendingDelete(null)}
            title="Also remove the itinerary item?"
          >
            <div className="form-body">
              <p className="muted">
                This reservation created "{pendingDelete.derivedItem.title}" on your itinerary.
                Deleting the reservation won't remove it automatically.
              </p>

              {formError ? <FeedbackMessage tone="error">{formError}</FeedbackMessage> : null}

              <FormActions>
                <Button
                  variant="secondary"
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    void performDelete(pendingDelete.reservation, pendingDelete.derivedItem, false)
                  }
                >
                  {isDeleting ? 'Deleting…' : 'Keep item'}
                </Button>
                <Button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    void performDelete(pendingDelete.reservation, pendingDelete.derivedItem, true)
                  }
                >
                  {isDeleting ? 'Deleting…' : 'Remove item'}
                </Button>
              </FormActions>
            </div>
          </ModalSheet>
        ) : null}

        {reservations.length === 0 ? (
          <EmptyState title="No reservations yet">
            <p className="muted">
              Add a dining or activity reservation to see it here.
            </p>
          </EmptyState>
        ) : (
          <section className="planner-item-list" aria-label="Trip reservations">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                canEdit={canEditReservations}
                onEdit={() => openEdit(reservation)}
                reservation={reservation}
              />
            ))}
          </section>
        )}
      </section>
    </main>
  )
}

function ReservationCard({
  canEdit,
  onEdit,
  reservation,
}: {
  canEdit: boolean
  onEdit: () => void
  reservation: TripReservation
}) {
  return (
    <CardSurface className="planner-item-card planner-item-card--align-start">
      <div className="planner-item-card__content">
        <p className="planner-item-time">
          {formatTripDayDate(reservation.reservation_date)}
          {reservation.reservation_time
            ? ` · ${formatReservationTime(reservation.reservation_time)}`
            : ''}
        </p>
        <div className="icon-label">
          <Icon name={tripReservationTypeIconMap[reservation.reservation_type]} size="small" />
          <strong>{reservation.name}</strong>
        </div>
        {reservation.place_name ? (
          <p className="muted">{reservation.place_name}</p>
        ) : null}
        {reservation.place_address ? (
          <p className="muted">{reservation.place_address}</p>
        ) : null}
        {reservation.confirmation_code ? (
          <p className="muted">Conf #{reservation.confirmation_code}</p>
        ) : null}
        {reservation.notes ? <p className="muted">{reservation.notes}</p> : null}
        {reservation.external_url ? (
          <a
            href={reservation.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-accent"
          >
            View booking
          </a>
        ) : null}
      </div>
      {canEdit ? (
        <div className="planner-item-card__controls">
          <div className="planner-item-card__actions">
            <IconButton icon="edit" label="Edit reservation" onClick={onEdit} />
          </div>
        </div>
      ) : null}
    </CardSurface>
  )
}
