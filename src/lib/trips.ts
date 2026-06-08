import { getSupabaseClient } from './supabaseClient'

export const travelTypes = [
  'Plane',
  'Road Trip',
  'Train',
  'Cruise',
  'Other',
] as const

export type TravelType = (typeof travelTypes)[number]

export type TripMemberRole = 'owner' | 'editor' | 'viewer'

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

export const plannerItemKinds = [
  'travel',
  'reservation',
  'activity',
  'note',
] as const

export type PlannerItemKind = (typeof plannerItemKinds)[number]

export type PlannerItem = {
  id: string
  trip_id: string
  trip_day_id: string
  kind: PlannerItemKind
  title: string
  description: string | null
  starts_at: string | null
  ends_at: string | null
  location_name: string | null
  sort_order: number
}

export type CreateTripInput = {
  name: string
  destination: string
  startsOn: string
  endsOn: string
  travelType: TravelType
}

export type CreatePlannerItemInput = {
  endTime: string
  kind: PlannerItemKind
  location: string
  notes: string
  startTime: string
  title: string
  tripDayId: string
  tripId: string
}

export type UpdatePlannerItemInput = CreatePlannerItemInput & {
  itemId: string
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

type PlannerItemRow = {
  id: string
  trip_id: string
  trip_day_id: string
  kind: PlannerItemKind
  title: string
  description: string | null
  starts_at: string | null
  ends_at: string | null
  location_name: string | null
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

export function formatPlannerItemTimeRange(item: PlannerItem) {
  if (!item.starts_at && !item.ends_at) {
    return ''
  }

  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (item.starts_at && item.ends_at) {
    return `${formatter.format(new Date(item.starts_at))} - ${formatter.format(
      new Date(item.ends_at),
    )}`
  }

  return formatter.format(new Date(item.starts_at ?? item.ends_at ?? ''))
}

export function formatPlannerItemTimeInput(value: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
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

function mapPlannerItemRow(row: PlannerItemRow): PlannerItem {
  return {
    id: row.id,
    trip_id: row.trip_id,
    trip_day_id: row.trip_day_id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    location_name: row.location_name,
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

export async function loadPlannerItems(tripId: string) {
  const client = getSupabaseClient()
  const { data, error } = await client.rpc('get_trip_planner_items', {
    target_trip_id: tripId,
  })

  if (error) {
    await logSupabaseError('Failed to load planner items', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return ((data ?? []) as PlannerItemRow[]).map(mapPlannerItemRow)
}

export async function createPlannerItem(input: CreatePlannerItemInput) {
  const client = getSupabaseClient()
  const trimmedTitle = input.title.trim()

  if (!trimmedTitle) {
    throw new Error('Title is required.')
  }

  if (input.startTime && input.endTime && input.endTime < input.startTime) {
    throw new Error('End time must be on or after start time.')
  }

  const { data: itemId, error } = await client.rpc('create_planner_item', {
    target_trip_id: input.tripId,
    target_trip_day_id: input.tripDayId,
    item_kind: input.kind,
    item_title: trimmedTitle,
    start_time: input.startTime || null,
    end_time: input.endTime || null,
    item_location: input.location.trim(),
    item_notes: input.notes.trim(),
  })

  if (error) {
    await logSupabaseError('Failed to create planner item', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return itemId
}

export async function updatePlannerItem(input: UpdatePlannerItemInput) {
  const client = getSupabaseClient()
  const trimmedTitle = input.title.trim()

  if (!trimmedTitle) {
    throw new Error('Title is required.')
  }

  if (input.startTime && input.endTime && input.endTime < input.startTime) {
    throw new Error('End time must be on or after start time.')
  }

  const { data: itemId, error } = await client.rpc('update_planner_item', {
    target_trip_id: input.tripId,
    target_item_id: input.itemId,
    item_kind: input.kind,
    item_title: trimmedTitle,
    start_time: input.startTime || null,
    end_time: input.endTime || null,
    item_location: input.location.trim(),
    item_notes: input.notes.trim(),
  })

  if (error) {
    await logSupabaseError('Failed to update planner item', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return itemId
}

export async function deletePlannerItem(tripId: string, itemId: string) {
  const client = getSupabaseClient()
  const { data: deletedItemId, error } = await client.rpc(
    'delete_planner_item',
    {
      target_trip_id: tripId,
      target_item_id: itemId,
    },
  )

  if (error) {
    await logSupabaseError('Failed to delete planner item', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return deletedItemId
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
