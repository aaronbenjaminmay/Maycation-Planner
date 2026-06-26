# Maycation — Feature Evaluation Framework

---

## Purpose

This document exists to prevent building unnecessary features.

The Product Opportunity Framework in [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) provides a quick six-question filter. This evaluation template is the full version — used when an opportunity from [PRODUCT_OPPORTUNITIES.md](./PRODUCT_OPPORTUNITIES.md) is being considered for the roadmap.

Complete this evaluation before committing to building anything. The discipline of writing it down surfaces assumptions, identifies risks, and often reveals that the problem is either smaller or larger than it initially appeared.

---

## When to Use This Template

Use this template when:

- An opportunity in PRODUCT_OPPORTUNITIES.md reaches "Exploring" or "Validated" status
- A new idea is proposed that has not yet been documented as an opportunity
- A previously deferred idea is being reconsidered

Do not use this template to advocate for a feature. Use it to honestly evaluate one.

---

## Evaluation Template

Copy this template for each evaluation. File evaluations alongside or linked from the relevant entry in PRODUCT_OPPORTUNITIES.md.

---

### Opportunity

*The title and a one-sentence description of the problem being addressed.*

---

### Problem

*What real-world problem exists? Describe it from the family's perspective, not from a product or engineering perspective.*

*Be specific. Vague problems produce vague solutions.*

---

### Current Workflow

*How do families accomplish this today?*

List the apps, websites, steps, and conversations involved. Count them.

- **Apps involved:**
- **Steps required:**
- **Who is responsible:**
- **What can go wrong:**

---

### What Work Disappears

*If this opportunity is addressed well, what does the family no longer have to do?*

*Describe the eliminated work, not the added capability. Subtraction is the goal.*

---

### Product Principles

Evaluate against each principle from [PRODUCT_PRINCIPLES.md](./PRODUCT_PRINCIPLES.md). Mark Yes, Partial, or No. A brief explanation is more useful than a bare rating.

| Principle | Rating | Note |
|-----------|--------|------|
| Reduce App Switching | | |
| Remove Steps | | |
| Plan Once | | |
| Context Over Complexity | | |
| Integrate, Don't Recreate | | |
| Family First | | |
| Calm Over Clever | | |

*If fewer than three principles rate Yes or Partial, this is a signal to reconsider.*

---

### Existing Product Fit

*Does this build on information Maycation already holds?*

The more an opportunity extends existing data — trips, days, planner items, members, addresses, timelines — the lower the incremental cost and the higher the coherence with the product.

| Data or capability | Already in Maycation? | Notes |
|---|---|---|
| Trip dates and location | | |
| Planner items with times | | |
| Member list and access | | |
| Addresses / destinations | | |
| Confirmation details | | |
| Travel legs | | |

*If the opportunity requires significant new data that Maycation does not currently hold, explain why collecting that data is worth the cost.*

---

### Build, Integrate, or Link

*Should Maycation:*

- **Build** this capability natively?
- **Integrate** an existing service via API?
- **Link** to another application at the appropriate moment?

Per [PRODUCT_PRINCIPLES.md](./PRODUCT_PRINCIPLES.md) — Integrate, Don't Recreate. Prefer integration whenever a best-in-class service already exists and can be accessed without degradation. Build natively only when integration is not possible or when the experience requires it to be first-class.

**Recommendation:**

**Rationale:**

---

### Maintenance Cost

*Estimate the long-term maintenance burden of adding this capability.*

| Level | What it means |
|-------|---------------|
| Low | Self-contained; changes to other parts of the product are unlikely to affect it |
| Medium | Depends on external data or APIs that may change; requires monitoring |
| High | Complex dependencies, external services with variable reliability, or ongoing curation required |

**Estimated cost:** Low / Medium / High

**Why:**

---

### Success Criteria

*How would we know this feature genuinely improved the experience?*

Use human outcomes, not technical metrics. "Fewer context switches" is more useful than "DAU increase." "Families arrive at travel days without confusion" is more useful than "session length."

List two or three specific observable outcomes that would indicate the feature is working.

1.
2.
3.

---

### Risks and Open Questions

*What is unknown? What assumptions are you making that could be wrong?*

List anything that would materially change the evaluation if the assumption turned out to be incorrect.

---

### Final Recommendation

Choose one:

**Build Now** — The problem is validated, the principles align, the fit is strong, and the maintenance cost is acceptable. Move to roadmap.

**Validate Further** — The problem is real but the solution approach is uncertain. Define a specific validation step before committing to build.

**Defer** — The problem is real but the timing is wrong, the dependencies are not in place, or higher-priority opportunities should be addressed first. Add to the Parking Lot in PRODUCT_OPPORTUNITIES.md with a note.

**Reject** — The problem does not meet the bar, the principles do not align, or the cost outweighs the benefit. Record the reasoning so the idea is not re-evaluated from scratch in the future.

**Recommendation:**

**Rationale:** *(Two to four sentences. Be direct. The reasoning is more valuable than the conclusion.)*

---

## Evaluation Integrity

The value of this framework depends on using it honestly.

**Complete evaluations for ideas you are skeptical of, not only for ideas you want to build.** A team that only evaluates promising ideas will accumulate bias toward building. A team that evaluates everything — including ideas it is uncomfortable rejecting — will make better decisions over time.

**A Reject decision is not a failure.** A well-reasoned rejection prevents wasted effort and keeps the product focused. Document the reasoning. Revisit it only when something material changes.

**Validate Further is not a delay tactic.** It is a commitment to a specific next step. Name the validation. Set a condition under which the evaluation will be revisited.

---

## Connection to the Roadmap

An opportunity with a "Build Now" recommendation moves to [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) as an active Phase 2 opportunity.

An opportunity with a "Defer" recommendation moves to the Parking Lot in [PRODUCT_OPPORTUNITIES.md](./PRODUCT_OPPORTUNITIES.md) with the evaluation rationale preserved.

An opportunity with a "Reject" recommendation stays in [PRODUCT_OPPORTUNITIES.md](./PRODUCT_OPPORTUNITIES.md) with status "Observed" and a note explaining why it was evaluated and rejected. This prevents the same idea from cycling through discovery repeatedly.
