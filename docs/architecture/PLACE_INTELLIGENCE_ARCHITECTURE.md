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

**Request:** `POST { query: string, near?: { lat: number; lng: number } }` — `near` is optional; see Contextual Place Resolution below

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
searchPlaces(query: string, near?: { lat: number; lng: number }): Promise<PlaceSuggestion[]>
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

## Naming Note: Not the Same System as Reservation Intelligence

"Reservation Place Intelligence" (this document, Phase A) and "Reservation Intelligence" (`DERIVATION_ENGINE.md`, v2.7.0) are two different systems that share the word "Reservation." This document describes `PlaceInput` usage inside the manually-created, `planner_items`-backed reservation-*kind* item form (`AddPlannerItemForm`) — unchanged by v2.7.0. Reservation Intelligence describes the separate `trip_reservations` fact table and its derivation lifecycle. Both exist simultaneously and are unrelated at the data layer: a `trip_reservations` fact's derived planner item happens to also be `kind = 'reservation'`, but it is created by `create_trip_reservation`, not by the form this document describes.

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

**Display (v2.6.0):** The Day Detail planner-item-card reads this same data back — origin from `metadata.start_place_name`, destination from `location_name` (unchanged from the generic card rendering, prefixed `To` for travel items), and duration computed client-side as `ends_at − starts_at` rather than stored separately. No new columns, no new RPC.

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

**Known limitation — context-free queries:** Resolved for the four call sites with a known contextual source — see Contextual Place Resolution below. Where no such source exists for a given search (no active Stay covering the date, no sibling field selected yet, or the Stay form's own place search, which intentionally does not participate), a venue name that exists in multiple locations may still rank a non-intended result above the correct one.

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

## Contextual Place Resolution

### Purpose

Search Box v1 ranks by venue name relevance, but without any location context, a generic venue name that exists in more than one place (e.g. "Be Our Guest") can rank a distant, same-named result above the one the user actually intends. Contextual Place Resolution addresses this by letting Maycation bias search results toward a coordinate the application already knows, whenever one is available for the place being resolved.

This is not a search feature, not place discovery, and not recommendations. It changes the ranking of results for a query the user is already typing; it never suggests, surfaces, or recommends a place the user did not ask for.

### Supported contextual sources

Two kinds of context are used, both already resident in the calling screen at the moment of search:

- **The trip's active Stay for a given date** — computed by the existing `getActiveStayForDay(stays, date)` and reduced to a coordinate pair by `stayCoordinates(stay)`, both in `src/lib/stays.ts`. This is a known fact: the family is staying there on that date.
- **A sibling field already resolved in the same form** — for example, a Travel item's destination search is biased by the origin the user has already selected. This is also a known fact, not an inference: the place was chosen by the user moments earlier in the same form.

No other source of context is used. Context is never inferred from a trip's destination, from another item's location, or from a chronological relationship between separate trip facts — see Known Boundaries.

### Current implementation

`search-places` and `searchPlaces()` accept an optional coordinate, named `near`, passed through unchanged from the calling screen to the Edge Function. Below the provider boundary, `near` is translated into whichever proximity parameter the active Mapbox provider expects — the only place a provider-specific term appears. Every other layer speaks only in terms of a coordinate to search near.

When `near` is absent, behavior is identical to search before this capability existed: no additional parameter reaches Mapbox, no ranking changes.

Four call sites currently supply a `near` coordinate, each computed from context already available on that screen:

| Call site | Context source |
|---|---|
| Travel "From" | The active Stay for the day being planned |
| Travel "To" | The origin already selected in "From" |
| Reservation planner item — Location | The active Stay for the day being planned |
| Trip Reservations — Place | The active Stay for the reservation's date |

The Trip Reservations call site required one piece of plumbing beyond the search parameter itself: the trip's Stay list, already loaded for the Stays screen, is threaded into the Reservations screen so it can compute the same active-Stay fact locally.

### Known Boundaries

Contextual Place Resolution intentionally stops at known facts. It does not extend to:

- **A new Stay's own place search.** Biasing a new Stay's search toward a different, chronologically adjacent Stay was evaluated and rejected. Every context source above is true by construction — the family really is staying at the active Stay on that date, the sibling field really was just selected. Adjacency between two separate Stays is not a fact of this kind; it is an inference about the shape of the itinerary, and that inference can be wrong (a multi-city trip that returns to an earlier city, for instance). The Stay form's search is unchanged by this capability.
- **The trip's own destination.** No coordinate exists anywhere in the schema for a trip's destination field, and resolving one is out of scope here.
- **Any provider concept above the provider boundary.** Every layer above the two provider-specific functions works only with a `near` coordinate — never a Mapbox-specific parameter name, and never a discovery, ranking-algorithm, or recommendation concept.

### Architectural decisions that did not ship

The following were considered during planning and deliberately not built, to keep the capability no larger than the four call sites above required:

- **No Context service.** There is no module, singleton, or shared runtime object representing "the current context." Each call site computes its own coordinate locally, from data the screen already holds.
- **No Context Hierarchy runtime.** Some call sites have more than one potential context source (an active Stay, a sibling field). Which one applies is expressed directly in that call site's own local logic, not evaluated by a shared function that branches over a set of rules. With only four call sites and at most two context tiers at any one of them, a shared evaluator would be an abstraction built before it was needed.
- **No `EditingIntent` type.** The reason a given call site prefers one context source over another — resolving a Travel origin versus resolving a reservation's place, for instance — is a documentation concept, useful for explaining why call sites differ. It was never built as a runtime type, enum, or parameter, and no shipped code passes an intent value anywhere.

Context, in this architecture, is not shared infrastructure. It is a coordinate computed locally, at each call site, from a fact that screen already has.

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
| Phase 4 | Travel item card display (origin, destination, duration on Day Detail) | Complete (v2.6.0) |
| Phase 5 | Figma component (PlaceInput Code Connect deferred pending this) | Not started |
| Contextual Place Resolution | Bias search using known-fact context at four call sites (Travel From/To, Reservation planner item, Trip Reservations) | Complete (v2.8.0) |
| Multi-Stay Context | Bias a new Stay's search using a chronologically adjacent Stay | Deferred — intentionally excluded, not merely unstarted (see Known Boundaries above) |
| Travel Quick Picks | Destination quick picks in Travel form (recent + reservation places) | Not started |
| Saved Places | Persistent user-defined places surfaced as quick picks | Not started |
