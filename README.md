# Maycation Planner

A collaborative family trip planner designed for real vacations, not spreadsheets.

Maycation helps families organize travel days, reservations, activities, transportation, and notes in a shared itinerary that works across devices and users.

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
* Figma variable collections: Primitives and Semantic collections established
* 18 T1 components — code-complete and Storybook-documented; 11 of 18 Code Connect–wired
* 3 T2 patterns — DashboardCard, DetailHeader, DayTile; Figma complete; Code Connect pending
* Storybook — 99 stories across Foundation, Components, Patterns, and Docs groups
* Dark-mode-first interface

### Current Focus

Design System Phase 2: Code Connect for patterns, remaining T1 Code Connect, component token layer, CSS co-location migration.

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
* 18 T1 components — code, Storybook, and partial Code Connect
* 3 T2 patterns — code, Storybook, and Figma
* Figma variable collections (Primitives and Semantic)
* Visual refinement to Disney Mayhem benchmark
* Shared card, form, modal, and navigation systems

### Phase 2 — System Health

Active

* Code Connect for T2 Patterns (DashboardCard, DetailHeader, DayTile)
* Code Connect for remaining T1 Components (EmptyState, StatusButton, FormActions, FormGrid, ScreenHeader, PageControls)
* Component Token Layer (DTCG Layer 2)
* CSS Co-location Migration (component CSS out of App.css)

### Future

* Light mode (token architecture already supports it)
* Expanded trip planning workflows
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
- `Patterns/` — T2 compositions: DashboardCard, DetailHeader
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

Current development focus:

* Code Connect for T2 Patterns and remaining T1 Components
* Component Token Layer (DTCG Layer 2)
* CSS Co-location Migration
* Product feature development on the stable design system foundation
