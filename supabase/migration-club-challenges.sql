-- Club Challenges: admin-created page-reading challenges for club members

create table if not exists club_challenges (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  created_by  uuid not null references members(id),
  title       text not null,
  target      int not null,
  start_date  date not null,
  end_date    date not null,
  status      text not null default 'active' check (status in ('active','completed','expired')),
  created_at  timestamptz default now()
);

-- Only one active challenge per club at a time
create unique index club_challenges_active_idx on club_challenges(club_id)
  where status = 'active';

alter table club_challenges enable row level security;

-- Members can read club challenges (must be a club member)
create policy "club_challenges_select" on club_challenges
  for select using (
    exists (
      select 1 from club_members
      where club_members.club_id = club_challenges.club_id
        and club_members.member_id = auth.uid()::uuid
    )
  );

-- Only club admins can insert challenges
create policy "club_challenges_insert" on club_challenges
  for insert with check (
    exists (
      select 1 from club_members
      where club_members.club_id = club_challenges.club_id
        and club_members.member_id = auth.uid()::uuid
        and club_members.role = 'admin'
    )
  );

-- Only club admins can update challenges (mark completed)
create policy "club_challenges_update" on club_challenges
  for update using (
    exists (
      select 1 from club_members
      where club_members.club_id = club_challenges.club_id
        and club_members.member_id = auth.uid()::uuid
        and club_members.role = 'admin'
    )
  );
