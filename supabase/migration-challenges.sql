-- Migration: Reading Challenges
-- Phase 1: Core challenges (pages, streak, books) with opt-in per cycle

create table if not exists challenges (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  category        text not null check (category in ('pages', 'streak', 'books', 'reviews', 'specific_book', 'mixed')),
  activity_type   text not null check (activity_type in ('pages', 'streak', 'books', 'reviews', 'mix')),
  goal_type       text not null check (goal_type in ('pages', 'days', 'count')),
  goal_value      int not null,
  duration_type   text not null check (duration_type in ('weekly', 'monthly', 'unlimited')),
  tier            int not null default 1,
  badge_icon      text not null,
  badge_name      text not null,
  badge_color     text not null,
  is_active       boolean default true,
  sort_order      int default 0,
  created_at      timestamptz default now()
);

create table if not exists challenge_participants (
  id              uuid primary key default gen_random_uuid(),
  challenge_id    uuid not null references challenges(id) on delete cascade,
  member_id       uuid not null references members(id) on delete cascade,
  progress        int not null default 0,
  started_at      date not null default current_date,
  completed_at    timestamptz,
  created_at      timestamptz default now(),
  unique(challenge_id, member_id)
);

create table if not exists challenge_badges (
  id              uuid primary key default gen_random_uuid(),
  challenge_id    uuid not null references challenges(id) on delete cascade,
  member_id       uuid not null references members(id) on delete cascade,
  badge_name      text not null,
  badge_icon      text not null,
  badge_color     text not null,
  period_label    text,
  earned_at       timestamptz not null default now()
);

-- Indexes
create index if not exists idx_challenge_participants_member on challenge_participants (member_id);
create index if not exists idx_challenge_badges_member on challenge_badges (member_id);

-- RLS
alter table challenges enable row level security;
alter table challenge_participants enable row level security;
alter table challenge_badges enable row level security;

drop policy if exists "challenges_read" on challenges;
create policy "challenges_read" on challenges for select using (true);

drop policy if exists "challenges_write" on challenges;
create policy "challenges_write" on challenges for all using (true);

drop policy if exists "challenge_participants_read" on challenge_participants;
create policy "challenge_participants_read" on challenge_participants for select using (true);

drop policy if exists "challenge_participants_write" on challenge_participants;
create policy "challenge_participants_write" on challenge_participants for all using (true);

drop policy if exists "challenge_badges_read" on challenge_badges;
create policy "challenge_badges_read" on challenge_badges for select using (true);

drop policy if exists "challenge_badges_write" on challenge_badges;
create policy "challenge_badges_write" on challenge_badges for all using (true);

-- Seed: Streak challenges (one-time, unlimited duration)
insert into challenges (title, description, category, activity_type, goal_type, goal_value, duration_type, tier, badge_icon, badge_name, badge_color, sort_order) values
  ('Pemula Aktif',    'Baca 3 hari berturut-turut',              'streak', 'streak', 'days',  3,  'unlimited', 1, '🔥', 'Bronze Streak',  '#CD7F32', 1),
  ('Rajin Membaca',   'Baca 7 hari berturut-turut',              'streak', 'streak', 'days',  7,  'unlimited', 2, '🔥', 'Silver Streak',  '#A8A8A8', 2),
  ('Kecanduan Baca',  'Baca 14 hari berturut-turut',             'streak', 'streak', 'days',  14, 'unlimited', 3, '🔥', 'Gold Streak',    '#FFD700', 3)
on conflict do nothing;

-- Seed: Pages challenges (weekly, opt-in each week)
insert into challenges (title, description, category, activity_type, goal_type, goal_value, duration_type, tier, badge_icon, badge_name, badge_color, sort_order) values
  ('Minggu Produktif',   'Baca 100 halaman dalam seminggu',      'pages', 'pages', 'pages', 100,  'weekly',  1, '📖', 'Bronze Reader',  '#CD7F32', 4),
  ('Minggu Rajin',       'Baca 250 halaman dalam seminggu',      'pages', 'pages', 'pages', 250,  'weekly',  2, '📖', 'Silver Reader',  '#A8A8A8', 5),
  ('Minggu Marathon',    'Baca 500 halaman dalam seminggu',      'pages', 'pages', 'pages', 500,  'weekly',  3, '📖', 'Gold Reader',    '#FFD700', 6),
  ('Bookworm Bulanan',   'Baca 1000 halaman dalam sebulan',      'pages', 'pages', 'pages', 1000, 'monthly', 1, '🏅', 'Marathoner',     '#1E4530', 7)
on conflict do nothing;

-- Seed: Books challenges (monthly, opt-in each month)
insert into challenges (title, description, category, activity_type, goal_type, goal_value, duration_type, tier, badge_icon, badge_name, badge_color, sort_order) values
  ('Kolektor Buku',      'Selesaikan 1 buku dalam sebulan',      'books', 'books', 'count', 1, 'monthly', 1, '📚', 'Book Collector', '#CD7F32', 8),
  ('Kolektor Buku 3',    'Selesaikan 3 buku dalam sebulan',      'books', 'books', 'count', 3, 'monthly', 2, '📚', 'Book Worm',      '#A8A8A8', 9),
  ('Kolektor Buku 5',    'Selesaikan 5 buku dalam sebulan',      'books', 'books', 'count', 5, 'monthly', 3, '📚', 'Book Master',    '#FFD700', 10)
on conflict do nothing;
