# Maycation Project State

> Canonical onboarding document for new Claude sessions. Reflects repository state as of Design System ds/v1.30.1 / Product v2.4.0 (July 2026). Verify against the repository before acting on specific details — this document may lag behind recent commits.

---

## Documentation Precedence

When documentation sources conflict, this order determines which is authoritative:

1. **PROJECT_CONSTITUTION.md** — Permanent engineering, architecture, UX, and design system rules. These never change without deliberate intent.
2. **PROJECT_STATE.md** (this document) — Current implementation state, versioning, and milestone.
3. **docs/DESIGN_SYSTEM.md** — Component inventory, token architecture, and Storybook parity.
4. **docs/product/PRODUCT_ROADMAP.md** — Product opportunity areas and evolution direction.
5. **docs/architecture/** — Implementation details for individual systems.
6. **Storybook** — Canonical component behavior. If Storybook and a doc disagree on component API, Storybook wins.
7. **Existing implementation** — If no documentation covers a case, the live code is the current truth.

---

## Last Verified

| Field | Value |
|---|---|
| Product version | v2.4.0 |
| Design System version | ds/v1.30.1 — Component Token Layer |
| Current milestone | v2.5.0 — Design System Convergence (all three System Health phases complete — CSS Co-location Migration, Component Token Layer, Code Connect completion; final convergence audit not yet performed) |
| Previous milestone | v2.4.0 — Reservation Place Intelligence (complete) |
| Verification date | 2026-07-07 |

---

## 1. Project Overview

Maycation Planner is a family trip planning single-page application. It is the successor to an earlier app called **Disney Mayhem**, which is the UX and visual design benchmark for the project. Maycation preserves Disney Mayhem's strengths — calm, focused, assumption-of-context — while rebuilding on a scalable foundation with explicit domain models, shared components, and a mature design system.

The app is deployed to GitHub Pages at `https://aaronbenjaminmay.github.io/Maycation-Planner`.

This is a personal project. The governing authority documents are:
- `PROJECT_CONSTITUTION.md` — UI and implementation guardrails (wins for UI decisions)
- `PROJECT_PLAN.md` — product vision, business rules, data models (wins for product/architecture decisions)
- `README.md` — setup and workflow (informational)

---

## 2. Technology

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19 |
| Language | TypeScript | ~6.0.2 |
| Build tool | Vite | 8 |
| Backend | Supabase JS | ^2.107.0 |
| Icons | lucide-react | ^1.17.0 |
| Component docs | Storybook | 10 |
| Figma bridge | @figma/code-connect | ^1.4.8 |
| Token pipeline | style-dictionary | ^5.4.4 |
| Deployment | gh-pages | — |

There is **no routing library**. Navigation is state-based inside `App.tsx`. Auth is email/password (Supabase Auth). Authenticated users land on `TripsDashboard`, which holds state for the full navigation tree.

All Supabase table writes go through `security definer` RPCs — no direct client table mutations anywhere in the codebase. This is a hard architectural rule.

The Mapbox access token is consumed only via `Deno.env.get('MAPBOX_ACCESS_TOKEN')` inside Edge Functions. There are zero Mapbox references in `src/`. The Supabase anon key must not be committed.

---

## 3. Architecture

### Navigation model

```
App.tsx
  └─ Auth state
       ├─ unauthenticated → sign-in / sign-up form
       └─ authenticated → TripsDashboard
            └─ TripDetail (trip selected)
                 ├─ DayDetail (day selected)
                 ├─ TripReservations (reservations tile)
                 ├─ TripStays (stays tile)
                 └─ TripSettings (settings icon)
```

Each "screen" is a full component swap — no `<Route>` or URL change.

### Data layer

`src/lib/` contains all data access functions. Each module maps to one domain:

| Module | Domain |
|---|---|
| `trips.ts` | Trip, TripDay, PlannerItem, types |
| `stays.ts` | TripStay, CRUD, `formatStayDateRange`, `getActiveStayForDay` |
| `places.ts` | PlaceSuggestion, PlaceValue, PlaceInputQuickPick, `searchPlaces`, `getTravelDurationMinutes` |
| `tripMembers.ts` | Role loading, invite flow |
| `auth.ts` | Sign-in, sign-up, sign-out |
| `supabaseClient.ts` | Singleton Supabase client |

### Supabase

27 migrations (`001_initial_schema.sql` → `027_trip_stays.sql`). Three Edge Functions:
- `search-places` — Mapbox place search proxy; supports Geocoding v5 and Search Box v1 via `PLACE_SEARCH_PROVIDER` dispatch
- `get-travel-duration` — Mapbox directions proxy
- `send-invite-email` — trip invitation emails

RLS is enabled on all tables. RPCs enforce authorization beyond RLS as defense-in-depth.

### Key types

```typescript
Trip            // id, name, starts_on, ends_on, destination, background_path, header_image_path, timezone
TripDay         // id, trip_id, date (YYYY-MM-DD), day_type, label, sort_order
PlannerItem     // id, trip_day_id, kind, title, starts_at, ends_at, metadata (JSONB)
TripStay        // id, trip_id, place_name, check_in_date, check_out_date, place_lat, place_lng, ...
PlaceValue      // name, address, coordinates?: { lat, lng }
```

`TripDayType`: `'activity' | 'travel' | 'relax' | 'explore' | 'special'`
`PlannerItemKind`: `'activity' | 'reservation' | 'travel' | 'note'` (inferred from file)
`TripMemberRole`: `'owner' | 'editor' | 'viewer'`

### Place Intelligence

Place Intelligence is a shared platform consumed by both Travel and Reservation planner items. `PlaceInput` accepts user search queries and returns a `PlaceValue`. Coordinates flow from the selected result through to stored metadata, enabling downstream derivations.

`PlaceInputQuickPick` provides pre-resolved `PlaceValue` objects (no search required). Used in `AddPlannerItemForm` to surface "Current Stay" as an origin for Travel items.

**Reservation Place Intelligence** (v2.4.0): The Reservation form uses `PlaceInput` for the Location field. Selecting a place auto-populates the Title (if empty), sets Location and Address, stores destination coordinates in `metadata.destination_place_lat/lng`, and hides the manual Address field when coordinates are resolved. Manual entry remains fully supported.

**Provider dispatch**: `search-places` Edge Function dispatches to one of two Mapbox backends based on the `PLACE_SEARCH_PROVIDER` secret:
- `searchbox` → Mapbox Search Box v1 `/forward` (current production active)
- absent or any other value → Mapbox Geocoding v5 (fallback)

See `docs/architecture/PLACE_INTELLIGENCE_ARCHITECTURE.md` for rollback procedure and provider detail.

Data flow:
```
PlaceInput → search-places Edge Function → Mapbox (Search Box v1 or Geocoding v5)
PlaceValue.coordinates → metadata.destination_place_lat/lng (reservations)
PlaceValue.coordinates → metadata.start_place_lat/lng (travel origins)
getActiveStayForDay() → PlaceInputQuickPick → AddPlannerItemForm (travel origin quick pick)
PlaceInputQuickPick.value → get-travel-duration → estimated drive time
```

### Temporal Intelligence

Items belong to the day they **start**, not when they end. An overnight drive departing Day 4 at 11 PM belongs to Day 4.

- `starts_at` — ISO timestamp always anchored to the owner day
- `ends_at` — any timestamp ≥ `starts_at`; values with `end_time_minutes ≥ 1440` produce next-day arrivals
- `end_time_minutes` is the canonical end-time parameter in RPCs (replaces `end_time time`)
- "Next day" label is display-only, derived from `starts_at`/`ends_at` comparison; never stored

Limitation: the comparison uses browser local timezone, not the trip's `timezone` field. Full timezone-aware comparison is deferred.

### Stay Intelligence

`trip_stays` stores continuous lodging bookings. Date range uses a **half-open interval `[check_in_date, check_out_date)`** — family sleeps at the property from `check_in_date` through `check_out_date - 1`, leaves on `check_out_date`. This enables same-day hotel switches with no overlap and no gap.

Overlap validation is enforced in the `create_trip_stay` and `update_trip_stay` RPCs.

`getActiveStayForDay(stays, dayDate)` computes the active stay for a calendar date using string comparison (ISO date strings sort correctly).

### Derivation Engine

A general pattern for durable trip facts that generate optional planner items. Stay Intelligence is the first implementation.

Core rules:
- Derived items carry `metadata.derived_from_{fact}` (soft reference, no FK) and `managed_by_maycation: true`
- `managed_by_maycation` becomes `false` when the user edits the item — it is then user-owned and not auto-synced
- No auto-sync on fact update; instead, a one-time sync offer is surfaced
- No cascade delete; deletion prompt handled in client before calling the delete RPC
- Source fact and derived items have independent lifecycles

---

## 4. Design System

### Version

**Design System: ds/v1.30.1 — Component Token Layer**

### Token Architecture (DTCG three-layer)

| Layer | Status | Location |
|---|---|---|
| Primitives | Complete | `tokens/` → `tokens/generated/tokens.css` |
| Semantic | Complete | Full color, opacity, spacing, radius, shadow, typography |
| Component | Started (ds/v1.30.1) | `tokens/source/component.tokens.json` — 6 namespaces (card, modal, badge, input, button, icon-button), base recipe only (background, border, radius, shadow/color where applicable). Button/IconButton base border and background remain unaliased — no Semantic token exists for them yet. |

**Opacity rule**: Always use `rgba()` composites on CSS surfaces. Never apply element-level `opacity` to containers. Figma: use opaque color + paint-layer opacity float.

Pipeline: `tokens/*.json` → Style Dictionary (`sd.config.mjs`) → `tokens/generated/tokens.css`

### Component Classification

| Tier | Description |
|---|---|
| T0 Foundation | Design tokens, type/spacing/color scales. Not React components. |
| T1 Component | Domain-agnostic, fully reusable. Storybook-documented. No `lib/` imports. |
| T2 Pattern | Opinionated T1 compositions. Domain-agnostic. Encodes Maycation layout conventions. |
| T3 Product | Maycation-specific. Carries domain knowledge. Not in Storybook. |

### T1 Components (19 total)

**General**: Badge, Button, CardSurface, FeedbackMessage, Icon, IconButton, ModalSheet, PlaceInput
**Forms**: FormActions, FormGrid, FormRow, SelectInput, TextArea, TextInput
**Navigation**: PageControls, ScreenHeader
**Feedback**: EmptyState, ProgressPill, StatusButton

Code Connect wired: **17 of 19** (Badge, Button, CardSurface, FeedbackMessage, FormRow, IconButton, ModalSheet, ProgressPill, SelectInput, TextArea, TextInput, EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls — last six wired ds/v1.30.0)
Not yet wired: Icon (deferred — known Storybook rendering defect), PlaceInput (deferred — Figma component pending Place Intelligence Phase 5)

### T2 Patterns (3 total)

| Pattern | CSS home | Composes | Figma | Code Connect |
|---|---|---|---|---|
| DashboardCard | `dashboard-card.css` (v1.29.0) | CardSurface | ✅ | Wired (ds/v1.30.0) |
| DetailHeader | `detail-header.css` (v1.29.0) | PageControls (fixed) + ScreenHeader (in-flow) | ✅ | Wired (ds/v1.30.0) |
| DayTile | `day-tile.css` (v1.29.0) | CardSurface + Icon + ProgressPill | ✅ | Wired (ds/v1.30.0) |

Each pattern's product-context composition rules intentionally remain in `App.css`: `.trip-card`/`.settings-panel` (DashboardCard), `.page-shell > .detail-header`/`.day-detail-screen .detail-header` (DetailHeader), `.trip-dashboard .day-tile` and its descendants (DayTile). See `docs/DESIGN_SYSTEM_ROADMAP.md` §5 Phase 1 — Wave 3 for the full per-selector ownership rationale.

### CSS Ownership Status

| Wave | Components | Status |
|---|---|---|
| **Wave 1** — Independent T1 | Button, IconButton, CardSurface, FeedbackMessage, EmptyState, ModalSheet | ✅ Complete (v1.27.0) |
| **Wave 2** — Layout T1 | ScreenHeader, PageControls, FormActions, FormGrid | ✅ Complete (v1.28.0) |
| **Wave 3** — T2 Patterns | DashboardCard, DetailHeader, DayTile | ✅ Complete (v1.29.0) |

A component is considered converged only when it renders correctly in Storybook **without** `App.css` imported globally. All 13 migrated components (Waves 1–3) pass this criterion. `.storybook/preview.ts` still imports `App.css` globally — it now serves only shared typography utilities (`.eyebrow`, `.muted`, `.label`) and the documented product-context overrides listed above, not any migrated component's own presentation.

### App.css Section Map

App.css is the primary CSS file. It is organized into named sections (§1–§13). Wave 1 components (Button, IconButton, CardSurface, FeedbackMessage, EmptyState, ModalSheet) own co-located CSS files; §10–11 replaced with a pointer comment. Wave 2 components (ScreenHeader, PageControls, FormActions, FormGrid) own co-located CSS files. Wave 3 patterns (DashboardCard, DetailHeader, DayTile) own co-located CSS files; App.css retains only their product-context composition overrides (`.trip-card`, `.settings-panel`, `.page-shell > .detail-header`, `.day-detail-screen .detail-header`, `.trip-dashboard .day-tile` and descendants). The CSS Co-location Migration (Phase 1 of v2.5.0) is complete.

### Storybook

Storybook is the canonical component implementation. What Storybook shows defines how a component behaves. Figma mirrors Storybook, not the reverse. 99+ stories across 25+ groups.

### CSS ownership

Components own all visual styling (layout, spacing, radius, borders, typography, states). Product screens own content, state, data, business logic, and event handlers. Screens must not own visual styling.

### Convergence status (2026-07 audit; updated 2026-07-04 for Wave 3 completion)

Design System Convergence has two axes:

| Axis | Status |
|---|---|
| **JSX ownership** — screens assembled from design system components | ✅ Complete. All product screens import from the design system barrel; no raw one-off UI remains beyond documented product patterns (hidden file inputs in the upload field, auth mode-toggle). |
| **CSS ownership** — each component's presentation in a stylesheet it owns | ✅ Complete (v1.29.0). Wave 1: Button, IconButton, CardSurface, FeedbackMessage, EmptyState, ModalSheet (v1.27.0). Wave 2: ScreenHeader, PageControls, FormActions, FormGrid (v1.28.0). Wave 3: DashboardCard, DetailHeader, DayTile (v1.29.0). All 13 each own a co-located stylesheet and render in Storybook without `App.css`. |

A component counts as converged only when it renders correctly in Storybook **without** `App.css` imported globally. The CSS Co-location Migration (three dependency-ordered waves) was the primary architectural initiative of v2.5.0 Phase 1 — now complete. See `docs/DESIGN_SYSTEM_ROADMAP.md` §5 Phase 1. Phase 2 (Component Token Layer) and Phase 3 (Code Connect completion) remain open.

---

## 5. Product Status

### Screens implemented

| Screen | Component | Status |
|---|---|---|
| Sign in / Sign up | `App.tsx` inline | Complete |
| My Trips dashboard | `TripsDashboard.tsx` | Complete |
| Trip Detail (day grid) | `TripDetail.tsx` | Complete |
| Day Detail | `DayDetail.tsx` | Complete |
| Add/Edit Planner Item | `AddPlannerItemForm.tsx` | Complete |
| Trip Reservations | `TripReservations.tsx` | Complete |
| Trip Stays | `TripStays.tsx` | Complete |
| Trip Settings | `TripSettings.tsx` | Complete |

### Intelligence systems

| System | Phase | Status |
|---|---|---|
| Place Intelligence | Travel: search, PlaceInput, quick picks, travel duration | Complete |
| Place Intelligence | Reservation: PlaceInput in reservation form, coordinate storage | Complete |
| Place Intelligence | Reservation UX: title auto-fill, conditional address field, manual fallback | Complete |
| Place Intelligence | Search platform: Search Box v1 provider dispatch, feature flag | Complete |
| Place Intelligence | Proximity bias / contextual ranking | Not started |
| Place Intelligence | Saved Places | Not started |
| Temporal Intelligence | Phase A (RPC + client + travel overnight) | Complete |
| Temporal Intelligence | Phase B (display "next day" label) | Complete |
| Temporal Intelligence | Phase C (edit round-trip endTimeMinutes restore) | Not started |
| Temporal Intelligence | Phase D (non-travel overnight toggle) | Not started |
| Stay Intelligence | Phase 1 (table, RPCs, types) | Complete |
| Stay Intelligence | Phase 2 (entry/management UI + reminder offer) | Complete |
| Stay Intelligence | Phase 3 (Day Detail ambient context display) | Not started |
| Stay Intelligence | Phase 4 (PlaceInput quick-picks integration) | Complete |
| Stay Intelligence | Phase 5 (Trip Dashboard accommodation timeline) | Not started |

---

## 6. Current Roadmap

**Source of truth**: `docs/product/PRODUCT_ROADMAP.md`

### Product versions

| Stream | Current | Next milestone |
|---|---|---|
| Product | **v2.4.0** | **v2.5.0 — Design System Convergence** |
| Design System | **ds/v1.30.1 — Component Token Layer** | Final Design System Convergence audit (not yet performed) |

### v2.4.0 — Reservation Place Intelligence (complete)

Completed June 2026. Place Intelligence is now a shared platform across Travel and Reservation planner items. Search Box v1 is production-ready and active via provider dispatch.

### Current milestone: v2.5.0 — Design System Convergence

Objective: audit every screen, component composition, modal, card, empty state, form, interaction, and layout and ensure it is assembled from existing design system components, documented patterns, Storybook components, and design tokens. No new features. Favor reuse over invention.

**Status:** The convergence audit is complete (2026-07). JSX ownership is converged. All three System Health phases are complete: CSS co-location (Phase 1, v1.29.0), Component Token Layer (Phase 2, ds/v1.30.1), and Code Connect completion (Phase 3, ds/v1.30.0). A final Design System Convergence audit has not yet been performed to formally close the v2.5.0 milestone.

### System Health phases (v2.5.0 execution order)

1. **Phase 1 — CSS Co-location Migration** (primary initiative). ✅ **Complete (v1.29.0).** Wave 1 (v1.27.0): Button, IconButton, CardSurface, FeedbackMessage, EmptyState, ModalSheet. Wave 2 (v1.28.0): ScreenHeader, PageControls, FormActions, FormGrid (`.form-body` dependency severed from App.css). Wave 3 (v1.29.0): DashboardCard, DetailHeader, DayTile — each pattern's uncontested presentation co-located; documented product-context composition (`.trip-card`/`.settings-panel`, `.page-shell > .detail-header`/`.day-detail-screen .detail-header`, `.trip-dashboard .day-tile`) intentionally remains in App.css. Migration rule: flatten the App.css cascade into one canonical component stylesheet, preserve behavior exactly, no renames/optimizations/new tokens — followed throughout all three waves.
2. **Phase 2 — Component Token Layer (Layer 2)** — ✅ **Complete (ds/v1.30.1).** `tokens/source/component.tokens.json` introduces 6 namespaces (card, modal, badge, input, button, icon-button) aliasing existing Semantic tokens; CardSurface, ModalSheet, Badge, the shared form-control input, Button, and IconButton all consume them for their base recipe (background, border, radius, and shadow/color where applicable). Button and IconButton's base border and background remain unaliased — no Semantic token exists for them, tracked in `TOKEN_DEBT.md`. Zero visual change; verified via Storybook computed-style checks.
3. **Phase 3 — Code Connect completion** for 6 priority T1 components (EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls) and 3 T2 patterns (DashboardCard, DetailHeader, DayTile). ✅ **Complete (ds/v1.30.0).** 9 new `.figma.tsx` files published to Figma. 17 of 19 T1 Components and 3 of 3 T2 Patterns now wired; Icon and PlaceInput remain deferred.

### Phase 2 opportunity areas (from `PRODUCT_ROADMAP.md`)

- Travel Duration — Complete
- Address / Place Intelligence — Complete (Search + quick picks + reservation context + Search Box platform)
- Stay Intelligence — Complete (phases 1, 2, 4; phases 3 and 5 not started)
- Reservation Intelligence — Phase A complete (Place Intelligence for reservations); Phase B+ (trip_reservations table, email import, full reservation platform) not started
- Weather — Not started
- Navigation — Not started
- Trip Timeline — Not started

**Future** (later phases): Expense Tracking, Photos, AI Recommendations, Public Sharing

---

## 7. Active Standards

### Must follow without exception

- **RPC-only writes**: All Supabase table writes go through `security definer` RPCs. No direct table mutations from the client.
- **Mapbox token**: Only accessible via `Deno.env.get('MAPBOX_ACCESS_TOKEN')` in Edge Functions. Zero references in `src/`.
- **Opacity**: Use `rgba()` in CSS. Never element-level `opacity` on containers.
- **Storybook is canonical**: Figma mirrors Storybook. If they disagree, Storybook wins.
- **Token names**: Use full token names (e.g., `--color-surface-glass`). No bridge layer exists — all token calls resolve directly from `tokens/generated/tokens.css`.
- **Component ownership**: Components own all visual styling. Screens own data, state, and logic only. Screens do not own visual styling.
- **planner-item-card composition**: Non-day-detail cards use `display: grid; grid-template-columns: minmax(0, 1fr) auto`. Content in column 1 (wide), controls in column 2 (narrow). Controls go in `__controls > __actions`. Use `IconButton`, not raw `Icon`, for interactive controls.
- **ModalSheet placement**: ModalSheet must not be a direct child of `<main class="dashboard-shell has-trip-bg">` — the `.dashboard-shell.has-trip-bg > *` CSS rule overrides `position: fixed`, collapsing the modal. Always render ModalSheet inside the `<section class="page-shell">`.

### Design principles (from `PROJECT_CONSTITUTION.md`)

- Every screen answers a single primary question
- The system knows more than it shows
- Prefer subtraction over addition
- No novel UI patterns, no one-off styling, no duplicate components
- Do not restate information already established through navigation
- Accessibility is a requirement, not a future enhancement

---

## 8. Repository Structure

```
maycation-planner/
├── docs/
│   ├── PROJECT_STATE.md              — This document. Canonical onboarding and project state.
│   ├── DESIGN_SYSTEM.md              — Component inventory, CSS section map, token debt
│   ├── DESIGN_SYSTEM_PRINCIPLES.md   — 7 design principles, component/token/opacity rules
│   ├── DESIGN_SYSTEM_ROADMAP.md      — v1.27.0 current release, System Health backlog, Phase 2 vision
│   ├── FIGMA_FOUNDATIONS.md          — Figma variable collections, token binding specs
│   ├── TOKEN_DEBT.md                 — Tracked hardcoded values that bypass the token pipeline
│   ├── architecture/
│   │   ├── DERIVATION_ENGINE.md      — 8-step pattern, managed_by_maycation, soft references
│   │   ├── PLACE_INTELLIGENCE_ARCHITECTURE.md
│   │   ├── STAY_INTELLIGENCE_ARCHITECTURE.md
│   │   └── TEMPORAL_INTELLIGENCE_ARCHITECTURE.md
│   └── product/
│       ├── EXPERIENCE_PRINCIPLES.md  — 12 UX experience principles
│       ├── FEATURE_EVALUATION.md     — Evaluation template for new feature proposals
│       ├── PLACE_INTELLIGENCE_DISCOVERY.md — Discovery doc for Place Intelligence (complete)
│       ├── PLACE_INTELLIGENCE_PLAN.md      — Implementation plan for Place Intelligence (complete)
│       ├── PRODUCT_OPPORTUNITIES.md  — Living log of observed product friction
│       ├── PRODUCT_PRINCIPLES.md     — 8 product principles
│       ├── PRODUCT_ROADMAP.md        — Phase 2 opportunity areas
│       └── PRODUCT_VISION.md         — Mission, vision, and problem framing
├── src/
│   ├── App.tsx                       — Auth state, top-level navigation
│   ├── App.css                       — Product/shell CSS (§1–§13); §10–11 removed (v1.27.0); CSS Co-location Migration complete (v1.29.0) — retains only product-screen layout, shell structure, and documented product-context overrides
│   ├── components/
│   │   ├── DesignSystem.tsx          — Re-export barrel for all design system components
│   │   ├── AddPlannerItemForm.tsx    — Add/edit planner items; Place + Temporal intelligence
│   │   ├── DayDetail.tsx             — Day itinerary view; planner-item-card host
│   │   ├── TripDetail.tsx            — Trip dashboard; day grid, countdown, intel card
│   │   ├── TripReservations.tsx      — Reservations list view
│   │   ├── TripStays.tsx             — Stay management; StayCard, Stay form, reminder offer
│   │   ├── TripSettings.tsx          — Trip settings (name, dates, image, delete, invite)
│   │   ├── TripsDashboard.tsx        — My Trips list
│   │   ├── TripCard.tsx              — Trip tile on My Trips
│   │   └── CreateTripForm.tsx        — New trip form
│   ├── components/ui/                — All T1 Components and T2 Patterns
│   │   ├── *.tsx                     — Component implementations
│   │   ├── *.figma.tsx               — Code Connect mappings (17 wired)
│   │   ├── PlaceInput.tsx            — T1 component: place search + PlaceInputQuickPick
│   │   ├── badge.css, forms.css, PlaceInput.css  — Co-located CSS (pre-v1.27.0)
│   │   ├── button.css, icon-button.css, card-surface.css  — Wave 1 co-located CSS (v1.27.0)
│   │   ├── feedback-message.css, empty-state.css, modal-sheet.css  — Wave 1 co-located CSS (v1.27.0)
│   │   ├── screen-header.css, page-controls.css  — Wave 2 co-located CSS (v1.28.0)
│   │   ├── dashboard-card.css, detail-header.css, day-tile.css  — Wave 3 co-located CSS (v1.29.0)
│   │   └── index.ts                  — Export barrel
│   ├── lib/
│   │   ├── trips.ts                  — Trip/TripDay/PlannerItem types and data functions
│   │   ├── stays.ts                  — TripStay types, CRUD, formatStayDateRange, getActiveStayForDay
│   │   ├── places.ts                 — PlaceValue, PlaceSuggestion, searchPlaces, getTravelDurationMinutes
│   │   ├── tripMembers.ts            — Role loading, invite flow
│   │   ├── auth.ts                   — Auth functions
│   │   └── supabaseClient.ts         — Singleton client
│   └── stories/                      — Storybook stories across Foundation, Components, Patterns, Docs groups
├── supabase/
│   ├── migrations/                   — 27 migrations (001_initial_schema → 027_trip_stays)
│   └── functions/
│       ├── search-places/            — Mapbox geocoding proxy
│       ├── get-travel-duration/      — Mapbox directions proxy
│       └── send-invite-email/        — Trip invitation emails
├── tokens/                           — DTCG token source files (color, opacity, spacing, radius, shadow, typography, icon, component)
│   └── generated/tokens.css          — Style Dictionary output (do not edit)
├── PROJECT_CONSTITUTION.md           — UI and implementation guardrails
├── PROJECT_PLAN.md                   — Product/architecture decisions
├── figma.config.json                 — Code Connect configuration
└── sd.config.mjs                     — Style Dictionary pipeline config
```

---

## 9. Outstanding Cleanup

### System Health (v2.5.0 Design System Convergence — reprioritized 2026-07)

| Item | Priority |
|---|---|
| **Phase 1:** CSS co-location migration — Waves 1–3 ✅ **complete** (v1.27.0, v1.28.0, v1.29.0). (See `DESIGN_SYSTEM_ROADMAP.md` §5) | Done |
| **Phase 2:** Component Token Layer (Layer 2) — component-scoped tokens for card, button, input, badge, icon-button, modal ✅ **complete** (ds/v1.30.1) | Done |
| **Phase 3:** Code Connect for 6 priority T1 components (EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls) ✅ **complete** (ds/v1.30.0) | Done |
| **Phase 3:** Code Connect for 3 T2 patterns (DashboardCard, DetailHeader, DayTile) ✅ **complete** (ds/v1.30.0) | Done |
| Code Connect for Icon — blocked on resolving known Storybook rendering defect | Low (blocked) |
| Code Connect for PlaceInput — deferred until Place Intelligence Phase 5 Figma component | Low (deferred) |
| Final Design System Convergence audit to formally close v2.5.0 | Medium (not yet performed) |

### Token debt (tracked in `TOKEN_DEBT.md`)

- `Button` and `IconButton` base border (`rgba(255,255,255,0.12)`) — no semantic token; now in `button.css`, `icon-button.css`
- `Button` and `IconButton` base background (`rgba(28,28,30,0.84)`) — no semantic token; now in `button.css`, `icon-button.css`
- `#fff` text on trip intel card and day tiles — no pure-white text token
- `rgba(53,184,168,0.08)` ambient gradient — semantic context differs from nearest token
- `rgba(0,0,0,0.22)` mode-toggle background — semantic context differs
- `rgba(28,28,30,0.68/0.76/0.62)` card backgrounds — intentional off-scale glass variants
- `rgba(255,255,255,0.04)` header-img-preview — nearest token is 0.05
- `rgba(0,0,0,0.4)` day-tile shadow — intentional contextual variant

### Intelligence deferred work

- **Temporal Phase C**: Restore `endTimeMinutes` from saved `ends_at` on edit (edit round-trip)
- **Temporal Phase D**: Non-travel overnight "Ends next day" toggle
- **Stay Phase 3**: Day Detail ambient "Staying at [place]" context display
- **Stay Phase 5**: Trip Dashboard accommodation timeline
- **Place Intelligence — Proximity bias**: Pass origin coordinates to `search-places` to weight results toward trip location. Would fix "Be Our Guest" returning an Ohio business instead of the Magic Kingdom restaurant for context-free queries.
- **Place Intelligence — Travel Quick Picks**: Surface previously-used destinations and upcoming reservation locations as quick picks in the Travel form destination field.
- **Reservation Intelligence Phase B+**: `trip_reservations` table, email confirmation import, full reservation platform (Derivation Engine source fact for reservations)
- **Saved Places**: Home, Airport, Hotel, recent selections surfaced as PlaceInput quick picks

### Known defects

- Icon component icons render incorrectly in Storybook (deferred — tracked in `project-deferred-work.md` memory)

---

## 10. Current Versions

| Artifact | Version |
|---|---|
| Product | **v2.4.0** |
| Next product milestone | **v2.5.0 — Design System Convergence** |
| Design System | **ds/v1.30.1 — Component Token Layer** |
| npm package | 0.0.0 (not published) |
| Supabase migrations | 27 (latest: `027_trip_stays.sql`) |
| Edge Function: search-places | v8 (Search Box v1 /forward + Geocoding v5 dispatch) |
| T1 Components | 19 (all code-complete, 17/19 Code Connect wired) |
| T2 Patterns | 3 (all code-complete, 3/3 Code Connect wired) |
| Storybook stories | 99+ across 25+ groups |
