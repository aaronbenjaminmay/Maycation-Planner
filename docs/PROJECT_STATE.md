# Maycation Project State

> Canonical onboarding document for new Claude sessions. Reflects repository state as of Design System v1.26.0 / Product v2.2.1 (June 2026). Verify against the repository before acting on specific details — this document may lag behind recent commits.

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
| Product version | v2.2.1 |
| Design System version | v1.26.0 — CSS Token Parity |
| Current milestone | v2.3.0 — Design System Convergence |
| Verification date | 2026-06-27 |
| Repository commit | `73db1d2` |

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
- `search-places` — Mapbox geocoding proxy
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

`PlaceInput` component accepts user search queries and returns a `PlaceValue`. Coordinates flow from the user's selected search result through to the stored record, enabling travel duration estimation without re-geocoding.

`PlaceInputQuickPick` provides pre-resolved `PlaceValue` objects (no search required). Used in `AddPlannerItemForm` to surface "Current Stay" as an origin pre-populated with hotel coordinates.

Data flow:
```
PlaceInput → search-places Edge Function → Mapbox
PlaceValue.coordinates → trip_stays.place_lat/lng
getActiveStayForDay() → PlaceInputQuickPick → AddPlannerItemForm
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

**Design System: v1.26.0 — CSS Token Parity**

### Token Architecture (DTCG three-layer)

| Layer | Status | Location |
|---|---|---|
| Primitives | Complete | `tokens/` → `tokens/generated/tokens.css` |
| Semantic | Complete | Full color, opacity, spacing, radius, shadow, typography |
| Component | Deferred | Not yet created |

**Opacity rule**: Always use `rgba()` composites on CSS surfaces. Never apply element-level `opacity` to containers. Figma: use opaque color + paint-layer opacity float.

`tokens-bridge.css` provides legacy shorthand aliases. New code must use full token names. The bridge is a known migration target (see Outstanding Cleanup).

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

Code Connect wired: **11 of 19** (Badge, Button, CardSurface, FeedbackMessage, FormRow, IconButton, ModalSheet, ProgressPill, SelectInput, TextArea, TextInput)
Not yet wired: EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls, Icon (deferred — known Storybook rendering defect), PlaceInput (deferred — Figma component pending Place Intelligence Phase 5)

### T2 Patterns (3 total)

| Pattern | Composes | Figma | Code Connect |
|---|---|---|---|
| DashboardCard | CardSurface | ✅ | Not wired |
| DetailHeader | PageControls (fixed) + ScreenHeader (in-flow) | ✅ | Not wired |
| DayTile | CardSurface + Icon + ProgressPill | ✅ | Not wired |

### App.css Section Map

App.css is the primary CSS file. It is organized into named sections (§1–§13). Component CSS is currently in App.css rather than co-located files — this is a known migration target.

### Storybook

Storybook is the canonical component implementation. What Storybook shows defines how a component behaves. Figma mirrors Storybook, not the reverse. 99+ stories across 25+ groups.

### CSS ownership

Components own all visual styling (layout, spacing, radius, borders, typography, states). Product screens own content, state, data, business logic, and event handlers. Screens must not own visual styling.

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
| Place Intelligence | Search + quick picks | Complete |
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
| Product | **v2.2.1** | **v2.3.0 — Design System Convergence** |
| Design System | **v1.26.0 — CSS Token Parity** | v1.x.0 — System Health (Code Connect, CSS co-location) |

### Current milestone: v2.3.0 — Design System Convergence

Objective: audit every screen, component composition, modal, card, empty state, form, interaction, and layout and ensure it is assembled from existing design system components, documented patterns, Storybook components, and design tokens. No new features. Favor reuse over invention.

### System Health (prerequisite to Product Phase 2)

1. Code Connect for 6 priority T1 components (EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls)
2. Code Connect for 3 T2 patterns (DashboardCard, DetailHeader, DayTile)
3. Component Token Layer (Layer 2)
4. CSS co-location migration

### Phase 2 opportunity areas (from `PRODUCT_ROADMAP.md`)

- Travel Duration (complete)
- Address (partial)
- Stay (complete)
- Reservation — per-trip reservation facts (`trip_reservations` table, Reservation Intelligence)
- Weather
- Navigation
- Trip Timeline

**Future** (later phases): Expense Tracking, Photos, AI Recommendations, Public Sharing

---

## 7. Active Standards

### Must follow without exception

- **RPC-only writes**: All Supabase table writes go through `security definer` RPCs. No direct table mutations from the client.
- **Mapbox token**: Only accessible via `Deno.env.get('MAPBOX_ACCESS_TOKEN')` in Edge Functions. Zero references in `src/`.
- **Opacity**: Use `rgba()` in CSS. Never element-level `opacity` on containers.
- **Storybook is canonical**: Figma mirrors Storybook. If they disagree, Storybook wins.
- **Token names**: Use full token names (e.g., `--color-surface-glass`). `tokens-bridge.css` shorthand aliases are legacy — do not add new code that uses them.
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
│   ├── DESIGN_SYSTEM_ROADMAP.md      — v1.26.0 current release, System Health backlog, Phase 2 vision
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
│   ├── App.css                       — All component and product CSS (§1–§13)
│   ├── tokens-bridge.css             — Legacy shorthand aliases (migration target)
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
│   │   ├── *.figma.tsx               — Code Connect mappings (11 wired)
│   │   ├── PlaceInput.tsx            — T1 component: place search + PlaceInputQuickPick
│   │   ├── badge.css, forms.css, PlaceInput.css  — Co-located CSS (migration in progress)
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
├── tokens/                           — DTCG token source files
│   └── generated/tokens.css          — Style Dictionary output (do not edit)
├── PROJECT_CONSTITUTION.md           — UI and implementation guardrails
├── PROJECT_PLAN.md                   — Product/architecture decisions
├── figma.config.json                 — Code Connect configuration
└── sd.config.mjs                     — Style Dictionary pipeline config
```

---

## 9. Outstanding Cleanup

### System Health (prerequisite to v2.3.0 Design System Convergence and Product Phase 2)

| Item | Priority |
|---|---|
| Code Connect for 6 priority T1 components (EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls) | High |
| Code Connect for 3 T2 patterns (DashboardCard, DetailHeader, DayTile) | High |
| Component Token Layer (Layer 2) — component-scoped tokens for card, button, input, badge, icon-button, modal | Medium |
| CSS co-location migration — move component CSS from App.css into co-located files | Medium |
| Code Connect for Icon — blocked on resolving known Storybook rendering defect | Low (blocked) |
| Code Connect for PlaceInput — deferred until Place Intelligence Phase 5 Figma component | Low (deferred) |

### Token debt (tracked in `TOKEN_DEBT.md`)

- `Button` and `IconButton` base border (`rgba(255,255,255,0.12)`) — no semantic token
- `Button` and `IconButton` base background (`rgba(28,28,30,0.84)`) — no semantic token
- `#fff` text on trip intel card and day tiles — no pure-white text token
- `rgba(53,184,168,0.08)` ambient gradient — semantic context differs from nearest token
- `rgba(0,0,0,0.22)` mode-toggle background — semantic context differs
- `rgba(28,28,30,0.68/0.76/0.62)` card backgrounds — intentional off-scale glass variants
- `rgba(255,255,255,0.04)` header-img-preview — nearest token is 0.05
- `rgba(0,0,0,0.4)` day-tile shadow — intentional contextual variant
- `tokens-bridge.css` shorthand aliases — removal plan not yet drafted

### Intelligence deferred work

- **Temporal Phase C**: Restore `endTimeMinutes` from saved `ends_at` on edit (edit round-trip)
- **Temporal Phase D**: Non-travel overnight "Ends next day" toggle
- **Stay Phase 3**: Day Detail ambient "Staying at [place]" context display
- **Stay Phase 5**: Trip Dashboard accommodation timeline

### Known defects

- Icon component icons render incorrectly in Storybook (deferred — tracked in `project-deferred-work.md` memory)

---

## 10. Current Versions

| Artifact | Version |
|---|---|
| Product | **v2.2.1** |
| Next product milestone | **v2.3.0 — Design System Convergence** |
| Design System | **v1.26.0 — CSS Token Parity** |
| npm package | 0.0.0 (not published) |
| Supabase migrations | 27 (latest: `027_trip_stays.sql`) |
| T1 Components | 19 (all code-complete, 11/19 Code Connect wired) |
| T2 Patterns | 3 (all code-complete, 0/3 Code Connect wired) |
| Storybook stories | 99+ across 25+ groups |
