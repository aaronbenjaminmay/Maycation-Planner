# Maycation Planner Project Plan

> Historical planning document. Some terminology or implementation details may differ from the shipped product.

Maycation Planner is the successor to Disney Mayhem, a family vacation planner that was successfully used during a real Walt Disney World trip. Disney Mayhem proved the value of a shared, lightweight trip command center, but it also exposed architectural debt caused by implicit item types, title-based inference, unstable identifiers, and separate card models for special cases.

Maycation Planner should preserve the practical, family-tested strengths of Disney Mayhem while rebuilding the foundation around explicit domain modeling, stable IDs, clear permissions, and one canonical planner item model.

## Product Vision

Maycation Planner helps families plan, coordinate, and enjoy vacations together without turning the trip into a project management exercise.

The product should support the full planning lifecycle:

- Create a trip and invite family members.
- Capture ideas, bookings, reservations, transportation, meals, attractions, tasks, notes, and reminders in one shared place.
- Organize items by date, status, location, person, and type.
- Make daily plans easy to scan before and during the trip.
- Preserve enough structure for automation, filtering, reminders, and future AI assistance.
- Stay calm, readable, and dependable when used on a phone in the middle of a busy travel day.

The core product bet is that vacation planning works best when everything is represented as a typed planner item with stable relationships, not as loosely interpreted notes or bespoke card variants.

## Design Principles

1. **Explicit over inferred**
   Item behavior must come from stored fields such as `type`, `status`, `starts_at`, and `assigned_to`, not from parsing titles, notes, labels, or display text.

2. **One canonical planner item model**
   Meals, attractions, reminders, bookings, transportation, tasks, and notes should all be represented by the same base `planner_items` table, with optional type-specific details where truly needed.

3. **Stable IDs everywhere**
   Every trip, member, item, attachment, comment, checklist entry, and invitation must have a durable ID. Client code should never depend on array position, title text, or generated display labels as identity.

4. **Trip ownership is explicit**
   Permissions are derived from trip membership and role records, not from client-side assumptions.

5. **Mobile-first usefulness**
   The dashboard should prioritize what a family needs today: schedule, next reservations, open tasks, reminders, and quick access to important details.

6. **Planning and travel modes are different**
   Pre-trip planning needs broad capture and organization. During-trip use needs fast scanning, reliable offline-friendly reads where possible, and low-friction updates.

7. **No special-case cards**
   UI cards can vary in presentation, but they should render from canonical planner items and type metadata. There should not be separate persistence models for attraction cards, dining cards, reminder cards, or arbitrary dashboard cards.

8. **Human-readable, machine-usable**
   Data should be readable enough for family members and structured enough for sorting, filtering, permissions, notifications, exports, and future integrations.

## Core Entities

### User

A person authenticated through Supabase Auth.

Key responsibilities:

- Own their authentication identity.
- Belong to one or more trips.
- Create, edit, assign, complete, and comment on planner items depending on trip role.

### Profile

Application-level user metadata linked one-to-one with a Supabase Auth user.

Example fields:

- `id`
- `user_id`
- `display_name`
- `avatar_url`
- `created_at`
- `updated_at`

### Trip

The top-level planning workspace for one vacation.

Example fields:

- `id`
- `name`
- `destination`
- `starts_on`
- `ends_on`
- `timezone`
- `created_by`
- `created_at`
- `updated_at`
- `archived_at`

### Trip Member

A user's membership in a trip.

Example fields:

- `id`
- `trip_id`
- `user_id`
- `role`
- `display_name_override`
- `joined_at`
- `created_at`

### Invitation

A pending invitation to join a trip.

Example fields:

- `id`
- `trip_id`
- `email`
- `role`
- `token_hash`
- `invited_by`
- `expires_at`
- `accepted_at`
- `created_at`

### Planner Item

The canonical planning object.

Planner items are used for all trip content: reservations, lodging, travel, dining, attractions, tasks, notes, reminders, packing items, activities, expenses, and general ideas.

Required architectural properties:

- Stable `id`.
- Explicit `type`.
- Explicit `status`.
- Optional date and time fields.
- Optional assignment.
- Optional location.
- Optional metadata payload for type-specific details.
- No behavior inferred from `title`, `description`, or notes.

### Checklist Entry

An ordered child item for a planner item.

Example uses:

- Packing list entries.
- Reservation preparation steps.
- Pre-travel tasks.
- Per-item subtasks.

### Comment

Discussion attached to a planner item.

### Attachment

A stored file or external URL attached to a planner item or trip.

Example uses:

- Confirmation PDFs.
- Tickets.
- Maps.
- Screenshots.
- Receipts.

### Location

Optional reusable location records for places that are referenced by multiple planner items.

Examples:

- Hotel.
- Airport.
- Restaurant.
- Theme park.
- Attraction.
- Rental car center.

## Permissions Model

Permissions are scoped by trip membership.

### Roles

`owner`

- Full access to the trip.
- Can update trip settings.
- Can invite and remove members.
- Can change member roles.
- Can archive the trip.
- Can delete planner items and attachments.

`planner`

- Can create and edit planner items.
- Can upload attachments.
- Can comment.
- Can assign tasks.
- Can update item statuses.
- Cannot delete the trip or manage owner-level settings.

`participant`

- Can view the trip.
- Can comment.
- Can update completion state for assigned tasks.
- Can edit limited personal fields if needed, such as RSVP-style responses or personal notes.

`viewer`

- Read-only access to trip content.

### Permission Rules

- A user can read a trip only if they are a member of that trip.
- A user can read planner items only for trips where they are a member.
- A user can create planner items only with `owner` or `planner` role.
- A user can update planner items only with `owner` or `planner` role, except limited participant actions.
- A user can delete planner items only with `owner` role, or optionally `planner` role for items they created if the product later needs that behavior.
- A user can manage invitations only with `owner` role.
- Storage objects must be protected by the same trip membership rules as the records that reference them.

Permissions should be enforced with Supabase Row Level Security, not only in application code.

## Authentication Strategy

Use Supabase Auth as the identity provider.

Initial strategy:

- Email and password authentication.
- Magic link sign-in as a low-friction option for family members.
- Session persistence through the Supabase client.
- Profile creation on first sign-in.
- Invitation acceptance flow that connects an authenticated user to a pending trip invitation.

Future options:

- Social login for convenience.
- Passkeys if Supabase support and project needs make it worthwhile.
- SMS is not planned initially because phone auth adds cost and operational complexity.

Authentication should answer only "who is this user?" Authorization should remain trip-role based.

## Trip Creation Workflow

1. User signs in.
2. User creates a trip with:
   - Trip name.
   - Destination.
   - Start date.
   - End date.
   - Timezone.
3. System creates:
   - `trips` record.
   - `trip_members` record for the creator with `owner` role.
   - Default planner views or preferences, if needed.
4. User lands on the new trip dashboard.
5. User can invite family members by email.
6. User starts adding planner items from quick-create actions:
   - Reservation.
   - Lodging.
   - Transportation.
   - Dining.
   - Activity.
   - Task.
   - Note.
   - Reminder.
7. Each quick-create action sets an explicit `type`; it does not create a special persistence model.

## Dashboard Workflow

The dashboard is the trip command center. It should be useful before the trip and during the trip.

### Pre-Trip Dashboard

Primary sections:

- Upcoming key dates.
- Open tasks.
- Reservations missing details.
- Ideas not yet scheduled.
- Recently updated items.
- Invite/member status.

Primary actions:

- Add planner item.
- Add reservation.
- Add task.
- Invite family member.
- Open calendar or itinerary view.

### During-Trip Dashboard

Primary sections:

- Today timeline.
- Next scheduled item.
- Dining and reservation confirmations.
- Transportation details.
- Open reminders.
- Important attachments.

Primary actions:

- Mark task done.
- Open confirmation.
- Add quick note.
- Adjust time/status.
- Find location details.

### Dashboard Architecture

Dashboard cards are presentation components over planner item queries. They should not introduce their own domain model.

Examples:

- "Next reservation" queries `planner_items` where `type = 'reservation'` and time is upcoming.
- "Open tasks" queries `planner_items` where `type = 'task'` and `status != 'done'`.
- "Today" queries `planner_items` where item date overlaps the selected day.

No dashboard component should infer item type from title, notes, emoji, display category, or card position.

## Data Model

### Enumerations

Suggested planner item types:

- `lodging`
- `transportation`
- `dining`
- `activity`
- `reservation`
- `ticket`
- `task`
- `reminder`
- `note`
- `packing`
- `expense`
- `idea`

Suggested item statuses:

- `idea`
- `planned`
- `booked`
- `confirmed`
- `in_progress`
- `done`
- `canceled`

Suggested member roles:

- `owner`
- `planner`
- `participant`
- `viewer`

### Tables

#### `profiles`

- `id uuid primary key`
- `user_id uuid references auth.users(id) unique not null`
- `display_name text`
- `avatar_url text`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

#### `trips`

- `id uuid primary key`
- `name text not null`
- `destination text`
- `starts_on date`
- `ends_on date`
- `timezone text not null default 'America/New_York'`
- `created_by uuid references auth.users(id) not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `archived_at timestamptz`

#### `trip_members`

- `id uuid primary key`
- `trip_id uuid references trips(id) on delete cascade not null`
- `user_id uuid references auth.users(id) on delete cascade not null`
- `role text not null`
- `display_name_override text`
- `joined_at timestamptz not null`
- `created_at timestamptz not null`
- Unique constraint on `(trip_id, user_id)`.

#### `trip_invitations`

- `id uuid primary key`
- `trip_id uuid references trips(id) on delete cascade not null`
- `email text not null`
- `role text not null`
- `token_hash text not null`
- `invited_by uuid references auth.users(id) not null`
- `expires_at timestamptz not null`
- `accepted_at timestamptz`
- `created_at timestamptz not null`

#### `planner_items`

- `id uuid primary key`
- `trip_id uuid references trips(id) on delete cascade not null`
- `type text not null`
- `status text not null`
- `title text not null`
- `description text`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `all_day boolean not null default false`
- `timezone text`
- `location_id uuid references locations(id)`
- `location_name text`
- `assigned_to uuid references auth.users(id)`
- `created_by uuid references auth.users(id) not null`
- `updated_by uuid references auth.users(id)`
- `sort_order numeric`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz`

Notes:

- `type` drives behavior.
- `metadata` is allowed only for non-core, type-specific details.
- Common behavior should be promoted to typed columns, not hidden inside `metadata`.
- Soft deletion can protect against accidental family-trip data loss.

#### `planner_item_checklist_entries`

- `id uuid primary key`
- `planner_item_id uuid references planner_items(id) on delete cascade not null`
- `title text not null`
- `status text not null`
- `assigned_to uuid references auth.users(id)`
- `sort_order numeric not null`
- `created_by uuid references auth.users(id) not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

#### `planner_item_comments`

- `id uuid primary key`
- `planner_item_id uuid references planner_items(id) on delete cascade not null`
- `author_id uuid references auth.users(id) not null`
- `body text not null`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `deleted_at timestamptz`

#### `locations`

- `id uuid primary key`
- `trip_id uuid references trips(id) on delete cascade not null`
- `name text not null`
- `address text`
- `latitude numeric`
- `longitude numeric`
- `external_place_id text`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null`
- `updated_at timestamptz not null`

#### `attachments`

- `id uuid primary key`
- `trip_id uuid references trips(id) on delete cascade not null`
- `planner_item_id uuid references planner_items(id) on delete cascade`
- `uploaded_by uuid references auth.users(id) not null`
- `storage_bucket text`
- `storage_path text`
- `external_url text`
- `file_name text not null`
- `content_type text`
- `size_bytes bigint`
- `created_at timestamptz not null`

### Indexes

Recommended indexes:

- `trip_members(trip_id, user_id)`
- `trip_members(user_id)`
- `planner_items(trip_id, starts_at)`
- `planner_items(trip_id, type)`
- `planner_items(trip_id, status)`
- `planner_items(trip_id, assigned_to)`
- `planner_items(trip_id, deleted_at)`
- `planner_item_checklist_entries(planner_item_id, sort_order)`
- `planner_item_comments(planner_item_id, created_at)`
- `attachments(trip_id)`
- `attachments(planner_item_id)`

## Supabase Architecture

### Services

Use Supabase for:

- Auth.
- Postgres database.
- Row Level Security.
- Storage.
- Edge Functions only when server-side logic is required.

Use the React app for:

- Auth UI.
- Trip creation flow.
- Dashboard and planner views.
- Client-side form validation.
- Optimistic UI where safe.

Use Edge Functions for:

- Invitation token creation or validation if hashing needs to remain server-side.
- Future notification delivery.
- Future itinerary export generation.
- Future integrations with third-party APIs.

### Row Level Security

RLS should be enabled on all application tables.

Core policy shape:

- A user can select rows for a trip when an active `trip_members` row exists for that user's auth ID.
- Insert/update/delete policies should check role.
- Attachment read/write policies should validate membership through the associated `trip_id`.
- Invitations should be visible to trip owners and, where needed, claimable by matching authenticated email or secure token flow.

Create helper SQL functions for repeated checks:

- `is_trip_member(trip_id uuid)`
- `has_trip_role(trip_id uuid, roles text[])`
- `is_trip_owner(trip_id uuid)`

These helpers keep RLS policies readable and reduce policy drift.

### Client Data Access

Initial client architecture:

- Supabase browser client singleton.
- Typed query helpers by entity.
- React hooks for auth session, trips, members, planner items, and dashboard summaries.
- Centralized item creation helpers that require explicit `type`.

Avoid:

- Creating planner items from display-only card state.
- Mapping titles to types.
- Maintaining separate local-only IDs for persisted records.
- Duplicating business rules across unrelated components.

## Storage Strategy

Use Supabase Storage for uploaded trip files.

### Buckets

Recommended bucket:

- `trip-attachments`

### Path Convention

Use stable, scoped paths:

```text
trip-attachments/{trip_id}/{attachment_id}/{file_name}
```

This keeps file ownership clear and avoids collisions.

### Attachment Rules

- Every stored file must have an `attachments` database record.
- Every attachment belongs to a trip.
- Attachments may optionally belong to a planner item.
- Storage access must be governed by trip membership.
- Do not use file names as identity.
- Do not encode item type into storage path as behavior.

### Future Storage Needs

Potential future buckets:

- `profile-avatars`
- `trip-cover-images`
- `exports`

These should remain separate from planner item attachments to keep access rules clear.

## Lessons Learned From Disney Mayhem

Disney Mayhem worked because it solved real planning pain for a real trip. The successor should keep what worked and intentionally replace what caused friction.

### Keep

- A shared family planning space.
- Fast access to the day's plan.
- Visual cards that make trip details easy to scan.
- Practical support for reservations, attractions, travel details, and notes.
- The ability to evolve quickly based on how the family actually plans.

### Change

- Replace inferred item categories with explicit `type`.
- Replace title and note parsing with structured fields.
- Replace special-case card persistence with one canonical planner item table.
- Replace unstable client-generated identifiers with database UUIDs.
- Replace display-driven logic with query-driven logic.
- Replace scattered behavior rules with centralized item creation and permission checks.

### Architectural Guardrails

- Every item must have a type at creation time.
- Every dashboard section must be explainable as a query over canonical data.
- No feature should require guessing intent from user-entered prose.
- No component should introduce a new persistence model just because it needs a different visual presentation.
- Metadata is acceptable for details, but not for core workflow behavior.

## Technical Roadmap

### Phase 1: Foundation

- Define Supabase schema.
- Add typed application models.
- Configure Supabase client.
- Implement auth session handling.
- Add profile creation flow.
- Add RLS policies and helper functions.
- Build basic trip creation.

### Phase 2: Trip Workspace

- Implement trip dashboard.
- Add trip member list.
- Add invitation flow.
- Add planner item creation and editing.
- Add list, calendar, and today views.
- Add role-aware UI states.

### Phase 3: Planner Item Depth

- Add checklist entries.
- Add comments.
- Add attachments.
- Add reusable locations.
- Add filtering by type, status, date, assignee, and location.
- Add dashboard summaries backed by canonical item queries.

### Phase 4: Travel-Day Readiness

- Improve mobile dashboard.
- Add today-first itinerary view.
- Add quick status updates.
- Add important attachments section.
- Add graceful loading and empty states.
- Add offline-tolerant read patterns where practical.

### Phase 5: Automation and Polish

- Add reminders and notifications.
- Add itinerary export.
- Add trip archive and duplicate flows.
- Add richer search.
- Add future AI assistance only after the explicit data model is stable.

## Release Milestones

### Milestone 0: Architecture Locked

Exit criteria:

- Project plan completed.
- Canonical planner item model accepted.
- Supabase schema direction accepted.
- No application implementation required.

### Milestone 1: Authenticated Trip Shell

Exit criteria:

- Users can sign up and sign in.
- Profiles are created.
- Users can create a trip.
- Trip creator becomes owner.
- RLS protects trip access.

### Milestone 2: Core Planner Items

Exit criteria:

- Owners and planners can create typed planner items.
- Items can be viewed, edited, completed, and deleted according to role.
- Dashboard shows data from planner item queries.
- No item behavior is inferred from title or notes.

### Milestone 3: Shared Family Planning

Exit criteria:

- Owners can invite members.
- Members can join trips.
- Roles control visible actions.
- Comments and checklist entries are available.
- The app supports multiple users planning one trip together.

### Milestone 4: Attachments and Travel Details

Exit criteria:

- Users can upload trip attachments.
- Attachments are protected by trip membership.
- Attachments can be linked to planner items.
- Reservation confirmations and travel documents are easy to access from the dashboard.

### Milestone 5: Travel-Ready Beta

Exit criteria:

- Mobile dashboard is polished.
- Today view is reliable.
- Important trip details are available in a small number of taps.
- Common pre-trip and during-trip workflows are covered.
- The app is ready to use for a real family vacation.

### Milestone 6: Post-Trip Iteration

Exit criteria:

- Collect feedback from real use.
- Identify missing item types or fields.
- Refine dashboard queries.
- Add automation only where structured data supports it cleanly.
- Preserve the one-model architecture while improving the experience.
