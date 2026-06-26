import { getSupabaseClient } from './supabaseClient'

export const travelTypes = [
  'Plane',
  'Road Trip',
  'Train',
  'Cruise',
  'Other',
] as const

export type TravelType = (typeof travelTypes)[number]

export const tripDayTypes = [
  'activity',
  'travel',
  'relax',
  'explore',
  'special',
] as const

export type TripDayType = (typeof tripDayTypes)[number]

export const reservationTypes = [
  'activity',
  'food',
  'lodging',
  'transportation',
] as const

export type ReservationType = (typeof reservationTypes)[number]

export type TripMemberRole = 'owner' | 'editor' | 'viewer'

export type Trip = {
  id: string
  name: string
  destination: string | null
  starts_on: string
  ends_on: string
  background_path: string | null
  header_image_path: string | null
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
  day_type: TripDayType
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
  trip_day_id: string | null
  kind: PlannerItemKind
  title: string
  description: string | null
  starts_at: string | null
  ends_at: string | null
  location_name: string | null
  location_address: string | null
  confirmation_code: string | null
  external_url: string | null
  status: string
  sort_order: number
  reservation_type: ReservationType
  metadata: {
    completed?: boolean
    [key: string]: unknown
  }
}

export type CreateTripInput = {
  name: string
  destination: string
  startsOn: string
  endsOn: string
  travelType: TravelType
}

export type UpdateTripInput = CreateTripInput & {
  tripId: string
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
  confirmationCode?: string
  address?: string
  externalUrl?: string
  reservationType?: ReservationType
  metadata?: Record<string, unknown>
}

export type UpdateTripDayInput = {
  tripId: string
  dayId: string
  label: string
  dayType: TripDayType
}

export type UpdatePlannerItemInput = CreatePlannerItemInput & {
  itemId: string
}

export type ReorderPlannerItemDirection = 'up' | 'down'

type TripRow = {
  id: string
  name: string
  destination: string | null
  starts_on: string
  ends_on: string
  background_path: string | null
  header_image_path: string | null
  metadata: Record<string, unknown> | null
}

type TripDayRow = {
  id: string
  trip_id: string
  date: string
  label: string | null
  sort_order: number
  day_type: TripDayType
}

type PlannerItemRow = {
  id: string
  trip_id: string
  trip_day_id: string | null
  kind: PlannerItemKind
  title: string
  description: string | null
  starts_at: string | null
  ends_at: string | null
  location_name: string | null
  location_address: string | null
  confirmation_code: string | null
  external_url: string | null
  status: string
  sort_order: number
  reservation_type: ReservationType
  metadata: Record<string, unknown> | null
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
  })

  return `${formatter.format(parseDateInput(startsOn))} – ${formatter.format(
    parseDateInput(endsOn),
  )}`
}

export function formatTripDayDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
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
    background_path: row.background_path,
    header_image_path: row.header_image_path,
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
    day_type: row.day_type,
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
    location_address: row.location_address,
    confirmation_code: row.confirmation_code,
    external_url: row.external_url,
    status: row.status,
    sort_order: row.sort_order,
    reservation_type: row.reservation_type,
    metadata: row.metadata ?? {},
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
    item_confirmation_code: input.confirmationCode?.trim() || null,
    item_address: input.address?.trim() || null,
    item_url: input.externalUrl?.trim() || null,
    item_reservation_type: input.reservationType ?? 'activity',
    item_metadata: input.metadata ?? {},
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
    item_confirmation_code: input.confirmationCode?.trim() || null,
    item_address: input.address?.trim() || null,
    item_url: input.externalUrl?.trim() || null,
    item_reservation_type: input.reservationType ?? 'activity',
    item_metadata: input.metadata ?? {},
  })

  if (error) {
    await logSupabaseError('Failed to update planner item', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return itemId
}

export async function updateTripDay(input: UpdateTripDayInput) {
  const client = getSupabaseClient()
  const { error } = await client.rpc('update_trip_day', {
    target_trip_id: input.tripId,
    target_day_id: input.dayId,
    day_label: input.label,
    new_day_type: input.dayType,
  })

  if (error) {
    await logSupabaseError('Failed to update trip day', error)
    throw new Error(getSupabaseErrorMessage(error))
  }
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

export async function reorderPlannerItem(
  tripId: string,
  itemId: string,
  direction: ReorderPlannerItemDirection,
) {
  const client = getSupabaseClient()
  const { data: didReorder, error } = await client.rpc(
    'reorder_planner_item',
    {
      target_trip_id: tripId,
      planner_item_id: itemId,
      direction,
    },
  )

  if (error) {
    await logSupabaseError('Failed to reorder planner item', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return Boolean(didReorder)
}

export async function togglePlannerItemCompletion(
  tripId: string,
  itemId: string,
  isCompleted: boolean,
) {
  const client = getSupabaseClient()
  const { data: updatedItemId, error } = await client.rpc(
    'toggle_planner_item_completion',
    {
      target_trip_id: tripId,
      planner_item_id: itemId,
      is_completed: isCompleted,
    },
  )

  if (error) {
    await logSupabaseError('Failed to update planner item completion', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return updatedItemId
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

export async function deleteTrip(tripId: string) {
  const client = getSupabaseClient()
  const { data: deletedId, error } = await client.rpc('delete_trip', {
    target_trip_id: tripId,
  })

  if (error) {
    await logSupabaseError('Failed to delete trip', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return deletedId as string
}

export async function setTripBackground(
  tripId: string,
  storagePath: string | null,
) {
  const client = getSupabaseClient()
  const { error } = await client.rpc('set_trip_background', {
    target_trip_id: tripId,
    storage_path: storagePath,
  })

  if (error) {
    await logSupabaseError('Failed to set trip background', error)
    throw new Error(getSupabaseErrorMessage(error))
  }
}

export async function getTripBackgroundUrl(path: string): Promise<string | null> {
  const client = getSupabaseClient()
  const { data, error } = await client.storage
    .from('trip-backgrounds')
    .createSignedUrl(path, 28800) // 8 hours

  if (error || !data?.signedUrl) {
    return null
  }

  return data.signedUrl
}

export async function setTripHeaderImage(
  tripId: string,
  storagePath: string | null,
) {
  const client = getSupabaseClient()
  const { error } = await client.rpc('set_trip_header_image', {
    target_trip_id: tripId,
    storage_path: storagePath,
  })

  if (error) {
    await logSupabaseError('Failed to set trip header image', error)
    throw new Error(getSupabaseErrorMessage(error))
  }
}

export async function getTripHeaderImageUrl(path: string): Promise<string | null> {
  const client = getSupabaseClient()
  const { data, error } = await client.storage
    .from('trip-backgrounds')
    .createSignedUrl(path, 28800) // 8 hours

  if (error || !data?.signedUrl) {
    return null
  }

  return data.signedUrl
}

export async function updateTrip(input: UpdateTripInput) {
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

  const { data, error } = await client.rpc('update_trip', {
    target_trip_id: input.tripId,
    trip_name: trimmedName,
    location: trimmedDestination,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    travel_type: input.travelType,
  })

  if (error) {
    await logSupabaseError('Failed to update trip', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  const updatedTrip = ((data ?? []) as TripRow[])[0]

  if (!updatedTrip) {
    throw new Error('Trip could not be updated.')
  }

  return mapTripRow(updatedTrip)
}
