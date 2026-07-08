# Derivation Engine

## Purpose

The Derivation Engine is the pattern by which durable trip facts generate optional planner items without surprising the user or taking control of their itinerary.

It is not a runtime system. It is not a background process. It is an architectural convention — a defined relationship between two categories of data and a set of rules governing how that relationship is expressed.

---

## Two Categories of Trip Data

Maycation holds two fundamentally different kinds of data.

### Event-Scoped Data

Event-scoped data belongs to a day. It appears in the itinerary. It has scheduling, sorting, completion, and editing behavior. Every row in `planner_items` is event-scoped.

Examples:
- A restaurant reservation at 7 PM on Tuesday
- A drive from the hotel to the theme park starting at 9 AM
- A check-in reminder on arrival day
- A note about sunscreen on a beach day

Event-scoped data lives in `planner_items`. It is tied to a `trip_day_id`.

### Trip-Scoped Facts

Trip-scoped facts belong to the trip. They persist across days and provide context that spans the whole trip. They are not tied to a single day. They do not have `starts_at` or `ends_at`. They are not itinerary items.

Examples:
- Where the family is staying (`trip_stays`)
- A flight or rental car booking (`trip_transportation`)
- Who is traveling (`trip_party`)
- Trip-wide settings (`trips`)

Trip-scoped facts live in their own `trip_*` tables with their own RPCs and RLS policies.

---

## The Problem They Solve Together

A family enters their hotel once. That hotel has a check-in date, a check-in time, an address, and a confirmation number. All of that information is useful on the check-in day as a planner item. But the family entered it as a trip fact — not an event.

Without a derivation pattern, the family enters the hotel twice: once as a stay, again as a check-in reminder. This violates "Plan Once." It requires the family to stay synchronized manually. And it produces divergence — the stay has an updated confirmation number, the planner item has the old one.

The Derivation Engine solves this by letting a trip fact produce planner items, with clear rules about how those items are created, maintained, and released from the source fact.

---

## Product Principles

### A trip fact entered once should serve the whole trip.

When a family records something durable about their trip, Maycation should reuse it wherever it helps. A hotel stay should power a check-in reminder. A flight booking should power a departure reminder. The family should not have to re-enter what they already told the app.

### Facts should never surprise the itinerary.

If a durable fact can produce planner items, those items should be explainable, optional, and reversible. The user should always understand why an item exists. Items should never appear silently.

### User control wins.

Generated planner items are not locked. The family can edit, complete, reorder, or delete them exactly like any other planner item. If they change a derived item, that change belongs to them and Maycation will not overwrite it.

---

## The Pattern

The Derivation Engine follows eight steps, in order.

**1. User enters a durable trip fact.**

The family creates a record in a `trip_*` table — a stay, a transportation booking, a reservation reference. This record exists at the trip level and has no inherent connection to any particular day's itinerary.

**2. Maycation identifies useful planner items that could be derived from it.**

The system determines what planner items are natural to offer. For a stay, those are a check-in reminder and a check-out reminder. For a flight, that might be a departure reminder. Not every fact produces items. The offer is made only when useful items are identifiable.

**3. Maycation offers to create those items.**

The offer is surfaced immediately after the fact is saved, while the context is fresh. It is a single, skippable prompt. It is never silent. It is never automatic.

**4. If accepted, the items are stored as normal planner items.**

Derived items are created via the existing `create_planner_item` RPC. They are real planner items the moment they are created. They have `trip_day_id`, `starts_at`, `ends_at`, and all the same properties as manually created items.

**5. Each created item stores a soft reference to its source fact in metadata.**

The item records where it came from. This reference is the only connection between the planner item and the source fact. It is advisory, not structural.

**6. If the user edits the item, it becomes independent.**

Any user save to a derived planner item sets the item's managed state to `false`. From this point on, the item is fully owned by the user. Maycation will not auto-update it when the source fact changes.

**7. If the source fact changes, Maycation may offer to sync unmanaged items.**

When the source fact is updated and derived items still exist, Maycation offers to update items that are still managed. Items the user has edited are surfaced with a softer notice — "this stay changed, but your reminder was customized" — with no auto-update offered.

**8. If the source fact is deleted, Maycation asks whether to remove related planner items.**

Deletion of the source fact does not cascade. The user is asked whether to remove associated items. If they keep them, those items continue as standalone planner items with an orphaned source reference.

---

## Naming: The Managed State Flag

Each derived planner item carries a metadata key representing whether it is still managed by Maycation or has been taken over by the user.

### Chosen name: `metadata.managed_by_maycation`

**Default value (newly derived):** `true`

**After any user edit:** `false`

### Why `managed_by_maycation = true` over alternatives

`user_edited = true` is a negative formulation. It describes something that happened in the past ("the user touched this") rather than the current state of ownership. Reading it, you need to infer the inverse: "not user_edited means Maycation manages it." The truth is backwards.

`managed_by_maycation = true` states the current governing condition directly. When you read a planner item and see `managed_by_maycation: true`, you know what that means: Maycation is responsible for keeping this item in sync with its source fact. When you see `managed_by_maycation: false`, you know the user owns it.

It also names the agent explicitly. "Managed" by whom? By Maycation. This matters when the codebase grows — a future reader does not have to infer the subject of the management relationship.

### Transition rules

| Event | Before | After |
|---|---|---|
| Derivation offer accepted | — | `managed_by_maycation: true` |
| User saves any field | `true` | `managed_by_maycation: false` |
| System sync (from source fact) | `true` | remains `true` |
| Source fact deleted, user keeps item | `true` | remains `true` (now orphaned) |
| Source fact deleted, user removes item | — | item is soft-deleted |

The `update_planner_item` RPC sets `managed_by_maycation: false` whenever it processes an item that currently has `managed_by_maycation: true`. A separate `sync_derived_items` RPC performs system-initiated updates and does not alter the managed state.

---

## Source References

### Format

Each derived item stores a source reference in `metadata` using the key `derived_from_{fact_type}`. The value is the UUID of the source record.

Examples:
- `metadata.derived_from_stay` — references a `trip_stays` row
- `metadata.derived_from_reservation` — references a `trip_reservations` row (v2.7.0)
- `metadata.derived_from_transportation` — references a future `trip_transportation` row

All source references are strings (UUIDs). They are not enforced by foreign key constraints.

### Why references live in metadata

`planner_items` has an existing `metadata jsonb` column that accepts arbitrary keys. Adding a source reference to metadata requires no schema migration and no new column. It is consistent with how other advisory attributes are stored (`metadata.completed`, `metadata.start_place_lat`, etc.).

New fact types can add their own source reference key without touching the `planner_items` table schema.

### Why references are one-directional

The planner item references the source fact. The source fact does not maintain a list of derived item IDs.

If the source fact maintained a child list, that list would need to be kept synchronized with reality: updated when items are deleted, cleared when items become standalone, extended when new items are derived from the same fact. This bidirectional state maintenance is complex and error-prone.

The one-directional query — `SELECT * FROM planner_items WHERE metadata->>'derived_from_stay' = :stay_id AND deleted_at IS NULL` — is sufficient for every operation that needs to find derived items: the sync offer, the deletion prompt, and the sync RPC. No operation requires the source fact to enumerate its children.

### Why no foreign key

A FK from `planner_items` to `trip_stays` would:

- Require an `ALTER TABLE` migration on a high-use table
- Create a hard dependency: `ON DELETE CASCADE` contradicts the no-auto-delete rule; `ON DELETE SET NULL` loses the reference the moment the stay is soft-deleted
- Add a nullable column to every planner item for a feature used by a minority of items
- Block the pattern from being extended to other source facts without additional FK columns

Soft references via metadata are appropriate when the relationship is advisory. A derived planner item functions correctly whether or not the source fact exists. The reference enables features — sync, deletion prompts — but is not load-bearing.

### Why source facts do not store child item IDs

Same reason as above. The child list would be a derived view of reality, not reality itself. If the list and the actual items ever diverge (due to manual deletion, bugs, or data migration), the list becomes misleading. The authoritative query against `planner_items.metadata` is always correct.

---

## Stored vs. Computed

Derived planner items are **stored as real planner items**, not computed at query time.

### Why not compute them

A computed model — deriving items from source facts at query time, as virtual rows — would require every planner item query to union-join with `trip_stays` and any future source fact tables. This changes the query model permanently and grows in complexity as new fact types are added.

More critically, computed items cannot hold state. The following are all impossible with computed items:

**Completion state.** If the family marks "Check in to Grand Hyatt" as complete, that state needs to be stored somewhere. A computed row has no persistence layer.

**User edits.** The family changes the check-in time from 3:00 PM to 4:00 PM because the front desk called. That edit needs to be stored. A computed row cannot hold user modifications.

**Notes.** The family adds "Use west entrance, request pool view." That belongs to the planner item. A computed row cannot carry user-authored content.

**Sort order.** The family reorders their check-in reminder between two other items on arrival day. Sort order is stored on the planner item. A computed row cannot be reordered.

**Deletion.** The family decides they don't want a check-out reminder — they'll just know. A computed row cannot be individually deleted without suppressing all future computation from that source fact.

**Existing infrastructure.** The planner item display, filtering, sorting, completion toggling, drag-to-reorder, and editing flow all work on `planner_items`. Stored derived items inherit all of this for free. Computed items require every piece of that infrastructure to be extended with virtual-row handling.

Stored items with a soft reference are the only model that supports the full lifecycle.

---

## Synchronization

When a source fact changes, derived items may be stale. The Derivation Engine defines the correct response.

### Never silently update a derived item.

No write to a derived planner item should happen without either: (a) the user explicitly accepting a sync offer, or (b) the write being a system sync to an item where `managed_by_maycation = true`.

Case (a) is user-initiated. Case (b) is system-initiated but only applies to items the user has not yet edited.

Silent updates violate "User control wins."

### The sync offer

When a source fact changes:

1. Query for derived items: `WHERE metadata->>'derived_from_{fact}' = :id AND deleted_at IS NULL`.
2. For each item, check `metadata.managed_by_maycation`.
3. If `true`: offer a sync with a brief diff preview ("Confirmation number: ABC → XYZ"). If the user accepts, call `sync_derived_items`.
4. If `false`: surface a softer notice ("This stay changed. Your reminder was customized."). Do not offer a sync. Do not write anything.

### What sync updates

A sync triggered via `sync_derived_items` updates only the fields sourced from the fact. It does not touch:

- `description` (user notes)
- `sort_order`
- `metadata.completed`
- Any key the user may have written

User-authored content survives a sync. The sync updates fact-derived fields only: time, title components, location, confirmation code.

### Day changes require special handling

If the source fact's date changes (e.g., a stay's `check_in_date` moves from May 29 to May 30), the derived item is on the wrong trip day. This is a structural change, not a field update. Moving a planner item across days requires changing `trip_day_id`. The sync offer should make the severity of this change visible before the user accepts.

---

## Deletion

When a source fact is deleted (soft-deleted via `deleted_at = now()`), related planner items are not automatically deleted.

### The deletion prompt

Before completing the source fact deletion:

1. Query for derived items that still exist (`deleted_at IS NULL`).
2. If any exist, surface a prompt: "Also remove the related planner items?" with a count if more than one.
3. If the user says yes: soft-delete the items via the existing `delete_planner_item` RPC. Then delete the fact.
4. If the user says no: delete the fact. Leave the items in place.

### Standalone survival

Items the user keeps after their source fact is deleted become standalone historical planner items. Their `derived_from_{fact}` metadata key now references a deleted row. This orphaned reference is benign — it is a string in a jsonb column, not a FK constraint. The item functions normally. The orphaned key can be used to identify "was once derived" if ever needed for auditing.

### Why no cascade

A cascade would delete items that may represent real history — a completed "Check in to Marriott" with notes the family added. The family deleted the stay because they moved to a different hotel, not because the check-in event didn't happen. Cascading treats the item as structural scaffolding. It is not — it is the family's itinerary.

---

## Architecture vs. Current Implementation

The sections above describe the Derivation Engine as an architectural pattern — the intended shape of the relationship between trip-scoped facts and the planner items they can produce. That pattern was fully specified before any system implemented all eight steps end to end.

This section documents which systems implement which parts of the pattern, as actually shipped. Where the two disagree, the implementation notes below are authoritative for "what exists today" — the numbered steps above remain the reference design.

| Capability (pattern step) | Stay Intelligence | Reservation Intelligence |
|---|---|---|
| 1–2. Fact entry, identify derivable items | ✅ Implemented | ✅ Implemented |
| 3. Offer to create (skippable prompt) | ✅ Implemented — post-save "Add reminders?" prompt | N/A by design — creation derives automatically, no offer (see note below) |
| 4–5. Stored as real planner items with soft reference + `managed_by_maycation: true` | ✅ Implemented | ✅ Implemented |
| 6. User edit releases the item (`managed_by_maycation` → `false`) | ❌ Not implemented — `update_planner_item` did not alter this flag for any derived item until migration `029`, and that change is scoped to reservation-derived items only (see below) | ✅ Implemented |
| 7. Sync offer / system sync on fact update | ❌ Not implemented — no sync RPC exists for stays; editing a stay never touches its derived items | ✅ Implemented — automatic system sync via `sync_reservation_derived_item`, not an offer (see note below) |
| 8. Deletion prompt ("also remove items?") | ❌ Not implemented — `delete_trip_stay` is called directly with no query for derived items and no prompt | ✅ Implemented — client queries for a derived item and prompts Keep/Remove before deleting the fact |

**Stay Intelligence implements only the foundational portion of the pattern** — fact CRUD, the derivation offer, and the initial soft reference. It does not implement managed-state tracking on edit, synchronization, or delete branching. `STAY_INTELLIGENCE_ARCHITECTURE.md` previously described a `sync_derived_stay_items` RPC and a client-side deletion prompt as though they existed; neither was ever built. That document has been corrected to reflect this.

**Reservation Intelligence (v2.7.0) is the first complete implementation** of steps 4 through 8 — automatic derivation, managed synchronization, customization detection, synchronization opt-out, and delete branching, all working end to end and verified against live data. See the dedicated section below.

**Travel Intelligence does not derive planner items from a trip-scoped fact** — there is no `trip_transportation` table and travel items are created directly, not derived. What Travel Intelligence does is *consume* another system's derived context: `AddPlannerItemForm` surfaces the active Stay (from Stay Intelligence's `getActiveStayForDay`) as a `PlaceInputQuickPick` for a travel item's origin. This is downstream integration with a derived fact, not a derivation source in its own right. Travel Intelligence is not a candidate for the "first complete implementation" distinction above.

### Why Reservation Intelligence's create and sync steps are automatic, not offered

Steps 3 and 7 as originally specified call for a skippable *offer* — a prompt the user can accept or decline. Reservation Intelligence deliberately implements both as automatic instead:

- **Creation (step 3):** saving a reservation fact derives its planner item immediately, with no confirmation dialog — a lightweight success message ("Reservation added to your itinerary.") replaces the offer.
- **Synchronization (step 7):** editing a reservation fact whose derived item is still managed updates that item immediately, with no confirmation dialog — a message states that the itinerary item was kept in sync.

This was an explicit product decision, not an oversight: automatic derivation removes a step from a flow the family will repeat for every reservation, and the "offer" pattern's original purpose — giving the user a chance to decline before losing control of an item — is already served by step 6 (any subsequent edit releases the item from management, permanently). The customization-detection and opt-out mechanism (below) is what preserves user control; the offer step is not needed to also preserve it at creation and sync time.

### Customization detection and synchronization opt-out

Reservation Intelligence is the first system where step 6 actually functions. `update_planner_item` (migration `029_reservation_intelligence_hardening.sql`) sets `metadata.managed_by_maycation` to `false` whenever it edits an item that currently has `metadata.derived_from_reservation` set and is currently managed. This is the opt-out mechanism: a user does not choose to "stop syncing" through a setting — they opt out simply by editing the derived item directly, the same action they'd take to edit any other planner item.

This flag-flip is scoped specifically to reservation-derived items (`metadata ? 'derived_from_reservation'`), not applied universally to every derived item. Applying it to Stay-derived items as well would be a defensible reading of the original pattern, but it was deliberately not done here — it would be a behavior change to a system this milestone was not scoped to modify.

A separate RPC, `sync_reservation_derived_item`, performs the system-initiated sync described in step 7. It updates only fact-derived fields (title, day/time, location, confirmation code, external URL, mapped type, destination coordinates) and never touches `description`, `sort_order`, `status`, or `managed_by_maycation` itself. It is a no-op — returns `null`, writes nothing — when no derived item exists or the derived item is no longer managed. This mirrors the general Synchronization section above precisely; Reservation Intelligence did not deviate from that part of the pattern.

### Deletion

`delete_trip_reservation` itself does not cascade — deleting the fact never touches the derived item at the RPC level, exactly as step 8 specifies. The branching described in step 8 (query, prompt, conditionally delete the item first) is implemented entirely client-side in `TripReservations.tsx`, sequencing calls to the existing `delete_planner_item` RPC and `delete_trip_reservation`. This has been verified live: deleting a reservation and choosing "Keep item" leaves the derived item as a standalone itinerary item; choosing "Remove item" deletes both.

---

## Reservation Intelligence: First Complete Implementation

**Source fact:** A row in `trip_reservations` (migration `028_trip_reservations.sql`).

**Scope:** `dining` and `activity` reservation types only. Lodging remains exclusively Stay Intelligence's domain; transportation remains a distinct, unimplemented future source fact. `trip_reservations` uses its own dedicated enum (`trip_reservation_type`), separate from the `reservation_type` enum used by `planner_items` and manually-created reservation-kind items.

**Fact fields that drive derivation:** `name`, `reservation_type`, `reservation_date`, `reservation_time`, `place_name`, `place_address`, `place_lat`/`place_lng`, `confirmation_code`, `external_url`. `notes` is captured on the fact but is treated as user territory on the derived item after creation — see Synchronization above.

**Item derived:** Exactly one planner item per reservation (`kind = 'reservation'`), unlike Stay's check-in/check-out pair. `trip_reservation_type` maps to the existing `planner_items.reservation_type` enum as `dining → food`, `activity → activity`.

**Metadata on the derived item:**
```json
{
  "derived_from_reservation": "<trip_reservations.id>",
  "managed_by_maycation": true,
  "destination_place_lat": <number or null>,
  "destination_place_lng": <number or null>
}
```

**Reservations screen and dashboard tile source `trip_reservations` directly, not `planner_items`.** This was the highest-priority behavioral change in the v2.7.0 milestone: previously, the Reservations screen queried `planner_items` filtered by `kind = 'reservation'`, which included Stay-derived check-in/check-out items (no `lodging` exclusion existed) — a real, user-reported source of confusion. Sourcing from the fact table directly makes that category of bug structurally impossible, not merely filtered out.

See `create_trip_reservation`, `update_trip_reservation`, `delete_trip_reservation`, `get_trip_reservations`, and `sync_reservation_derived_item` in `supabase/migrations/028_trip_reservations.sql` and `029_reservation_intelligence_hardening.sql` for the full RPC contracts.

---

## Future Implementations

The pattern is designed for reuse. Each new source fact type adds its own:

- `trip_*` table with its own RPCs
- Derivation offer UI triggered after save (or automatic derivation, per product decision — see Reservation Intelligence above)
- `derived_from_{fact}` metadata key name
- Sync logic specific to its field mapping

### Anticipated future implementations

**Transportation Intelligence**

Source: `trip_transportation` (future — rental car, flight, shuttle)

May offer: departure reminder, pickup reminder, airport arrival buffer item

**Today Intelligence**

Source: computed from the current date relative to `trip_days`

May offer: packing reminder before departure day, "you're traveling today" summary item

**Reservation Intelligence — email import**

Reservation Intelligence (above) covers manual entry only. Importing reservation details from confirmation emails remains a distinct, unimplemented future phase — see `docs/product/PRODUCT_ROADMAP.md`.

**Stay Intelligence — completing the pattern**

Stay Intelligence could adopt the same managed-state flip, sync RPC, and delete-branching that Reservation Intelligence now implements, following the same shape. Not scheduled; noted here so the gap is visible rather than rediscovered.

None of these require changes to the core pattern or to `planner_items` schema. The pattern accommodates them as-is.

---

## What This Is Not

**Not a rules engine.** There is no branching condition tree, no weighted scoring, and no automatic prioritization. Items are offered, not decided.

**Not a background sync service.** The Derivation Engine does not run on a schedule or watch for changes. Sync is triggered by explicit user actions: saving a source fact, accepting a sync offer.

**Not a template system.** Derived items are not instantiated from a named template. They are created by the existing `create_planner_item` RPC with values mapped from the source fact.

**Not AI generation.** Items are structurally derived from explicit fields in the source fact. There is no inference, suggestion, or ML involved in the MVP pattern.

---

## Implementation Checklist (Per New Source Fact)

When a new source fact type adopts this pattern:

- [ ] Define which planner items can be derived and what fields drive them
- [ ] Choose the `derived_from_{fact}` key name
- [ ] Surface a derivation offer in the fact-creation UI
- [ ] Implement the offer UI: "Create [item names]?" with Accept / Skip
- [ ] Create items via `create_planner_item` with `managed_by_maycation: true` and the source reference
- [ ] Wire the update path: detect changes to fact fields, query derived items, surface sync offer
- [ ] Wire the deletion path: query derived items, prompt "Also remove reminders?"
- [ ] Implement `sync_derived_items` variant (or extend the shared RPC) that updates fact-derived fields without altering `managed_by_maycation`
- [ ] Ensure `update_planner_item` sets `managed_by_maycation: false` for items where it is currently `true`
