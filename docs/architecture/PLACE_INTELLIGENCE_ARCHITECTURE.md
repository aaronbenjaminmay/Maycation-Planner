# Place Intelligence Architecture

## Purpose

Place Intelligence lets Maycation derive planning details from real-world places while keeping users inside the planning flow.

When a user is planning a travel day, they know what they intend — leave at 9am, drive from the hotel to the theme park. They should not have to open a second app to calculate how long that drive takes, then manually copy the result back into Maycation.

Place Intelligence supports the product principle:

> Capture intent. Derive the details.

Users provide what they know: a leave time, a start place, a destination. Maycation calculates what it can: estimated travel duration and estimated arrival time.

---

## Scope

### In scope for MVP

- Place search and autocomplete
- Driving duration estimate between two places
- Arrival time derivation from leave time and duration (Phase 3)

### Explicitly out of scope

- Navigation or turn-by-turn directions
- Live traffic data
- Route alternatives
- Walking, cycling, or transit modes
- Saved Places management
- A full place data model or place entity
- Any Mapbox UI components in the product

---

## Architecture Overview

```
React app
  └── src/lib/places.ts          (provider-agnostic service layer)
        └── Supabase Edge Functions  (server-side proxies)
              └── Mapbox APIs        (geocoding + directions)
```

The React application calls `places.ts`. `places.ts` calls Supabase Edge Functions. The Edge Functions call Mapbox. At no point does the React layer know it is talking to Mapbox.

This separation means the mapping provider can change without touching any product code — only the Edge Functions need to be updated.

---

## Security Model

- The Mapbox access token is stored exclusively as a Supabase Edge Function secret.
- Secret name: `MAPBOX_ACCESS_TOKEN`.
- The token is read only through `Deno.env.get('MAPBOX_ACCESS_TOKEN')` inside server-side Deno functions.
- The token is never stored in Vite environment variables (`.env`, `VITE_*`).
- The token is never included in any HTTP response.
- The token is never sent to the browser under any circumstance.
- `src/` contains no direct Mapbox references of any kind.

---

## Edge Functions

Both functions follow the same pattern established by `send-invite-email`:

- Respond to `OPTIONS` requests with CORS headers.
- Require a valid `Authorization` header.
- Verify the caller via `userClient.auth.getUser()`.
- Read `MAPBOX_ACCESS_TOKEN` from Deno environment.
- Return JSON with consistent CORS headers.

### `search-places`

**File:** `supabase/functions/search-places/index.ts`

**Request:** `POST { query: string }`

**Response:** `{ suggestions: PlaceSuggestion[] }`

```typescript
type PlaceSuggestion = {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
}
```

**Behavior:**

- Queries under 2 characters return `{ suggestions: [] }` immediately without calling Mapbox.
- Calls Mapbox Geocoding v5: `/geocoding/v5/mapbox.places/{query}.json`
- Parameters: `autocomplete=true`, `limit=5`, `types=poi,address,place`
- Maps Mapbox `features` to the normalized `PlaceSuggestion` shape.
- GeoJSON coordinates (`[longitude, latitude]`) are mapped to `{ lat, lng }`.
- Returns `502` if Mapbox is unreachable or returns a non-OK status.
- Returns `500` if `MAPBOX_ACCESS_TOKEN` is not configured.

### `get-travel-duration`

**File:** `supabase/functions/get-travel-duration/index.ts`

**Request:** `POST { origin: { lat: number; lng: number }, destination: { lat: number; lng: number } }`

**Response:** `{ durationMinutes: number }`

**Behavior:**

- Validates origin and destination using a type guard that checks `typeof lat === 'number'` and `typeof lng === 'number'`. Falsy checks are not used — `0` is a valid coordinate value.
- Calls Mapbox Directions v5: `/directions/v5/mapbox/driving/{lng,lat;lng,lat}.json`
- Parameters: `overview=false` (no route geometry returned — reduces response payload)
- Driving mode only. No traffic data, no alternatives, no walking or transit.
- `durationMinutes` is `Math.ceil(routes[0].duration / 60)` — duration in seconds from Mapbox, converted to whole minutes rounded up.
- Returns `422` when Mapbox responds with `code !== "Ok"` or an empty `routes` array (no route found).
- Returns `502` if Mapbox is unreachable.
- Returns `500` if `MAPBOX_ACCESS_TOKEN` is not configured.

---

## Frontend Service

**File:** `src/lib/places.ts`

**Dependencies:** `src/lib/supabaseClient.ts` only. No React. No Mapbox.

**Exported types:**

```typescript
type PlaceSuggestion = {
  id: string        // used as list key during search results display
  name: string
  address: string
  coordinates: { lat: number; lng: number }
}

type PlaceValue = {
  name: string      // stored: metadata.start_place_name / location_name
  address: string   // stored: metadata.start_place_address / location_address
  coordinates?: { lat: number; lng: number }  // undefined = manually entered, no geocode result
}

type PlaceInputQuickPick = {
  id: string         // unique key for React rendering
  label: string      // short category label shown above the sublabel ("Current Stay")
  sublabel?: string  // specific place name shown below the label ("Grand Hyatt Denver")
  value: PlaceValue  // pre-resolved value; selecting immediately calls onChange
}
```

Three distinct types serve three distinct concerns:
- `PlaceSuggestion` — a search result returned by the endpoint; includes `id` for React list keys and `coordinates` always present
- `PlaceValue` — the selected place stored in state and persisted; transient search `id` is dropped; `coordinates` optional (absent for manual entries)
- `PlaceInputQuickPick` — a pre-resolved selection surfaced before search; carries a user-visible `label` category and the resolved `PlaceValue`; the component does not know where quick picks come from

`PlaceSuggestion` is what the search endpoint returns. `PlaceValue` is what gets stored after a place is selected. `PlaceInputQuickPick` is what consumers provide to offer contextual shortcuts before the user begins typing. These are kept separate to preserve optionality: quick picks can be sourced from stays, reservations, user profile, or any other trip fact without changing the `PlaceInput` component's interface.

**Exported functions:**

```typescript
searchPlaces(query: string): Promise<PlaceSuggestion[]>
getTravelDurationMinutes(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number>
```

**Behavior:**

- `searchPlaces` returns `[]` immediately for queries under 2 characters, without invoking the Edge Function.
- Both functions call Edge Functions via `getSupabaseClient().functions.invoke(...)`. The Supabase client automatically attaches the authenticated user's JWT, satisfying the Edge Function auth check.
- Both functions throw `Error` with a user-facing message on failure. The caller decides how to surface the error.
- Dev-mode `console.error` logging is gated on `import.meta.env.DEV`.

**Provider agnosticism:**

`places.ts` contains no Mapbox-specific logic, types, or references. If the backend provider changes from Mapbox to another service, `places.ts` does not change — only the Edge Functions do. Product code that imports `places.ts` is insulated from the provider entirely.

---

## Travel Data Mapping

When a travel planner item is saved, the Place Intelligence data maps to existing columns as follows:

| Data | Column / Field |
|------|----------------|
| Leave time | `planner_items.starts_at` |
| Arrival time (derived) | `planner_items.ends_at` |
| Destination name | `planner_items.location_name` |
| Destination address | `planner_items.location_address` |
| Origin name | `planner_items.metadata.start_place_name` |
| Origin address | `planner_items.metadata.start_place_address` |
| Origin coordinates | `planner_items.metadata.start_place_lat` / `start_place_lng` |
| Destination coordinates | `planner_items.metadata.destination_place_lat` / `destination_place_lng` |

No new database columns are added for the MVP. All data fits in the existing schema.

### Coordinate storage for edit/recalculation support

Resolved place coordinates are persisted in `metadata` so that editing a saved Travel item can restore both origin and destination as resolved `PlaceValue`s with coordinates. Without this, both places would restore as manual entries (no coordinates), preventing recalculation until the user reselected both places from scratch.

**Scope:** Only minimal `{ lat, lng }` pairs are stored — no provider-specific IDs, no Mapbox feature objects, no geocoding metadata. These coordinates are used solely to call `getTravelDurationMinutes` on edit.

**Null clearing:** If either place is entered manually (no coordinates), its `lat`/`lng` keys are saved as `null`. The metadata merge strategy in the update RPC (`WHERE v IS DISTINCT FROM 'null'::jsonb`) removes null-valued keys, so stale coordinates from a previous resolved selection do not persist when a place is replaced with a manual entry.

**This is not a full place data model.** Coordinates in metadata are a narrow MVP optimization. A proper place entity (saved places, place history, place deduplication) is out of scope.

### Metadata RPC

`create_planner_item` and `update_planner_item` both accept an optional `item_metadata jsonb default '{}'::jsonb` parameter (migration `025_planner_item_metadata_rpc.sql`). The update RPC merges incoming metadata into the existing row, preserving keys written by other RPCs (e.g. `completed` from `toggle_planner_item_completion`).

**Direct client-side table updates must not be used.** All metadata writes must go through the RPC to maintain the security layer.

---

## Design System Relationship

`PlaceInput` will be the first new product-driven Tier 1 component added in Phase 2.

Design system rules that apply:

- **Storybook is canonical.** The Storybook implementation defines the component's behavior, states, and API. Figma mirrors what Storybook says, not the other way around.
- **Figma update happens after Storybook stabilizes.** A Figma component is created in Phase 5, after Phase 2 is complete and the component is not expected to change significantly.
- **The component represents "selecting a place," not "searching Mapbox."** The component's public API works with `PlaceValue` and an injected `onSearch` function. It has no awareness of Mapbox, Edge Functions, or any specific mapping provider.

This naming and scoping decision preserves optionality: future versions of `PlaceInput` may support saved places, recent places, or preset options (Home, Hotel) without changing the component's public interface.

---

## Quick Picks

Quick picks are pre-resolved place selections surfaced above the search input. They allow consumers to offer contextual shortcuts — places the system already knows about — before the user begins typing.

### Component API

```typescript
<PlaceInput
  quickPicks={[
    {
      id: 'stay-uuid',
      label: 'Current Stay',
      sublabel: 'Grand Hyatt Denver',
      value: {
        name: 'Grand Hyatt Denver',
        address: '1750 Welton St, Denver, CO',
        coordinates: { lat: 39.7437, lng: -104.9874 },
      },
    },
  ]}
  ...
/>
```

### Separation of concerns

`PlaceInput` does not know what a Stay is, what a Reservation is, or how quick picks are derived. It only knows:

1. An array of `PlaceInputQuickPick` was passed in
2. Each pick has a `label`, an optional `sublabel`, and a pre-resolved `PlaceValue`
3. Selecting a pick immediately calls `onChange(pick.value)` — no search is performed

The consumer owns derivation. `PlaceInput` owns presentation and selection.

### Stay integration

`getActiveStayForDay(stays, dayDate)` in `src/lib/stays.ts` computes the stay covering a given date using half-open interval semantics (`check_in_date <= dayDate < check_out_date`). See [`STAY_INTELLIGENCE_ARCHITECTURE.md`](./STAY_INTELLIGENCE_ARCHITECTURE.md) for the interval convention.

`AddPlannerItemForm` calls this function and builds a `PlaceInputQuickPick` for the "From" field when the active day has a stay. The quick pick carries the stay's `place_lat`/`place_lng` as coordinates, enabling travel time estimation without the user searching for their hotel.

### Future quick pick sources

The `quickPicks` prop is an open array — any consumer can pass any number of picks from any source. Planned future sources:
- Airport (from a flight reservation)
- Previous destination (from a previous day's travel item)
- Home (from user profile)
- Saved places

---

## Future Extension Points

These are not part of the MVP. They are listed here to document known directions without committing to them.

- **Saved Places** — Home, Hotel, Airport stored on the user profile or trip, surfaced as quick-picks in `PlaceInput` before the user begins typing.
- **Recent Places** — Previously selected places surfaced for fast re-selection.
- **Reservation Places** — Addresses already stored in reservation planner items surfaced as suggestions.
- **Hotel / Home defaults** — The trip's lodging or the user's home pre-populated as a default origin for travel legs.
- **Nearby recommendations** — Context-aware suggestions based on the trip location.
- **Weather and location intelligence** — Using stored place coordinates to surface weather for specific trip days.

None of these require changes to the current `places.ts` contract or Edge Function interfaces.

---

## Search Provider Architecture

### Provider dispatch

`search-places` supports two Mapbox backends, selected by the `PLACE_SEARCH_PROVIDER` Supabase secret:

| Secret value | Provider | Endpoint |
|---|---|---|
| `searchbox` | Mapbox Search Box v1 | `GET /search/searchbox/v1/forward` |
| absent or any other value | Mapbox Geocoding v5 | `GET /geocoding/v5/mapbox.places/{query}.json` |

**Current production value:** `PLACE_SEARCH_PROVIDER=searchbox`

The client contract (`PlaceSuggestion` shape, HTTP request/response shape) is identical for both providers. No React code is aware of which backend is active.

### Rollback procedure

To revert to Geocoding v5 without redeployment:

```bash
npx supabase secrets set PLACE_SEARCH_PROVIDER=geocoding --project-ref hintjmstninktszynqgv
```

The Edge Function reads the env var on each request. The change takes effect immediately — no redeployment needed.

### Current provider: Mapbox Search Box v1 `/forward`

`search-places` calls `/search/searchbox/v1/forward` with `types=poi,address`, `language=en`, `limit=5`. The response is GeoJSON (`features` array). Coordinates come from `feature.geometry.coordinates[0]` (longitude) and `[1]` (latitude). The address field uses `properties.full_address ?? properties.place_formatted`, with the venue name prefix stripped to avoid duplication in the PlaceInput selected state.

**Venue-first results:** Search Box v1 ranks by venue name relevance rather than address proximity, which was the core motivation for the upgrade.

**Known limitation — context-free queries:** Without a proximity parameter, queries for venue names that exist in multiple locations (e.g. "Be Our Guest") may rank non-Disney results above the intended location. A proximity bias (`proximity={lng},{lat}` near the trip destination) would resolve this. See deferred work in `PROJECT_STATE.md`.

### Geocoding v5 fallback

`search-places` falls back to `/geocoding/v5/mapbox.places/{query}.json` with `autocomplete=true`, `types=poi,address,place`, `limit=5`. The response is a GeoJSON feature collection. Coordinates come from `feature.center[0]` (longitude) and `[1]` (latitude).

**Known limitation:** Geocoding v5 is address-first. Venue name searches return street-name matches rather than specific restaurants or attractions.

### Search Box v1 — implementation history

**First attempt (June 2026, Edge Function v2):** `search-places` was rewritten to call `/search/searchbox/v1/forward`. It returned 502s in production. The failure was attributed at the time to token scope, but terminal testing subsequently confirmed HTTP 200 from the same token — the root cause was an implementation/mapping bug in the Edge Function code, not a token access restriction.

**Revert (v3):** Geocoding v5 was restored within the same session.

**Provider dispatch (v4):** Both providers were added to a single Edge Function behind `PLACE_SEARCH_PROVIDER` dispatch. Geocoding v5 remained the default; the env var activated Search Box.

**Diagnosis of `/suggest` failure (v6–v7):** When `PLACE_SEARCH_PROVIDER=searchbox` was activated, all queries returned 0 results. Root cause: the `/suggest` endpoint does **not** include coordinates in its response — coordinates require a separate `/retrieve` call per suggestion (N+1 HTTP calls). The implementation was filtering on `suggestion.center != null`, which eliminated all results.

**Fix — switch to `/forward` (v8):** The implementation was changed from `/suggest` to `/forward`. The `/forward` endpoint returns GeoJSON features with `geometry.coordinates` directly — no session management, no N+1 calls. This is the current production implementation.

**`/suggest` vs `/forward` distinction:**
- `/suggest` → autocomplete suggestion list; no coordinates; requires `/retrieve` for coordinates; designed for session-based billing
- `/forward` → direct geocoding; returns GeoJSON features with geometry; equivalent to Geocoding v5 in structure; appropriate for our use case

---

## Implementation Status

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Edge Functions + `places.ts` service | Complete |
| Phase 2 | `PlaceInput` T1 component + Storybook | Complete |
| Phase 3 | Travel form + live derivation + coordinate persistence | Complete |
| Phase 3.5 | `PlaceInputQuickPick` + Current Stay quick pick | Complete |
| Phase A | Reservation Place Intelligence — PlaceInput in reservation form, coordinate storage | Complete |
| Phase A.1 | Reservation form UX — title auto-fill, conditional address field, manual fallback | Complete |
| Search Box upgrade | Provider dispatch, PLACE_SEARCH_PROVIDER feature flag, Search Box v1 /forward | Complete |
| Phase 4 | Travel item card display | Not started |
| Phase 5 | Figma component (PlaceInput Code Connect deferred pending this) | Not started |
| Proximity bias | Pass trip coordinates to provider for context-aware ranking | Not started |
| Travel Quick Picks | Destination quick picks in Travel form (recent + reservation places) | Not started |
| Saved Places | Persistent user-defined places surfaced as quick picks | Not started |
