import { getSupabaseClient } from './supabaseClient'

export type TripStay = {
  id: string
  trip_id: string
  place_name: string
  place_address: string | null
  place_lat: number | null
  place_lng: number | null
  check_in_date: string
  check_in_time: string | null
  check_out_date: string
  check_out_time: string | null
  confirmation_code: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type CreateTripStayInput = {
  tripId: string
  placeName: string
  placeAddress?: string
  placeLat?: number | null
  placeLng?: number | null
  checkInDate: string
  checkInTime?: string
  checkOutDate: string
  checkOutTime?: string
  confirmationCode?: string
  notes?: string
}

export type UpdateTripStayInput = CreateTripStayInput & {
  stayId: string
}

type TripStayRow = {
  id: string
  trip_id: string
  place_name: string
  place_address: string | null
  place_lat: number | null
  place_lng: number | null
  check_in_date: string
  check_in_time: string | null
  check_out_date: string
  check_out_time: string | null
  confirmation_code: string | null
  notes: string | null
  created_at: string
  updated_at: string
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

function mapTripStayRow(row: TripStayRow): TripStay {
  return {
    id: row.id,
    trip_id: row.trip_id,
    place_name: row.place_name,
    place_address: row.place_address,
    place_lat: row.place_lat,
    place_lng: row.place_lng,
    check_in_date: row.check_in_date,
    check_in_time: row.check_in_time,
    check_out_date: row.check_out_date,
    check_out_time: row.check_out_time,
    confirmation_code: row.confirmation_code,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function formatStayDateRange(checkInDate: string, checkOutDate: string): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  })
  const [inYear, inMonth, inDay] = checkInDate.split('-').map(Number)
  const [outYear, outMonth, outDay] = checkOutDate.split('-').map(Number)
  const checkIn = new Date(inYear, inMonth - 1, inDay)
  const checkOut = new Date(outYear, outMonth - 1, outDay)
  return `${formatter.format(checkIn)} – ${formatter.format(checkOut)}`
}

export function getActiveStayForDay(stays: TripStay[], dayDate: string): TripStay | null {
  return stays.find(
    (stay) => stay.check_in_date <= dayDate && stay.check_out_date > dayDate,
  ) ?? null
}

export async function loadTripStays(tripId: string): Promise<TripStay[]> {
  const client = getSupabaseClient()
  const { data, error } = await client.rpc('get_trip_stays', {
    target_trip_id: tripId,
  })

  if (error) {
    await logSupabaseError('Failed to load trip stays', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return ((data ?? []) as TripStayRow[]).map(mapTripStayRow)
}

export async function createTripStay(input: CreateTripStayInput): Promise<string> {
  const client = getSupabaseClient()
  const trimmedName = input.placeName.trim()

  if (!trimmedName) {
    throw new Error('Property name is required.')
  }

  const { data: stayId, error } = await client.rpc('create_trip_stay', {
    target_trip_id: input.tripId,
    stay_place_name: trimmedName,
    stay_check_in_date: input.checkInDate,
    stay_check_out_date: input.checkOutDate,
    stay_place_address: input.placeAddress?.trim() || null,
    stay_place_lat: input.placeLat ?? null,
    stay_place_lng: input.placeLng ?? null,
    stay_check_in_time: input.checkInTime || null,
    stay_check_out_time: input.checkOutTime || null,
    stay_confirmation_code: input.confirmationCode?.trim() || null,
    stay_notes: input.notes?.trim() || null,
  })

  if (error) {
    await logSupabaseError('Failed to create trip stay', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return stayId as string
}

export async function updateTripStay(input: UpdateTripStayInput): Promise<string> {
  const client = getSupabaseClient()
  const trimmedName = input.placeName.trim()

  if (!trimmedName) {
    throw new Error('Property name is required.')
  }

  const { data: stayId, error } = await client.rpc('update_trip_stay', {
    target_trip_id: input.tripId,
    target_stay_id: input.stayId,
    stay_place_name: trimmedName,
    stay_check_in_date: input.checkInDate,
    stay_check_out_date: input.checkOutDate,
    stay_place_address: input.placeAddress?.trim() || null,
    stay_place_lat: input.placeLat ?? null,
    stay_place_lng: input.placeLng ?? null,
    stay_check_in_time: input.checkInTime || null,
    stay_check_out_time: input.checkOutTime || null,
    stay_confirmation_code: input.confirmationCode?.trim() || null,
    stay_notes: input.notes?.trim() || null,
  })

  if (error) {
    await logSupabaseError('Failed to update trip stay', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return stayId as string
}

export async function deleteTripStay(tripId: string, stayId: string): Promise<string> {
  const client = getSupabaseClient()
  const { data: deletedId, error } = await client.rpc('delete_trip_stay', {
    target_trip_id: tripId,
    target_stay_id: stayId,
  })

  if (error) {
    await logSupabaseError('Failed to delete trip stay', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return deletedId as string
}
