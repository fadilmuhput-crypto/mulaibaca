-- Migration: Note images support
-- Run in Supabase Dashboard → SQL Editor
-- Idempotent: safe to re-run

-- 1. Create storage bucket for note images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select 'note-images', 'note-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where not exists (select 1 from storage.buckets where id = 'note-images');

-- 2. Storage RLS: authenticated users can upload
create policy if not exists "Authenticated users can upload note images"
  on storage.objects for insert
  with check (bucket_id = 'note-images' and auth.role() = 'authenticated');

-- 3. Storage RLS: anyone can view note images
create policy if not exists "Anyone can view note images"
  on storage.objects for select
  using (bucket_id = 'note-images');

-- 4. Add images column to reading_logs
alter table reading_logs
  add column if not exists images text[] default '{}';
