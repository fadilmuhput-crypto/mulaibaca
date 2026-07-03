-- Migration: Tambah status & admin_reply ke tabel feedback

-- Pastikan tabel feedback ada (created via dashboard or earlier migration)
create table if not exists feedback (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid references members(id) on delete set null,
  name       text,
  email      text,
  category   text,
  subject    text,
  message    text not null,
  created_at timestamptz default now()
);

-- Tambah kolom status (jika belum ada)
alter table feedback add column if not exists status text
  not null default 'baru'
  check (status in ('baru', 'dibaca', 'diproses', 'selesai', 'ditutup'));

-- Tambah kolom admin_reply (jika belum ada)
alter table feedback add column if not exists admin_reply text;

-- Tambah kolom replied_at (jika belum ada)
alter table feedback add column if not exists replied_at timestamptz;

-- Indeks untuk sorting/filter
create index if not exists idx_feedback_status on feedback(status);
create index if not exists idx_feedback_category on feedback(category);
create index if not exists idx_feedback_created on feedback(created_at desc);
