# Stay Intelligence Architecture

## Purpose

Stay Intelligence lets Maycation understand where a family is staying during their trip and use that knowledge throughout the product — on the daily itinerary, in the Place Intelligence quick-picks, and in the Trip Dashboard.

It answers the question: **Where does this family sleep tonight?**

---

## Relationship to the Derivation Engine

Stay Intelligence is the first implementation of the Derivation Engine pattern.

The Derivation Engine defines how durable trip facts generate optional planner items without surprising the user or taking control of their itinerary. Stay Intelligence applies that pattern to one specific fact type: a Trip Stay.

For the full pattern definition — including the managed state flag, soft reference semantics, sync lifecycle, and deletion behavior — see [`DERIVATION_ENGINE.md`](./DERIVATION_ENGINE.md).

This document covers what is specific to Stay Intelligence: the `trip_stays` data model, date range conventions, derivation specifics, and integration with the rest of the product.

---

## Domain Model

### Trip Stay

A Trip Stay represents a continuous lodging arrangement during a trip. One stay = one continuous booking at one property.

```
trip_stays
  id                  uuid
  trip_id             uuid (FK → trips)
  place_name          text        -- "Grand Hyatt Denver"
  place_address       text        -- "1750 Welton St, Denver, CO"
  place_lat           numeric
  place_lng           numeric
  check_in_date       date        -- the first night (family sleeps here)
  check_out_date      date        -- the last day (family leaves)
  check_in_time       time        -- null if unknown
  check_out_time      time        -- null if unknown
  confirmation_code   text        -- null if unknown
  notes               text        -- null if none
  created_by          uuid
  created_at          timestamptz
  updated_at          timestamptz
  deleted_at          timestamptz -- soft delete
```

### Date Range Convention: Half-Open Interval `[check_in_date, check_out_date)`

The date range is interpreted as a half-open interval. The family sleeps at this property on `check_in_date` through `check_out_date - 1`. They do not sleep here on `check_out_date` — they leave.

| Day | Family is here? |
|---|---|
| check_in_date | Yes — they arrive |
| check_in_date + 1 | Yes |
| … | Yes |
| check_out_date - 1 | Yes — last night |
| check_out_date | No — they leave |

**Why half-open:**
- Matches hotel industry convention (check-out day you leave, not sleep)
- Enables same-day hotel switching: one stay's `check_out_date` equals the next stay's `check_in_date` with no overlap and no gap
- Compatible with PostgreSQL `daterange` exclusion constraints for future enforcement
- The function `getActiveStayForDay(day)` returns the stay where `check_in_date <= day < check_out_date`

### Multi-Stay Trips

A trip may have multiple `trip_stays` rows. The family checks out of one hotel and into another on the same day. There is no single "current stay" stored on the trip — it is always computed from the date.

Overlap validation at MVP is enforced in the RPC: when creating or updating a stay, the RPC checks for rows in the same trip where the new date range overlaps an existing range using the half-open interval semantics. The PostgreSQL `btree_gist` exclusion constraint is the upgrade path if RPC-level checks prove insufficient.

---

## Derivation: Check-In and Check-Out Items

Stay Intelligence is the first Derivation Engine implementation. The source fact is a `trip_stays` row. The derived items are a check-in reminder and a check-out reminder.

### What is offered

After saving a stay, Maycation offers to create two planner items:

**Check-in item**
- `kind = 'reservation'`, `reservation_type = 'lodging'`
- Title: "Check in to [place_name]"
- Day: `check_in_date`
- Start time: `check_in_time` (null if unknown — item is created without a time)
- `location_name`: `place_name`
- `location_address`: `place_address`
- `confirmation_code`: `confirmation_code`

**Check-out item**
- `kind = 'reservation'`, `reservation_type = 'lodging'`
- Title: "Check out of [place_name]"
- Day: `check_out_date`
- Start time: `check_out_time` (null if unknown)
- `location_name`: `place_name`
- `location_address`: `place_address`
- `confirmation_code`: `confirmation_code`

### Metadata on each derived item

```json
{
  "derived_from_stay": "<trip_stays.id>",
  "managed_by_maycation": true
}
```

When the user edits the item, `managed_by_maycation` becomes `false`. See `DERIVATION_ENGINE.md` for the full managed-state lifecycle.

### When the offer is surfaced

Immediately after the stay is saved (create or update), while the user is still in context. A single dismissible prompt: "Create check-in and check-out reminders?" with Accept and Skip.

The offer is not re-surfaced on subsequent updates if derived items already exist. The sync offer handles updates instead.

---

## Day Context: `getActiveStayForDay`

```typescript
getActiveStayForDay(stays: TripStay[], dayDate: Date): TripStay | null
```

Returns the stay whose date range covers a given day. Returns `null` if no stay covers that day (the family has their own accommodation, or the day is uncovered).

This function is computed, not stored. No FK from `trip_days` to `trip_stays`. Day-to-stay resolution is always derived from the date ranges.

### Usage

- Day Detail view: show ambient "Staying at [place]" context above the itinerary when a stay covers this day
- PlaceInput quick-picks: surface "Current Stay" as a pre-resolved origin or destination suggestion
- Trip Dashboard: show where the family is staying across the trip timeline

### Check-out day edge case

On `check_out_date`, the family is not staying at this property (per half-open interval). But they may still be physically present in the morning before checking out. The "Current Stay" quick-pick may choose to look back one day and surface the departing stay on `check_out_date` as a "Leaving from" option, with appropriate label. This behavior is deferred to Place Intelligence Phase 4.

---

## RPC Design

All writes to `trip_stays` go through `security definer` RPCs. No direct client table mutations.

### `create_trip_stay(trip_id, place_name, ...)`

Creates a new stay row. Validates that the date range does not overlap an existing non-deleted stay for the same trip. Returns the new stay UUID.

### `update_trip_stay(trip_id, stay_id, place_name, ...)`

Updates an existing stay row. Re-validates overlap excluding the current row. Returns the stay UUID.

### `delete_trip_stay(trip_id, stay_id)`

Soft-deletes the stay (`deleted_at = now()`). Does not cascade to planner items. Returns the stay UUID.

The deletion prompt ("also remove reminders?") is handled in the client before calling this RPC. If the user confirms removal, `delete_planner_item` is called for each derived item before `delete_trip_stay` is called.

### `sync_derived_stay_items(trip_id, stay_id)`

Updates derived check-in and check-out items where `managed_by_maycation = true`. Updates only fields sourced from the stay: title components, times, location, confirmation code. Does not alter `managed_by_maycation`. Does not touch user-authored fields (`description`, `sort_order`, `metadata.completed`).

---

## Integration Points

### Place Intelligence

`getActiveStayForDay` feeds into `PlaceInput` quick-picks. When the user is adding a travel item, the PlaceInput can surface "Current Stay" as a pre-resolved `PlaceValue` with coordinates, without the user typing anything.

The stay's `place_lat` and `place_lng` provide the coordinates needed to call `getTravelDurationMinutes`. The family gets a duration estimate from their hotel without having to search for it.

### Temporal Intelligence

Check-in and check-out items are created via `create_planner_item`. They use the existing `start_time` and `end_time_minutes` contract. Check-in and check-out times are same-day (values 0–1439 minutes). No overnight handling is required for these item types.

### Trip Dashboard (future)

The stay data enables a trip-wide accommodation timeline: which property the family is at on each night, with gaps visible as uncovered nights. This requires no additional data — it is a display derivation from all non-deleted `trip_stays` rows for the trip.

---

## Place Selection

Stay creation uses `PlaceInput` as its canonical place selector — the same component used by Travel items. This is not cosmetic. It is the mechanism that allows coordinates to flow from the user's search result into `trip_stays.place_lat` / `place_lng`, making the Current Stay quick pick fully capable of triggering travel duration estimation.

### Data flow

```
PlaceInput (search or manual entry)
  → PlaceValue { name, address, coordinates? }
  → createTripStay / updateTripStay
  → trip_stays.place_lat / place_lng
  → getActiveStayForDay()
  → PlaceInputQuickPick { value: PlaceValue with coordinates }
  → AddPlannerItemForm "From" field
  → getTravelDurationMinutes(origin, destination)
  → estimated drive time
```

When the user selects a search result, `PlaceValue.coordinates` is populated. Coordinates flow through to the stored stay, then to the quick pick, then to the travel duration effect. When the user types a name manually (no search result), `PlaceValue.coordinates` is `undefined`, the quick pick carries no coordinates, and travel duration is not estimated — exactly the same behavior as a manually-entered travel origin.

### Cross-reference

See [`PLACE_INTELLIGENCE_ARCHITECTURE.md`](./PLACE_INTELLIGENCE_ARCHITECTURE.md) for the `PlaceInputQuickPick` type definition and quick picks architecture.

---

## What Stay Intelligence Is Not

**Not a reservation system.** `trip_stays` stores what the family tells Maycation, not a booking made through Maycation. There is no payment, availability, or booking confirmation integration.

**Not Reservation Intelligence.** A future `trip_reservations` table will handle flight bookings, dining reservations, and activity tickets. Stay Intelligence is specifically about lodging — where the family sleeps.

**Not a place entity.** `trip_stays.place_name` is a string, not a foreign key to a place database. The `place_lat` and `place_lng` coordinates are for internal use (travel time estimation, quick-picks) — not a full geocoded place record.

**Not per-person.** A stay covers the whole family traveling together. Per-person room assignments or occupancy tracking is out of scope.

---

## Implementation Status

| Phase | Description | Status |
|---|---|---|
| Phase 1 | `trip_stays` table migration, RPCs, TypeScript types | Complete |
| Phase 2 | Stay entry and management UI + check-in/check-out reminder offer | Complete |
| Phase 3 | Day Detail ambient context display | Not started |
| Phase 4 | Place Intelligence integration (PlaceInput quick-picks) | Complete |
| Phase 5 | Trip Dashboard accommodation timeline | Not started |
