-- Add is_cms_admin column to members if not exists
alter table members add column if not exists is_cms_admin boolean not null default false;

-- Create storage bucket for blog cover images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do nothing;

-- Allow public to view blog images
drop policy if exists "Blog images are public" on storage.objects;
create policy "Blog images are public"
  on storage.objects for select
  using (bucket_id = 'blog-images');

-- Allow admins to upload blog images
drop policy if exists "Admins can upload blog images" on storage.objects;
create policy "Admins can upload blog images"
  on storage.objects for insert
  with check (
    bucket_id = 'blog-images'
    and (select is_cms_admin from members where auth_user_id = auth.uid() limit 1) = true
  );
