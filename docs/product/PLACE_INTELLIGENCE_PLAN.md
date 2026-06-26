# Place Intelligence — Implementation Plan

**Feature:** Travel Duration for Planner Items
**Phase:** 2 — Product Evolution
**Status:** Ready for implementation
**Prerequisite:** `PLACE_INTELLIGENCE_DISCOVERY.md`
**Date:** 2026-06-26

---

## 1. Existing Architecture Summary

### The Travel planner item today

`travel` is one of four values in the `planner_item_kind` enum. It is not a distinct model — it shares the `PlannerItem` type with `reservation`, `activity`, and `note`.

The form (`AddPlannerItemForm.tsx`) renders identically for all four kinds, with one exception: the `address`, `confirmationCode`, and `externalUrl` fields are conditionally shown for `kind === 'reservation'` only. The `travel` kind receives no special behavior.

The item card in `DayDetail.tsx` renders identically for all four kinds, with one exception: `address` and `confirmationCode` display only for `reservation` items. A travel item today displays its time range (if set), title, and `location_name` — nothing more.

**The `travel` kind is currently a label, not a feature.**

### How planner items are persisted

All reads and writes go through Supabase RPCs in `src/lib/trips.ts`. No direct table access from the client. The function chain is:

```
AddPlannerItemForm
  → DayDetail.handleItemSubmit
  → createPlannerItem / updatePlannerItem  (trips.ts)
  → client.rpc('create_planner_item' / 'update_planner_item')
  → Postgres function  (migration 023)
```

The `create_planner_item` and `update_planner_item` RPC signatures (current, migration 023):

```sql
create_planner_item(
  target_trip_id uuid,
  target_trip_day_id uuid,
  item_kind text,
  item_title text,
  start_time time,        -- HH:MM only
  end_time time,          -- HH:MM only
  item_location text,     -- → location_name
  item_notes text,        -- → description
  item_confirmation_code text default null,
  item_address text default null,  -- → location_address
  item_url text default null,
  item_reservation_type text default 'activity'
)
```

### How `starts_at` and `ends_at` are stored

The client sends `startTime` and `endTime` as HH:MM strings (from `<input type="time">`). The RPC constructs timestamptz values by combining the day's date and the trip's timezone:

```sql
starts_at = (day_date + start_time) AT TIME ZONE trip_timezone
ends_at   = (day_date + end_time)   AT TIME ZONE trip_timezone
```

Trip timezone defaults to `'America/New_York'` (set at trip creation; hardcoded default).

On the client, `formatPlannerItemTimeInput(value)` converts `starts_at`/`ends_at` back to HH:MM by calling `new Date(value).getHours()` and `.getMinutes()`. This uses the **device's local timezone**, not the trip timezone — a pre-existing display mismatch for users in a different timezone than the trip.

Validation: both client and RPC reject `endTime < startTime`. Cross-midnight travel (e.g., overnight flights where arrival is the next day) is not supported. This is a v1 constraint.

### What the existing form components provide

All form controls inherit the `.form-control` CSS class via `forms.css`, which provides: `width: 100%`, `min-height: 46px`, consistent padding, border, border-radius, focus ring, and disabled state.

`FormRow` wraps every control in a `<label>` with `.form-row__label` and optional `.form-row__hint`. This is the canonical label pattern.

`ModalSheet` renders as a full-viewport overlay (`role="dialog"`, `aria-modal="true"`). It listens for Escape to close. The form content inside it scrolls vertically if it overflows. The component renders no explicit `overflow` container — CSS handles the scroll at the `.modal-sheet` level.

### Critical finding: the metadata approach requires a migration

The discovery document proposed storing the origin place in `metadata.start_place_name` / `metadata.start_place_address`. **This is not currently possible without a schema change.**

The `create_planner_item` and `update_planner_item` RPCs do not accept a metadata parameter. The `CreatePlannerItemInput` TypeScript type has no metadata field. The only path from form to database is through these RPC parameters. There is no current mechanism to pass arbitrary metadata through the existing API surface.

Options and recommendation — see Section 6 (Simplification Opportunities).

---

## 2. Files Impacted

### Existing files — will change

| File | Change |
|------|--------|
| `src/components/AddPlannerItemForm.tsx` | Add From/To PlaceInput fields for `kind === 'travel'`; wire duration calculation; auto-populate end time; relabel fields for travel context |
| `src/components/DayDetail.tsx` | Update travel item card display: show origin if stored, show destination address |
| `src/components/ui/index.ts` | Export `PlaceInput` and related types |
| `src/lib/trips.ts` | Update `CreatePlannerItemInput` if origin is persisted; update `PlannerItem` type if origin columns added |

### New files — will be created

| File | Purpose |
|------|---------|
| `src/components/ui/PlaceInput.tsx` | T1 component: place selection with async search |
| `src/components/ui/PlaceInput.css` | Styles for the input and result dropdown |
| `src/stories/PlaceInput.stories.tsx` | Storybook stories — all states |
| `src/lib/places.ts` | Pure TypeScript service: wraps Edge Function calls; no React |
| `supabase/functions/search-places/index.ts` | Edge Function: text → place suggestions (Mapbox Geocoding) |
| `supabase/functions/get-travel-duration/index.ts` | Edge Function: coordinates → driving duration (Mapbox Directions) |

### If origin persistence is implemented (see Section 5)

| File | Change |
|------|--------|
| `supabase/migrations/025_planner_item_origin.sql` | Add `start_location_name` + `start_location_address` columns and extend RPC signatures |
| `src/lib/trips.ts` | Add origin fields to `PlannerItem`, `CreatePlannerItemInput`, `UpdatePlannerItemInput` |

---

## 3. Risks

### Mobile keyboard and autocomplete in ModalSheet

**Severity: High**

`AddPlannerItemForm` renders inside `ModalSheet`, which is a full-viewport bottom sheet. On mobile, when the user taps the PlaceInput text field, the software keyboard opens and shrinks the viewport. The autocomplete dropdown must remain visible above or below the focused field — not clipped by the sheet edge or obscured by the keyboard.

`position: absolute` on the dropdown will clip at the sheet's overflow boundary. `position: fixed` positions relative to the viewport, which works but requires calculating coordinates.

This is a known difficult interaction pattern on mobile web. It must be explicitly tested on both iOS Safari and Android Chrome before shipping. The implementation cannot assume desktop positioning behavior.

### Supabase Edge Function cold starts

**Severity: Medium**

Edge Functions have cold start latency (~200–500ms for the first call). For a feature where the user is actively waiting for autocomplete results, a cold-started first request will feel slow. Subsequent requests benefit from the warmed function.

This is most noticeable for the first search of a session. Mitigation options: warm the function on form open; accept the latency as a known v1 characteristic; document it.

### Cross-midnight travel not supported

**Severity: Medium for long-haul trips**

The RPC enforces `ends_at >= starts_at` within a single day. A flight departing at 11:00 PM arriving at 6:00 AM the next day cannot be represented. For the duration API, if `startTime + durationMinutes > 23:59`, the calculation will produce a value that the RPC will reject.

The client must detect this case before submission and either: show an error ("This trip arrives the next day — please enter the arrival time manually"), or allow manual end-time override that bypasses auto-calculation.

This is a genuine product gap, not just a technical constraint. It should be documented in the form.

### Debounce and API cost

**Severity: Low**

Autocomplete calls should be debounced (~300ms) to avoid calling the Edge Function on every keystroke. Without debounce, a 10-character search generates 10 API calls. At scale this becomes costly. Debounce is straightforward to implement but must not be forgotten.

### End-time override invalidates derived data

**Severity: Low**

If the user overrides the auto-populated end time, `ends_at` no longer reflects the API-calculated duration. The item will display a time range that the user entered, not one Maycation derived. This is correct behavior — user intent supersedes calculation — but the UI should not label the time range as "estimated" once overridden.

### Trip timezone vs device timezone

**Severity: Pre-existing, not introduced by this feature**

`formatPlannerItemTimeInput` uses `getHours()` / `getMinutes()` (device local timezone). `starts_at` is stored in the trip's timezone. Users in a different timezone than their trip will see times shifted. This bug predates Place Intelligence. Do not attempt to fix it as part of this feature.

---

## 4. Recommended Implementation Plan

Each phase leaves the application in a working state. Phases are ordered to build on each other without blocking. Phase 0 is a decision, not a code task.

---

### Phase 0 — Decide origin persistence strategy

**Not a coding task. Must resolve before Phase 3.**

Three options (see Section 5 for the product decision required).

- **Option A (recommended):** Ephemeral origin. No migration. Origin is transient form state used only to calculate duration. Not stored. On re-edit, From is empty; user re-enters if recalculation is needed. Duration output persists via `ends_at`.

- **Option B:** Add columns via migration 025. Clean, durable, allows editing the travel leg without re-entering places. Requires extending 4 RPC signatures and 2 TypeScript types.

- **Option C:** Extend RPC metadata parameter. Less clean than B because metadata is untyped JSONB; harder to query, display, or migrate later. Not recommended.

---

### Phase 1 — Places service layer

**Scope:** Two Edge Functions + one TypeScript service module. No UI. No form changes. Independently testable.

**`supabase/functions/search-places/index.ts`**

Accepts: `POST { query: string }`
Returns: `{ suggestions: Array<{ id: string; name: string; address: string; coordinates: { lat: number; lng: number } }> }`

- Reads `MAPBOX_API_KEY` from Deno environment
- Calls Mapbox Geocoding v6 `/forward?q=...&autocomplete=true&limit=5`
- Maps Mapbox response to the contract above
- Requires authenticated caller (check `Authorization` header, same pattern as `send-invite-email`)
- Returns empty array on no results; returns 500 on Mapbox failure

**`supabase/functions/get-travel-duration/index.ts`**

Accepts: `POST { origin: { lat: number; lng: number }; destination: { lat: number; lng: number } }`
Returns: `{ durationMinutes: number }`

- Calls Mapbox Directions v5 `/driving/{lng,lat;lng,lat}?overview=false`
- Returns the `duration` field from the first route, converted to minutes (ceiling)
- Driving only, no traffic, no alternatives
- Returns 422 if coordinates are missing; returns 500 on Mapbox failure

**`src/lib/places.ts`**

```typescript
export type PlaceSuggestion = {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
}

export async function searchPlaces(query: string): Promise<PlaceSuggestion[]>
export async function getTravelDurationMinutes(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number>
```

- Calls Edge Functions via `getSupabaseClient().functions.invoke(...)`
- Throws on network or API error with a user-facing message
- No React imports; no hooks; no state
- No direct Mapbox calls from the client — all Mapbox communication stays server-side

---

### Phase 2 — PlaceInput component

**Scope:** New T1 component. Storybook stories. No form integration yet.

**Interface:**

```typescript
export type PlaceValue = {
  name: string
  address: string
  coordinates: { lat: number; lng: number }
}

type PlaceInputProps = {
  label: string
  value: PlaceValue | null
  onChange: (place: PlaceValue | null) => void
  onSearch: (query: string) => Promise<PlaceSuggestion[]>
  placeholder?: string
  disabled?: boolean
  hint?: string
}
```

`onSearch` is required and injected by the parent. In production: `searchPlaces` from `places.ts`. In Storybook: a mock function. This keeps the component decoupled from the service and fully testable without a live API.

**States:**

| State | Trigger | Display |
|-------|---------|---------|
| Empty | `value === null`, input empty | Input with placeholder |
| Typing | Input has text, no results yet | Input active |
| Loading | `onSearch` called, awaiting | Input + spinner (inline, right of input) |
| Results | `onSearch` resolved with ≥1 result | Input + dropdown list |
| No results | `onSearch` resolved with empty array | Input + "No results" |
| Selected | `value !== null` | Selected place name + address + clear button |
| Error | `onSearch` rejected | Input + inline error message |
| Disabled | `disabled={true}` | Muted, non-interactive |

**Dropdown positioning:**

The dropdown must use `position: fixed` with coordinates calculated relative to the input's `getBoundingClientRect()`. `position: absolute` will clip at `ModalSheet`'s overflow boundary. The component must handle `resize` and `scroll` events to reposition while open.

**Keyboard navigation:**

- Arrow Down / Arrow Up: move through results
- Enter: select focused result
- Escape: close dropdown (does not close ModalSheet — stop propagation)
- Tab: close dropdown and move focus

**Storybook stories (`PlaceInput.stories.tsx`):**

1. Default — empty, placeholder visible
2. Loading — search in progress
3. WithResults — dropdown open with 3 mock results
4. Selected — a place has been chosen
5. ErrorState — `onSearch` threw an error
6. NoResults — `onSearch` returned empty array
7. Disabled

All stories use mock `onSearch` functions that return immediately — no real API calls in Storybook.

**CSS (`PlaceInput.css`):**

- Input shell follows `.form-control` class rules (same dimensions, border, focus ring)
- Dropdown: `position: fixed`, `z-index` above modal backdrop, `background: var(--color-surface-card)`, `border: 1px solid var(--color-border-default)`, `border-radius: var(--radius-card)`, list of result items
- Selected state: replace input with a row showing place name + secondary address text + clear IconButton
- Loading indicator: small spinner icon inside the input trailing slot (not a spinner that replaces the input)

---

### Phase 3 — Travel form update

**Scope:** `AddPlannerItemForm.tsx` only. Wire PlaceInput into the travel kind. No DayDetail changes yet.

When `kind === 'travel'`:

1. Replace the generic "Location" TextInput with a "To" PlaceInput
2. Add a "From" PlaceInput above it
3. When both From and To are selected, call `getTravelDurationMinutes(from.coordinates, to.coordinates)`
4. Show a duration row: "~2h 15min by car" (display only, not a form field)
5. Pre-populate `endTime` with the calculated arrival: `startTime + durationMinutes` (HH:MM)
6. If `startTime + durationMinutes > 23:59`: show "Arrives next day — enter arrival time manually"; leave `endTime` empty
7. `endTime` remains a visible, editable field — user can override the derived value
8. Label the `startTime` field "Leave time" (not "Start time") for travel kind
9. Label the `endTime` field "Arrival time" (not "End time") for travel kind
10. The "Title" field remains required, below the place fields (user still names the leg)

**Data mapping when saving a travel item:**

| Input | Maps to | Notes |
|-------|---------|-------|
| `startTime` | `startTime` (existing) | Leave time |
| `endTime` (derived or entered) | `endTime` (existing) | Arrival time |
| To place name | `location` | Destination name |
| To place address | `address` | Destination address |
| From place | Ephemeral (if Option A) | Used only for duration calculation |
| Title | `title` | User-entered leg name |

No new fields in `CreatePlannerItemInput` are required for Option A (ephemeral origin).

If Option B (persist origin): add `originName?: string` and `originAddress?: string` to `CreatePlannerItemInput`, pass through to the RPC via the new migration 025 columns.

**Duration API error handling:**

If `getTravelDurationMinutes` fails:
- Show `FeedbackMessage` tone="neutral": "Couldn't estimate duration — enter arrival time manually"
- Clear any previously derived `endTime` value
- The form remains submittable — user enters arrival time manually
- The failure is not shown as an error (tone="error") because it is not user error

---

### Phase 4 — Travel item card display

**Scope:** `DayDetail.tsx`. Update the planner item card for travel items.

Current travel card: time range + title + `location_name`

Updated travel card for items created with Place Intelligence:
- Time range (`starts_at – ends_at`)
- Title
- If `location_name` is set: destination name
- If `location_address` is set: destination address (same as reservation pattern — already has CSS)
- If origin is persisted (Option B): "From [start_location_name]" above the destination row

No new components needed. The card pattern already renders `location_name` and `location_address`. The only change is showing `location_address` for `kind === 'travel'` as well as `kind === 'reservation'`.

---

### Phase 5 — Figma

After Phase 2 Storybook is canonical:

1. Create `PlaceInput` as a T1 Figma component with variants for all 7 states
2. Wire design tokens (no new tokens needed — reuse surface, border, text, accent tokens)
3. No Code Connect wiring until production behavior is validated

---

## 5. Human Decisions Required

### Decision 1: Origin persistence strategy

**Must resolve before Phase 3 begins.**

| Option | Migration | Edit UX | Long-term |
|--------|-----------|---------|-----------|
| A: Ephemeral | None | From is empty on re-edit | Simplest v1 |
| B: Add columns | Yes — migration 025 | Full round-trip | Clean, durable |
| C: RPC metadata | Yes — extend RPCs | Workable | Untyped, harder to query |

Recommendation: **Option A** for v1. The value that matters — when did we leave, when did we arrive — persists via `starts_at` and `ends_at`. Origin is planning context, not a record of what happened. The user can re-enter From if they want to recalculate.

If the project later needs to display "From Orlando, FL" on the travel card, the migration can be added then with real data to work with.

### Decision 2: Mapbox API key provisioning

**Must resolve before Phase 1 begins.**

The Edge Functions require a `MAPBOX_API_KEY` environment variable set in the Supabase project. This requires:
1. Creating a Mapbox account and generating an access token
2. Setting the secret in Supabase (`supabase secrets set MAPBOX_API_KEY=...`)
3. Deciding on token scope (public token with URL restriction, or secret token server-side only — server-side is correct since the key never leaves the Edge Function)

### Decision 3: PlaceInput scope

**Can resolve during Phase 2.**

The `PlaceInput` component is defined here as accepting an `onSearch` prop (injected). An alternative is for the component to import and call `searchPlaces` directly from `places.ts`, keeping the parent simpler.

The injected-search approach is recommended because it makes Storybook stories work without mocking module imports. The parent (`AddPlannerItemForm`) imports `searchPlaces` from `places.ts` and passes it in — one extra line per form that uses it.

If this feels like unnecessary indirection, the component can import directly and Storybook stories can use `jest.mock` or Storybook's MSW addon. Either approach is valid; the decision affects only the component's API surface.

### Decision 4: Cross-midnight travel handling

**Can resolve during Phase 3.**

Two options:
1. Detect cross-midnight and show "Arrives next day — enter arrival time manually" (leaves `endTime` empty, user can submit without an end time)
2. Detect cross-midnight and block form submission, requiring manual entry before saving

Option 1 is more permissive and consistent with how the rest of the form handles optional end time. Option 2 prevents a confusing card display (start time with no arrival time for a long flight). Both are defensible — decide based on expected user behavior for the first family using this.

---

## 6. Simplification Opportunities

### Keep origin ephemeral — eliminate the migration

The discovery document proposed metadata storage for origin. **The RPC has no metadata parameter; this was a false assumption.** The real alternatives are: don't persist origin at all (no migration), or add columns (migration required).

Making origin ephemeral reduces the implementation to zero new database work. The feature's core value — "Maycation tells me when I'll arrive" — is preserved entirely in `ends_at`. A user who wants to recalculate duration re-enters the From field. For most trips, travel items are planned once and not re-edited.

This is the single largest scope reduction available.

### The `address` field already exists for travel items

`location_address` is a first-class column on `planner_items`. The form already passes it via `address` in `CreatePlannerItemInput`. The only reason it doesn't appear for travel items today is a conditional in `AddPlannerItemForm`:

```tsx
{kind === 'reservation' ? (
  <>
    <TextInput label="Address" ... />
    ...
  </>
) : null}
```

The destination address from PlaceInput selection can be saved into the existing `address` field by changing this condition to `kind === 'reservation' || kind === 'travel'` — or simply making it show for all kinds.

No new field, no new column, no new RPC parameter.

### PlaceInput can start simpler

The full PlaceInput spec (7 states, fixed-position dropdown, keyboard navigation) is the right end state. For v1, a simpler form is viable:

- Render a TextInput for the place name
- A second TextInput (read-only) shows the resolved address after selection
- A search button triggers the lookup
- Results appear as a list below (no fixed positioning needed — just append to the form, push content down)

This eliminates the dropdown positioning problem entirely. It is less polished but significantly easier to build and test in a bottom sheet. The "typing → instant results" behavior can be added in v1.1 once the interaction is stable.

This is worth considering if the mobile keyboard/dropdown risk is deemed high enough to delay shipping.

### Reuse `FeedbackMessage` for the duration result

The duration confirmation ("~2h 15min by car · Arrives ~11:15 AM") can be rendered as a `FeedbackMessage tone="neutral"` — already exists, already styled, no new component needed. It does not need to be a custom designed element for v1.

### Consider starting with destination-only

The minimum version of duration calculation requires only the **destination** and the **leave time**. The origin can default to the trip's destination city (already available as `trip.destination`). This eliminates the From field entirely for v1.

The UX would be: user enters leave time and destination; Maycation geocodes the trip's destination as the origin and calls the duration API. For the core use case (driving from the hotel to the theme park), this works. The trip `destination` is a free-text field, not geocoded, so it would need to be geocoded on the fly — but this is one fewer user input.

The risk: `trip.destination` is "Orlando, FL" or "Disney World" — it's a human-entered string that may not geocode cleanly to a specific address. A wrong origin produces a useless duration estimate with no feedback.

Leaving the From field explicit — even if it adds one input — is safer. The user knows where they're actually starting from. This simplification is noted but not recommended.

---

## Summary Table

| Question | Answer |
|----------|--------|
| Migration needed? | No (if Option A); yes (if Option B) |
| New RPC? | No |
| New Edge Functions? | Yes — 2 |
| New T1 component? | Yes — PlaceInput |
| New Storybook stories? | Yes — PlaceInput (7 stories) |
| New Figma component? | Yes — after Storybook is canonical |
| Files changed (existing) | 4 |
| Files created (new) | 6 |
| Biggest technical risk | PlaceInput dropdown in ModalSheet on mobile |
| Biggest product risk | Origin not persisted (Option A) limits edit UX |
| Blockers before Phase 1 | Mapbox key provisioned |
| Blockers before Phase 3 | Origin persistence decision |
