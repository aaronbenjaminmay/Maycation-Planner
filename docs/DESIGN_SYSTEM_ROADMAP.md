# Maycation Design System — Roadmap

Current release: **v1.27.0 — CSS Co-location Wave 1**

v1.27.0 co-located CSS for all six Wave 1 independent T1 components (Button, IconButton, CardSurface, FeedbackMessage, EmptyState, ModalSheet). Each component now owns its presentation in a co-located stylesheet and renders correctly in Storybook without `App.css` imported globally. App.css §10 and §11 removed. v1.26.0 eliminated 11 hardcoded CSS values in App.css.

---

## 1. Vision

The Maycation Design System is the single source of truth for UI across code, Storybook, and Figma. Its purpose is to make UI decisions once and express them consistently in all three representations.

**Goals:**

- **Consistency.** Components, tokens, and patterns behave identically in the app, in Storybook, and in Figma.
- **Parity.** Code → Storybook → Figma is a maintained chain. Changes in one are reflected in all three.
- **AI readiness.** Code Connect wiring enables AI-assisted design-to-code and code-to-design workflows. Without it, Figma components are visual-only.
- **Reusability.** T1 Components compose into T2 Patterns. Neither tier carries product domain logic. Product screens (T3) consume patterns, not the reverse.
- **Subtraction over addition.** The system grows only when a gap is clearly identified. New components, tokens, and patterns are added only after existing work is complete and stable.

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for the full tier classification and component inventory.

---

## 2. Foundation

**Status: Complete**

The foundational layer is established and stable. See [FIGMA_FOUNDATIONS.md](./FIGMA_FOUNDATIONS.md) for detailed specifications.

| Area | Status | Notes |
|------|--------|-------|
| Design Tokens (DTCG) | ✅ | Three-layer: Primitive → Semantic → Component (Layer 2 deferred) |
| Style Dictionary pipeline | ✅ | `tokens/` → `tokens/generated/tokens.css` |
| Semantic variables | ✅ | Full color, opacity, spacing, radius, shadow, typography scale |
| Token bridge (`tokens-bridge.css`) | ✅ Removed | Retired v2.3.0 — all call sites migrated to full semantic token names |
| Storybook | ✅ | Foundation stories: Colors, Spacing & Radius, Typography |
| Figma variable collections | ✅ | Primitives and Semantic collections established |
| Documentation | ✅ | `DESIGN_SYSTEM.md`, `FIGMA_FOUNDATIONS.md`, `TOKEN_DEBT.md` |

---

## 3. Components

**Status: Complete (Code Connect partially wired)**

All 19 T1 Components are code-complete and Storybook-documented. 11 of 19 have Code Connect wired. 8 are not yet wired: EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls, Icon (deferred — known Storybook rendering defect), PlaceInput (deferred — Figma component pending Place Intelligence Phase 5). See [DESIGN_SYSTEM.md — Component Inventory](./DESIGN_SYSTEM.md#component-inventory-t1) for the full list and Code Connect status.

**Summary (19 components across 4 groups):**

- **General:** Badge, Button, CardSurface, FeedbackMessage, Icon, IconButton, ModalSheet, PlaceInput
- **Forms:** FormActions, FormGrid, FormRow, SelectInput, TextArea, TextInput
- **Navigation:** PageControls, ScreenHeader
- **Feedback:** EmptyState, ProgressPill, StatusButton

---

## 4. Patterns

**Status: Active**

Patterns are opinionated compositions of T1 Components. They encode Maycation layout conventions without carrying product domain logic. See [DESIGN_SYSTEM.md — Pattern Inventory](./DESIGN_SYSTEM.md#pattern-inventory-t2).

### DashboardCard

Titled card pattern built on `CardSurface`. Adds eyebrow, title, subtitle, and a flex-wrapped meta slot.

- [x] Code
- [x] Storybook
- [x] Documentation
- [x] Figma
- [ ] Code Connect

### DetailHeader

Canonical detail-screen header. Composes `PageControls` (fixed pill) + `ScreenHeader` (in-flow).

- [x] Code
- [x] Storybook
- [x] Documentation
- [x] Figma
- [ ] Code Connect

### DayTile

Interactive card tile for trip days. Composes `CardSurface` + `Icon` + `ProgressPill`. Promoted from T3 in v1.22.0; Figma pattern completed in v1.23.0.

- [x] Code
- [x] Storybook
- [x] Documentation
- [x] Figma
- [ ] Code Connect

---

## 5. System Health

Active maintenance work. Complete this before introducing new patterns or components.

**Ordering (revised 2026-07 for v2.5.0 — Design System Convergence):** the convergence audit found that JSX-level convergence is complete — every product screen is assembled from design system components — but CSS-level convergence is not. Nine T1/T2 components still derive their presentation from `App.css`, and Storybook renders them correctly only because `.storybook/preview.ts` imports the entire application stylesheet. CSS Co-location is therefore the **primary architectural initiative of v2.5.0**, not a medium-priority cleanup task. System Health work proceeds in this order:

| Phase | Initiative | Rationale |
|---|---|---|
| **1** | CSS Co-location Migration | Convergence blocker. Components must own their presentation in fact, not only in JSX, before anything layers on top. |
| **2** | Component Token Layer (Layer 2) | Component tokens land in consolidated, co-located component CSS. Requires Phase 1. |
| **3** | Code Connect completion (T1 + Patterns) | Tooling parity. Valuable, but changes nothing about how the app is assembled. May proceed in parallel where convenient; it blocks nothing. |

---

### Phase 1 — CSS Co-location Migration (primary initiative of v2.5.0)

**Goal:** Move component styles from `App.css` into co-located CSS files so that each design system component owns its presentation.

**Why it is Phase 1:** True Design System Convergence requires both:

- **JSX ownership** — screens are assembled from design system components. **Complete.**
- **CSS ownership** — each component's presentation lives in a stylesheet it owns. **In progress.**

Until CSS ownership is complete, "Storybook is canonical" and "components own presentation" hold at the JSX level but not at the CSS level: a component renders correctly in Storybook only because the full `App.css` — all of its layered visual system passes — is loaded globally behind it.

**Migration rule:**

> Flatten the existing App.css cascade into a single canonical component stylesheet.
> Preserve behavior exactly.
> Do not optimize, redesign, rename selectors, or introduce new tokens during migration.
> Behavioral changes and visual cleanup are separate work.

**Validation strategy:** A component is considered converged only when it renders correctly in Storybook **without requiring `App.css` to be imported globally**. Storybook becomes progressively self-contained as each component is migrated.

**Migration waves — ordered by dependency depth, not component popularity:**

**Wave 1 — Independent T1 components. ✅ Complete (v1.27.0).** All six components co-located and validated in Storybook without `App.css`.

| Component | CSS home |
|---|---|
| Button | `src/components/ui/button.css` |
| IconButton | `src/components/ui/icon-button.css` |
| CardSurface | `src/components/ui/card-surface.css` |
| FeedbackMessage | `src/components/ui/feedback-message.css` |
| EmptyState | `src/components/ui/empty-state.css` |
| ModalSheet | `src/components/ui/modal-sheet.css` |

> `ProgressPill` and `StatusButton` have no CSS of their own (they render through Badge and IconButton classes) — they converge automatically with `badge.css` (already co-located) and Wave 1 IconButton. `Icon` uses inline SVG only.

**Wave 2 — Layout T1 components.** Their CSS interacts with page-shell structure (ScreenHeader's divider under `.detail-header`, PageControls' fixed positioning against the `.dashboard-shell` padding bridge). Migrating them requires boundary decisions between component ownership and product-shell ownership, so they follow the mechanical Wave 1 migrations.

| Component | Current CSS home |
|---|---|
| ScreenHeader | `App.css §8` |
| PageControls | `App.css §13` |
| FormActions | `forms.css` — *already co-located, but selectors are scoped under `.form-body`, which is defined in `App.css`. Wave 2 severs that dependency; no file move needed.* |
| FormGrid | `forms.css` — *same `.form-body` dependency as FormActions* |

**Wave 3 — T2 patterns.** Compose Wave 1/2 components and are the most entangled in the `App.css` §5–§7 layered passes. They can only validate as self-contained once the T1 CSS they compose is already co-located — the deepest dependency migrates last.

| Pattern | Current CSS home |
|---|---|
| DashboardCard | `App.css §1, §3, §6, §7` |
| DetailHeader | `App.css §4, §8` |
| DayTile | `App.css §3, §6, §7` |

**Expected outcome:** Each component owns its own CSS file. `App.css` retains only product-screen layout, shell structure, and product-pattern utilities. `.storybook/preview.ts` no longer imports `App.css`. Documented intentional contextual variants (e.g., the `.trip-dashboard .day-tile` shadow) remain in `App.css` as product-context overrides, with their tracking in [`TOKEN_DEBT.md`](./TOKEN_DEBT.md) unchanged.

---

### Phase 2 — Component Token Layer (Layer 2)

**Goal:** Implement component-scoped tokens for core components (`card`, `button`, `input`, `badge`, `icon-button`, `modal`).

**Why it matters:** Currently, components reference semantic tokens directly (e.g., `CardSurface` uses `--color-surface-glass` inline). Layer 2 component tokens create an explicit contract between design and code, make per-component overrides safe, and complete the three-layer DTCG architecture described in [`FIGMA_FOUNDATIONS.md §1`](./FIGMA_FOUNDATIONS.md). This work must not begin until CSS co-location (Phase 1) is complete: component tokens land in consolidated, co-located component CSS — introducing them while a component's presentation is still spread across `App.css` passes would bind tokens to a cascade that is about to be flattened.

**Expected outcome:** `component.*` token namespace in `tokens/`, corresponding Figma variable collection, and updated co-located component CSS to reference component tokens instead of semantic tokens directly.

---

### Phase 3 — Code Connect Completion

**Goal:** Wire Code Connect for the remaining T1 Components (EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls) and all three T2 Patterns (`DashboardCard`, `DetailHeader`, `DayTile`).

**Why it matters:** Without Code Connect, the Figma ↔ code link for these components is visual-only — AI tools, design handoff, and design-to-code workflows cannot resolve Figma components to their code counterparts. This work mirrors what is already done for the 11 wired components. It is sequenced last because it is design-tooling parity: it improves the Figma → code bridge but changes nothing about how the application is assembled, and it depends on nothing in Phases 1–2 (it may proceed in parallel where convenient).

**Scope:** Icon is excluded — its Storybook rendering defect must be resolved first (tracked in project memory). PlaceInput Code Connect is deferred until its Figma component is created (Place Intelligence Phase 5).

**Expected outcome:** 9 new `.figma.tsx` files. 17 of 19 T1 Components and 3 of 3 T2 Patterns fully wired (Icon and PlaceInput remain deferred).

---

### Remaining Token Migration Debt

**Goal:** Eliminate the last hardcoded values in `App.css` that predate the semantic token layer.

**Interaction with Phase 1:** per the migration rule, CSS co-location moves these values **verbatim** into co-located component stylesheets — it does not resolve them. Debt entries that travel with a component (e.g., Button/IconButton base border and background) remain tracked in [`TOKEN_DEBT.md`](./TOKEN_DEBT.md) with updated locations. Resolving them is Phase 2 (Component Token Layer) or separate token work, never a side effect of migration.

**Why it matters:** These values bypass the token pipeline, cannot be updated via Style Dictionary, and are invisible to Figma. They are tracked in [`TOKEN_DEBT.md`](./TOKEN_DEBT.md) and in `DESIGN_SYSTEM.md` under Known Token Migration Debt.

**Outstanding items (post v1.26.0):**
- `Button` and `IconButton` base border (`rgba(255,255,255,0.12)`) — no semantic token yet
- `Button` and `IconButton` base background (`rgba(28,28,30,0.84)`) — no semantic token yet
- `Button` primary hover overlay — `var(--opacity-interactive-primary-hover)` exists (v1.25.0); `color-mix()` usage is already clean; no simpler token-driven form possible
- `#fff` text on trip intel card and day tiles — no pure-white text token; `--color-text-primary` is `#f5f7fb` (near-white, not exact)
- `rgba(53,184,168,0.08)` ambient gradient in `.app-shell` — value matches `--color-success-surface` but semantic context (decorative glow) differs
- `rgba(0,0,0,0.22)` mode-toggle background — value matches `--color-surface-badge` but semantic context differs
- `rgba(28,28,30,0.68/0.76/0.62)` card backgrounds — intentional variants; no tokens exist for these off-scale glass opacities
- `rgba(255,255,255,0.04)` header-img-preview — closest is `--color-surface-feedback-neutral` (0.05), not exact
- `rgba(0,0,0,0.4)` day-tile shadow — intentional contextual variant; no matching token
**Expected outcome:** No hardcoded color or opacity values in component CSS.

---

## 6. Phase 2 — Product Evolution

The Design System Foundation (Phase 1) is complete as of v1.26.0. Phase 2 begins once System Health work is done. Phase 2 shifts focus from building the design system to using it for product development.

In Phase 2 the design system is a stable, maintained foundation — not an active construction site. Changes are additive, not architectural. New product features use existing components and patterns.

**Planned work for Phase 2:**

**Light mode.** The token architecture supports a second mode in Figma variable collections. No product requirement for light mode currently exists. The Semantic token layer is the correct starting point when this changes.

**Additional patterns.** Candidates emerge from product screens that stabilize around a reusable layout composition. No current candidates are ready for promotion.

**Expanded component library.** New components are added only when a pattern or product screen cannot be built from existing components without duplication.

**Icon library expansion.** Add alongside Code Connect wiring work so new icons enter the system with full tooling support from day one.

**Product feature development.** Trip planning workflows, collaboration features, and UX refinement on the stable design system foundation.
