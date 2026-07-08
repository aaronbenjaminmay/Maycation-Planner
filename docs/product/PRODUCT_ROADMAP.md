# Maycation — Product Roadmap

**Product: v2.6.0 — Travel Intelligence (complete) | Design System: ds/v1.30.1 — Component Token Layer**

This roadmap is organized by product maturity, not by version or release schedule.

It describes the direction and opportunity space. It is not a feature specification, a commitment list, or a sprint plan.

---

## Phase 2 — Product Evolution

**Current focus: Reduce app switching.**

The design system is stable. The product infrastructure is in place. Phase 2 is about using that foundation to make Maycation genuinely more useful during planning and travel — particularly by pulling common, repetitive context-switching tasks back inside Maycation.

### Completed

**Travel Duration Intelligence** — Complete (v2.6.0)
When a family adds a travel leg, Maycation estimates the drive time and derives the arrival time from the leave time and duration. Users do not need to open Maps. The Day Detail card also shows origin, destination, and drive duration after save, and editing a travel item no longer loses a previously saved arrival time while duration recalculates.

**Stay Intelligence** — Complete (Phases 1, 2, 4)
Where a family is staying is recorded once and used across the product: check-in and check-out reminders are offered via the Derivation Engine, and the active stay pre-populates the origin field for Travel items via PlaceInput quick picks. Day Detail ambient display (Phase 3) and Trip Dashboard accommodation timeline (Phase 5) are not yet started.

**Reservation Place Intelligence** — Complete (v2.4.0)
Reservations now use PlaceInput for the Location field. Selecting a place auto-populates the Title, sets Location and Address, stores destination coordinates, and hides the manual Address field when a place is resolved. Manual entry remains fully supported. Place Intelligence is now a shared platform across both Travel and Reservation kinds.

**Reservation UX Refinement** — Complete (v2.4.0)
Title auto-fill from place selection, conditional address field (hidden when coordinates are resolved), and clear distinction between resolved-place and manual-entry states.

**Search Platform Upgrade** — Complete (v2.4.0)
`search-places` Edge Function dispatches between Mapbox Geocoding v5 and Mapbox Search Box v1 via `PLACE_SEARCH_PROVIDER` secret. Search Box v1 `/forward` is the active production provider. Geocoding v5 is the fallback. No schema changes, no client API changes.

### Active Opportunity Areas

**Reservation Intelligence — Phase B+**
Families receive booking confirmations by email. The information in those emails — confirmation numbers, check-in times, addresses, cancellation policies — is exactly what Maycation needs. Bringing that information in should be as low-friction as possible. This requires a `trip_reservations` table (trip-scoped fact), email import, and Derivation Engine integration to offer planner items. Phase A (Place Intelligence for reservation planner items) is complete. Phase B+ is the full reservation platform.

**Place Intelligence — Proximity Bias**
Without a trip location context, generic venue name queries (e.g. "Be Our Guest") may rank distant businesses above the intended location. Passing trip coordinates to the `search-places` function as proximity bias would weight results toward the trip area. No schema changes required — this is a parameter addition to the Edge Function.

**Place Intelligence — Travel Quick Picks**
Surface previously-used destinations and upcoming reservation locations as quick picks in the Travel form destination field. Reduces re-entry for common trip destinations.

**Weather Context**
A 90-degree afternoon matters if the family is walking through a theme park. A storm warning matters if they are driving. Weather is context that changes what a day looks like, and it should appear in the plan without requiring a separate app switch.

**Navigation Context**
On a travel day, families need to know where they're going and how long it takes from where they are. Maycation should be able to hand off to navigation at the right moment, with the right destination, without the user needing to find the address themselves.

**Trip Timeline Improvements**
The sequence of a trip day matters. When items overlap, when travel time hasn't been accounted for, when a reservation conflicts with a planned activity — these are problems that are easier to catch during planning than during travel. The timeline should make them visible.

---

## Future — Intentionally Deferred

These are ideas worth holding. They are not the current focus, and no timelines are attached to them.

**Saved Places**
Home, Airport, Hotel, and recently selected places stored in user profile and surfaced as PlaceInput quick picks. Reduces re-entry for repeat places. The `PlaceInputQuickPick` API is already designed to accept these without changing the component interface.

**Expense Tracking**
Shared trip expenses, split bills, and budget visibility are recurring pain points for families traveling together. This is a meaningful problem but a large one — expense features carry significant complexity and require integration with financial services. Defer until the core planning experience is complete.

**Photo Memories**
Preserving memories of a trip — photos organized by day, highlights surfaced after the trip — is a natural extension of a trip planning product. It is out of scope for Phase 2 but a natural direction for Phase 3.

**AI Trip Recommendations**
Personalized suggestions for destinations, activities, and itineraries based on family preferences and past trips. High potential. Requires accumulated data and careful product design to avoid being generic.

**Public Trip Sharing**
Allowing families to share itineraries publicly or with other families. A fundamentally different use case from private family coordination — requires separate design consideration and moderation thinking.

**Expense Integration**
Deep integration with payment systems to automatically capture trip spend, split costs among family members, and summarize by category.

---

## Product Opportunity Framework

Every proposed feature should pass this filter before it enters active development.

These are not a scoring rubric. They are a forcing function for clarity.

---

**1. Does it reduce app switching?**

Will this keep the family inside Maycation for something they currently do in another app? Does the value of bringing it in outweigh the cost of building it?

---

**2. Does it remove steps?**

Does the feature eliminate work that currently exists? Or does it add a new step in exchange for some other benefit? Net-step-reduction is a strong signal.

---

**3. Does it reduce uncertainty?**

Will the family feel more confident in their plan after using this feature? Does it answer a question they currently have to find the answer to on their own?

---

**4. Does it save time during planning?**

Planning a family trip is work. Features that compress that work — fewer decisions, faster input, smarter defaults — compound across the entire planning phase.

---

**5. Does it reduce stress during travel?**

Travel days are when the stakes are highest and attention is most limited. Features that reduce friction, surface the right information, and prevent surprises are most valuable here.

---

**6. Does it improve collaboration?**

Does the feature make it easier for the full family to stay informed, share responsibility, or participate in the plan? Or does it only benefit the primary planner?

---

If a proposed feature answers "No" to most of these questions, reconsider it.

If it cannot be described in terms of one or more of these questions, it may not belong in Maycation.
