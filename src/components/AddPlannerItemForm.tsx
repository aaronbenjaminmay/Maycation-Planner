import { type FormEvent, useState, useEffect } from 'react'
import {
  plannerItemKinds,
  reservationTypes,
  type CreatePlannerItemInput,
  type PlannerItemKind,
  type ReservationType,
  type TripDay,
} from '../lib/trips'
import { searchPlaces, getTravelDurationMinutes, type PlaceValue } from '../lib/places'
import {
  Button,
  FeedbackMessage,
  FormActions,
  FormGrid,
  IconButton,
  ModalSheet,
  PlaceInput,
  SelectInput,
  TextArea,
  TextInput,
} from './DesignSystem'

type AddPlannerItemFormProps = {
  ariaLabel?: string
  day: TripDay
  error: string
  initialValues?: PlannerItemFormValues
  isDeleting?: boolean
  isSubmitting: boolean
  onCancel: () => void
  onDelete?: () => Promise<void>
  onSubmit: (input: CreatePlannerItemInput) => Promise<void>
  submitLabel?: string
  submittingLabel?: string
  title?: string
  tripId: string
}

export type PlannerItemFormValues = {
  endTime: string
  kind: PlannerItemKind
  location: string
  notes: string
  startTime: string
  title: string
  confirmationCode: string
  address: string
  externalUrl: string
  reservationType: ReservationType
  origin: PlaceValue | null
  destination: PlaceValue | null
}

const kindLabels: Record<PlannerItemKind, string> = {
  activity: 'Activity',
  note: 'Note',
  reservation: 'Reservation',
  travel: 'Travel',
}

const reservationTypeLabels: Record<ReservationType, string> = {
  activity: 'Activity',
  food: 'Food & Dining',
  lodging: 'Lodging',
  transportation: 'Transportation',
}

function computeArrivalMinutes(startTimeStr: string, durationMins: number): number {
  const [h, m] = startTimeStr.split(':').map(Number)
  return h * 60 + m + durationMins
}

function formatMinutesAsClockDisplay(totalMinutes: number): string {
  const clockMins = totalMinutes % 1440
  const d = new Date()
  d.setHours(Math.floor(clockMins / 60), clockMins % 60, 0, 0)
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs === 0) return `${mins} min`
  if (mins === 0) return `${hrs} hr`
  return `${hrs} hr ${mins} min`
}

export function AddPlannerItemForm({
  ariaLabel = 'Add planner item',
  day,
  error,
  initialValues,
  isDeleting = false,
  isSubmitting,
  onCancel,
  onDelete,
  onSubmit,
  submitLabel = 'Save Item',
  submittingLabel = 'Saving...',
  title: formTitle = 'Add Item',
  tripId,
}: AddPlannerItemFormProps) {
  const [kind, setKind] = useState<PlannerItemKind>(
    initialValues?.kind ?? 'activity',
  )
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [startTime, setStartTime] = useState(initialValues?.startTime ?? '')
  const [endTime, setEndTime] = useState(initialValues?.endTime ?? '')
  const [location, setLocation] = useState(initialValues?.location ?? '')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [confirmationCode, setConfirmationCode] = useState(initialValues?.confirmationCode ?? '')
  const [address, setAddress] = useState(initialValues?.address ?? '')
  const [externalUrl, setExternalUrl] = useState(initialValues?.externalUrl ?? '')
  const [reservationType, setReservationType] = useState<ReservationType>(
    initialValues?.reservationType ?? 'activity',
  )

  // Travel-specific state
  const [origin, setOrigin] = useState<PlaceValue | null>(initialValues?.origin ?? null)
  const [destination, setDestination] = useState<PlaceValue | null>(initialValues?.destination ?? null)
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null)
  const [isDeriving, setIsDeriving] = useState(false)
  const [derivationError, setDerivationError] = useState<string | null>(null)

  const [validationMessage, setValidationMessage] = useState('')

  // Extract coordinate primitives so the effect deps use value equality, not reference equality.
  // This ensures the effect re-runs reliably whenever coordinates actually change.
  const originLat = origin?.coordinates?.lat ?? null
  const originLng = origin?.coordinates?.lng ?? null
  const destLat = destination?.coordinates?.lat ?? null
  const destLng = destination?.coordinates?.lng ?? null

  // Live derivation: runs whenever coordinates change for a travel item
  useEffect(() => {
    if (kind !== 'travel') {
      setDurationMinutes(null)
      setDerivationError(null)
      setIsDeriving(false)
      return
    }

    if (originLat === null || originLng === null || destLat === null || destLng === null) {
      setDurationMinutes(null)
      setDerivationError(null)
      setIsDeriving(false)
      return
    }

    let isCurrent = true
    setIsDeriving(true)
    setDurationMinutes(null)
    setDerivationError(null)

    getTravelDurationMinutes(
      { lat: originLat, lng: originLng },
      { lat: destLat, lng: destLng },
    )
      .then((minutes) => {
        if (isCurrent) {
          setDurationMinutes(minutes)
          setIsDeriving(false)
        }
      })
      .catch((err) => {
        if (isCurrent) {
          setDurationMinutes(null)
          setDerivationError(
            err instanceof Error ? err.message : 'Travel time unavailable',
          )
          setIsDeriving(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [kind, originLat, originLng, destLat, destLng])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationMessage('')

    if (!title.trim()) {
      setValidationMessage('Title is required.')
      return
    }

    if (kind !== 'travel' && startTime && endTime && endTime < startTime) {
      setValidationMessage('End time must be on or after start time.')
      return
    }

    if (kind === 'travel') {
      const endTimeMinutes =
        durationMinutes !== null && startTime
          ? computeArrivalMinutes(startTime, durationMinutes)
          : null

      await onSubmit({
        kind,
        title,
        startTime,
        endTime: '',
        endTimeMinutes,
        location: destination?.name ?? '',
        address: destination?.address ?? '',
        notes,
        tripDayId: day.id,
        tripId,
        metadata: {
          start_place_name: origin?.name ?? null,
          start_place_address: origin?.address ?? null,
          start_place_lat: origin?.coordinates?.lat ?? null,
          start_place_lng: origin?.coordinates?.lng ?? null,
          destination_place_lat: destination?.coordinates?.lat ?? null,
          destination_place_lng: destination?.coordinates?.lng ?? null,
        },
      })
    } else {
      await onSubmit({
        endTime,
        kind,
        location,
        notes,
        startTime,
        title,
        tripDayId: day.id,
        tripId,
        confirmationCode,
        address,
        externalUrl,
        reservationType,
      })
    }
  }

  const bothPlacesSet = origin !== null && destination !== null
  const canDerive =
    (origin?.coordinates !== undefined) &&
    (destination?.coordinates !== undefined)
  const showUnavailable = bothPlacesSet && !canDerive && !isDeriving

  return (
    <ModalSheet
      ariaLabel={ariaLabel}
      eyebrow={formTitle}
      onClose={onCancel}
      title={day.label || 'Trip Day'}
    >
      <form className="planner-item-form" onSubmit={handleSubmit}>
        <SelectInput
          label="Kind"
          value={kind}
          onChange={(v) => setKind(v as PlannerItemKind)}
          options={plannerItemKinds.map((k) => ({ value: k, label: kindLabels[k] }))}
        />

        {kind === 'reservation' ? (
          <SelectInput
            label="Type"
            value={reservationType}
            onChange={(v) => setReservationType(v as ReservationType)}
            options={reservationTypes.map((t) => ({ value: t, label: reservationTypeLabels[t] }))}
          />
        ) : null}

        <TextInput label="Title" value={title} onChange={setTitle} required />

        {kind === 'travel' ? (
          <>
            <TextInput
              label="Leave time"
              type="time"
              value={startTime}
              onChange={setStartTime}
            />

            <PlaceInput
              label="From"
              value={origin}
              onChange={setOrigin}
              onSearchPlaces={searchPlaces}
              hint="Where are you leaving from?"
            />

            <PlaceInput
              label="To"
              value={destination}
              onChange={setDestination}
              onSearchPlaces={searchPlaces}
              hint="Where are you going?"
            />

            {isDeriving ? (
              <p className="travel-estimate travel-estimate--calculating">
                Calculating travel time…
              </p>
            ) : durationMinutes !== null ? (
              <div className="travel-estimate">
                <p className="travel-estimate__duration">
                  ≈ {formatDuration(durationMinutes)} drive
                </p>
                {startTime ? (() => {
                  const arrivalMins = computeArrivalMinutes(startTime, durationMinutes)
                  const nextDay = arrivalMins >= 1440
                  return (
                    <p className="travel-estimate__arrival">
                      Arrive around{' '}
                      {formatMinutesAsClockDisplay(arrivalMins)}
                      {nextDay ? ' next day' : ''}
                    </p>
                  )
                })() : null}
              </div>
            ) : showUnavailable ? (
              <p className="travel-estimate travel-estimate--unavailable">
                Travel time unavailable
              </p>
            ) : derivationError && bothPlacesSet ? (
              <p className="travel-estimate travel-estimate--unavailable">
                Travel time unavailable
              </p>
            ) : null}
          </>
        ) : (
          <>
            <FormGrid>
              <TextInput
                label="Start time"
                type="time"
                value={startTime}
                onChange={setStartTime}
              />
              <TextInput
                label="End time"
                type="time"
                value={endTime}
                onChange={setEndTime}
              />
            </FormGrid>

            <TextInput label="Location" value={location} onChange={setLocation} />
          </>
        )}

        {kind === 'reservation' ? (
          <>
            <TextInput label="Address" value={address} onChange={setAddress} />
            <TextInput
              label="Confirmation #"
              value={confirmationCode}
              onChange={setConfirmationCode}
            />
            <TextInput
              label="Booking link"
              value={externalUrl}
              onChange={setExternalUrl}
            />
          </>
        ) : null}

        <TextArea label="Notes" value={notes} onChange={setNotes} rows={4} />

        {validationMessage || error ? (
          <FeedbackMessage tone="error">{validationMessage || error}</FeedbackMessage>
        ) : null}

        <FormActions
          leading={
            onDelete
              ? (
                  <IconButton
                    disabled={isDeleting || isSubmitting}
                    icon="delete"
                    label={isDeleting ? 'Deleting item' : 'Delete item'}
                    onClick={() => void onDelete()}
                    variant="destructive"
                  />
                )
              : undefined
          }
        >
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </FormActions>
      </form>
    </ModalSheet>
  )
}
