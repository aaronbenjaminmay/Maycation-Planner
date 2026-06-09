import { type FormEvent, useState } from 'react'
import {
  travelTypes,
  type CreateTripInput,
  type TravelType,
} from '../lib/trips'

type CreateTripFormProps = {
  error: string
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (input: CreateTripInput) => Promise<void>
}

const initialTravelType: TravelType = 'Plane'

export function CreateTripForm({
  error,
  isSubmitting,
  onCancel,
  onSubmit,
}: CreateTripFormProps) {
  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [startsOn, setStartsOn] = useState('')
  const [endsOn, setEndsOn] = useState('')
  const [travelType, setTravelType] = useState<TravelType>(initialTravelType)
  const [validationMessage, setValidationMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setValidationMessage('')

    if (!name.trim()) {
      setValidationMessage('Trip name is required.')
      return
    }

    if (!startsOn || !endsOn) {
      setValidationMessage('Start date and end date are required.')
      return
    }

    if (endsOn < startsOn) {
      setValidationMessage('End date must be on or after the start date.')
      return
    }

    await onSubmit({
      name,
      destination,
      startsOn,
      endsOn,
      travelType,
    })
  }

  return (
    <form className="trip-form" onSubmit={handleSubmit}>
      <label>
        Trip Name
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>

      <label>
        Location
        <input
          type="text"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
        />
      </label>

      <div className="form-grid">
        <label>
          Start Date
          <input
            type="date"
            value={startsOn}
            onChange={(event) => setStartsOn(event.target.value)}
            required
          />
        </label>

        <label>
          End Date
          <input
            type="date"
            value={endsOn}
            onChange={(event) => setEndsOn(event.target.value)}
            required
          />
        </label>
      </div>

      <label>
        Travel Type
        <select
          value={travelType}
          onChange={(event) => setTravelType(event.target.value as TravelType)}
        >
          {travelTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      {validationMessage || error ? (
        <p className="feedback">{validationMessage || error}</p>
      ) : null}

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Trip'}
        </button>
      </div>
    </form>
  )
}
