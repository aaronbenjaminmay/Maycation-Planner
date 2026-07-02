# Maycation Design System

Last updated: v1.27.0 — CSS Co-location Wave 1 (2026-07-02)

## Component Classification

The design system uses a four-tier hierarchy aligned with DTCG token conventions and Figma component library conventions:

| Tier | Name | Storybook group | Description |
|------|------|-----------------|-------------|
| **T0** | Foundation | `Foundation/` | Design tokens, type scales, spacing scales, color systems. Not React components. |
| **T1** | Component | `Components/` | Domain-agnostic, fully reusable in any React app. No imports from `lib/`, no product-specific logic. Storybook-ready. |
| **T2** | Pattern | `Patterns/` | Opinionated composition of Components. Still domain-agnostic. Encodes Maycation layout conventions. |
| **T3** | Product | (not in Storybook) | Maycation-specific. Depends on product data shapes or mapping. Lives in `ui/` but carries domain knowledge. |

> **Note:** This replaces the prior P1/P2/P3 classification. "Primitives" has been retired as a Storybook group name. In DTCG terminology, colors, spacing, and tokens are the primitives — React components are Components.

---

## Component Inventory (T1)

Domain-agnostic components with no imports from `lib/`. All are Storybook-documented.

### General

| Component | File | CSS home | Storybook path |
|-----------|------|----------|----------------|
| `Badge` | `Badge.tsx` | `badge.css` | `Components/Badge` |
| `Button` | `Button.tsx` | `button.css` (v1.27.0) | `Components/Button` |
| `CardSurface` | `CardSurface.tsx` | `card-surface.css` (v1.27.0) | `Components/CardSurface` |
| `FeedbackMessage` | `FeedbackMessage.tsx` | `feedback-message.css` (v1.27.0) | `Components/Feedback/FeedbackMessage` |
| `Icon` | `Icon.tsx` | (inline SVG) | `Components/Icon` |
| `IconButton` | `IconButton.tsx` | `icon-button.css` (v1.27.0) | `Components/IconButton` |
| `ModalSheet` | `ModalSheet.tsx` | `modal-sheet.css` (v1.27.0) | `Components/ModalSheet` |
| `PlaceInput` | `PlaceInput.tsx` | `PlaceInput.css` | `Components/PlaceInput` |

### Forms

| Component | File | CSS home | Storybook path |
|-----------|------|----------|----------------|
| `FormActions` | `FormActions.tsx` | `forms.css` | `Components/Forms/FormActions` |
| `FormGrid` | `FormGrid.tsx` | `forms.css` | `Components/Forms/FormGrid` |
| `FormRow` | `FormRow.tsx` | `forms.css` | `Components/Forms/FormRow` |
| `SelectInput` | `SelectInput.tsx` | `forms.css` | `Components/Forms/SelectInput` |
| `TextArea` | `TextArea.tsx` | `forms.css` | `Components/Forms/TextArea` |
| `TextInput` | `TextInput.tsx` | `forms.css` | `Components/Forms/TextInput` |

### Navigation

| Component | File | CSS home | Storybook path |
|-----------|------|----------|----------------|
| `PageControls` | `PageControls.tsx` | `App.css §13` | `Components/Navigation/PageControls` |
| `ScreenHeader` | `ScreenHeader.tsx` | `App.css §8` | `Components/Navigation/ScreenHeader` |

### Feedback

| Component | File | CSS home | Storybook path |
|-----------|------|----------|----------------|
| `EmptyState` | `EmptyState.tsx` | `empty-state.css` (v1.27.0) | `Components/Feedback/EmptyState` |
| `ProgressPill` | `ProgressPill.tsx` | (via Badge) | `Components/Feedback/ProgressPill` |
| `StatusButton` | `StatusButton.tsx` | (via IconButton) | `Components/Feedback/StatusButton` |

---

## Pattern Inventory (T2)

Opinionated compositions of Components. Domain-agnostic but encode Maycation layout conventions.

| Component | File | CSS home | Storybook path | Composes | Figma |
|-----------|------|----------|----------------|----------|-------|
| `DashboardCard` | `DashboardCard.tsx` | `App.css §1, §3, §6, §7` | `Patterns/DashboardCard` | `CardSurface` | ✅ `04 Patterns` · Code Connect not wired |
| `DetailHeader` | `DetailHeader.tsx` | `App.css §4, §8` | `Patterns/DetailHeader` | `PageControls` (fixed overlay) + `ScreenHeader` (in-flow) | ✅ `04 Patterns` · Code Connect not wired |
| `DayTile` | `DayTile.tsx` | `App.css §3, §6, §7` | `Patterns/DayTile` | `CardSurface` + `Icon` + `ProgressPill` | ✅ `04 Patterns` · Code Connect not wired |

### DetailHeader composition note

`DetailHeader` has two structurally independent layers:

**PageControls** — `position: fixed`, rendered at `top: env(safe-area-inset-top) + var(--spacing-md)`, spanning the full viewport width. The inner pill is `max-width: 900px`, centered. It is not part of the `detail-header` document flow — the `gap` property on `.detail-header` has no effect on PageControls.

**ScreenHeader (in-flow)** — the only in-flow child of `header.detail-header`. Contains eyebrow, h1, and optional meta block. The `border-bottom` on `.detail-header` acts as the section divider and appears under the ScreenHeader content.

**Screen padding bridges the two layers.** `.dashboard-shell` applies `padding-top: calc(env(safe-area-inset-top) + var(--spacing-md) + var(--spacing-xs) * 2 + 40px + var(--spacing-md))` (~88px) to push the in-flow content below the fixed pill. DetailHeader itself does not control this gap.

**`action` prop routes to the pill, not to ScreenHeader.** The `action?: ReactNode` is passed to `PageControls trailing` — it appears in the top pill alongside the back button. `ScreenHeader.actions` is never used by DetailHeader.

**TripSettings uses `PageControls` directly** without DetailHeader — no ScreenHeader, no divider. PageControls is independently composable.

---

## Product Component Inventory (T3)

Components that carry Maycation domain knowledge. Not in Storybook.

Product screens and sub-components (`TripCard`, `ReservationCard`) live in `src/components/` and are not exported from `ui/index.ts`.

---

## CSS Ownership Rules

1. **Primitive CSS** belongs co-located with its component or in a dedicated stylesheet imported by that component (e.g., `badge.css`, `forms.css`). Never redefine Primitive classes in `App.css`.
2. **App.css** owns product-screen layout, shell structure, the visual system passes, and product-pattern utilities (`.upload-field`, `.page-controls`).
3. **Do not duplicate class definitions across files.** If a class appears in both `forms.css` and `App.css`, the `App.css` definition wins in the app but the `forms.css` definition wins in Storybook — a guaranteed conflict.
4. **Token variables** (`var(--color-*)`, `var(--spacing-*)`, etc.) are defined in `tokens/generated/tokens.css` via Style Dictionary. Use them everywhere; never hardcode color or spacing values.
5. **Use full token names everywhere.** `var(--color-*)`, `var(--spacing-*)`, etc. defined in `tokens/generated/tokens.css`. No compatibility bridge layer exists.

---

## Design System Convergence (v2.5.0)

Design System Convergence has two axes. Both are required before a component — or the system — can be called converged:

| Axis | Meaning | Status |
|---|---|---|
| **JSX ownership** | Product screens are assembled from design system components; no raw one-off UI. | ✅ Complete (2026-07 audit) |
| **CSS ownership** | Each component's presentation lives in a stylesheet the component owns and imports. | 🔶 In progress — Wave 1 complete (v1.27.0): Button, IconButton, CardSurface, FeedbackMessage, EmptyState, ModalSheet validated self-contained in Storybook without App.css. Waves 2–3 remain. |

The 2026-07 convergence audit confirmed the JSX axis is complete but found that nine T1/T2 components still derive their presentation from `App.css` (§1–§13 layered passes). Storybook currently renders these components correctly only because `.storybook/preview.ts` imports the entire `App.css` globally — meaning "Storybook is canonical" and "components own presentation" hold at the JSX level but not yet at the CSS level.

**Migration rule (applies to every co-location change):**

> Flatten the existing App.css cascade into a single canonical component stylesheet.
> Preserve behavior exactly.
> Do not optimize, redesign, rename selectors, or introduce new tokens during migration.
> Behavioral changes and visual cleanup are separate work.

**Validation strategy:** a component is considered converged only when it renders correctly in Storybook **without requiring `App.css` to be imported globally**. Storybook becomes progressively self-contained as each component is migrated.

Migration proceeds in three waves ordered by dependency depth (independent T1 → layout T1 → T2 patterns). See [DESIGN_SYSTEM_ROADMAP.md §5 — Phase 1](./DESIGN_SYSTEM_ROADMAP.md) for the wave assignments and sequencing rationale.

---

## Design Tokens

Token source: `tokens/` (DTCG format) → Style Dictionary pipeline → `tokens/generated/tokens.css`

Load order in `main.tsx`:
```
tokens.css → index.css → App.css
```
Component CSS (`forms.css`, `badge.css`) loads on first import via Vite's module graph.

Key semantic tokens:

| Token | Value | Use |
|-------|-------|-----|
| `--color-surface-glass` | `rgba(28, 28, 30, 0.72)` | Card/surface backgrounds |
| `--color-surface-badge` | `rgba(0, 0, 0, 0.22)` | Badge background (v1.8.0) |
| `--color-surface-feedback-neutral` | `rgba(255, 255, 255, 0.05)` | FeedbackMessage neutral background (v1.8.0) |
| `--color-border-glass` | `rgba(255, 255, 255, 0.08)` | Card/surface borders |
| `--color-overlay-default` | `rgba(0, 0, 0, 0.78)` | Modal backdrop |
| `--color-info-border` | `#3483fa` | Badge --info tone border (v1.7.0) |
| `--color-warning-border` | `#f2a93b` | Badge --warning / ProgressPill --attention border (v1.7.0) |
| `--color-secondary-border` | `#9b8cff` | Badge --secondary tone border (v1.7.0) |
| `--color-success-surface` | `rgba(53, 184, 168, 0.08)` | FeedbackMessage --success background (v1.8.0) |
| `--color-success-border` | `rgba(53, 184, 168, 0.30)` | FeedbackMessage --success border (v1.8.0) |
| `--color-success-text` | `#35b8a8` | FeedbackMessage --success text (v1.8.0) |
| `--color-text-primary` | `#f5f7fb` | Body / label text |
| `--color-text-muted` | `#a1a1a6` | Muted metadata text; use `.muted` utility class |
| `--opacity-disabled-default` | `0.65` | Disabled component state (v1.8.0) |
| `--opacity-interactive-hover` | `0.08` | Hover overlay fill — Button, IconButton (v1.10.0) |
| `--opacity-interactive-hover-border` | `0.22` | Hover border opacity — Button, IconButton (v1.25.0) |
| `--opacity-interactive-primary-hover` | `0.14` | Primary button hover brightening overlay (v1.25.0) |
| `--opacity-header-image-overlay` | `0.52` | Trip header background image dim overlay |
| `--radius-lg` | `20px` | Card radius |
| `--radius-full` | `999px` | Pill radius |
| `--shadow-md` | `0 18px 50px 0 rgba(0,0,0,0.26)` | Panel elevation |
| `--shadow-sm` | `0 10px 28px 0 rgba(0,0,0,0.34)` | Card elevation |
| `--spacing-xs / sm / md / lg / xl` | — | Consistent spacing |
| `--typography-label-*` | — | Label font size/weight/tracking |

---

## Design Principles

See [DESIGN_SYSTEM_PRINCIPLES.md](./DESIGN_SYSTEM_PRINCIPLES.md) for the full set of design and implementation principles. The CSS-specific rules are summarized below for inline reference.

**One canonical definition per class.** Every selector must have exactly one source-of-truth file.

**Primitives have no domain imports.** A component in `src/components/ui/` must not import from `src/lib/`.

**Tokens before hardcoded values.** Check `tokens/generated/tokens.css` before writing any color, shadow, spacing, or radius value.

**App.css is layered by design.** `App.css` has multiple refinement passes (§1–13). Later passes override earlier ones. Do not remove an early-pass definition without verifying the later-pass override covers all the same selectors.

**No feature flags or compatibility shims.** Delete CSS completely when a class or component is removed.

**Opacity Handling Rule.** Primitive colors are always opaque. Use composited `rgba()` in CSS, not element-level `opacity:` on containers. Use opaque primitives + separate `Opacity/*` variable in Figma. Element-level opacity is acceptable only for: disabled state, pseudo-element overlays, and standalone backdrop elements with no text children. See [FIGMA_FOUNDATIONS.md §8](./FIGMA_FOUNDATIONS.md) for the full implementation table.

---

## App.css Section Map

| § | Name | Key classes |
|---|------|-------------|
| 1 | App shells, auth screen, product cards/lists | `.app-shell`, `.auth-panel`, `.mode-toggle`, `.settings-panel` |
| 3 | Trip dashboard screen | `.trip-dashboard`, `.trip-intel-card`, `.trip-destination-grid` |
| 4 | Day detail screen | `.day-detail-screen`, `.planner-item-card` |
| 5 | Visual system v1 | mode-toggle glass pass, travel-estimate (FeedbackMessage rules moved to `feedback-message.css` v1.27.0) |
| 6 | Disney Mayhem production-aligned visual system | Full visual overhaul pass |
| 7 | Visual system consolidation | Canonical surface rules (`.card-surface`/`.modal-sheet` entries moved to co-located CSS v1.27.0; product/pattern list raised to class specificity) |
| 8 | Shared authenticated page shell (canonical) | `.page-shell`, `.dashboard-shell` |
| 9 | Login screen wordmark and mobile fixes | `.auth-wordmark`, mobile overrides |
| 10–11 | *(removed v1.27.0)* | Button/IconButton styles moved to `button.css` / `icon-button.css` |
| 12 | Trip background image system | `.dashboard-shell.has-trip-bg`, `::before`/`::after` layers |
| 13 | Upload field and PageControls | `.upload-field`, `.page-controls` |

---

## Known Token Migration Debt

**v1.8.0 Token Architecture Phase 2** resolved: FeedbackMessage success tokens, disabled opacity wiring, neutral surface opacity tokens (Badge + FeedbackMessage neutral), and muted color cleanup. See `docs/TOKEN_DEBT.md` for all resolved entries.

**v1.7.0 Token Architecture Phase 1** resolved the highest-priority item: Badge no longer depends on product-domain tokens. See `docs/TOKEN_DEBT.md`.

These hardcoded values remain as of v1.27.0 (Wave 1 moved the Button/IconButton values verbatim into their co-located files — locations updated, debt unchanged). See [TOKEN_DEBT.md](./TOKEN_DEBT.md) for the full resolution history.

| Value | Location | Status |
|-------|----------|--------|
| `#a1a1a6` (SVG only) | `forms.css select.form-control background-image` | Cannot fix — URL-encoded SVG stroke in data URI; browser limitation |
| `rgba(255, 255, 255, 0.12)` | `button.css`, `icon-button.css` base border | No semantic token yet |
| `rgba(28, 28, 30, 0.84)` | `button.css`, `icon-button.css` base background | No semantic token yet |
| `rgba(28, 28, 30, 0.68/0.76/0.62)` | `.trip-intel-card`, `.planner-item-card` backgrounds (App.css) | Intentional variants; no tokens for these off-scale glass opacities |
| `#fff` | Trip intel card and day tile text (App.css) | No pure-white text semantic token; `--color-text-primary` is `#f5f7fb` |
| `color-mix()` primary hover | `button.css` / `icon-button.css` `--primary:hover` | `var(--opacity-interactive-primary-hover)` exists; no simpler token-driven form available |

Inline `rgba()` values in CSS for **intentional surface variants** are **intentional** per the Opacity Handling Rule. `--color-surface-glass` is itself the rgba composite (`rgba(28,28,30,0.72)`) and is used directly in §7 `:where()` blocks. Intentional variants (`trip-intel-card` 0.68, `planner-item-card` 0.76, `.trip-dashboard .day-tile` contextual shadow) remain as inline `rgba()` with documentation comments. Each composite rgba in CSS should have a comment in the format:
```css
/* Color/[primitive] × Opacity/[semantic] */
background: rgba(...);
```

---

## Storybook

**Status as of v1.5.0:** Active. Full design system coverage complete.

**Location:** Run `npm run storybook` — served at `http://localhost:6006`

**Framework:** Storybook 10 + `@storybook/react-vite`

**Story files:** `src/stories/**/*.stories.tsx`

**Total entries:** 99 stories across 25 groups

### Storybook structure (v1.5.0)

```
Foundation/
  Colors                 — All semantic color tokens as labeled swatches
  Spacing & Radius       — Spacing scale bars + radius token demos
  Typography             — Eyebrow, label, caption, body, heading type styles

Components/
  Badge                  — All tone variants
  Button                 — Primary, secondary, destructive, disabled
  CardSurface            — Static, interactive, as button
  FeedbackMessage        — Neutral, error, success
  Icon                   — Full catalog (21 icons) + size variants
  IconButton             — All variants + selected/disabled states
  ModalSheet             — Default, with eyebrow, with form content
  Forms/
    FormActions          — Cancel/save, leading delete, destructive confirm
    FormGrid             — Two-column, odd field count, date range
    FormRow              — Text, select, textarea children
    SelectInput          — Default, hint, disabled
    TextArea             — Default, empty, hint, taller, disabled
    TextInput            — Default, placeholder, hint, email, password, disabled
  Navigation/
    PageControls         — Back/add, back only, back/settings, with save
    ScreenHeader         — Title, eyebrow, meta, actions, all slots
  Feedback/
    EmptyState           — Title only, with body, with action, full
    ProgressPill         — In progress, complete, needs attention
    StatusButton         — Incomplete, complete, read-only, disabled

Patterns/
  DashboardCard          — Static, subtitle, eyebrow, interactive, meta, gallery
  DetailHeader           — Back+title, eyebrow, trailing action, settings, all slots
  DayTile                — With date, with subtitle, no progress, complete, icon gallery

Docs/
  Design Principles      — 7 principles from PROJECT_CONSTITUTION.md
  Component Classification — Foundation/Component/Pattern/Product taxonomy
```

### What's intentionally excluded

- All product screens (trip flows, dashboard, reservations, planner items)
- All Supabase-connected components

### Global CSS setup

`.storybook/preview.ts` imports CSS in the same order as `main.tsx`:
```
tokens/generated/tokens.css → src/index.css → src/App.css
```
Components with co-located CSS (`badge.css`, `forms.css`) load automatically when imported.

### Future Storybook phases

Ordered per the v2.5.0 System Health phases (see [DESIGN_SYSTEM_ROADMAP.md §5](./DESIGN_SYSTEM_ROADMAP.md)):

**Phase 1 — CSS Co-location Migration (primary initiative of v2.5.0):** Migrate component styles from `App.css` to co-located CSS files, in three dependency-ordered waves. This removes the `App.css` dependency from Storybook's global imports and makes each component self-contained. Success criterion: components render correctly in Storybook without `App.css` imported globally. See [Design System Convergence](#design-system-convergence-v250) above for the migration rule.

**Phase 2 — Component Token Layer:** Component-scoped tokens land in the consolidated co-located CSS produced by Phase 1.

**Phase 3 — Code Connect for remaining T1 Components and T2 Patterns:** Wire Code Connect for EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls, and the three patterns (DashboardCard, DetailHeader, DayTile). Icon is separately deferred (known Storybook rendering defect). PlaceInput is deferred until its Figma component is created (Place Intelligence Phase 5). May proceed in parallel with Phases 1–2 where convenient; it blocks nothing.
