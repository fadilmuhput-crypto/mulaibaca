-- Jalankan di Supabase SQL Editor

-- 1. Tambah kolom reminder ke tabel members
alter table members
  add column if not exists reminder_enabled boolean not null default false,
  add column if not exists reminder_time text not null default '19:00';

-- 2. Tabel push subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  unique (member_id, endpoint)
);

-- Index for cron queries
create index if not exists idx_push_subs_member on push_subscriptions(member_id);
create index if not exists idx_members_reminder on members(reminder_enabled, reminder_time);
