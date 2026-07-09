# Maycation Planner

A collaborative family trip planner designed for real vacations, not spreadsheets.

Maycation helps families organize travel days, reservations, activities, transportation, and notes in a shared itinerary that works across devices and users.

## Documentation

Start here when joining the project as an engineer or AI assistant:

1. [README.md](./README.md) — Setup and workflow (this file)
2. [docs/PROJECT_STATE.md](./docs/PROJECT_STATE.md) — Full project state: architecture, design system, product status, versioning, and current milestone
3. [PROJECT_CONSTITUTION.md](./PROJECT_CONSTITUTION.md) — Permanent engineering and design rules. Governs every implementation decision.
4. [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) — Component inventory, token architecture, CSS ownership, Storybook parity
5. [docs/product/PRODUCT_ROADMAP.md](./docs/product/PRODUCT_ROADMAP.md) — Product opportunity areas and evolution direction
6. [docs/architecture/](./docs/architecture/) — Implementation details: Place Intelligence, Stay Intelligence, Temporal Intelligence, Derivation Engine

Do not begin implementation until you have read `docs/PROJECT_STATE.md` and `PROJECT_CONSTITUTION.md`.

## Current Status

Maycation is actively under development.

### Architecture

Complete

* Multi-user trip collaboration
* Supabase-backed data storage
* Shared family access and permissions
* Trips, days, and planner items
* Reservations and fixed plans
* Travel and transportation tracking
* Planner item completion
* Mobile-friendly responsive layouts

### Design System

Complete — Phase 1 Foundation

* DTCG three-layer token architecture (Primitive → Semantic → Component)
* Style Dictionary pipeline → `tokens/generated/tokens.css` and `tokens.ts`
* Full semantic token system: color, opacity, spacing, radius, shadow, typography, icon
* Component token layer (Layer 2) established for card, modal, badge, input, button, icon-button base recipes
* Figma variable collections: Primitives and Semantic collections established
* 19 T1 components — code-complete and Storybook-documented; 17 of 19 Code Connect–wired
* 3 T2 patterns — DashboardCard, DetailHeader, DayTile; Figma complete; Code Connect wired
* Storybook — 99 stories across Foundation, Components, Patterns, and Docs groups
* Dark-mode-first interface

### Current Focus

v2.8.0 — Contextual Place Resolution: complete. Place search across Travel and Reservation forms now biases toward geographically relevant results using context already available at the point of search — the trip's active Stay for the day, or a place just selected in a sibling field — so ambiguous venue names (a chain restaurant with locations in multiple cities, for example) resolve to the correct one without any new step for the user. Unbiased search remains the exact fallback when no such context exists. Stay-to-stay bias (Multi-Stay Context) was intentionally deferred — see Roadmap below. v2.7.0 — Reservation Intelligence, v2.6.0 — Travel Intelligence, and v2.5.0 — Design System Convergence are also complete and released.

## Design Philosophy

Maycation is heavily inspired by the clarity and consistency established in the Disney Mayhem project.

The application is built around reusable design system primitives rather than individually styled screens.

Core principles:

* Prefer subtraction over addition
* Consistent page structure
* Shared component primitives
* Single source of truth for styling
* Token-driven visual system
* Accessible interactions
* Mobile-first planning experience

## Technology

* React
* TypeScript
* Vite
* Supabase
* Lucide React
* Style Dictionary

## Design System

### Tokens

* Color
* Typography
* Spacing
* Radius
* Shadow
* Icon sizing

### Components

* Button, IconButton
* CardSurface, ModalSheet
* Badge, FeedbackMessage, EmptyState, ProgressPill, StatusButton
* TextInput, SelectInput, TextArea, FormRow, FormGrid, FormActions
* ScreenHeader, PageControls

### Patterns

* DashboardCard
* DetailHeader
* DayTile

## Roadmap

### Phase 1 — Design System Foundation

Complete (v1.26.0)

* Design token pipeline (DTCG, Style Dictionary)
* 19 T1 components — code, Storybook, and partial Code Connect
* 3 T2 patterns — code, Storybook, and Figma
* Figma variable collections (Primitives and Semantic)
* Visual refinement to Disney Mayhem benchmark
* Shared card, form, modal, and navigation systems

### v2.4.0 — Reservation Place Intelligence

Complete (June 2026)

* Place Intelligence shared across Travel and Reservation planner items
* Reservation Location field uses PlaceInput (search, autocomplete, coordinates)
* Title auto-fill from place selection; conditional address field
* Mapbox Search Box v1 `/forward` production provider via `PLACE_SEARCH_PROVIDER` dispatch
* Geocoding v5 retained as fallback; rollback requires no redeployment

### v2.5.0 — Design System Convergence

Complete (July 2026)

* Code Connect for T2 Patterns (DashboardCard, DetailHeader, DayTile) — complete (ds/v1.30.0)
* Code Connect for remaining T1 Components (EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls) — complete (ds/v1.30.0)
* Component Token Layer (DTCG Layer 2) — complete (ds/v1.30.1)
* CSS Co-location Migration (component CSS out of App.css) — complete (ds/v1.29.0)

### v2.6.0 — Travel Intelligence

Complete (July 2026)

* Travel planner items display origin, destination, and drive duration on the Day Detail card
* Editing a travel item no longer clears a previously saved arrival time while duration recalculates
* No Design System, schema, or RPC changes — reuses existing Place Intelligence and Temporal Intelligence infrastructure

### v2.7.0 — Reservation Intelligence

Complete (July 2026)

* `trip_reservations` — a new trip-scoped fact table for Dining and Activity reservations, independent of Stay Intelligence and `planner_items`
* Saving a reservation automatically derives exactly one itinerary item, with no confirmation step
* Reservations screen and dashboard tile now read reservation facts directly, not `planner_items` — Stay-derived check-in/check-out items no longer appear on the Reservations screen
* Editing a reservation keeps its itinerary item in sync automatically while that item remains Maycation-managed; editing the item directly protects it from being overwritten by a later fact edit
* Deleting a reservation prompts whether to also remove its itinerary item
* First complete implementation of the Derivation Engine's full lifecycle (see `docs/architecture/DERIVATION_ENGINE.md`); manual entry only, email import remains a future phase

### v2.8.0 — Contextual Place Resolution

Complete (July 2026)

* Place search biases toward geographically relevant results using context already available at the point of search — no new UI, no new user-facing step
* Travel "From" and "To" — biased using the day's active Stay and the already-selected origin, respectively
* Reservation planner item Location and Trip Reservations Place — both biased using the active Stay for the relevant date
* Unbiased search remains the exact fallback whenever no context is available
* No Design System, schema, or RPC changes — one optional parameter added to `search-places` and `searchPlaces()`
* Multi-Stay Context (biasing a new Stay's search using a chronologically adjacent Stay) was evaluated and intentionally deferred: adjacency in time is not a reliable signal for adjacency in place, and shipping it risked a confident-looking wrong answer being worse than no bias at all

### Future

* Light mode (token architecture already supports it)
* Place Intelligence: Travel Quick Picks, Saved Places
* Place Intelligence: Multi-Stay Context (deferred — see v2.8.0 above)
* Reservation Intelligence — email import
* Additional collaboration features

## Storybook

Storybook documents the complete Maycation design system: foundations, components, patterns, and design principles. It is not a product preview — it does not show trip flows, dashboard screens, or Supabase-connected features.

Run Storybook locally:

```bash
npm run storybook
```

Opens at `http://localhost:6006`.

**Coverage:**
- `Foundation/` — Color tokens, typography scale, spacing and radius scale
- `Components/` — All T1 components: buttons, surfaces, forms, navigation, feedback
- `Patterns/` — T2 compositions: DashboardCard, DetailHeader, DayTile
- `Docs/` — Design Principles and Component Classification

**What Storybook is for:**
- Reviewing component variants and states in isolation
- Verifying token values (colors, spacing, radius, typography)
- Checking component behavior without app context or data
- Communicating design system conventions to designers and tooling

**What not to use Storybook for:**
- Testing authenticated product flows
- Previewing trip dashboards or planner screens
- Verifying Supabase data or real-time behavior

Build a static Storybook:

```bash
npm run build-storybook
```

---

## Development

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Deploy:

```bash
npm run deploy
```

## Repository Workflow

Primary development occurs on feature branches and is merged into main.

v2.5.0 — Design System Convergence, v2.6.0 — Travel Intelligence, v2.7.0 — Reservation Intelligence, and v2.8.0 — Contextual Place Resolution are all complete and released.
