# Maycation Design System

Last updated: v1.6.0

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

Domain-agnostic components with no imports from `lib/`. All are Storybook-documented as of v1.5.0.

### General

| Component | File | CSS home | Storybook path |
|-----------|------|----------|----------------|
| `Badge` | `Badge.tsx` | `badge.css` | `Components/Badge` |
| `Button` | `Button.tsx` | `App.css §10` | `Components/Button` |
| `CardSurface` | `CardSurface.tsx` | `App.css §5–7` | `Components/CardSurface` |
| `FeedbackMessage` | `FeedbackMessage.tsx` | `forms.css` | `Components/FeedbackMessage` |
| `Icon` | `Icon.tsx` | (inline SVG) | `Components/Icon` |
| `IconButton` | `IconButton.tsx` | `App.css §11` | `Components/IconButton` |
| `ModalSheet` | `ModalSheet.tsx` | `App.css §7–8` | `Components/ModalSheet` |

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
| `EmptyState` | `EmptyState.tsx` | `App.css` | `Components/Feedback/EmptyState` |
| `ProgressPill` | `ProgressPill.tsx` | (via Badge) | `Components/Feedback/ProgressPill` |
| `StatusButton` | `StatusButton.tsx` | (via IconButton) | `Components/Feedback/StatusButton` |

---

## Pattern Inventory (T2)

Opinionated compositions of Components. Domain-agnostic but encode Maycation layout conventions.

| Component | File | CSS home | Storybook path | Composes |
|-----------|------|----------|----------------|----------|
| `DashboardCard` | `DashboardCard.tsx` | `App.css §3` | `Patterns/DashboardCard` | `CardSurface` |
| `DetailHeader` | `DetailHeader.tsx` | `App.css §4, §8` | `Patterns/DetailHeader` | `PageControls` + `ScreenHeader` |

---

## Product Component Inventory (T3)

Components that carry Maycation domain knowledge. Not in Storybook.

| Component | File | Notes |
|-----------|------|-------|
| `DayTile` | `DayTile.tsx` | Icon-to-day-type mapping lives in `TripDetail.tsx` |

Product screens and sub-components (`TripCard`, `ReservationCard`) live in `src/components/` and are not exported from `ui/index.ts`.

---

## CSS Ownership Rules

1. **Primitive CSS** belongs co-located with its component or in a dedicated stylesheet imported by that component (e.g., `badge.css`, `forms.css`). Never redefine Primitive classes in `App.css`.
2. **App.css** owns product-screen layout, shell structure, the visual system passes, and product-pattern utilities (`.upload-field`, `.page-controls`).
3. **Do not duplicate class definitions across files.** If a class appears in both `forms.css` and `App.css`, the `App.css` definition wins in the app but the `forms.css` definition wins in Storybook — a guaranteed conflict.
4. **Token variables** (`var(--color-*)`, `var(--spacing-*)`, etc.) are defined in `tokens/generated/tokens.css` via Style Dictionary. Use them everywhere; never hardcode color or spacing values.
5. **tokens-bridge.css** maps legacy shorthand variables (`--text`, `--border`, `--accent`) to token names. This bridge is active. New code must use full token names, not bridge shorthands.

---

## Design Tokens

Token source: `tokens/` (DTCG format) → Style Dictionary pipeline → `tokens/generated/tokens.css`

Load order in `main.tsx`:
```
tokens.css → index.css → tokens-bridge.css → App.css
```
Component CSS (`forms.css`, `badge.css`) loads on first import via Vite's module graph.

Key semantic tokens:

| Token | Value | Use |
|-------|-------|-----|
| `--color-surface-glass` | `rgba(28, 28, 30, 0.74)` | Card/surface backgrounds |
| `--color-border-glass` | `rgba(255, 255, 255, 0.08)` | Card/surface borders |
| `--color-overlay-default` | `rgba(0, 0, 0, 0.78)` | Modal backdrop |
| `--color-info-border` | `#3483fa` | Badge --info tone border (v1.7.0) |
| `--color-warning-border` | `#f2a93b` | Badge --warning / ProgressPill --attention border (v1.7.0) |
| `--color-secondary-border` | `#9b8cff` | Badge --secondary tone border (v1.7.0) |
| `--color-text-primary` | `#f5f7fb` | Body / label text |
| `--color-text-muted` | — | Use `.muted` utility class |
| `--radius-lg` | `20px` | Card radius |
| `--radius-full` | `999px` | Pill radius |
| `--shadow-md` | `0 12px 34px 0 rgba(0,0,0,0.36)` | Modal/sheet elevation |
| `--shadow-sm` | `0 10px 28px 0 rgba(0,0,0,0.34)` | Card elevation |
| `--spacing-xs / sm / md / lg / xl` | — | Consistent spacing |
| `--typography-label-*` | — | Label font size/weight/tracking |

---

## Design Principles

**1. One canonical definition per class.**
Every selector must have exactly one source-of-truth file. Duplication across `App.css` and component CSS is a bug, not a convention.

**2. Primitives have no domain imports.**
A component in `src/components/ui/` must not import from `src/lib/`. Domain mappings (e.g., `dayTypeIconMap`) belong in the product screen that uses the component.

**3. Tokens before hardcoded values.**
Before writing any color, shadow, spacing, or radius value, check `tokens/generated/tokens.css`. Use the token. Only hardcode if a token genuinely does not exist and you are prepared to add one.

**4. App.css is layered by design.**
`App.css` has multiple refinement passes (§1–13). Later passes override earlier ones. This is intentional for the current migration phase. Do not remove an early-pass definition without verifying the later-pass override covers all the same selectors.

**5. No feature flags or compatibility shims.**
When a class or component is removed, delete all its CSS. Do not leave commented-out rules or `.old-*` aliases.

**6. Opacity Handling Rule.**
Maycation models opacity as a design-system primitive, but Figma and CSS express it differently.

*In Figma:*
- Use opaque color primitives (`Color/Neutral 800`, `Color/White`, `Color/Black`).
- Apply opacity as a separate `Opacity/*` variable at the paint/fill/stroke layer (not element-level opacity).
- Example: `CardSurface` fill = `Color/Neutral 800` + fill opacity = `Opacity/Surface/Glass` (0.74).

*In CSS:*
- Do **not** use `opacity:` on container components (cards, modals, buttons, inputs) to simulate surface transparency — it affects all children and dims text.
- Use composited `rgba()` values directly so text and child elements remain fully opaque.
- Document any composited `rgba()` value with the primitive color and opacity token it represents.
- Example:
  ```css
  /* Color/Neutral 800 × Opacity/Surface/Glass (0.74) */
  background: rgba(28, 28, 30, 0.74);
  ```
- Element-level `opacity:` is acceptable for: disabled state (entire component dims uniformly), pseudo-element overlays, and standalone backdrop elements with no text children.

---

## App.css Section Map

| § | Name | Key classes |
|---|------|-------------|
| 1 | App shells | `.app-shell`, `.app-shell--auth` |
| 2 | Auth screen | `.auth-panel`, login form layout |
| 3 | Trip dashboard screen | `.trip-dashboard`, `.dashboard-card`, `.trip-destination-grid` |
| 4 | Day detail screen | `.day-detail-screen`, `.planner-item-card` |
| 5 | Visual system v1 | Original `:where()` glass-surface definitions |
| 6 | Disney Mayhem production-aligned visual system | Full visual overhaul pass |
| 7 | Visual system consolidation | Canonical `:where()` blocks using tokens |
| 8 | Shared authenticated page shell (canonical) | `.page-shell`, `.dashboard-shell` |
| 9 | Login screen wordmark and mobile fixes | `.wordmark`, mobile overrides |
| 10 | Button component styles | `.button`, `.button--*` |
| 11 | IconButton component styles | `.icon-button`, `.icon-button--*` |
| 12 | Trip background image system | `.dashboard-shell.has-trip-bg`, `::before`/`::after` layers |
| 13 | Upload field and PageControls | `.upload-field`, `.page-controls` |

---

## Known Token Migration Debt

**v1.7.0 Token Architecture Phase 1** resolved the highest-priority item: Badge no longer depends on product-domain tokens (`color.role.editor`, `color.role.viewer`, `color.kind.reservation`). Three semantic token families were added: `color.info.border`, `color.warning.border`, `color.secondary.border`. See `docs/TOKEN_DEBT.md` for the resolved entry.

These hardcoded values remain in `App.css` and are candidates for future token migration:

| Value | Location | Notes |
|-------|----------|-------|
| `#35b8a8` | Early passes | Old accent color; superseded by `--accent` in newer passes |
| `#a1a1a6` | `.muted`, `.day-tile__icon`, `.trip-intel-card dt` | Should become `var(--color-text-muted)` once token is confirmed |
| `rgba(255, 255, 255, 0.08)` | Early passes (15+ occurrences) | Now superseded by `var(--color-border-glass)` in §7 |
| `rgba(0, 0, 0, 0.52)` | `.dashboard-shell.has-trip-bg::after` | Trip image overlay; use `var(--opacity-header-image-overlay)` when migrating (pseudo-element, so element opacity is acceptable) |
| Button/icon-button hover backgrounds | `rgba(255, 255, 255, 0.08–0.14)` | Use as fill overlay layer per Opacity Handling Rule; `var(--opacity-interactive-hover)` available |

Inline `rgba()` values in CSS for glass surfaces (`rgba(28,28,30,0.74)`, `rgba(255,255,255,0.08)`, etc.) are **intentional** per the Opacity Handling Rule — do not replace them with `var(--color-surface-glass)` (which is now opaque) without also applying the rgba composition. Each composite rgba in CSS should have a comment in the format:
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

Docs/
  Design Principles      — 7 principles from PROJECT_CONSTITUTION.md
  Component Classification — Foundation/Component/Pattern/Product taxonomy
```

### What's intentionally excluded

- `DayTile` — T3 Product Component; icon-to-day-type mapping is product-specific
- All product screens (trip flows, dashboard, reservations, planner items)
- All Supabase-connected components

### Global CSS setup

`.storybook/preview.ts` imports CSS in the same order as `main.tsx`:
```
tokens/generated/tokens.css → src/index.css → src/tokens-bridge.css → src/App.css
```
Components with co-located CSS (`badge.css`, `forms.css`) load automatically when imported.

### Future Storybook phases

**v1.6.0 — Figma Foundations:** Token architecture, variable collection structure, Figma-to-code mapping, and Accent Blue decision. See [docs/FIGMA_FOUNDATIONS.md](./FIGMA_FOUNDATIONS.md) for the full specification.

**v1.x.0 — CSS Migration:** Migrate component styles from `App.css` to co-located CSS files. This removes the `App.css` dependency from Storybook's global imports and makes each component self-contained.
