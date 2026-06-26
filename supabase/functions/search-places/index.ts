import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type MapboxFeature = {
  id: string
  text: string
  place_name: string
  geometry: {
    coordinates: [number, number]
  }
}

type MapboxGeocodingResponse = {
  features: MapboxFeature[]
}

type PlaceSuggestion = {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
}

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

    const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`)
    url.searchParams.set('access_token', mapboxApiKey)
    url.searchParams.set('autocomplete', 'true')
    url.searchParams.set('limit', '5')
    url.searchParams.set('types', 'poi,address,place')

    const mapboxRes = await fetch(url.toString())
    if (!mapboxRes.ok) {
      console.error('search-places: Mapbox error', { status: mapboxRes.status })
      return new Response(JSON.stringify({ error: 'Place search unavailable' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const mapboxData = await mapboxRes.json() as MapboxGeocodingResponse
    const suggestions: PlaceSuggestion[] = (mapboxData.features ?? []).map((feature) => ({
      id: feature.id,
      name: feature.text,
      address: feature.place_name,
      coordinates: {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
      },
    }))

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
