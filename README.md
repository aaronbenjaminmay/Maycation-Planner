# Maycation Planner

A collaborative family trip planner designed for real vacations, not spreadsheets.

Maycation helps families organize travel days, reservations, activities, transportation, and notes in a shared itinerary that works across devices and users.

## Current Status

Maycation is actively under development and includes:

* Multi-user trip collaboration
* Supabase-backed data storage
* Shared family access and permissions
* Day-by-day itinerary management
* Reservations and fixed plans
* Travel and transportation tracking
* Mobile-friendly responsive layouts
* Dark-mode-first interface
* Design-system-driven UI architecture

## Design Philosophy

Maycation is heavily inspired by the clarity and consistency established in the Disney Mayhem project.

The goal is a highly structured interface built from reusable design system primitives rather than individually styled screens.

Core principles:

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

## Design System Direction

The application is currently evolving toward a fully componentized design system architecture.

Planned system layers:

### Foundations

* Color tokens
* Typography tokens
* Spacing scale
* Radius scale
* Elevation system
* Icon sizing

### Primitives

* Button
* IconButton
* TextInput
* SelectInput
* TextArea
* Toggle
* Badge

### Surfaces

* PageShell
* PageHeader
* CardSurface
* Modal

### Compositions

* DayTile
* ItemCard
* ReservationCard
* MemberRow
* InviteRow

## Future Roadmap

### Design System

* Complete design token implementation
* Shared component architecture audit
* Eliminate one-off visual implementations
* Improve component documentation

### Storybook

Future Storybook integration will document:

* Foundations
* Components
* Variants
* Usage guidelines
* Accessibility requirements

### Figma MCP

The long-term goal is a 1:1 relationship between:

* Design tokens
* Figma variables
* Figma components
* React components
* Storybook documentation

This will allow design and development systems to remain synchronized while supporting AI-assisted workflows.

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

## Repository Workflow

Primary development occurs on feature branches and is merged into `main` through pull requests.

Current focus:

* Design system consolidation
* Shared component primitives
* UI consistency
* Collaborative trip planning workflows
