import { type FormEvent, useState } from 'react'
import {
  travelTypes,
  type CreateTripInput,
  type TravelType,
} from '../lib/trips'
import {
  FeedbackMessage,
  FormActions,
  FormGrid,
  SelectInput,
  TextInput,
} from './DesignSystem'

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
      <TextInput label="Trip Name" value={name} onChange={setName} required />

      <TextInput
        label="Location"
        value={destination}
        onChange={setDestination}
      />

      <FormGrid>
        <TextInput
          label="Start Date"
          type="date"
          value={startsOn}
          onChange={setStartsOn}
          required
        />
        <TextInput
          label="End Date"
          type="date"
          value={endsOn}
          onChange={setEndsOn}
          required
        />
      </FormGrid>

      <SelectInput
        label="Travel Type"
        value={travelType}
        onChange={(v) => setTravelType(v as TravelType)}
        options={travelTypes.map((type) => ({ value: type, label: type }))}
      />

      {validationMessage || error ? (
        <FeedbackMessage tone="error">{validationMessage || error}</FeedbackMessage>
      ) : null}

      <FormActions>
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Trip'}
        </button>
      </FormActions>
    </form>
  )
}
