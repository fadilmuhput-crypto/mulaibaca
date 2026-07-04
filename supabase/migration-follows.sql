-- Follow system: members can follow each other

create table if not exists follows (
  follower_id  uuid not null references members(id) on delete cascade,
  following_id uuid not null references members(id) on delete cascade,
  created_at   timestamptz default now(),
  primary key (follower_id, following_id)
);

alter table follows enable row level security;

create policy "follows_select" on follows for select using (true);
create policy "follows_insert" on follows for insert
  with check (auth.uid() in (select auth_user_id from members where id = follower_id));
create policy "follows_delete" on follows for delete
  using (auth.uid() in (select auth_user_id from members where id = follower_id));

create index if not exists idx_follows_follower  on follows(follower_id);
create index if not exists idx_follows_following on follows(following_id);
