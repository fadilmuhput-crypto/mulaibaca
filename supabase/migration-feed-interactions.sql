-- Feed likes & comments
-- Requires migration-activity-feed.sql (table: activity_feed)

create table if not exists feed_likes (
  id        uuid primary key default gen_random_uuid(),
  feed_id   uuid not null references activity_feed(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(feed_id, member_id)
);

create table if not exists feed_comments (
  id        uuid primary key default gen_random_uuid(),
  feed_id   uuid not null references activity_feed(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  content   text not null,
  created_at timestamptz not null default now()
);

-- RLS: allow read if you can see the feed item
alter table feed_likes enable row level security;
alter table feed_comments enable row level security;

-- Likes RLS: anyone authenticated can read/insert/delete their own
create policy "feed_likes_select"
  on feed_likes for select
  using (true);

create policy "feed_likes_insert"
  on feed_likes for insert
  with check (auth.uid() in (select auth_user_id from members where id = member_id));

create policy "feed_likes_delete"
  on feed_likes for delete
  using (auth.uid() in (select auth_user_id from members where id = member_id));

-- Comments RLS: read all, insert own, update/delete own
create policy "feed_comments_select"
  on feed_comments for select
  using (true);

create policy "feed_comments_insert"
  on feed_comments for insert
  with check (auth.uid() in (select auth_user_id from members where id = member_id));

create policy "feed_comments_delete"
  on feed_comments for delete
  using (auth.uid() in (select auth_user_id from members where id = member_id));
