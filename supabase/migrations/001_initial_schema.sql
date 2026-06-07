-- Maycation Planner initial Supabase schema.
-- Source of truth: SUPABASE_SCHEMA_PLAN.md
--
-- Storage buckets are intentionally documented as comments only in this
-- migration. Bucket creation and storage policies should be added in a later
-- migration after the schema and RLS model are reviewed.

create extension if not exists pgcrypto;

create type public.trip_member_role as enum (
  'owner',
  'editor',
  'viewer'
);

create type public.planner_item_kind as enum (
  'travel',
  'reservation',
  'activity',
  'note'
);

create type public.planner_item_status as enum (
  'idea',
  'planned',
  'booked',
  'confirmed',
  'done',
  'canceled'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_user_id_key unique (user_id)
);

create unique index profiles_email_lower_key
  on public.profiles (lower(email))
  where email is not null;

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text,
  starts_on date,
  ends_on date,
  timezone text not null default 'America/New_York',
  background_path text,
  logo_path text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint trips_date_range_check check (
    ends_on is null
    or starts_on is null
    or ends_on >= starts_on
  )
);

create table public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.trip_member_role not null,
  display_name_override text,
  invited_by uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_members_trip_id_user_id_key unique (trip_id, user_id)
);

create table public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  label text,
  sort_order integer not null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_days_trip_id_date_key unique (trip_id, date),
  constraint trip_days_trip_id_sort_order_key unique (trip_id, sort_order),
  constraint trip_days_id_trip_id_key unique (id, trip_id)
);

create table public.planner_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  trip_day_id uuid references public.trip_days(id) on delete set null,
  parent_item_id uuid references public.planner_items(id) on delete cascade,
  kind public.planner_item_kind not null,
  title text not null,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  all_day boolean not null default false,
  timezone text,
  location_name text,
  location_address text,
  confirmation_code text,
  external_url text,
  status public.planner_item_status not null default 'planned',
  sort_order numeric not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint planner_items_time_range_check check (
    ends_at is null
    or starts_at is null
    or ends_at >= starts_at
  ),
  constraint planner_items_id_trip_id_key unique (id, trip_id),
  constraint planner_items_trip_day_same_trip_fkey foreign key (
    trip_day_id,
    trip_id
  ) references public.trip_days (id, trip_id),
  constraint planner_items_parent_same_trip_fkey foreign key (
    parent_item_id,
    trip_id
  ) references public.planner_items (id, trip_id)
);

create table public.trip_invites (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  email text not null,
  role public.trip_member_role not null default 'viewer',
  token_hash text not null,
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_invites_trip_id_email_key unique (trip_id, email),
  constraint trip_invites_token_hash_key unique (token_hash)
);

create or replace function public.prevent_last_owner_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    if old.role = 'owner'::public.trip_member_role
      and exists (
        select 1
        from public.trips
        where id = old.trip_id
      )
      and not exists (
        select 1
        from public.trip_members
        where trip_id = old.trip_id
          and id <> old.id
          and role = 'owner'::public.trip_member_role
      )
    then
      raise exception 'Cannot delete the last owner membership for a trip.';
    end if;

    return old;
  end if;

  if old.role = 'owner'::public.trip_member_role
    and (
      new.role <> 'owner'::public.trip_member_role
      or new.trip_id <> old.trip_id
    )
    and not exists (
      select 1
      from public.trip_members
      where trip_id = old.trip_id
        and id <> old.id
        and role = 'owner'::public.trip_member_role
    )
  then
    raise exception 'Cannot change the last owner membership for a trip.';
  end if;

  return new;
end;
$$;

create trigger trip_members_prevent_last_owner_change
before update or delete on public.trip_members
for each row
execute function public.prevent_last_owner_change();

create index trips_created_by_idx
  on public.trips (created_by);

create index trips_updated_by_idx
  on public.trips (updated_by);

create index trip_members_trip_id_idx
  on public.trip_members (trip_id);

create index trip_members_user_id_idx
  on public.trip_members (user_id);

create index trip_members_invited_by_idx
  on public.trip_members (invited_by);

create index trip_members_created_by_idx
  on public.trip_members (created_by);

create index trip_members_updated_by_idx
  on public.trip_members (updated_by);

create index trip_members_trip_id_user_id_idx
  on public.trip_members (trip_id, user_id);

create index trip_days_trip_id_date_idx
  on public.trip_days (trip_id, date);

create index trip_days_trip_id_sort_order_idx
  on public.trip_days (trip_id, sort_order);

create index trip_days_created_by_idx
  on public.trip_days (created_by);

create index trip_days_updated_by_idx
  on public.trip_days (updated_by);

create index planner_items_trip_id_idx
  on public.planner_items (trip_id);

create index planner_items_trip_day_id_idx
  on public.planner_items (trip_day_id);

create index planner_items_parent_item_id_idx
  on public.planner_items (parent_item_id);

create index planner_items_created_by_idx
  on public.planner_items (created_by);

create index planner_items_updated_by_idx
  on public.planner_items (updated_by);

create index planner_items_trip_id_trip_day_id_idx
  on public.planner_items (trip_id, trip_day_id);

create index planner_items_trip_id_kind_idx
  on public.planner_items (trip_id, kind);

create index planner_items_trip_id_status_idx
  on public.planner_items (trip_id, status);

create index planner_items_trip_id_starts_at_idx
  on public.planner_items (trip_id, starts_at);

create index planner_items_trip_day_order_idx
  on public.planner_items (trip_id, trip_day_id, sort_order);

create index planner_items_trip_id_deleted_at_idx
  on public.planner_items (trip_id, deleted_at);

create index trip_invites_trip_id_idx
  on public.trip_invites (trip_id);

create index trip_invites_invited_by_idx
  on public.trip_invites (invited_by);

create index trip_invites_accepted_by_idx
  on public.trip_invites (accepted_by);

create index trip_invites_email_lower_idx
  on public.trip_invites (lower(email));

create index trip_invites_token_hash_idx
  on public.trip_invites (token_hash);

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger trips_set_updated_at
before update on public.trips
for each row
execute function public.set_updated_at();

create trigger trip_members_set_updated_at
before update on public.trip_members
for each row
execute function public.set_updated_at();

create trigger trip_days_set_updated_at
before update on public.trip_days
for each row
execute function public.set_updated_at();

create trigger planner_items_set_updated_at
before update on public.planner_items
for each row
execute function public.set_updated_at();

create trigger trip_invites_set_updated_at
before update on public.trip_invites
for each row
execute function public.set_updated_at();

create or replace function public.is_trip_member(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trip_members
    where trip_id = target_trip_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_trip_role(
  target_trip_id uuid,
  allowed_roles public.trip_member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trip_members
    where trip_id = target_trip_id
      and user_id = auth.uid()
      and role = any(allowed_roles)
  );
$$;

create or replace function public.is_trip_owner(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_trip_role(
    target_trip_id,
    array['owner']::public.trip_member_role[]
  );
$$;

create or replace function public.user_created_trip(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.trips
    where id = target_trip_id
      and created_by = auth.uid()
  );
$$;

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_days enable row level security;
alter table public.planner_items enable row level security;
alter table public.trip_invites enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Members can read trips"
on public.trips
for select
to authenticated
using (public.is_trip_member(id));

create policy "Authenticated users can create trips"
on public.trips
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Owners can update trips"
on public.trips
for update
to authenticated
using (public.is_trip_owner(id))
with check (public.is_trip_owner(id));

create policy "Members can read trip members"
on public.trip_members
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_trip_member(trip_id)
);

create policy "Owners can create trip members"
on public.trip_members
for insert
to authenticated
with check (
  public.is_trip_owner(trip_id)
  or (
    user_id = auth.uid()
    and role = 'owner'::public.trip_member_role
    and public.user_created_trip(trip_id)
  )
);

create policy "Owners can update trip members"
on public.trip_members
for update
to authenticated
using (public.is_trip_owner(trip_id))
with check (public.is_trip_owner(trip_id));

create policy "Owners can delete trip members"
on public.trip_members
for delete
to authenticated
using (public.is_trip_owner(trip_id));

create policy "Members can read trip days"
on public.trip_days
for select
to authenticated
using (public.is_trip_member(trip_id));

create policy "Owners and editors can create trip days"
on public.trip_days
for insert
to authenticated
with check (
  public.has_trip_role(
    trip_id,
    array['owner', 'editor']::public.trip_member_role[]
  )
);

create policy "Owners and editors can update trip days"
on public.trip_days
for update
to authenticated
using (
  public.has_trip_role(
    trip_id,
    array['owner', 'editor']::public.trip_member_role[]
  )
)
with check (
  public.has_trip_role(
    trip_id,
    array['owner', 'editor']::public.trip_member_role[]
  )
);

create policy "Owners can delete trip days"
on public.trip_days
for delete
to authenticated
using (public.is_trip_owner(trip_id));

create policy "Members can read planner items"
on public.planner_items
for select
to authenticated
using (public.is_trip_member(trip_id));

create policy "Owners and editors can create planner items"
on public.planner_items
for insert
to authenticated
with check (
  public.has_trip_role(
    trip_id,
    array['owner', 'editor']::public.trip_member_role[]
  )
  and created_by = auth.uid()
);

create policy "Owners and editors can update planner items"
on public.planner_items
for update
to authenticated
using (
  public.has_trip_role(
    trip_id,
    array['owner', 'editor']::public.trip_member_role[]
  )
)
with check (
  public.has_trip_role(
    trip_id,
    array['owner', 'editor']::public.trip_member_role[]
  )
);

create policy "Owners can delete planner items"
on public.planner_items
for delete
to authenticated
using (public.is_trip_owner(trip_id));

create policy "Owners can read trip invites"
on public.trip_invites
for select
to authenticated
using (public.is_trip_owner(trip_id));

create policy "Owners can create trip invites"
on public.trip_invites
for insert
to authenticated
with check (
  public.is_trip_owner(trip_id)
  and invited_by = auth.uid()
);

create policy "Owners can update trip invites"
on public.trip_invites
for update
to authenticated
using (public.is_trip_owner(trip_id))
with check (public.is_trip_owner(trip_id));

create policy "Owners can delete trip invites"
on public.trip_invites
for delete
to authenticated
using (public.is_trip_owner(trip_id));

-- Storage plan for a future migration:
--
-- Buckets:
-- - trip-backgrounds
-- - trip-logos
--
-- Intended access:
-- - Trip members can view background and logo objects for trips they belong to.
-- - Owners and editors can upload or update background and logo objects.
-- - Viewers cannot upload or update storage objects.
--
-- Intended path convention:
-- - trip-backgrounds/{trip_id}/{asset_id}
-- - trip-logos/{trip_id}/{asset_id}
--
-- Storage policies should extract trip_id from the object path and validate
-- access through trip_members. Do not use filenames or timestamps as identity.
