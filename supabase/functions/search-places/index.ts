import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Geocoding v5 types ──────────────────────────────────────────────────────

type GeocodingFeature = {
  id: string
  text: string
  place_name: string
  center: [number, number] // [longitude, latitude]
}

type GeocodingResponse = {
  features: GeocodingFeature[]
}

// ── Search Box v1 /forward types ────────────────────────────────────────────

type SearchBoxFeatureProperties = {
  name: string
  mapbox_id: string
  place_formatted: string
  full_address?: string
}

type SearchBoxFeature = {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  properties: SearchBoxFeatureProperties
}

type SearchBoxForwardResponse = {
  features: SearchBoxFeature[]
}

// ── Shared output type (matches client PlaceSuggestion contract) ─────────────

type PlaceSuggestion = {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
}

// ── Provider implementations ─────────────────────────────────────────────────

async function searchViaGeocoding(query: string, apiKey: string): Promise<PlaceSuggestion[] | null> {
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`)
  url.searchParams.set('access_token', apiKey)
  url.searchParams.set('autocomplete', 'true')
  url.searchParams.set('types', 'poi,address,place')
  url.searchParams.set('limit', '5')

  const res = await fetch(url.toString())
  if (!res.ok) {
    let excerpt = ''
    try { excerpt = (await res.text()).slice(0, 200) } catch (_) { /* no-op */ }
    console.error('search-places: Mapbox error', { provider: 'geocoding-v5', status: res.status, excerpt })
    return null
  }

  const data = await res.json() as GeocodingResponse
  return (data.features ?? []).map((feature) => {
    const namePrefix = feature.text + ', '
    const address = feature.place_name.startsWith(namePrefix)
      ? feature.place_name.slice(namePrefix.length)
      : feature.place_name
    return {
      id: feature.id,
      name: feature.text,
      address,
      coordinates: { lat: feature.center[1], lng: feature.center[0] },
    }
  })
}

async function searchViaSearchBox(query: string, apiKey: string): Promise<PlaceSuggestion[] | null> {
  const url = new URL('https://api.mapbox.com/search/searchbox/v1/forward')
  url.searchParams.set('q', query)
  url.searchParams.set('access_token', apiKey)
  url.searchParams.set('types', 'poi,address')
  url.searchParams.set('limit', '5')
  url.searchParams.set('language', 'en')

  const res = await fetch(url.toString())
  if (!res.ok) {
    let excerpt = ''
    try { excerpt = (await res.text()).slice(0, 200) } catch (_) { /* no-op */ }
    console.error('search-places: Mapbox error', { provider: 'searchbox-v1-forward', status: res.status, excerpt })
    return null
  }

  const data = await res.json() as SearchBoxForwardResponse
  return (data.features ?? []).map((feature) => {
    const p = feature.properties
    const rawAddress = p.full_address ?? p.place_formatted
    const namePrefix = p.name + ', '
    const address = rawAddress.startsWith(namePrefix) ? rawAddress.slice(namePrefix.length) : rawAddress
    return {
      id: p.mapbox_id,
      name: p.name,
      address,
      coordinates: {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
      },
    }
  })
}

// ── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const mapboxApiKey = Deno.env.get('MAPBOX_ACCESS_TOKEN') ?? ''
    if (!mapboxApiKey) {
      console.error('search-places: MAPBOX_ACCESS_TOKEN not configured')
      return new Response(JSON.stringify({ error: 'Service not configured' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const provider = Deno.env.get('PLACE_SEARCH_PROVIDER') ?? 'geocoding'

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json() as { query?: unknown }
    const query = typeof body.query === 'string' ? body.query.trim() : ''

    if (query.length < 2) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const suggestions = provider === 'searchbox'
      ? await searchViaSearchBox(query, mapboxApiKey)
      : await searchViaGeocoding(query, mapboxApiKey)

    if (suggestions === null) {
      return new Response(JSON.stringify({ error: 'Place search unavailable' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('search-places error', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
