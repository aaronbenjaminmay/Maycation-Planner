import { type FormEvent, useState } from 'react'
import {
  plannerItemKinds,
  type CreatePlannerItemInput,
  type PlannerItemKind,
  type TripDay,
} from '../lib/trips'

type AddPlannerItemFormProps = {
  day: TripDay
  error: string
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (input: CreatePlannerItemInput) => Promise<void>
  tripId: string
}

const kindLabels: Record<PlannerItemKind, string> = {
  activity: 'Activity',
  note: 'Note',
  reservation: 'Reservation',
  travel: 'Travel',
}

export function AddPlannerItemForm({
  day,
  error,
  isSubmitting,
  onCancel,
  onSubmit,
  tripId,
}: AddPlannerItemFormProps) {
  const [kind, setKind] = useState<PlannerItemKind>('activity')
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
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
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" aria-label="Add planner item">
        <div>
          <p className="eyebrow">Add Item</p>
          <h2>{day.label || 'Trip Day'}</h2>
        </div>

        <form className="planner-item-form" onSubmit={handleSubmit}>
          <label>
            Kind
            <select
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as PlannerItemKind)
              }
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

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
