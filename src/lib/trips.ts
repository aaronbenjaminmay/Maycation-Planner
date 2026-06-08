import { getSupabaseClient } from './supabaseClient'

export const travelTypes = [
  'Plane',
  'Road Trip',
  'Train',
  'Cruise',
  'Other',
] as const

export type TravelType = (typeof travelTypes)[number]

export type Trip = {
  id: string
  name: string
  destination: string | null
  starts_on: string
  ends_on: string
  metadata: {
    travel_type?: TravelType
    [key: string]: unknown
  }
}

export type TripDay = {
  id: string
  trip_id: string
  date: string
  label: string | null
  sort_order: number
}

export type CreateTripInput = {
  name: string
  destination: string
  startsOn: string
  endsOn: string
  travelType: TravelType
}

type TripRow = {
  id: string
  name: string
  destination: string | null
  starts_on: string
  ends_on: string
  metadata: Record<string, unknown> | null
}

type TripDayRow = {
  id: string
  trip_id: string
  date: string
  label: string | null
  sort_order: number
}

type SupabaseErrorLike = {
  code?: string
  details?: string
  hint?: string
  message?: string
}

async function logSupabaseError(context: string, error: SupabaseErrorLike) {
  if (import.meta.env.DEV) {
    const client = getSupabaseClient()
    const { data } = await client.auth.getSession()

    console.error(context, {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
      sessionUserId: data.session?.user.id ?? null,
    })
  }
}

function getSupabaseErrorMessage(error: SupabaseErrorLike) {
  return error.message || 'Supabase request failed.'
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getTripDayCount(startsOn: string, endsOn: string) {
  const start = parseDateInput(startsOn)
  const end = parseDateInput(endsOn)
  const millisecondsPerDay = 24 * 60 * 60 * 1000

  return Math.round((end.getTime() - start.getTime()) / millisecondsPerDay) + 1
}

export function buildTripDays(startsOn: string, endsOn: string) {
  const dayCount = getTripDayCount(startsOn, endsOn)
  const start = parseDateInput(startsOn)

  return Array.from({ length: dayCount }, (_value, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)

    return {
      date: formatDateInput(date),
      sort_order: index,
    }
  })
}

export function formatTripDateRange(startsOn: string, endsOn: string) {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return `${formatter.format(parseDateInput(startsOn))} - ${formatter.format(
    parseDateInput(endsOn),
  )}`
}

export function formatTripDayDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parseDateInput(date))
}

function mapTripRow(row: TripRow): Trip {
  return {
    id: row.id,
    name: row.name,
    destination: row.destination,
    starts_on: row.starts_on,
    ends_on: row.ends_on,
    metadata: row.metadata ?? {},
  }
}

function mapTripDayRow(row: TripDayRow): TripDay {
  return {
    id: row.id,
    trip_id: row.trip_id,
    date: row.date,
    label: row.label,
    sort_order: row.sort_order,
  }
}

export async function loadTripsForUser() {
  const client = getSupabaseClient()
  const { data, error } = await client.rpc('get_my_trips')

  if (error) {
    await logSupabaseError('Failed to load trips', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return ((data ?? []) as TripRow[]).map(mapTripRow)
}

export async function loadTripDays(tripId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client.rpc('get_trip_days', {
    target_trip_id: tripId,
  })

  if (error) {
    await logSupabaseError('Failed to load trip days', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return ((data ?? []) as TripDayRow[]).map(mapTripDayRow)
}

export async function createTrip(input: CreateTripInput) {
  const client = getSupabaseClient()
  const trimmedName = input.name.trim()
  const trimmedDestination = input.destination.trim()

  if (!trimmedName) {
    throw new Error('Trip name is required.')
  }

  if (!input.startsOn || !input.endsOn) {
    throw new Error('Start date and end date are required.')
  }

  if (parseDateInput(input.endsOn) < parseDateInput(input.startsOn)) {
    throw new Error('End date must be on or after the start date.')
  }

  const { data: tripId, error } = await client.rpc('create_trip_with_days', {
    trip_name: trimmedName,
    location: trimmedDestination,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    travel_type: input.travelType,
  })

  if (error) {
    await logSupabaseError('Failed to create trip', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return tripId
}
