-- Migration: Clubs (Klub Baca)
-- Run di Supabase SQL Editor

-- ==========================================
-- CLUBS
-- ==========================================
create table if not exists clubs (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text not null default '',
  cover_url     text,
  created_by    uuid not null references members(id) on delete cascade,
  invite_code   text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  max_members   int,
  is_active     boolean not null default true,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ==========================================
-- CLUB MEMBERS
-- ==========================================
create table if not exists club_members (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  member_id   uuid not null references members(id) on delete cascade,
  role        text not null default 'member' check (role in ('admin', 'member')),
  joined_at   timestamptz default now(),
  unique(club_id, member_id)
);

-- RLS
alter table clubs enable row level security;
alter table club_members enable row level security;

-- Club policies: anyone authenticated can read active clubs
create policy "clubs_select" on clubs for select using (is_active = true);

-- Club policies: authenticated users can create clubs
create policy "clubs_insert" on clubs for insert with check (
  (select auth_user_id from members where id = created_by) = auth.uid()
);

-- Club policies: only creator can update
create policy "clubs_update" on clubs for update using (
  created_by = (select id from members where auth_user_id = auth.uid() limit 1)
);

-- Club members: members can see their own clubs
create policy "club_members_select" on club_members for select using (
  member_id = (select id from members where auth_user_id = auth.uid() limit 1)
);

-- Club members: anyone can join (insert)
create policy "club_members_insert" on club_members for insert with check (
  member_id = (select id from members where auth_user_id = auth.uid() limit 1)
);

-- Club members: member can delete themselves (leave)
create policy "club_members_delete" on club_members for delete using (
  member_id = (select id from members where auth_user_id = auth.uid() limit 1)
);

-- Indexes
create index if not exists idx_club_members_club_id on club_members(club_id);
create index if not exists idx_club_members_member_id on club_members(member_id);
