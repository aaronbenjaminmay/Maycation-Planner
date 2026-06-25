# Maycation Design System — Roadmap

Current release: **v1.26.0 — CSS Token Parity**

v1.26.0 eliminated 11 hardcoded CSS values in App.css that already had generated design tokens. No new tokens, no Figma changes, no visual changes. v1.25.0 resolved all 36 deferred Tranche B token binding decisions from v1.24.0, adding 3 new primitive variables and binding 28 nodes.

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
| Token bridge (`tokens-bridge.css`) | ✅ Active | Legacy shorthand aliases; new code must use full token names |
| Storybook | ✅ | Foundation stories: Colors, Spacing & Radius, Typography |
| Figma variable collections | ✅ | Primitives and Semantic collections established |
| Documentation | ✅ | `DESIGN_SYSTEM.md`, `FIGMA_FOUNDATIONS.md`, `TOKEN_DEBT.md` |

---

## 3. Components

**Status: Complete**

All T1 Components are code-complete, Storybook-documented, and Code Connect–wired. See [DESIGN_SYSTEM.md — Component Inventory](./DESIGN_SYSTEM.md#component-inventory-t1) for the full list.

**Summary (18 components across 4 groups):**

- **General:** Badge, Button, CardSurface, FeedbackMessage, Icon, IconButton, ModalSheet
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

Active maintenance work identified during previous audits. Complete this before introducing new patterns or components.

### Code Connect for Patterns

**Goal:** Wire Code Connect for `DashboardCard`, `DetailHeader`, and `DayTile`.

**Why it matters:** Figma components currently have no Code Connect mapping. Without it, the Figma ↔ code link is visual-only — AI tools, design handoff, and design-to-code workflows cannot resolve Figma components to their code counterparts. All three patterns have stable APIs and Figma parity; they are ready to be wired.

**Expected outcome:** Three `.figma.tsx` Code Connect files. Each pattern's Figma component resolves to its React import in code.

---

### Component Token Layer (Layer 2)

**Goal:** Implement component-scoped tokens for core components (`card`, `button`, `input`, `badge`, `icon-button`, `modal`).

**Why it matters:** Currently, components reference semantic tokens directly (e.g., `CardSurface` uses `--color-surface-glass` inline). Layer 2 component tokens create an explicit contract between design and code, make per-component overrides safe, and complete the three-layer DTCG architecture described in [`FIGMA_FOUNDATIONS.md §1`](./FIGMA_FOUNDATIONS.md). This work should not begin until Code Connect is wired and the Figma variable foundation is validated against live components.

**Expected outcome:** `component.*` token namespace in `tokens/`, corresponding Figma variable collection, and updated component CSS to reference component tokens instead of semantic tokens directly.

---

### CSS Co-location Migration

**Goal:** Move component styles from `App.css` into co-located CSS files for each component.

**Why it matters:** Several T1 Components (`Button`, `CardSurface`, `IconButton`, `ModalSheet`, `ScreenHeader`, `PageControls`, `EmptyState`, `ProgressPill`, `StatusButton`) have their CSS in `App.css` rather than co-located files. This makes Storybook dependent on the full `App.css`, creates risk of cross-component selector conflicts, and couples component styles to product-screen layout rules. The migration is identified in `DESIGN_SYSTEM.md` under Future Storybook phases.

**Expected outcome:** Each component owns its own CSS file. `App.css` retains only product-screen layout, shell structure, and pattern utilities. Storybook no longer depends on App.css for component rendering.

---

### Remaining Token Migration Debt

**Goal:** Eliminate the last hardcoded values in `App.css` that predate the semantic token layer.

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
- `tokens-bridge.css` shorthand aliases remain active — new code must use full token names; the bridge itself should eventually be removed

**Expected outcome:** No hardcoded color or opacity values in component CSS. `tokens-bridge.css` removal plan drafted.

---

## 6. Future

Intentionally deferred. These are opportunities, not commitments. Do not pursue until System Health work is complete.

**Light mode.** The token architecture supports a second mode in Figma variable collections. No product requirement for light mode currently exists. If product requirements change, the Semantic token layer is the correct starting point.

**Additional patterns.** Candidates would emerge from product screens that stabilize around a reusable layout composition (e.g., a list item row, a settings section). No current candidates are ready for promotion.

**Expanded component library.** The T1 Component set covers current product needs. New components should only be added when a pattern or product screen cannot be built from existing components without duplication.

**Icon library expansion.** The current icon set covers active product usage. Additional icons should be added alongside the Code Connect wiring work so new icons enter the system with full tooling support from the start.
