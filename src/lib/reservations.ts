import { getSupabaseClient } from './supabaseClient'

// Named distinctly from trips.ts's ReservationType/reservationTypes (the
// existing 'activity' | 'food' | 'lodging' | 'transportation' vocabulary used
// by manually-created reservation-kind planner items). The two are unrelated
// vocabularies that happen to share a domain word — see the type mapping in
// migration 028 for how a fact's type becomes a derived item's type.
export type TripReservationType = 'dining' | 'activity'

export const tripReservationTypes: TripReservationType[] = ['dining', 'activity']

export type TripReservation = {
  id: string
  trip_id: string
  reservation_type: TripReservationType
  name: string
  place_name: string | null
  place_address: string | null
  place_lat: number | null
  place_lng: number | null
  reservation_date: string
  reservation_time: string | null
  confirmation_code: string | null
  external_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type CreateTripReservationInput = {
  tripId: string
  reservationType: TripReservationType
  name: string
  placeName?: string
  placeAddress?: string
  placeLat?: number | null
  placeLng?: number | null
  reservationDate: string
  reservationTime?: string
  confirmationCode?: string
  externalUrl?: string
  notes?: string
}

export type UpdateTripReservationInput = CreateTripReservationInput & {
  reservationId: string
}

type TripReservationRow = {
  id: string
  trip_id: string
  reservation_type: TripReservationType
  name: string
  place_name: string | null
  place_address: string | null
  place_lat: number | null
  place_lng: number | null
  reservation_date: string
  reservation_time: string | null
  confirmation_code: string | null
  external_url: string | null
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

function mapTripReservationRow(row: TripReservationRow): TripReservation {
  return {
    id: row.id,
    trip_id: row.trip_id,
    reservation_type: row.reservation_type,
    name: row.name,
    place_name: row.place_name,
    place_address: row.place_address,
    place_lat: row.place_lat,
    place_lng: row.place_lng,
    reservation_date: row.reservation_date,
    reservation_time: row.reservation_time,
    confirmation_code: row.confirmation_code,
    external_url: row.external_url,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function loadTripReservations(tripId: string): Promise<TripReservation[]> {
  const client = getSupabaseClient()
  const { data, error } = await client.rpc('get_trip_reservations', {
    target_trip_id: tripId,
  })

  if (error) {
    await logSupabaseError('Failed to load trip reservations', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return ((data ?? []) as TripReservationRow[]).map(mapTripReservationRow)
}

export async function createTripReservation(input: CreateTripReservationInput): Promise<string> {
  const client = getSupabaseClient()
  const trimmedName = input.name.trim()

  if (!trimmedName) {
    throw new Error('Reservation name is required.')
  }

  const { data: reservationId, error } = await client.rpc('create_trip_reservation', {
    target_trip_id: input.tripId,
    reservation_type_input: input.reservationType,
    reservation_name: trimmedName,
    reservation_date_input: input.reservationDate,
    reservation_place_name: input.placeName?.trim() || null,
    reservation_place_address: input.placeAddress?.trim() || null,
    reservation_place_lat: input.placeLat ?? null,
    reservation_place_lng: input.placeLng ?? null,
    reservation_time_input: input.reservationTime || null,
    reservation_confirmation_code: input.confirmationCode?.trim() || null,
    reservation_external_url: input.externalUrl?.trim() || null,
    reservation_notes: input.notes?.trim() || null,
  })

  if (error) {
    await logSupabaseError('Failed to create trip reservation', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return reservationId as string
}

export async function updateTripReservation(input: UpdateTripReservationInput): Promise<string> {
  const client = getSupabaseClient()
  const trimmedName = input.name.trim()

  if (!trimmedName) {
    throw new Error('Reservation name is required.')
  }

  const { data: reservationId, error } = await client.rpc('update_trip_reservation', {
    target_trip_id: input.tripId,
    target_reservation_id: input.reservationId,
    reservation_type_input: input.reservationType,
    reservation_name: trimmedName,
    reservation_date_input: input.reservationDate,
    reservation_place_name: input.placeName?.trim() || null,
    reservation_place_address: input.placeAddress?.trim() || null,
    reservation_place_lat: input.placeLat ?? null,
    reservation_place_lng: input.placeLng ?? null,
    reservation_time_input: input.reservationTime || null,
    reservation_confirmation_code: input.confirmationCode?.trim() || null,
    reservation_external_url: input.externalUrl?.trim() || null,
    reservation_notes: input.notes?.trim() || null,
  })

  if (error) {
    await logSupabaseError('Failed to update trip reservation', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return reservationId as string
}

// System-initiated sync (Derivation Engine step 7): updates only the
// fact-derived fields on the derived planner item, and only while it is
// still managed by Maycation. Returns null when there's nothing to sync —
// no derived item exists, or the item has been customized — which is a
// normal, expected outcome, not an error.
export async function syncReservationDerivedItem(
  tripId: string,
  reservationId: string,
): Promise<string | null> {
  const client = getSupabaseClient()
  const { data: syncedItemId, error } = await client.rpc('sync_reservation_derived_item', {
    target_trip_id: tripId,
    target_reservation_id: reservationId,
  })

  if (error) {
    await logSupabaseError('Failed to sync reservation derived item', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return (syncedItemId as string | null) ?? null
}

export async function deleteTripReservation(tripId: string, reservationId: string): Promise<string> {
  const client = getSupabaseClient()
  const { data: deletedId, error } = await client.rpc('delete_trip_reservation', {
    target_trip_id: tripId,
    target_reservation_id: reservationId,
  })

  if (error) {
    await logSupabaseError('Failed to delete trip reservation', error)
    throw new Error(getSupabaseErrorMessage(error))
  }

  return deletedId as string
}
