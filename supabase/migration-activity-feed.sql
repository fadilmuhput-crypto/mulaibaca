-- Activity Feed: unified timeline for all user activities
-- Each row represents one activity entry shown in the timeline

create table if not exists activity_feed (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references members(id) on delete cascade,
  family_id     uuid not null references families(id) on delete cascade,
  activity_type text not null check (activity_type in (
    'shelf_add', 'shelf_status', 'log', 'review', 'finish', 'follow'
  )),
  data          jsonb not null default '{}'::jsonb,
  created_at    timestamptz default now()
);

create index if not exists idx_activity_feed_member on activity_feed(member_id);
create index if not exists idx_activity_feed_created on activity_feed(created_at desc);

alter table activity_feed enable row level security;

create policy "activity_feed_select" on activity_feed
  for select using (true);

create policy "activity_feed_insert" on activity_feed
  for insert with check (auth.uid() is not null);
