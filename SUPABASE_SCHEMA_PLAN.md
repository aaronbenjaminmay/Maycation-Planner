# Maycation Planner Supabase Schema Plan

## 1. Auth Strategy

Maycation Planner will use Supabase Auth as the authentication provider.

Supported authentication methods:

- Email and password.
- Magic link sign-in.

Authentication identifies the user. Authorization is handled separately through trip membership and role-based Row Level Security.

### Profiles

Application user records live in a `profiles` table connected to `auth.users`.

Purpose:

- Store app-level display information.
- Keep user-facing profile data separate from Supabase Auth internals.
- Provide a stable profile record for trip membership, ownership, and audit fields.

Profile creation should happen when a user signs up or first signs in.

## 2. Core Tables

Core tables:

- `profiles`
- `trips`
- `trip_members`
- `trip_days`
- `planner_items`
- `trip_invites`

## 3. Table Columns

### `profiles`

Stores application profile data for authenticated users.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `display_name text`
- `avatar_url text`
- `email text`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- `unique (user_id)`
- `unique (email)` if email is stored and normalized

Notes:

- `user_id` is the connection to Supabase Auth.
- Users can read and update their own profile.
- Profile records should not be used as authentication credentials.

### `trips`

Stores top-level vacation workspaces.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `destination text`
- `starts_on date`
- `ends_on date`
- `timezone text not null default 'America/New_York'`
- `background_path text`
- `logo_path text`
- `created_by uuid not null references auth.users(id)`
- `updated_by uuid references auth.users(id)`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `archived_at timestamptz`

Notes:

- Owners can manage trip settings.
- Members can read trips they belong to.
- Background and logo paths point to Supabase Storage objects.

### `trip_members`

Stores user membership and role per trip.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `trip_id uuid not null references trips(id) on delete cascade`
- `user_id uuid not null references auth.users(id) on delete cascade`
- `role text not null`
- `display_name_override text`
- `invited_by uuid references auth.users(id)`
- `created_by uuid references auth.users(id)`
- `updated_by uuid references auth.users(id)`
- `joined_at timestamptz not null default now()`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- `unique (trip_id, user_id)`
- `role in ('owner', 'editor', 'viewer')`

Notes:

- One membership per user per trip.
- Role drives authorization.
- Owners manage members and roles.

### `trip_days`

Stores canonical trip dates for itinerary grouping.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `trip_id uuid not null references trips(id) on delete cascade`
- `date date not null`
- `label text`
- `sort_order integer not null`
- `created_by uuid references auth.users(id)`
- `updated_by uuid references auth.users(id)`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- `unique (trip_id, date)`
- `unique (trip_id, sort_order)`

Notes:

- Trip days are explicit records so itinerary views do not infer days from planner item text.
- `sort_order` keeps day ordering stable even if labels change.

### `planner_items`

Stores all planner content in one canonical table.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `trip_id uuid not null references trips(id) on delete cascade`
- `trip_day_id uuid references trip_days(id) on delete set null`
- `kind text not null`
- `title text not null`
- `description text`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `all_day boolean not null default false`
- `timezone text`
- `location_name text`
- `location_address text`
- `confirmation_code text`
- `external_url text`
- `status text not null default 'planned'`
- `sort_order numeric not null default 0`
- `created_by uuid not null references auth.users(id)`
- `updated_by uuid references auth.users(id)`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `deleted_at timestamptz`

Constraints:

- `kind in ('travel', 'reservation', 'activity', 'note')`
- `status in ('idea', 'planned', 'booked', 'confirmed', 'done', 'canceled')`
- `check (ends_at is null or starts_at is null or ends_at >= starts_at)`

Notes:

- This is the only planner card persistence model.
- `kind` is explicit and required.
- No routing, filtering, or behavior should be inferred from `title`, `description`, or `metadata`.
- `metadata` may store type-specific details, but core behavior should use typed columns.
- `sort_order` supports stable ordering within trip, day, and dashboard views.

### `trip_invites`

Stores pending invitations to trips.

Columns:

- `id uuid primary key default gen_random_uuid()`
- `trip_id uuid not null references trips(id) on delete cascade`
- `email text not null`
- `role text not null default 'viewer'`
- `token_hash text not null`
- `invited_by uuid not null references auth.users(id)`
- `accepted_by uuid references auth.users(id)`
- `accepted_at timestamptz`
- `expires_at timestamptz not null`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Constraints:

- `role in ('owner', 'editor', 'viewer')`
- `unique (trip_id, email)`
- `unique (token_hash)`

Notes:

- Store only hashed invite tokens.
- Accepting an invite creates a `trip_members` row.
- Owners manage invites.

## 4. Planner Item Model

Maycation Planner uses one canonical `planner_items` table.

Planner item kinds:

- `travel`
- `reservation`
- `activity`
- `note`

Do not create separate tables for card types yet.

Rules:

- Every planner item must have an explicit `kind`.
- The UI may render different cards for different kinds, but all cards read from `planner_items`.
- Queries should filter by `kind`, date fields, status, and membership-scoped trip ID.
- Do not infer item kind from titles, descriptions, notes, emoji, or display labels.
- Do not create hidden legacy models for special cards.

## 5. Permissions Model

Roles:

- `owner`
- `editor`
- `viewer`

### Owner

Can:

- Read trip content.
- Manage trip settings.
- Manage trip members.
- Manage trip invites.
- Create, update, and delete planner content.
- Upload and update trip backgrounds and logos.

### Editor

Can:

- Read trip content.
- Create and update planner content.
- Update planner item ordering.
- Upload and update trip backgrounds and logos.

Cannot:

- Manage trip ownership.
- Remove members.
- Archive or delete trips.

### Viewer

Can:

- Read trip content.

Cannot:

- Create or edit planner content.
- Manage members or invites.
- Upload or update storage objects.

## 6. RLS Policy Plan

Enable Row Level Security on all application tables:

- `profiles`
- `trips`
- `trip_members`
- `trip_days`
- `planner_items`
- `trip_invites`

Recommended helper functions:

- `is_trip_member(target_trip_id uuid)`
- `has_trip_role(target_trip_id uuid, allowed_roles text[])`
- `is_trip_owner(target_trip_id uuid)`

### `profiles`

Policies:

- Users can read their own profile.
- Users can update their own profile.
- Users can insert their own profile during onboarding.

### `trips`

Policies:

- Members can read trips they belong to.
- Authenticated users can create trips.
- Owners can update trip settings.
- Owners can archive trips.

### `trip_members`

Policies:

- Trip members can read membership rows for trips they belong to.
- Owners can insert, update, and delete trip members.
- Users can read their own membership rows.

### `trip_days`

Policies:

- Trip members can read trip days.
- Owners and editors can create trip days.
- Owners and editors can update trip days.
- Owners can delete trip days.

### `planner_items`

Policies:

- Trip members can read planner items.
- Owners and editors can create planner items.
- Owners and editors can update planner items.
- Owners and editors can update planner item order fields.
- Owners can delete planner items.

### `trip_invites`

Policies:

- Owners can read trip invites.
- Owners can create trip invites.
- Owners can update or revoke trip invites.
- Invite acceptance should be handled through a secure token flow.

## 7. Storage Plan

Buckets:

- `trip-backgrounds`
- `trip-logos`

### Path Strategy

Use stable trip-scoped paths:

```text
trip-backgrounds/{trip_id}/{asset_id}
trip-logos/{trip_id}/{asset_id}
```

Rules:

- Do not use filenames as identity.
- Do not use timestamps as generated IDs.
- Store resulting object paths on the `trips` table.

### Access

Trip members can view:

- Backgrounds for trips they belong to.
- Logos for trips they belong to.

Owners and editors can upload/update:

- Backgrounds for trips where they have `owner` or `editor` role.
- Logos for trips where they have `owner` or `editor` role.

Viewers cannot upload or update storage objects.

Storage policies should validate access by extracting `trip_id` from the object path and checking `trip_members`.

## 8. Indexes and Constraints

### Indexes

Recommended indexes:

- `profiles(user_id)`
- `trips(created_by)`
- `trip_members(trip_id)`
- `trip_members(user_id)`
- `trip_members(trip_id, user_id)`
- `trip_days(trip_id, date)`
- `trip_days(trip_id, sort_order)`
- `planner_items(trip_id)`
- `planner_items(trip_id, trip_day_id)`
- `planner_items(trip_id, kind)`
- `planner_items(trip_id, status)`
- `planner_items(trip_id, starts_at)`
- `planner_items(trip_id, trip_day_id, sort_order)`
- `planner_items(trip_id, deleted_at)`
- `trip_invites(trip_id)`
- `trip_invites(email)`
- `trip_invites(token_hash)`

### Required Constraints

Membership:

- `unique (trip_id, user_id)` on `trip_members`

Trip days:

- `unique (trip_id, date)` on `trip_days`
- `unique (trip_id, sort_order)` on `trip_days`

Planner item ordering:

- `sort_order numeric not null default 0`
- Index planner ordering with `(trip_id, trip_day_id, sort_order)`
- Use stable persisted order values instead of ordering by title, timestamp-derived IDs, or array position.

Planner item kind:

- `kind in ('travel', 'reservation', 'activity', 'note')`

Roles:

- `role in ('owner', 'editor', 'viewer')`

Invites:

- `unique (trip_id, email)` on `trip_invites`
- `unique (token_hash)` on `trip_invites`

## 9. Migration Order

SQL creation order:

1. Enable required extensions, including `pgcrypto` for `gen_random_uuid()`.
2. Create enum types or check constraint helpers for roles, planner item kinds, and statuses.
3. Create `profiles`.
4. Create `trips`.
5. Create `trip_members`.
6. Create `trip_days`.
7. Create `planner_items`.
8. Create `trip_invites`.
9. Create indexes and uniqueness constraints.
10. Create updated-at trigger function.
11. Attach updated-at triggers.
12. Create RLS helper functions.
13. Enable RLS on all application tables.
14. Create table RLS policies.
15. Create storage buckets:
    - `trip-backgrounds`
    - `trip-logos`
16. Create storage policies.

Required table order:

```text
profiles -> trips -> trip_members -> trip_days -> planner_items -> trip_invites -> storage policies
```

## 10. Safety Notes

Avoid Disney Mayhem technical debt from the start.

Rules:

- No inferred types.
- No title-based routing.
- No generated IDs based on timestamps.
- No hidden legacy card models.
- No separate persistence tables for travel, reservation, activity, or note cards yet.
- No dashboard behavior based on card title, notes, emoji, or display text.
- No client-only identity for persisted records.
- No storage paths that encode behavior beyond trip ownership.

Maycation Planner should treat structured data as the foundation. UI components can be expressive and card-like, but persistence must stay canonical, explicit, and stable.
