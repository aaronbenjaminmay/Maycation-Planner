# Place Intelligence — Discovery Document

**Feature:** Travel Duration for Planner Items
**Phase:** 2 — Product Evolution
**Status:** Complete — Shipped. See `PLACE_INTELLIGENCE_ARCHITECTURE.md` for canonical implementation state.
**Date:** 2026-06-25

---

## 1. Current-State Audit

### Travel Item Model

There is no dedicated travel item model. `travel` is one of four values in the `planner_item_kind` enum (`travel`, `reservation`, `activity`, `note`). A travel item is a regular `PlannerItem` with `kind = 'travel'`.

When a user selects `travel` as the kind in `AddPlannerItemForm`, they get the same form fields as every other kind — title, start/end times, location (free text), and notes. No place search. No duration. No arrival time.

**The `travel` kind currently provides no additional structure or intelligence over `activity`.**

### Planner Item Fields (Current)

Full `PlannerItem` type from `src/lib/trips.ts:66`:

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `trip_id` | `string` | |
| `trip_day_id` | `string \| null` | |
| `kind` | `PlannerItemKind` | `travel \| reservation \| activity \| note` |
| `title` | `string` | required |
| `description` | `string \| null` | used for "Notes" in the form |
| `starts_at` | `string \| null` | timestamptz — "leave time" |
| `ends_at` | `string \| null` | timestamptz — "arrival time" (currently manual) |
| `location_name` | `string \| null` | destination name (free text) |
| `location_address` | `string \| null` | destination address (free text) — visible for `reservation` only |
| `confirmation_code` | `string \| null` | `reservation` only |
| `external_url` | `string \| null` | `reservation` only |
| `status` | `string` | `planned` by default |
| `sort_order` | `number` | |
| `reservation_type` | `ReservationType` | `activity \| food \| lodging \| transportation` |
| `metadata` | `{ completed?: boolean; [key: string]: unknown }` | JSONB — extensible |

The database schema (`001_initial_schema.sql`) also has a `timezone` column and a `parent_item_id` column — neither is surfaced in the current app.

### Duration Handling

**None.** There is no duration field, no duration calculation, no travel duration anywhere in the codebase. The only hint of duration is the implicit gap between `starts_at` and `ends_at`, which the user sets manually. `formatPlannerItemTimeRange` displays `starts_at – ends_at` but does not label it as duration.

### Date and Time Handling

- Trip-level dates: `date` type in Postgres. Client uses manual `parseDateInput`/`formatDateInput` functions — no external date library.
- Planner item times: stored as `timestamptz`. The RPC constructs the full timestamp from `(day_date + start_time) AT TIME ZONE trip_timezone`. Trip timezone defaults to `'America/New_York'`.
- Form inputs use HTML `<input type="time">` (HH:MM) via the existing `TextInput` component.
- Display uses `Intl.DateTimeFormat` — no moment, no date-fns, no Luxon.

The existing time pipeline already handles what we need: pass a `startTime` (HH:MM) and an `endTime` (HH:MM), and the RPC stores them as timestamptz correctly. **If we can calculate `endTime = startTime + durationMinutes`, no schema changes are needed.**

### Trip and User Profile Data

| Source | Fields | Notes |
|--------|--------|-------|
| `Trip` | `destination: string \| null` | Plain text ("Orlando, FL") — not geocoded |
| `Trip` | `metadata.travel_type` | `Plane \| Road Trip \| Train \| Cruise \| Other` |
| `profiles` table | `display_name`, `avatar_url`, `email`, `metadata` | No address fields at all |

**No user address exists in the app.** `Trip.destination` is unstructured text — it cannot serve as a geocoded origin or destination.

### Saved Places

**None.** There are no saved places anywhere — no home address, no hotel, no airport, no recent searches, no place IDs, no coordinates. The concept does not exist in the current schema or codebase.

### Existing Form Components Available

| Component | Location | Notes |
|-----------|----------|-------|
| `TextInput` | `ui/TextInput.tsx` | supports `type="time"`, `type="text"`, `type="date"`, `type="email"` |
| `TextArea` | `ui/TextArea.tsx` | multi-line text |
| `SelectInput` | `ui/SelectInput.tsx` | native `<select>` |
| `FormGrid` | `ui/FormGrid.tsx` | 2-column layout |
| `FormRow` | `ui/FormRow.tsx` | labeled field wrapper |
| `FormActions` | `ui/FormActions.tsx` | button row |
| `ModalSheet` | `ui/ModalSheet.tsx` | bottom sheet — contains the add/edit item form |
| `Button` | `ui/Button.tsx` | primary / secondary / destructive |
| `IconButton` | `ui/IconButton.tsx` | icon-only |
| `FeedbackMessage` | `ui/FeedbackMessage.tsx` | inline error / success / warning |

**A `PlaceSearchInput` — a text field with async autocomplete results — does not exist.** This is a new UI pattern not currently in the design system. It is required for this feature and must be designed and built before the travel form can be updated.

---

## 2. Recommended MVP Scope

**The minimum lovable version of Place Intelligence:**

The user provides:
1. **Leave time** — already an existing field (`startTime`)
2. **From place** — new: text autocomplete → select from results
3. **To place** — new: text autocomplete → select from results

Maycation derives and shows:
1. **Estimated travel duration** — from mapping service based on the two places
2. **Estimated arrival time** — leave time + duration, pre-populated as `endTime`

The user confirms or overrides the arrival time, then saves. The item is created with the existing data model, no schema changes.

**No schema migration is needed for v1.** See Data section below.

---

## 3. Fields and Data

### What changes in the form (kind === 'travel')

| Field | Current behavior | New behavior |
|-------|-----------------|--------------|
| `title` | Free text, required | Unchanged — user still names the leg ("Drive to resort") |
| `startTime` | Time input | Unchanged — this is the leave time |
| `endTime` | Time input, manual | Pre-populated from leave time + duration; user can override |
| `location` → `location_name` | Free text | Populated from the "To" place selection (place name) |
| `address` → `location_address` | Free text (reservation only) | Populated from the "To" place selection (address); visible for travel items |

### New fields in the form (travel kind only)

| New field | Maps to | Notes |
|-----------|---------|-------|
| From place search | `metadata.start_place_name` | Name of origin (e.g., "Home", "Hollywood Studios") |
| From address (resolved) | `metadata.start_place_address` | Resolved address from selection |
| Duration (derived, display only) | Not stored separately | Displayed as "~2h 15min" for confirmation; derivable from `ends_at – starts_at` |

### Why metadata for start place

The `planner_items` table has no `start_location_name` or `start_location_address` columns. The `metadata` JSONB column is the correct place for this in v1 — it requires no migration, follows the existing pattern (`metadata.completed` already exists), and can be formalized into proper columns later if the feature graduates.

The destination (To place) maps cleanly to the existing `location_name` + `location_address` columns, which are already surfaced in the item display in `DayDetail`.

### Data flow summary

```
User inputs:
  startTime: "09:00"          → planner_items.starts_at
  fromPlace: { name, address } → metadata.start_place_name, metadata.start_place_address
  toPlace:   { name, address } → location_name, location_address

API call (with fromPlace + toPlace):
  → durationMinutes: 135

Derived:
  endTime = "09:00" + 135min = "11:15" → planner_items.ends_at
  arrivalLabel = "Arrives ~11:15 AM" (display only)
```

No new RPC. No new columns. No new migration for v1.

---

## 4. UX Flow Outline

### Happy path (user types destination, both places resolve)

1. User opens the "Add Item" sheet on a day.
2. Selects **Kind: Travel**.
3. Form reconfigures to show travel-specific layout:
   - Leave time (time input)
   - **From** (place search input — new)
   - **To** (place search input — new)
   - Title (still required)
   - Notes
4. User enters a leave time: `9:00 AM`.
5. User taps **From**, types "4321 Elm Street" or "home" or "Hollywood Studios".
6. Autocomplete results appear below the input. User selects one.
7. From is confirmed — address resolves and field shows the place name.
8. User taps **To**, types the destination name.
9. Autocomplete results appear. User selects one.
10. As soon as both From and To are set, Maycation calls the duration API.
11. A loading indicator shows briefly.
12. Duration resolves: **~2h 15min driving**. Arrival time shown: **~11:15 AM**.
13. End time input is pre-populated with `11:15`.
14. User confirms or adjusts.
15. User taps Save.

### Fallback path (API fails or no result)

- Duration row shows: "Couldn't estimate duration — enter manually."
- End time input remains empty, editable as normal.
- User enters end time manually and saves.
- Feature degrades gracefully. No blocking.

### Fallback path (user skips place search)

- Places are optional. The user can skip From and/or To entirely.
- Without both places, no duration API call is made.
- The form behaves as it does today for the travel kind.

---

## 5. Integration Considerations

### What is needed from a mapping service

1. **Place autocomplete** — Given partial text input, return a list of place suggestions with name, address, and a place identifier. Called per keystroke (debounced).
2. **Place details** — Given a place identifier, return the resolved address and geocoordinates. Called once on selection.
3. **Travel duration estimate** — Given two sets of geocoordinates, return estimated driving time. Called once when both places are confirmed.

### Candidate services

**Google Maps Platform**
- Places API (autocomplete + details) + Distance Matrix API (driving duration)
- Most accurate for consumer use cases; most familiar to users
- Strong iOS Maps integration context for this audience
- Restrictions: results must not be stored in a database; cached display is limited; must display Google logo
- Pricing: generous free tier ($200/month credit); pay-per-request beyond that
- Key concern: Google's terms prohibit storing place data outside of Maps display contexts — the address and coordinates we'd store in `location_address`/`metadata` may require careful terms review

**Mapbox**
- Geocoding API (search/autocomplete) + Matrix API (travel time)
- No data caching restrictions — results can be stored
- Generous free tier: 50,000 geocoding requests/month, 25,000 matrix requests/month
- Slightly less accurate than Google for consumer POI data in some regions
- Developer-friendly; no logo requirement for non-map use
- Clean recommendation for a product that stores place data

**Apple MapKit JS**
- Geocoder + Search (autocomplete) + Directions (routing)
- Strong fit for an Apple platform audience
- Free tier: 250,000 map initializations/day; per-request pricing for services beyond that
- Requires an Apple Developer account and a Maps token
- Best experience on iOS Safari; web implementation is more complex than Google/Mapbox
- Not recommended for v1 due to complexity

**Recommendation for v1: Mapbox**
- Cleanest licensing for storing results
- No data display restrictions
- Generous free tier that covers early-stage usage without billing surprises
- Separating geocoding (place search) from routing (duration) allows each to be swapped independently later

### Key architecture decision: client-side vs server-side

**Do not put a mapping API key in client-side code without restriction.**

Two valid approaches:
1. **Supabase Edge Function (preferred)** — Proxy autocomplete and duration requests through a Supabase Edge Function. The API key lives in the function's environment variables. The client never sees it. Adds ~50–100ms latency per call.
2. **Client-side restricted key** — Mapbox allows domain-restricted tokens. The key is visible in source but only works from the registered domain. Simpler to deploy; acceptable for Mapbox's token model.

For v1, a **Supabase Edge Function** is the right call. It keeps the key server-side, enables rate limiting and abuse prevention, and is consistent with the existing architecture (all data access goes through Supabase RPCs).

Two Edge Functions:
- `search-places` — accepts a text query, returns autocomplete suggestions
- `get-travel-duration` — accepts two geocoordinate pairs, returns estimated driving minutes

---

## 6. Deferred Features

These are intentionally out of scope for v1.

**Saved Places**
Whether saved places are *required* for v1: **No, but they are the obvious next step.**

V1 works without saved places — users type a From address and a To address each time. This is sufficient to validate whether duration calculation is valuable. The friction of re-typing "home" or "Disney's Hollywood Studios" on every travel item is the forcing function that should drive saved places into v1.1 or v1.2 once the core pattern is validated.

What saved places would look like when added:
- Home address on the user profile
- Per-trip "key places" (hotel, airport, resort)
- Quick-select chips in the From/To fields: "Home · Hotel · Airport"
- No complex place management UI needed — just a few named slots

**Live traffic refresh**
Duration estimate at save time. Not refreshed. Traffic-aware estimates require time-of-day context; a rough estimate is sufficient for planning.

**Route alternatives**
One result. The fastest driving route. No multimodal, no walking, no transit for v1.

**Transport mode selection**
Driving only. Walking and transit add UX complexity that is not justified until the base feature is validated.

**Background duration updates**
No push notifications, no background recalculation when route conditions change.

**Full navigation replacement**
Maycation should hand off to Maps at departure time — not replace it. The navigation handoff (deep link to Apple Maps or Google Maps with the destination pre-filled) is a natural v1.1 addition after place data is stored cleanly.

---

## 7. Risks and Blockers

### Blocker: API service and key decision

Before implementation begins, the following must be decided:
- Which mapping service (recommendation: Mapbox)
- Whether to use Edge Function proxy or a domain-restricted client-side key
- How to provision and rotate the key (environment variable in Supabase project)

This is a product + infrastructure decision that cannot be deferred past the start of implementation.

### Risk: PlaceSearchInput is a new design system component

There is no autocomplete input anywhere in the current design system. This is a non-trivial UI component: text input + debounced async fetch + keyboard-navigable dropdown + selection state + loading/error states + mobile keyboard handling inside a bottom sheet.

This component must be designed in Figma and built before the travel form can be updated. It is likely the longest-lead-time item in the implementation plan.

### Risk: bottom sheet + mobile keyboard + autocomplete

`AddPlannerItemForm` renders inside `ModalSheet`, which is a bottom-sheet modal. On mobile, when the user taps a text input inside a bottom sheet, the keyboard appears and changes the viewport height. Autocomplete dropdowns opening inside this context require careful positioning — the dropdown must not be clipped by the sheet, must scroll correctly, and must close on tap-outside without conflicting with sheet close behavior.

This is a known difficult interaction pattern on mobile web. It needs explicit testing before shipping.

### Risk: Google Maps terms if Google is chosen

If Google Maps Platform is selected instead of Mapbox, the Terms of Service must be reviewed before storing place data (addresses, coordinates) in Supabase. Google restricts storage of place data retrieved via the API. This could require storing only display-safe fields (place name, formatted address) without coordinates — which may affect the quality of duration calculation.

Mapbox does not have this restriction. This is why Mapbox is recommended.

### Risk: terms review for manual `endTime` override

If the user overrides the arrival time, the stored `ends_at` no longer reflects the API-estimated duration. The item will show a "time range" that doesn't match the actual driving time. This is fine for planning purposes — it's the user's intent — but should not be labeled as "estimated" once overridden.

### Risk: timezone handling

The existing RPC constructs timestamptz as `(day_date + time) AT TIME ZONE trip_timezone`. Trip timezone is hardcoded to `America/New_York` by default. For trips in other timezones, this is already an issue (pre-existing, not new). The Place Intelligence feature does not introduce timezone handling problems — it inherits the existing behavior.

---

## 8. Recommended Implementation Plan

### Phase A — Decisions (no code)

1. Select the mapping service (Mapbox recommended).
2. Decide on key architecture (Edge Function proxy recommended).
3. Add the "Capture intent, derive the details" principle to `EXPERIENCE_PRINCIPLES.md` and `PRODUCT_PRINCIPLES.md` if appropriate.
4. Update `PRODUCT_OPPORTUNITIES.md` — Travel Duration Intelligence status: Exploring → Validated.
5. Complete a `FEATURE_EVALUATION.md` entry for this feature.

### Phase B — Edge Functions

1. Provision Mapbox API key in Supabase project environment.
2. Build `search-places` Edge Function: accepts `{ query: string }`, returns `{ suggestions: Array<{ id: string; name: string; address: string }> }`.
3. Build `get-travel-duration` Edge Function: accepts `{ originId: string; destinationId: string }`, returns `{ durationMinutes: number; mode: 'driving' }`.
4. Test both functions independently before touching the frontend.

### Phase C — PlaceSearchInput Component

1. Design `PlaceSearchInput` in Figma (new T1 component).
2. Build `src/components/ui/PlaceSearchInput.tsx`.
3. Handle states: idle, loading, results, selected, error, no-results.
4. Write Storybook stories.
5. Test on mobile in bottom-sheet context before proceeding.

### Phase D — Travel Item Form

1. Update `AddPlannerItemForm` to render place search fields when `kind === 'travel'`.
2. Wire place search to `search-places` Edge Function (debounced, ~300ms).
3. Wire duration calculation to `get-travel-duration` Edge Function (on both-places-confirmed).
4. Derive and pre-populate `endTime` from `startTime + durationMinutes`.
5. Show duration confirmation: "~2h 15min by car · Arrives ~11:15 AM".
6. Store start place in `metadata.start_place_name` + `metadata.start_place_address`.
7. Destination name and address populate existing `location` and `address` fields.
8. Implement manual fallback for API failure.

### Phase E — Display

1. Update the planner item card in `DayDetail` to show start place for `kind === 'travel'` items.
2. Consider surfacing derived duration ("~2h 15min") on the card if both start and end places are stored.

### Phase F — Validation

1. Test golden path: home → resort, ~2–3h drive.
2. Test fallback: API unavailable.
3. Test fallback: no results for query.
4. Test manual override of arrival time.
5. Test on iPhone Safari (bottom sheet + autocomplete).
6. Test on Android Chrome.

---

## Summary

| Question | Answer |
|----------|--------|
| Schema migration needed? | No — v1 fits in existing columns + metadata |
| New RPC needed? | No — existing create/update RPCs are sufficient |
| New database tables? | No |
| Saved places required for v1? | No — deferred to v1.1 |
| New design system component? | Yes — PlaceSearchInput (T1) |
| New Supabase Edge Functions? | Yes — search-places, get-travel-duration |
| API service decision required? | Yes — blocker before implementation |
| Biggest implementation risk? | PlaceSearchInput in ModalSheet on mobile |
| Biggest product risk? | Friction of typing From/To every time without saved places |
| Does this eliminate the app-switch described in the problem? | Yes — for the core duration-lookup step |
