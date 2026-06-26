-- ============================================================
-- Jalankan di Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tabel sections
create table if not exists jelajah_sections (
  id          uuid    primary key default gen_random_uuid(),
  title       text    not null,
  subtitle    text,
  type        text    not null check (type in ('featured','grid_v','grid_h','banner')),
  config      jsonb   not null default '{}',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz default now()
);

-- 2. Tabel relasi section ↔ curated_books
create table if not exists jelajah_section_books (
  id              uuid    primary key default gen_random_uuid(),
  section_id      uuid    not null references jelajah_sections(id) on delete cascade,
  curated_book_id uuid    not null references curated_books(id)    on delete cascade,
  sort_order      integer not null default 0,
  unique(section_id, curated_book_id)
);

-- 3. RLS
alter table jelajah_sections      enable row level security;
alter table jelajah_section_books enable row level security;

-- Public: baca section aktif saja
create policy "public read active sections"
  on jelajah_sections for select
  using (is_active = true);

create policy "public read section books"
  on jelajah_section_books for select
  using (true);

-- 4. Storage bucket untuk banner (jalankan via Supabase Dashboard → Storage → New Bucket)
-- Nama: jelajah-banners  |  Public: true  |  Max size: 5MB
-- Atau jalankan SQL ini:
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jelajah-banners',
  'jelajah-banners',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do nothing;

create policy "public read jelajah banners"
  on storage.objects for select
  using (bucket_id = 'jelajah-banners');

create policy "service role upload jelajah banners"
  on storage.objects for insert
  with check (bucket_id = 'jelajah-banners');

-- 5. Data awal: pindahkan section editorial yang ada ke DB
insert into jelajah_sections (title, subtitle, type, sort_order, is_active)
values
  ('Pilihan Editorial', 'Buku terpilih minggu ini', 'featured', 1, true),
  ('Semua Koleksi',     null,                        'grid_v',   2, true)
on conflict do nothing;
