# Maycation Design System

Last updated: v1.3.0

## Component Classification

Components in `src/components/ui/` are classified into three tiers:

| Tier | Name | Description |
|------|------|-------------|
| **P1** | Primitive | Domain-agnostic, fully reusable in any React app. No imports from `lib/`, no product-specific logic. Storybook-ready. |
| **P2** | Pattern | Opinionated layout or composition that is still domain-agnostic. May import other Primitives. |
| **P3** | Product Component | Maycation-specific. Lives in `ui/` for now but depends on product shape or mapping. Should migrate toward `components/` if coupling grows. |

---

## Primitive Inventory (P1)

These components have no imports from `lib/` and carry no product domain knowledge.

| Component | File | CSS home | Notes |
|-----------|------|----------|-------|
| `Badge` | `Badge.tsx` | `badge.css` | Tone variants via prop |
| `Button` | `Button.tsx` | `App.css §10` | Primary, destructive variants |
| `CardSurface` | `CardSurface.tsx` | `App.css §5–7` | Polymorphic `as` prop |
| `EmptyState` | `EmptyState.tsx` | `App.css` | Optional `action` slot |
| `FeedbackMessage` | `FeedbackMessage.tsx` | `forms.css` | Error/success inline feedback |
| `FormActions` | `FormActions.tsx` | `forms.css` | Button row for form footers |
| `FormGrid` | `FormGrid.tsx` | `forms.css` | 2-column responsive field layout |
| `FormRow` | `FormRow.tsx` | `forms.css` | Label + input + hint wrapper |
| `Icon` | `Icon.tsx` | (inline SVG) | `IconName` union type is the icon registry |
| `IconButton` | `IconButton.tsx` | `App.css §11` | Variants: primary, destructive, complete |
| `ModalSheet` | `ModalSheet.tsx` | `App.css §7–8` | Bottom-sheet dialog |
| `PageControls` | `PageControls.tsx` | `App.css §13` | Sticky bottom nav bar |
| `ProgressPill` | `ProgressPill.tsx` | `App.css` | Completion count display |
| `ScreenHeader` | `ScreenHeader.tsx` | `App.css §8` | Top nav bar with back button |
| `SelectInput` | `SelectInput.tsx` | `forms.css` | Styled `<select>` |
| `StatusButton` | `StatusButton.tsx` | `App.css` | Checkbox-style toggle button |
| `TextArea` | `TextArea.tsx` | `forms.css` | Styled `<textarea>` |
| `TextInput` | `TextInput.tsx` | `forms.css` | Styled `<input>` |

---

## Pattern Inventory (P2)

Opinionated layout components that compose Primitives but remain domain-agnostic.

| Component | File | CSS home | Notes |
|-----------|------|----------|-------|
| `DashboardCard` | `DashboardCard.tsx` | `App.css §3` | Stat/summary card |
| `DetailHeader` | `DetailHeader.tsx` | `App.css §4` | Back-nav + title + action slot |

---

## Product Component Inventory (P3)

Components that carry Maycation-specific knowledge or visual conventions.

| Component | File | CSS home | Notes |
|-----------|------|----------|-------|
| `DayTile` | `DayTile.tsx` | `App.css` | Accepts `iconName?: IconName`; icon-to-day-type mapping lives in `TripDetail.tsx` |

Product screens (`TripCard`, `ReservationCard` sub-component) live in `src/components/` and are not exported from `ui/index.ts`.

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

## Known Token Migration Debt (v1.3.0)

These hardcoded values remain in `App.css` and are candidates for future token migration:

| Value | Location | Notes |
|-------|----------|-------|
| `#35b8a8` | Early passes | Old accent color; superseded by `--accent` in newer passes |
| `#a1a1a6` | `.muted`, `.day-tile__icon`, `.trip-intel-card dt` | Should become `var(--color-text-muted)` once token is confirmed |
| `#0a84ff` | `.trip-intel-card__header span` | Possibly intentional blue accent; needs design decision |
| `rgba(255, 255, 255, 0.08)` | Early passes (15+ occurrences) | Now superseded by `var(--color-border-glass)` in §7 |
| `rgba(0, 0, 0, 0.52)` | `.dashboard-shell.has-trip-bg::after` | Background overlay; no token exists for this specific use |
| Button/icon-button hover backgrounds | `rgba(255, 255, 255, 0.08)` | No token for interactive hover state; needs new token |

---

## Storybook

**Status as of v1.4.0:** Active. Storybook is installed and documented.

**Location:** Run `npm run storybook` — served at `http://localhost:6006`

**Framework:** Storybook 10 + `@storybook/react-vite`

**Story files:** `src/stories/**/*.stories.tsx`

### What's in v1.4.0

**Foundation stories** (`Foundation/` group in Storybook):
- `Colors` — All semantic color tokens as labeled swatches
- `Typography` — Eyebrow, label, caption, body, and heading type styles
- `Spacing & Radius` — Spacing scale bars + radius token demos

**Primitive stories** (`Primitives/` group in Storybook):
- `Button` — Primary, secondary, destructive, disabled variants
- `IconButton` — Default, primary, destructive, complete (unselected/selected), disabled variants
- `Icon` — Full icon catalog + size variants
- `CardSurface` — Static div, interactive div, button form
- `ModalSheet` — Default, with eyebrow, with form content
- `Badge` — All tone variants (neutral, accent, info, secondary, warning, danger)
- `FeedbackMessage` — Neutral, error, success tones

### What's intentionally excluded from v1.4.0

- `DayTile` — P3 Product Component; Maycation-specific layout
- `DashboardCard` — P2 Pattern; not yet story-ready without product context
- `DetailHeader`, `ScreenHeader` — P2 Patterns; require layout context to be meaningful
- `PageControls` — App-shell navigation; product-coupled
- `ProgressPill`, `StatusButton`, `EmptyState` — Deferred to v1.5.0
- All form primitives (`FormRow`, `TextInput`, `SelectInput`, `TextArea`, etc.) — Deferred to v1.5.0 forms sprint
- Product screens, trip flows, dashboard pages, Supabase-connected components

### Global CSS setup

`.storybook/preview.ts` imports CSS in the same order as `main.tsx`:
```
tokens/generated/tokens.css → src/index.css → src/tokens-bridge.css → src/App.css
```
Components with co-located CSS (`badge.css`, `forms.css`) load automatically when imported.

### Future Storybook phases

**v1.5.0 — Form Primitives:** Stories for `FormRow`, `TextInput`, `SelectInput`, `TextArea`, `FormGrid`, `FormActions`, `FeedbackMessage`.

**v1.6.0 — Patterns & Layout:** Stories for `ScreenHeader`, `DetailHeader`, `DashboardCard`, `ProgressPill`, `StatusButton`, `EmptyState`.

**v1.x.0 — CSS Migration:** Migrate component styles from `App.css` to co-located CSS files. This removes the `App.css` dependency from Storybook's global imports and makes each component self-contained.
