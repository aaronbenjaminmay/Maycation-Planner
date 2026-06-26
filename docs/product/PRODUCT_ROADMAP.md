# Maycation — Product Roadmap

This roadmap is organized by product maturity, not by version or release schedule.

It describes the direction and opportunity space. It is not a feature specification, a commitment list, or a sprint plan.

---

## Phase 2 — Product Evolution

**Current focus: Reduce app switching.**

The design system is stable. The product infrastructure is in place. Phase 2 is about using that foundation to make Maycation genuinely more useful during planning and travel — particularly by pulling common, repetitive context-switching tasks back inside Maycation.

### Opportunity Areas

**Travel Duration Intelligence**
When a family adds a travel leg — a drive, a flight, a transfer — Maycation should know approximately how long it takes. Drive times should not require the user to open Maps and copy back an answer.

**Address Intelligence**
Destinations, hotels, restaurants, and venues already have addresses. Maycation should be able to surface the right address at the right moment without the user re-entering it or remembering where they put it.

**Reservation Intelligence**
Families receive booking confirmations by email. The information in those emails — confirmation numbers, check-in times, addresses, cancellation policies — is exactly what Maycation needs. Bringing that information in should be as low-friction as possible.

**Weather Context**
A 90-degree afternoon matters if the family is walking through a theme park. A storm warning matters if they are driving. Weather is context that changes what a day looks like, and it should appear in the plan without requiring a separate app switch.

**Navigation Context**
On a travel day, families need to know where they're going and how long it takes from where they are. Maycation should be able to hand off to navigation at the right moment, with the right destination, without the user needing to find the address themselves.

**Trip Timeline Improvements**
The sequence of a trip day matters. When items overlap, when travel time hasn't been accounted for, when a reservation conflicts with a planned activity — these are problems that are easier to catch during planning than during travel. The timeline should make them visible.

---

## Future — Intentionally Deferred

These are ideas worth holding. They are not the current focus, and no timelines are attached to them.

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
