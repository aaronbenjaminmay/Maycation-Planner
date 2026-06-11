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

The objective is consistency, clarity, simplicity, and restraint.

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

## Information Architecture Principles

Maycation should prioritize clarity through restraint.

The system should know more than it shows.

Avoid exposing information simply because the data exists.

The goal is not to maximize visible information.

The goal is to maximize understanding.

Prefer subtraction over addition.

---

### Primary Question Rule

Every screen should answer a single primary question.

Examples:

#### My Trips

Question:

Which trip do I want?

#### Trip Detail

Question:

Which day do I need?

#### Day Detail

Question:

What do I need to do today?

#### Settings

Question:

What am I changing?

Any information that does not support the primary question should be:

* Removed
* Combined
* Demoted
* Moved closer to where it is needed

---

### Context Retention Rule

Assume the user remembers actions they just performed.

Do not repeatedly reintroduce information established one navigation level earlier.

Examples:

If a user selects a trip:

* Do not repeatedly display the trip name on every subsequent screen.
* Do not restate information already established through navigation.

If a user selects a day:

* Do not reintroduce the trip.
* Do not repeat metadata already visible elsewhere.

Avoid narrating navigation.

Trust the user.

---

### Header Content Rules

Headers should be concise.

A header may contain:

* Title
* Optional supporting detail

Avoid stacking multiple layers of hierarchy unless each layer provides unique value.

Before adding content to a header ask:

Does this help the user understand where they are or what they should do next?

If not, remove it.

Examples:

Avoid:

* Application branding
* Screen category labels
* Repeated parent context
* Signed-in account information

Prefer:

* One clear title
* One supporting detail when necessary

---

### Authenticated Screen Rules

Authenticated screens should not repeatedly display application branding.

Avoid:

* MAYCATION PLANNER
* Signed-in email addresses
* TRIP DASHBOARD
* Other labels that merely describe the current screen

The interface already communicates this through structure and navigation.

Examples:

Avoid:

My Trips

Signed in as [user@example.com](mailto:user@example.com)

Prefer:

My Trips

---

Avoid:

TRIP DASHBOARD

Beach Maycation

Orange Beach

Jun 7–12

Prefer:

Beach Maycation

Jun 7–12 • Orange Beach

---

Avoid:

BEACH MAYCATION

Day 1

Sunday, Jun 7

Prefer:

Day 1

Sunday, Jun 7

---

### Information Density Review

Every UI review should evaluate:

1. What is the primary information?
2. What is the primary action?
3. What information is duplicated?
4. What information can be removed?
5. What information can be combined?

Success is measured by clarity, not by the amount of information displayed.

---

### Disney Mayhem Principle

Disney Mayhem succeeded because it reduced cognitive load.

It assumed user context.

It avoided administrative interfaces.

It avoided explaining itself.

Maycation should follow the same principle.

The system should feel:

* Calm
* Focused
* Confident
* Predictable

The interface should know more than it shows.

Users should spend their attention on trip content, not interface chrome.

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

Screens should not own information hierarchy that can be standardized by the system.

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
* Page title
* Optional supporting detail
* Divider
* Header actions

Use eyebrow labels only when they provide unique context.

Do not use eyebrow labels simply to describe the current screen.

If the title already communicates the context, omit the eyebrow.

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
* Am I showing information because it is useful or because it exists?

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
