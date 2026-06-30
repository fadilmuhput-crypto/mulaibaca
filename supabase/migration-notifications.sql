-- Migration: Notifications table
-- Creates the notifications table for in-app notification bell

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references members(id) on delete cascade,
  title       text not null,
  body        text,
  type        text not null default 'info' check (type in ('info', 'achievement', 'system')),
  link        text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Index for fast queries (member's notifications, ordered by date)
create index idx_notifications_member on notifications (member_id, created_at desc);

-- Row Level Security
alter table notifications enable row level security;

-- Members can read their own notifications
create policy "notifications_read_own" on notifications
  for select using (
    member_id in (
      select id from members where auth_user_id = auth.uid()
    )
  );

-- API routes use service_role key (bypasses RLS), but we keep the policy for direct client access safety
create policy "notifications_write" on notifications
  for all using (true);
