import { type FormEvent, useState } from 'react'
import {
  plannerItemKinds,
  type CreatePlannerItemInput,
  type PlannerItemKind,
  type TripDay,
} from '../lib/trips'
import {
  Button,
  FeedbackMessage,
  FormActions,
  FormGrid,
  IconButton,
  ModalSheet,
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
}

const kindLabels: Record<PlannerItemKind, string> = {
  activity: 'Activity',
  note: 'Note',
  reservation: 'Reservation',
  travel: 'Travel',
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
  const [validationMessage, setValidationMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationMessage('')

    if (!title.trim()) {
      setValidationMessage('Title is required.')
      return
    }

    if (startTime && endTime && endTime < startTime) {
      setValidationMessage('End time must be on or after start time.')
      return
    }

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
    })
  }

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

        <TextInput
          label="Title"
          value={title}
          onChange={setTitle}
          required
        />

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

        <TextInput
          label="Location"
          value={location}
          onChange={setLocation}
        />

        {kind === 'reservation' ? (
          <>
            <TextInput
              label="Address"
              value={address}
              onChange={setAddress}
            />
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

        <TextArea
          label="Notes"
          value={notes}
          onChange={setNotes}
          rows={4}
        />

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
