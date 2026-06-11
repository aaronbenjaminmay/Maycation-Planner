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

### Design System Foundation

Complete

* DTCG token structure
* Style Dictionary token pipeline
* Semantic token ownership
* Generated CSS and TypeScript token outputs
* Shared component primitives
* Lucide icon standardization
* Dark-mode-first interface

### Current Focus

Disney Mayhem visual parity and UX refinement.

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

### Primitives

* CardSurface
* DashboardCard
* DayTile
* ActionBar
* Badge
* ProgressPill
* IconButton
* ModalSheet
* ScreenHeader
* DetailHeader
* FeedbackMessage

### Forms

* TextInput
* SelectInput
* TextArea
* FormRow
* FormGrid
* FormActions

## Roadmap

### v1.0.0 — Design System Foundation

Complete

* Design token pipeline
* Shared component primitives
* CSS consolidation
* GitHub Pages deployment
* Design system ownership model

### v1.1.0 — Disney Mayhem Visual Parity

In Progress

* Visual refinement
* Interaction polish
* Shared card system
* Shared typography system
* Shared modal system

### Future

* Storybook documentation
* Figma MCP parity
* Expanded trip planning workflows
* Additional collaboration features

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

* Disney Mayhem visual parity
* Design system refinement
* Shared component ownership
* Collaborative trip planning workflows
