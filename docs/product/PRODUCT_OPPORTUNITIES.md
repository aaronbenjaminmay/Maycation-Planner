# Maycation — Product Opportunities

---

## What This Document Is

This is the living repository of observed product opportunities.

An opportunity is not a feature request. It is a moment where families experience unnecessary work, uncertainty, coordination overhead, or context switching while planning or taking a trip.

Every entry begins with an observed problem. Solutions remain intentionally lightweight until the problem is validated as worth solving.

The goal is to eliminate work that shouldn't exist — not to accumulate capabilities.

---

## How to Use This Document

**Add an entry when you observe a real family doing unnecessary work** — manually copying information between apps, asking someone else for a detail they already entered, discovering a conflict on the travel day that could have been visible during planning.

**Do not add entries for features you want to build.** Start from the friction, not the solution.

**Keep solutions brief.** The Opportunity field describes intent, not implementation. Technical decisions belong in FEATURE_EVALUATION.md.

**Update the status as opportunities move forward.** Status values:

| Status | Meaning |
|--------|---------|
| Observed | Problem identified; not yet exploring solutions |
| Exploring | Actively thinking about the opportunity |
| Validated | Confirmed the problem is real and significant |
| On Roadmap | Committed to addressing it |
| Built | Complete |

---

## Opportunity Template

Each entry uses this structure:

**Title** — A short descriptive name for the problem space.

**Current Workflow** — How families accomplish this today: apps, websites, manual steps, conversations. Be specific.

**Friction** — Why this is painful. The type of friction (app switching, manual copying, repeated entry, coordination, uncertainty, forgetting).

**Opportunity** — How Maycation might reduce or eliminate the work. Describe intent, not implementation. One or two sentences.

**Human Outcome** — The benefit in human terms. What does the family no longer have to do?

**Product Principles** — Which principles from PRODUCT_PRINCIPLES.md are strengthened.

**Status** — Current status (see table above).

---

## Opportunities

---

### Travel Duration Intelligence

**Current Workflow**
A family wants to understand how long a drive will take. They open a mapping app (Google Maps or Apple Maps), enter the start and end points, read the estimate, and return to Maycation. They enter the duration manually as a planner item. If the departure time changes, they repeat the process.

**Friction**
- App switching for every travel leg
- Manual entry of the result
- The estimate is not connected to the item or the day's sequence
- Duration estimates go stale when times change

**Opportunity**
When a planner item includes a starting point and a destination, surface estimated travel duration without requiring the family to calculate it in a separate app. Travel time should be visible alongside the day's other items.

**Human Outcome**
Families see realistic day timelines without opening Maps for each leg.

**Product Principles**
Reduce App Switching · Remove Steps · Context Over Complexity

**Status**
Built (v2.6.0 — Travel Intelligence). Duration is calculated at creation and now also displayed on the Day Detail card alongside origin and destination.

---

### Address Intelligence

**Current Workflow**
A family receives a hotel or restaurant confirmation by email. They find the address inside the email, copy or screenshot it, and paste or retype it into a planner item in Maycation. On the travel day, when they need to navigate, they search for the address again — either in Maycation, in the email, or in a message from the person who booked it.

**Friction**
- Multiple manual transcription steps
- The address lives in several disconnected places simultaneously
- Must be located again at the moment it is actually needed
- Transcription errors are possible

**Opportunity**
When a location is associated with a planner item, the address is stored once and available at the moment of need. At departure time, the family can navigate directly without searching for the address they already gave Maycation.

**Human Outcome**
Families stop copying addresses between apps and stop searching for them on travel days.

**Product Principles**
Reduce App Switching · Plan Once · Remove Steps

**Status**
Observed

---

### Reservation Intelligence

**Current Workflow**
A booking confirmation arrives by email. The family member responsible for planning opens the email, identifies the key details — name, date, time, address, confirmation number, cancellation deadline, check-in instructions — and enters those details by hand into Maycation. The process repeats for every reservation. The email and the planner item are disconnected: if the booking changes, the plan does not automatically update.

**Friction**
- Manual transcription from email to planner for every reservation
- Easy to miss important details buried in confirmation emails
- Each reservation requires multiple steps to reach the plan
- Changes to a booking do not reach the plan

**Opportunity**
Reduce the work required to move reservation details from confirmation emails into Maycation. The path from "I have a confirmation" to "it is in my plan" should require as few steps as possible.

**Human Outcome**
Reservations that exist in email are organized in Maycation without significant manual effort.

**Product Principles**
Reduce App Switching · Remove Steps · Plan Once

**Status**
Observed. **Note (v2.7.0):** the foundational piece this opportunity depends on has shipped — reservations are now durable trip facts (`trip_reservations`) that automatically derive an itinerary item, instead of being entered directly as planner items with no persistent fact behind them. This did not address the friction described above; a family still transcribes confirmation details from email by hand. It removes what would otherwise be a second migration later — email import can now target an existing fact model instead of requiring one to be designed at the same time. See "Reservation Intelligence — Email Import" in `PRODUCT_ROADMAP.md`.

---

### Weather Context

**Current Workflow**
Before or during a trip, a family member wants to know what the weather will be like on a specific trip day. They open a weather app, navigate to the destination, and check the forecast for the date in question — which requires mentally mapping "Day 3 is Thursday" to the right calendar date. They return to Maycation with that knowledge in mind, but the context is not recorded anywhere. The next time someone wants to check, the process repeats.

**Friction**
- App switching for every weather check
- Mental mapping between trip days and calendar dates
- Context does not persist in the plan
- Weather surprises disrupt plans made without it

**Opportunity**
Surface relevant weather conditions for each trip day based on the trip's location and dates. Weather should inform the day's plan without requiring the family to open a separate app or perform mental calendar math.

**Human Outcome**
Families make better-informed daily plans and are not surprised by weather they could have anticipated.

**Product Principles**
Reduce App Switching · Context Over Complexity · Integrate, Don't Recreate

**Status**
Observed

---

### Timeline Confidence

**Current Workflow**
A family adds individual planner items to a day — breakfast, a theme park visit, a dinner reservation — but sees them as a flat list, not as a connected sequence with time blocks. The total shape of the day is not visible. Whether the schedule is realistic is assessed by intuition. Conflicts (overlapping items), insufficient travel time between locations, or over-packed days are not surfaced during planning. They are discovered during travel, when the cost of adjustment is highest.

**Friction**
- No single view of how a day flows as time blocks
- Conflicts and tight windows are invisible during planning
- The adjustment tax is paid at the worst possible moment
- Even good planners cannot verify a realistic schedule without doing manual math

**Opportunity**
Present trip days as a continuous timeline with items in sequence, gaps visible, travel time between locations surfaced, and conflicts flagged — all during planning, not during travel.

**Human Outcome**
Families arrive at travel days with confidence that the schedule is realistic and that nothing is going to overlap.

**Product Principles**
Reduce Uncertainty · Remove Steps · Context Over Complexity

**Status**
Observed

---

### Shared Awareness

**Current Workflow**
The primary planner makes a change to the itinerary. They then notify other family members via text, group chat, or email. Other members update their mental model of the plan — or do not, if the notification is missed. Family members operating on different versions of the plan discover the discrepancy at an inopportune moment. The primary planner becomes a bottleneck and a single point of failure.

**Friction**
- Coordination overhead that falls entirely on the primary planner
- Changes made without notification are invisible to the rest of the family
- Different family members may operate on different versions of the plan
- The effort of keeping everyone informed grows with the size and complexity of the trip

**Opportunity**
When any family member with access makes a change, all other members see the current plan without manual notification. The plan one person sees is the plan everyone sees.

**Human Outcome**
The whole family is on the same page without anyone having to send updates.

**Product Principles**
Family First · Plan Once · Remove Steps

**Status**
Observed

---

### Offline Confidence

**Current Workflow**
On a travel day — in an airport, on a plane, in a remote area, or in an international destination with limited data — the family needs their plan. Connectivity is often worst exactly when the plan is most critical. Families revert to screenshots taken before departure, printed pages, or memory. Screenshots age without updating. Printed pages cannot be changed.

**Friction**
- Uncertainty about whether the plan will be accessible when it is most needed
- Screenshots are outdated the moment the plan changes
- Printing requires advance planning and cannot reflect updates
- Connectivity anxiety is a background stress during travel

**Opportunity**
The plan — at minimum the current day's critical details (items, addresses, confirmation numbers, timing, departure information) — is available without an active connection. The moment of highest need should not also be the moment of highest risk.

**Human Outcome**
Families know their plan is accessible regardless of where they are or what their signal is.

**Product Principles**
Calm Over Clever · Reduce Uncertainty · Family First

**Status**
Observed

---

## Parking Lot

Ideas intentionally deferred. These are not on the roadmap. They are recorded here to prevent rediscovery and to maintain a clear record of what was considered and why it was set aside.

---

**Expense Tracking**
Shared trip budgets, split expenses, and cost summaries are a real family pain point. Deferred because financial features carry significant product complexity and require integration with payment or banking services. The core planning experience should be complete before adding a financial layer.

---

**Memory Journal**
A record of a trip after it happens — photos organized by day, highlights surfaced, moments preserved. A natural extension of the planning product. Deferred to Phase 3. Requires the Phase 2 product to be stable before adding a retrospective dimension.

---

**AI Trip Generation**
Personalized itinerary suggestions based on family preferences, past trips, and destination data. High potential. Requires meaningful accumulated trip data and careful product design to avoid generic or irrelevant suggestions. Revisit when the planning experience is mature enough to have generated useful signal.

---

**Public Trip Sharing**
Allowing families to share itineraries publicly or with people outside the trip. A fundamentally different use case from private family coordination. Would require separate design consideration, content moderation thinking, and a clear answer to why this is better than existing travel content platforms.
