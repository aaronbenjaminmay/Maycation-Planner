import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Coordinates = {
  lat: number
  lng: number
}

type MapboxRoute = {
  duration: number
}

type MapboxDirectionsResponse = {
  code: string
  routes: MapboxRoute[]
}

function isValidCoordinates(value: unknown): value is Coordinates {
  return (
    typeof value === 'object' &&
    value !== null &&
    'lat' in value &&
    'lng' in value &&
    typeof (value as Coordinates).lat === 'number' &&
    typeof (value as Coordinates).lng === 'number'
  )
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
      console.error('get-travel-duration: MAPBOX_ACCESS_TOKEN not configured')
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

    const body = await req.json() as { origin?: unknown; destination?: unknown }

    if (!isValidCoordinates(body.origin) || !isValidCoordinates(body.destination)) {
      return new Response(
        JSON.stringify({ error: 'origin and destination must include lat and lng numbers' }),
        {
          status: 422,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      )
    }

    const origin = body.origin
    const destination = body.destination

    // Mapbox Directions uses longitude,latitude order
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`
    const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coords}.json`)
    url.searchParams.set('access_token', mapboxApiKey)
    url.searchParams.set('overview', 'false')

    const mapboxRes = await fetch(url.toString())
    if (!mapboxRes.ok) {
      console.error('get-travel-duration: Mapbox error', { status: mapboxRes.status })
      return new Response(JSON.stringify({ error: 'Route lookup unavailable' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const mapboxData = await mapboxRes.json() as MapboxDirectionsResponse

    if (mapboxData.code !== 'Ok' || mapboxData.routes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No driving route found between these locations' }),
        {
          status: 422,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      )
    }

    const durationMinutes = Math.ceil(mapboxData.routes[0].duration / 60)

    return new Response(JSON.stringify({ durationMinutes }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('get-travel-duration error', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
