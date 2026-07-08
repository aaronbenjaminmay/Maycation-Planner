# Temporal Intelligence Architecture

## Purpose

Temporal Intelligence governs how Maycation represents, stores, and displays time for planner items — including items that start late at night and end after midnight.

---

## Core Rule: Items Belong to the Day They Start

A planner item is owned by its start day via `trip_day_id`. `ends_at` may be any timestamp on or after `starts_at`. There is no requirement that `ends_at` fall on the same calendar day.

A late-night drive that departs Day 4 at 11 PM and arrives Day 5 at 12:30 AM belongs to **Day 4**. It appears on Day 4's detail view. It is sorted among Day 4's items by its `starts_at` timestamp.

This matches how families experience the trip: the drive *is* part of Day 4, even though they arrive in the early hours of Day 5.

---

## Data Model

### `starts_at`

Always anchored to the planner item's owner day:

```sql
starts_at = (day_date + start_time) AT TIME ZONE trip_timezone
```

Where `day_date` is the calendar date of the `trip_day` row, and `start_time` is the user-entered departure time (`time` type, 0–23:59).

`starts_at` never crosses into a previous or subsequent calendar day.

### `ends_at`

May be any timestamp on or after `starts_at`:

```sql
ends_at = (day_date + make_interval(mins => end_time_minutes)) AT TIME ZONE trip_timezone
```

`end_time_minutes` is total minutes elapsed from midnight of the owner day. Values 0–1439 produce a same-day `ends_at`. Values ≥ 1440 produce an `ends_at` on a later calendar day.

Examples:

| `end_time_minutes` | Resulting `ends_at` (clock time) | Day |
|---|---|---|
| 780 | 1:00 PM | same day |
| 1439 | 11:59 PM | same day |
| 1470 | 12:30 AM | next day |
| 1530 | 1:30 AM | next day |

### Database constraint

```sql
constraint planner_items_time_range_check check (
  ends_at is null or starts_at is null or ends_at >= starts_at
)
```

This constraint is satisfied for all valid `end_time_minutes` values. `end_time_minutes` must be ≥ `start_time` expressed in minutes from midnight — enforced by the RPC before construction.

---

## RPC Contract

Both `create_planner_item` and `update_planner_item` accept:

```sql
start_time       time     -- departure time, always on the owner day
end_time_minutes integer  -- total minutes from midnight of the owner day
```

The `end_time time` parameter used in earlier migrations has been replaced by `end_time_minutes integer` (migration `026_planner_item_end_time_minutes_rpc.sql`).

**This is the authoritative API contract for end time.** No boolean flag is stored or transmitted.

### Validation

The RPC rejects saves where `end_time_minutes < start_time_in_minutes`:

```sql
start_minutes := extract(hour from start_time)::integer * 60
               + extract(minute from start_time)::integer;
if end_time_minutes < start_minutes then
  raise exception 'End time must be on or after start time.';
end if;
```

An overnight item always passes this check because its `end_time_minutes` (≥ 1440) exceeds any same-day `start_time_in_minutes` (≤ 1439).

---

## Client Contract

`CreatePlannerItemInput` in `trips.ts`:

```typescript
endTime: string          // "HH:MM" clock time — used by non-travel items
endTimeMinutes?: number  // total minutes from midnight — used by travel items
```

When `endTimeMinutes` is provided it takes precedence. When absent, `endTime` is converted to minutes by `timeStringToMinutes`.

For travel items, the form computes `endTimeMinutes = startHours * 60 + startMinutes + durationMinutes` without any modulo wrapping. This preserves the full elapsed time for overnight arrivals.

For non-travel items, `endTime` is a same-day `"HH:MM"` string from a `<input type="time">` element. Values 0–1439 minutes.

**Edit-time duration preservation (v2.6.0):** `durationMinutes` is owned by a live-recalculation effect that resets it to `null` whenever it's in flight, has failed, or either place currently lacks coordinates. On edit, origin and destination restore with coordinates from `metadata`/`location_name`, so recalculation starts automatically — but if the user submits before it resolves, `durationMinutes` would be `null` and `endTimeMinutes` would be sent as `null`, clearing the previously saved arrival time. `AddPlannerItemForm` now also derives the item's originally saved duration (`ends_at − starts_at`, computed the same way as the Day Detail card display) into a separate, stable `savedDurationMinutes` value once at mount. At submit, `durationMinutes ?? savedDurationMinutes` is used — the fresh value if recalculation succeeded, otherwise the previously saved one. This is a fallback-preservation guard, not a literal "restore `endTimeMinutes` from saved `ends_at`" reimplementation of the form's initial state; the live-recalculation behavior itself is unchanged.

---

## "Next Day" Is Display Only

The label "next day" is never stored. It is derived at display time from the saved timestamps.

### Travel form estimate

```typescript
const nextDay = arrivalMinutes >= 1440
```

Shows `Arrive around 12:30 AM next day` when `arrivalMinutes >= 1440`. Same-day arrivals show no suffix.

### Planner item cards (`formatPlannerItemTimeRange`)

```typescript
export function isPlannerItemEndNextDay(item: PlannerItem): boolean {
  if (!item.starts_at || !item.ends_at) return false
  return new Date(item.ends_at).toDateString() !== new Date(item.starts_at).toDateString()
}
```

`isPlannerItemEndNextDay` compares the browser-local date strings of `starts_at` and `ends_at`. When they differ, `formatPlannerItemTimeRange` appends ` · Next day`:

```
11:00 PM - 12:30 AM · Next day
```

Same-day items are unchanged:

```
9:00 AM - 10:30 AM
```

This helper is used by Day Detail cards.

**Correction (v2.7.1):** this section previously stated the helper was also used by the Trip Reservations view. As of v2.7.0, the Reservations screen renders `trip_reservations` facts directly rather than `planner_items`, and formats its own date/time display (`formatTripDayDate` + a local time formatter) rather than calling `formatPlannerItemTimeRange`. The "Next day" label described below does not apply to the Reservations screen — a reservation fact has a single date and optional time, not a `starts_at`/`ends_at` pair that can cross midnight.

**Limitation:** The comparison uses the browser's local timezone, not the trip's stored `timezone` field. A trip in a timezone that differs significantly from the browser's could produce an incorrect "Next day" label in edge cases. Full timezone-aware comparison is deferred.

No boolean is stored in `metadata` or anywhere else.

---

## Sorting

`sortItemsByPlanOrder` sorts by `starts_at` timestamp. This is correct for overnight items — items are ordered by when they start, not when they end. No change was needed.

---

## Day Detail Filtering

Items are filtered by `trip_day_id`, not by timestamp range. An overnight item starting Day N and ending Day N+1 appears only on Day N's detail view. Day N+1 does not see it. This is the intended behavior under the "items belong to their start day" rule.

---

## What This Is Not

- **Not full timezone intelligence.** Display compares `starts_at` and `ends_at` in the browser's local timezone for the "next day" label. A trip in a timezone far from the browser's timezone could produce an incorrect label. A full fix would compare dates using the trip's stored `timezone` field. Deferred.
- **Not multi-day items.** A single planner item cannot span more than one explicit trip day. Items that take days (e.g. a long sea voyage) are outside scope.
- **Not split items.** An overnight item is not split into two separate items — one for the departure day and one for the arrival day.
- **Not non-travel overnight items.** Phase A supports overnight arrival times for travel items only. Non-travel items (activity, reservation, note) are still validated as same-day at the form level.

---

## Implementation Status

| Phase | Description | Status |
|---|---|---|
| Phase A | RPC + client + travel form overnight support | Complete |
| Phase B | Display "next day" label in Day Detail cards and Reservations view | Complete |
| Phase C | Prevent edit-time duration loss (fallback preservation, not a literal `endTimeMinutes`-from-`ends_at` restore) | Complete (v2.6.0) |
| Phase D | Non-travel items: "Ends next day" toggle | Not started |
