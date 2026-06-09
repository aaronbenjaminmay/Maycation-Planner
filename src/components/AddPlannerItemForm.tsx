import { type FormEvent, useState } from 'react'
import {
  plannerItemKinds,
  type CreatePlannerItemInput,
  type PlannerItemKind,
  type TripDay,
} from '../lib/trips'
import { IconButton, ModalSheet } from './DesignSystem'

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
        <label>
          Kind
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as PlannerItemKind)}
          >
            {plannerItemKinds.map((itemKind) => (
              <option key={itemKind} value={itemKind}>
                {kindLabels[itemKind]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>

        <div className="form-grid">
          <label>
            Start time
            <input
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </label>

          <label>
            End time
            <input
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </label>
        </div>

        <label>
          Location
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </label>

        <label>
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
          />
        </label>

        {validationMessage || error ? (
          <p className="feedback">{validationMessage || error}</p>
        ) : null}

        <div className={`form-actions${onDelete ? ' form-actions--with-delete' : ''}`}>
          {onDelete ? (
            <div className="form-actions__danger">
              <IconButton
                disabled={isDeleting || isSubmitting}
                icon="delete"
                label={isDeleting ? 'Deleting item' : 'Delete item'}
                onClick={() => void onDelete()}
                variant="destructive"
              />
            </div>
          ) : null}
          <div className="form-actions__main">
            <button type="button" className="secondary-button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </ModalSheet>
  )
}
