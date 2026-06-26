import { getSupabaseClient } from './supabaseClient'

export type PlaceSuggestion = {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
}

export type PlaceValue = {
  name: string
  address: string
  coordinates?: { lat: number; lng: number }
}

type SearchPlacesResponse = {
  suggestions: PlaceSuggestion[]
}

type TravelDurationResponse = {
  durationMinutes: number
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 2) {
    return []
  }

  const client = getSupabaseClient()
  const { data, error } = await client.functions.invoke('search-places', {
    body: { query: query.trim() },
  })

  if (error) {
    if (import.meta.env.DEV) {
      console.error('searchPlaces failed', { query, error })
    }
    throw new Error('Place search is currently unavailable.')
  }

  return (data as SearchPlacesResponse).suggestions ?? []
}

export async function getTravelDurationMinutes(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<number> {
  const client = getSupabaseClient()
  const { data, error } = await client.functions.invoke('get-travel-duration', {
    body: { origin, destination },
  })

  if (error) {
    if (import.meta.env.DEV) {
      console.error('getTravelDurationMinutes failed', { origin, destination, error })
    }
    throw new Error('Travel time estimate is currently unavailable.')
  }

  const result = data as TravelDurationResponse
  if (typeof result.durationMinutes !== 'number') {
    throw new Error('Travel time estimate returned an unexpected result.')
  }

  return result.durationMinutes
}
