-- Trip background image storage for Phase 7B.
--
-- Creates the trip-backgrounds bucket (non-public) and access policies.
-- Path convention: {trip_id}/background
-- Signed URLs required for access; TTL is managed on the client.
--
-- NOTE: Run this migration manually in the Supabase SQL editor.
-- The bucket insert and storage policies require the storage schema
-- to be accessible, which may not be available in local migration tooling.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trip-backgrounds',
  'trip-backgrounds',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif'
  ]
)
on conflict (id) do nothing;

create policy "Members can read trip backgrounds"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'trip-backgrounds'
  and public.is_trip_member((storage.foldername(name))[1]::uuid)
);

create policy "Owners can upload trip backgrounds"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'trip-backgrounds'
  and public.is_trip_owner((storage.foldername(name))[1]::uuid)
);

create policy "Owners can replace trip backgrounds"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'trip-backgrounds'
  and public.is_trip_owner((storage.foldername(name))[1]::uuid)
);

create policy "Owners can delete trip backgrounds"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'trip-backgrounds'
  and public.is_trip_owner((storage.foldername(name))[1]::uuid)
);
