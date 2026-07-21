-- Migration: Club visibility & join approval
-- Run di Supabase SQL Editor

-- ==========================================
-- ADD COLUMNS
-- ==========================================
alter table clubs add column if not exists visibility  text not null default 'public'  check (visibility in ('public', 'private'));
alter table clubs add column if not exists join_type   text not null default 'auto'    check (join_type in ('auto', 'approval'));

-- ==========================================
-- JOIN REQUESTS
-- ==========================================
create table if not exists join_requests (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  member_id   uuid not null references members(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz default now(),
  unique(club_id, member_id)
);

-- RLS
alter table join_requests enable row level security;

-- Members can see their own requests
create policy "join_requests_select_own" on join_requests for select using (
  member_id = (select id from members where auth_user_id = auth.uid() limit 1)
);

-- Admins can see requests for their clubs
create policy "join_requests_select_admin" on join_requests for select using (
  exists (
    select 1 from club_members
    where club_members.club_id = join_requests.club_id
    and club_members.member_id = (select id from members where auth_user_id = auth.uid() limit 1)
    and club_members.role = 'admin'
  )
);

-- Members can insert their own requests
create policy "join_requests_insert" on join_requests for insert with check (
  member_id = (select id from members where auth_user_id = auth.uid() limit 1)
);

-- Admins can update status
create policy "join_requests_update_admin" on join_requests for update using (
  exists (
    select 1 from club_members
    where club_members.club_id = join_requests.club_id
    and club_members.member_id = (select id from members where auth_user_id = auth.uid() limit 1)
    and club_members.role = 'admin'
  )
);

-- Indexes
create index if not exists idx_join_requests_club_id on join_requests(club_id);
create index if not exists idx_join_requests_member_id on join_requests(member_id);
create index if not exists idx_join_requests_status on join_requests(status);
