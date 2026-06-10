# Maycation Project Constitution

## Purpose

Maycation is the successor to Disney Mayhem.

Disney Mayhem is the UX, visual design, and product quality benchmark for the project.

Maycation exists to preserve the strengths of Disney Mayhem while rebuilding the application on a more scalable foundation using explicit domain models, stable identifiers, shared components, and a mature design system.

The architecture is considered complete.

Current development should focus on:

* Design system maturity
* UI consistency
* Component architecture
* User experience refinement
* Accessibility
* Performance
* Bug fixes

The goal is not to continuously redesign the product.

The goal is to improve the system while preserving the architecture.

---

## Source of Truth

The project is governed by three documents:

### README.md

Contains:

* Project overview
* Setup instructions
* Development workflow

### PROJECT_PLAN.md

Contains:

* Product vision
* Business rules
* Data models
* Supabase architecture
* Permissions
* Roadmap
* Release milestones

### PROJECT_CONSTITUTION.md

Contains:

* Design system rules
* Component rules
* UX rules
* Development guardrails

If conflicts occur:

1. PROJECT_PLAN.md wins for product and architecture decisions.
2. PROJECT_CONSTITUTION.md wins for UI and implementation decisions.
3. README.md is informational.

---

## Architecture Rules

Do not change the following unless explicitly requested:

* Supabase schema
* Data models
* Authentication flow
* Authorization model
* Permissions
* Routing structure
* Invitation architecture
* Planner item architecture
* Core trip ownership model

Assume these systems are stable.

Improvements should happen within the established architecture.

---

## Design Philosophy

Use Disney Mayhem as the visual benchmark.

The objective is not visual imitation.

The objective is consistency, clarity, and simplicity.

Prefer:

* Simpler layouts
* Fewer components
* Shared primitives
* Consistent spacing
* Predictable interactions

Avoid:

* Novel UI patterns
* One-off styling
* Visual complexity
* Duplicate components
* Feature creep

Prefer subtraction over addition.

---

## Design System Principles

Maycation should behave like a true design system.

Changes should cascade through shared primitives.

Do not patch individual instances when a shared component should own the behavior.

A developer should be able to modify a component once and have the update reflected everywhere that component is used.

---

## Component Ownership

Shared components own:

* Layout
* Styling
* Radius
* Borders
* Padding
* Typography
* Hover states
* Focus states
* Disabled states
* Selected states
* Variants

Screens own:

* Content
* State
* Data
* Business logic
* Event handlers

Screens should not own visual styling.

---

## Design Tokens

Visual decisions should be represented as tokens whenever practical.

Examples:

### Colors

* background
* surface
* surfaceElevated
* border
* textPrimary
* textSecondary
* textMuted
* accent
* destructive

### Radius

* radius.sm
* radius.md
* radius.lg
* radius.xl

### Typography

* eyebrow
* title
* heading
* body
* caption

### Spacing

* spacing.xs
* spacing.sm
* spacing.md
* spacing.lg
* spacing.xl

### Icons

* icon.sm
* icon.md
* icon.lg

Avoid hardcoded values when a token should exist.

---

## Required Shared Components

The application should be built from shared primitives.

Core components include:

### Layout

* PageShell
* PageHeader

### Surfaces

* CardSurface
* SectionCard
* ItemCard

### Actions

* Button
* IconButton

### Forms

* TextInput
* SelectInput
* TextArea
* Toggle

### Feedback

* Badge
* EmptyState

### Modals

* Modal
* ModalHeader
* ModalBody
* ModalFooter

### Structure

* ListRow
* FormRow

If a UI pattern appears multiple times, create or reuse a shared component.

---

## Icon Rules

Use:

```text
lucide-react
```

All icon-only actions should use the shared IconButton component.

Examples:

* Back
* Add
* Edit
* Delete
* Complete
* Close
* Settings
* Invite
* Logout

Do not create custom SVG icon systems.

Do not create one-off icon button implementations.

Do not create one-off icon button CSS.

---

## Card Rules

Use a shared card system.

Cards should inherit:

* Radius
* Surface color
* Border
* Elevation
* Spacing

Avoid:

* Nested card systems
* Card-inside-card page layouts
* One-off card styling

Cards present content.

Cards do not define architecture.

---

## Modal Rules

All modals should use the shared modal system.

Modals should share:

* Overlay behavior
* Surface styling
* Padding
* Header layout
* Footer layout
* Close action treatment

Delete actions should use the shared destructive IconButton variant.

---

## Header Rules

Authenticated screens should share a common page header pattern.

Structure:

* Back action when appropriate
* Eyebrow label
* Page title
* Optional metadata
* Divider
* Header actions

Screens should not create their own header systems.

---

## Completion Rules

Completion is a visual interaction attached to planner items.

Completion controls should:

* Use IconButton
* Use a Lucide Check icon
* Fill with the accent color when selected
* Use a white check when selected

Completion should not:

* Change card layout
* Change card hierarchy
* Change unrelated controls
* Affect other planner items

Updates should be scoped to the specific item being changed.

Avoid global loading states.

Prefer optimistic UI updates where appropriate.

---

## Accessibility

All new UI should support:

* Keyboard navigation
* Visible focus states
* Appropriate color contrast
* Accessible labels
* Reasonable touch targets

Accessibility is a requirement, not a future enhancement.

---

## AI Development Rules

Before making changes:

1. Read README.md
2. Read PROJECT_PLAN.md
3. Read PROJECT_CONSTITUTION.md

Ask:

* Is this a system problem or an instance problem?
* Should this change happen in a shared component?
* Should this change happen in a token?
* Will this change cascade correctly?
* Am I creating a one-off implementation?

If the change creates a one-off implementation, stop and refactor through the shared system.

---

## Future Direction

The design system should be structured to support:

* Storybook
* Design token documentation
* Component documentation
* Figma MCP
* 1:1 Figma component libraries
* AI-assisted development workflows

Future tooling should be able to map:

Figma Component → React Component → Storybook Documentation

without redefining behavior or visual rules.

---

## Success Criteria

A successful Maycation implementation allows:

* Visual changes to cascade through shared primitives
* Components to remain consistent across screens
* New features to reuse existing patterns
* Designers and developers to work from the same system
* AI tools to understand and extend the product predictably

The system should become easier to maintain as it grows, not harder.
