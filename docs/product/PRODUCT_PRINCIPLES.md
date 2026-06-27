# Maycation — Product Principles

These principles guide every product decision. When a feature, change, or interaction is proposed, these principles are the filter.

---

## 1. Reduce App Switching

Every time a family leaves Maycation to complete a planning task, ask whether that work belongs inside Maycation.

Not every task does. Maycation should not rebuild Maps, Weather, or Calendar. But information from those services — a travel duration, a forecast, a reservation address — should not require the family to leave and return. Where integration is possible and reduces a meaningful switch, pursue it.

The measure of success is not features added. It is context switches eliminated.

---

## 2. Remove Steps

The best feature is often the one that removes work.

Before adding a new step to any flow, ask whether existing steps can be eliminated. Before adding a new field to a form, ask whether that information already exists somewhere. Before adding a screen, ask whether the task could be completed in fewer taps.

Subtraction is a product decision. It requires more deliberate thinking than addition.

---

## 3. Plan Once

Information entered once should power multiple experiences.

A destination entered during trip creation should appear in navigation context. A reservation time entered in a planner item should inform the day's timeline. A member added to a trip should see every update without being told individually.

When information is entered in one place but must be re-entered somewhere else, that is a product failure, not a workflow.

### A trip fact entered once should serve the whole trip.

Some information is durable — it belongs to the trip, not to a single day. Where the family is staying. How they are getting there. Who is traveling. When this kind of fact is entered, Maycation should use it wherever it helps: surfacing it as a quick-pick when filling out travel items, suggesting a check-in reminder on the right day, showing accommodation context on the daily itinerary.

The family should not have to re-enter what they already told the app. See the [Derivation Engine](../architecture/DERIVATION_ENGINE.md) for how durable trip facts produce itinerary items without taking control of the plan.

---

## 4. Context Over Complexity

Show the right information at the right moment. Avoid exposing every possible option.

A planner item for dinner at 7pm is more useful at 6:45pm than at 9am. A warning about overlapping reservations is more useful during planning than during travel. A map is more useful on the travel day than before it.

Complexity is not a sign of power. A product that knows when to be quiet is more powerful than one that always has something to say.

---

## 5. Integrate, Don't Recreate

Leverage Maps, Calendar, Weather, Photos, and other best-in-class services. Do not rebuild them.

When a family needs directions, they should get directions from the best directions experience available, not from a degraded version inside Maycation. Maycation's job is to know when to hand off and to make that handoff seamless — not to compete with services that have teams dedicated to them.

Integration done well is invisible. The family just gets where they're going.

---

## 6. Family First

Design for real families traveling together — with different ages, different roles, and different levels of involvement in the planning.

Not every family member wants to manage the itinerary. Some want to know the plan. Some want to help build it. Some want to be told where to be and when. Maycation should serve all of them without requiring uniform participation.

Shared plans mean shared responsibility. Maycation should make it easy to share both.

---

## 7. Calm Over Clever

Reduce stress. Never increase cognitive load.

A family managing travel logistics is already under pressure. Maycation should never add to that pressure — not with unnecessary notifications, not with complex navigation, not with unclear confirmations, not with options that create doubt.

Calm is not boring. Calm is confidence. A product that gives people confidence in their plan is more valuable than one that impresses them.

---

## 8. Product Drives the Design System

The design system evolves because the product needs it. Not the other way around.

The design system is infrastructure. Infrastructure serves the product. When a product need requires a new component, pattern, or token, the design system grows to meet it. The design system does not dictate what the product can and cannot build.

Phase 1 established the infrastructure. Phase 2 uses it.
