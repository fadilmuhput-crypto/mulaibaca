-- Create storage bucket for blog cover images (if not exists)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select 'blog-images', 'blog-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif']
where not exists (select 1 from storage.buckets where id = 'blog-images');

-- Public can view blog images
create policy "Blog images are public"
  on storage.objects for select
  using (bucket_id = 'blog-images');

-- Authenticated admins can upload blog images
create policy "Admins can upload blog images"
  on storage.objects for insert
  with check (
    bucket_id = 'blog-images'
    and (select is_cms_admin from members where auth_user_id = auth.uid() limit 1) = true
  );

CREATE TABLE content_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  audience TEXT NOT NULL DEFAULT 'individu' CHECK (audience IN ('individu', 'keluarga')),
  channels TEXT[] NOT NULL DEFAULT '{}',
  temas TEXT[] NOT NULL DEFAULT '{}',
  goals TEXT NOT NULL DEFAULT '',
  cta_style TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage content pillars"
  ON content_pillars
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM members WHERE auth_user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE auth_user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Authenticated users can view content pillars"
  ON content_pillars
  FOR SELECT
  TO authenticated
  USING (true);
