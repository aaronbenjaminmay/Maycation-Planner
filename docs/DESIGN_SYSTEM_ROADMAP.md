# Maycation Design System — Roadmap

Current release: **ds/v1.30.1 — Component Token Layer**

ds/v1.30.1 introduced the Component token layer (DTCG Layer 2): `tokens/source/component.tokens.json` defines 6 namespaces (card, modal, badge, input, button, icon-button), each aliasing existing Semantic tokens for a component's base recipe (background, border, radius, and shadow/color where applicable). CardSurface, ModalSheet, Badge, the shared form-control input, Button, and IconButton now reference these component tokens instead of Semantic tokens directly. Button and IconButton's base border and background remain unaliased — no Semantic token exists for them yet, tracked in `TOKEN_DEBT.md`. Zero visual change; verified via Storybook computed-style checks across all 8 consuming components. This completes Phase 2 of v2.5.0 System Health.

ds/v1.30.0 completed Phase 3 — Code Connect for the remaining 6 priority T1 components (EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls) and all 3 T2 Patterns (DashboardCard, DetailHeader, DayTile): 9 new `.figma.tsx` files, published to Figma. 17 of 19 T1 Components and 3 of 3 T2 Patterns are now wired; Icon and PlaceInput remain deferred.

v1.29.0 co-located CSS for all three T2 Patterns (DashboardCard, DetailHeader, DayTile), completing the CSS Co-location Migration (Phase 1 of v2.5.0 Design System Convergence). Each pattern now owns its uncontested presentation in a co-located stylesheet and renders correctly in Storybook without `App.css` imported globally. `.trip-dashboard .day-tile` and `.page-shell > .detail-header` remain in `App.css` as intentional, documented product-context overrides — Wave 3 changed CSS ownership, not behavior. v1.28.0 completed Wave 2 (ScreenHeader, PageControls, FormActions, FormGrid); v1.27.0 completed Wave 1 (Button, IconButton, CardSurface, FeedbackMessage, EmptyState, ModalSheet); v1.26.0 eliminated 11 hardcoded CSS values in App.css.

All three v2.5.0 System Health phases (CSS Co-location, Component Token Layer, Code Connect completion) are now complete. A final Design System Convergence audit has not yet been performed to formally close v2.5.0.

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
| Design Tokens (DTCG) | ✅ | Three-layer: Primitive → Semantic → Component (Layer 2 base recipe implemented, ds/v1.30.1) |
| Style Dictionary pipeline | ✅ | `tokens/` → `tokens/generated/tokens.css` |
| Semantic variables | ✅ | Full color, opacity, spacing, radius, shadow, typography scale |
| Token bridge (`tokens-bridge.css`) | ✅ Removed | Retired v2.3.0 — all call sites migrated to full semantic token names |
| Storybook | ✅ | Foundation stories: Colors, Spacing & Radius, Typography |
| Figma variable collections | ✅ | Primitives and Semantic collections established |
| Documentation | ✅ | `DESIGN_SYSTEM.md`, `FIGMA_FOUNDATIONS.md`, `TOKEN_DEBT.md` |

---

## 3. Components

**Status: Complete (Code Connect wired 17 of 19)**

All 19 T1 Components are code-complete and Storybook-documented. 17 of 19 have Code Connect wired (ds/v1.30.0 wired the last 6: EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls). 2 remain deferred: Icon (known Storybook rendering defect), PlaceInput (Figma component pending Place Intelligence Phase 5). See [DESIGN_SYSTEM.md — Component Inventory](./DESIGN_SYSTEM.md#component-inventory-t1) for the full list and Code Connect status.

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
- [x] Code Connect

### DetailHeader

Canonical detail-screen header. Composes `PageControls` (fixed pill) + `ScreenHeader` (in-flow).

- [x] Code
- [x] Storybook
- [x] Documentation
- [x] Figma
- [x] Code Connect

### DayTile

Interactive card tile for trip days. Composes `CardSurface` + `Icon` + `ProgressPill`. Promoted from T3 in v1.22.0; Figma pattern completed in v1.23.0.

- [x] Code
- [x] Storybook
- [x] Documentation
- [x] Figma
- [x] Code Connect

---

## 5. System Health

Active maintenance work. Complete this before introducing new patterns or components.

**Ordering (revised 2026-07 for v2.5.0 — Design System Convergence):** the convergence audit found that JSX-level convergence is complete — every product screen is assembled from design system components — but CSS-level convergence was not. Nine T1/T2 components derived their presentation from `App.css`, and Storybook rendered them correctly only because `.storybook/preview.ts` imported the entire application stylesheet. CSS Co-location was therefore the **primary architectural initiative of v2.5.0**, not a medium-priority cleanup task. System Health work proceeds in this order:

| Phase | Initiative | Rationale |
|---|---|---|
| **1** | CSS Co-location Migration | ✅ **Complete (v1.29.0).** Convergence blocker. Components must own their presentation in fact, not only in JSX, before anything layers on top. |
| **2** | Component Token Layer (Layer 2) | ✅ **Complete (ds/v1.30.1).** Component tokens landed in consolidated, co-located component CSS. |
| **3** | Code Connect completion (T1 + Patterns) | ✅ **Complete (ds/v1.30.0).** Tooling parity — improves the Figma ↔ code bridge; changes nothing about how the app is assembled. |

---

### Phase 1 — CSS Co-location Migration ✅ Complete (v1.29.0)

**Goal:** Move component styles from `App.css` into co-located CSS files so that each design system component owns its presentation.

**Why it was Phase 1:** True Design System Convergence requires both:

- **JSX ownership** — screens are assembled from design system components. **Complete.**
- **CSS ownership** — each component's presentation lives in a stylesheet it owns. **Complete (v1.29.0).**

Before this phase, "Storybook is canonical" and "components own presentation" held at the JSX level but not at the CSS level: a component rendered correctly in Storybook only because the full `App.css` — all of its layered visual system passes — was loaded globally behind it. All 13 migrated components (9 T1 + 3 T2, excluding the CSS-free `ProgressPill`/`StatusButton`/`Icon`) now render correctly in Storybook with `App.css` commented out of `.storybook/preview.ts` — verified per-component during Waves 1–3. The import itself remains in `preview.ts` because shared typography utilities (`.eyebrow`, `.muted`, `.label`) and documented product-context overrides (e.g. `.trip-dashboard .day-tile`, `.page-shell > .detail-header`) are intentionally still product-owned in `App.css`.

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

**Wave 3 — T2 patterns. ✅ Complete (v1.29.0).** Composed Wave 1/2 components and were the most entangled in the `App.css` §1, §3–§8 layered passes. Each pattern's uncontested presentation is now co-located; each pattern's product-context composition (rendering inside `.trip-dashboard` or `.page-shell`) intentionally remains in `App.css`, per the Wave 3 audit's ownership-boundary decisions.

| Pattern | CSS home | Product-context rules remaining in `App.css` |
|---|---|---|
| DashboardCard | `src/components/ui/dashboard-card.css` | `.trip-card` (TripCard's `className` extension), `.settings-panel` (unrelated product class formerly compounded for shared values) |
| DetailHeader | `src/components/ui/detail-header.css` | `.page-shell > .detail-header` (shell-level padding/border override, same relationship as ScreenHeader's Wave 2 treatment), `.day-detail-screen .detail-header` (Day Detail's 18px gap, preserved exactly — not normalized to the 12px used elsewhere) |
| DayTile | `src/components/ui/day-tile.css` | `.trip-dashboard .day-tile` and its `__content`/`__icon`/`__date`/`h2`/`__summary` descendants — DayTile's only production consumer always renders inside `.trip-dashboard`, which overrides this file's `display:grid` with `display:flex; align-items:center` plus a heavier contextual shadow (tracked in [`TOKEN_DEBT.md`](./TOKEN_DEBT.md)). Per Wave 3 decision, that layout is **not** promoted into the pattern merely because it is the only current consumer. |

**Outcome:** Each pattern owns its own CSS file. `App.css` retains only product-screen layout, shell structure, product-pattern utilities, and the documented composition/product overrides listed above. `.storybook/preview.ts` still imports `App.css` globally (for shared typography utilities `.eyebrow`/`.muted`/`.label` and the product-context rules above), but every migrated component now renders its own presentation correctly with that import removed — verified individually per component. Documented intentional contextual variants (e.g., the `.trip-dashboard .day-tile` shadow) remain in `App.css` as product-context overrides, with their tracking in [`TOKEN_DEBT.md`](./TOKEN_DEBT.md) unchanged.

---

### Phase 2 — Component Token Layer (Layer 2) ✅ Complete (ds/v1.30.1)

**Goal:** Implement component-scoped tokens for core components (`card`, `button`, `input`, `badge`, `icon-button`, `modal`).

**Why it mattered:** Previously, components referenced semantic tokens directly (e.g., `CardSurface` used `--color-surface-glass` inline). Layer 2 component tokens create an explicit contract between design and code, make per-component overrides safe, and complete the three-layer DTCG architecture described in [`FIGMA_FOUNDATIONS.md §1`](./FIGMA_FOUNDATIONS.md). This work was blocked on CSS co-location (Phase 1), completed as of v1.29.0.

**Outcome:** `tokens/source/component.tokens.json` introduces a `component.*` namespace with 6 groups — `card`, `modal`, `badge`, `input`, `button`, `icon-button` — each aliasing an existing Semantic token for that component's base recipe (background, border, radius, and shadow/color where applicable). Every alias resolves to a value byte-identical to what the component used before migration — zero visual change, verified via Storybook computed-style checks across all 8 consuming components (CardSurface, ModalSheet, Badge, TextInput, SelectInput, TextArea, Button, IconButton). `sd.config.mjs` required no changes — its glob-based source and primitive-exclusion filter already picked up the new file correctly.

**Scope boundary — intentionally not covered:** Button and IconButton's base border and background remain direct literal values (`rgba(255,255,255,0.12)` and `rgba(28,28,30,0.84)`) because no Semantic token exists for them. A Component token must alias a Semantic token, not a bare literal — creating one here would have meant inventing a Semantic token as an undocumented side effect, which the migration rule explicitly forbids. These two properties remain tracked in [`TOKEN_DEBT.md`](./TOKEN_DEBT.md), unchanged. Variant/tone-specific tokens (Button/IconButton primary/secondary/destructive colors, Badge tone borders, IconButton's `--complete` state) were also out of scope — the namespace covers each component's base recipe only.

**Figma:** The corresponding Figma `Component` variable collection (`FIGMA_FOUNDATIONS.md §5`, Collection 4) was not created — this phase was code-only. Figma parity for the Component layer remains future work.

---

### Phase 3 — Code Connect Completion ✅ Complete (ds/v1.30.0)

**Goal:** Wire Code Connect for the remaining T1 Components (EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls) and all three T2 Patterns (`DashboardCard`, `DetailHeader`, `DayTile`).

**Why it mattered:** Without Code Connect, the Figma ↔ code link for these components was visual-only — AI tools, design handoff, and design-to-code workflows could not resolve Figma components to their code counterparts. This work mirrors what was already done for the 11 previously-wired components. It was design-tooling parity: it improves the Figma → code bridge but changes nothing about how the application is assembled, and it depended on nothing in Phases 1–2.

**Scope:** Icon remains excluded — its Storybook rendering defect must be resolved first (tracked in project memory). PlaceInput Code Connect remains deferred until its Figma component is created (Place Intelligence Phase 5).

**Outcome:** 9 new `.figma.tsx` files, published to Figma. 17 of 19 T1 Components and 3 of 3 T2 Patterns fully wired (Icon and PlaceInput remain deferred).

---

### Remaining Token Migration Debt

**Goal:** Eliminate the last hardcoded values in `App.css` that predate the semantic token layer.

**Interaction with Phase 1 (complete as of v1.29.0):** per the migration rule, CSS co-location moved values **verbatim** into co-located component stylesheets — it did not resolve them. Debt entries that traveled with a component (e.g., Button/IconButton base border and background) remain tracked in [`TOKEN_DEBT.md`](./TOKEN_DEBT.md) with updated locations. The two Wave 3 debt items (`#fff` day-tile/trip-intel text, `rgba(0,0,0,0.4)` day-tile shadow) did not relocate — both belong to `.trip-dashboard .day-tile`, which stayed in `App.css` as documented product-context ownership.

**Interaction with Phase 2 (complete as of ds/v1.30.1):** the Component Token Layer intentionally did not resolve the Button/IconButton base border and background debt — a Component token must alias an existing Semantic token, and none exists for either value. Resolving these two items now requires either a deliberate new Semantic token or dedicated token work; it is not a side effect of any planned phase.

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
