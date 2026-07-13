-- Mulaibaca Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ==========================================
-- FAMILIES
-- ==========================================
create table families (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null default 'family' check (type in ('family', 'circle')),
  invite_code text unique not null default substring(gen_random_uuid()::text, 1, 8),
  created_at  timestamptz default now()
);

-- ==========================================
-- MEMBERS (family members with PIN auth)
-- ==========================================
create table members (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references families(id) on delete cascade,
  name        text not null,
  avatar      text not null default '📖',  -- emoji avatar
  pin_hash    text not null,               -- bcrypt hash of 4-digit PIN
  role        text not null default 'member' check (role in ('admin', 'member')),
  created_at  timestamptz default now()
);

-- ==========================================
-- BOOKS (shared catalog)
-- ==========================================
create table books (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  author          text,
  cover_url       text,
  isbn            text,
  open_library_id text,
  total_pages     int,
  created_at      timestamptz default now()
);

-- ==========================================
-- SHELF ITEMS (member's reading list)
-- ==========================================
create table shelf_items (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references members(id) on delete cascade,
  family_id     uuid not null references families(id) on delete cascade,
  book_id       uuid not null references books(id),
  status        text not null default 'reading' check (status in ('want', 'reading', 'done')),
  current_page  int default 0,
  started_at    timestamptz,
  finished_at   timestamptz,
  created_at    timestamptz default now(),
  unique(member_id, book_id)
);

-- ==========================================
-- READING LOGS (daily sessions)
-- ==========================================
create table reading_logs (
  id               uuid primary key default gen_random_uuid(),
  shelf_item_id    uuid not null references shelf_items(id) on delete cascade,
  member_id        uuid not null references members(id) on delete cascade,
  log_date         date not null default current_date,
  pages_read       int not null default 0,
  duration_minutes int,
  note             text,
  created_at       timestamptz default now(),
  unique(shelf_item_id, log_date)   -- one log per book per day
);

-- ==========================================
-- STREAKS (cached for performance)
-- ==========================================
create table streaks (
  member_id       uuid primary key references members(id) on delete cascade,
  current_streak  int not null default 0,
  longest_streak  int not null default 0,
  last_log_date   date,
  updated_at      timestamptz default now()
);

-- ==========================================
-- REVIEWS (published book reviews)
-- ==========================================
create table reviews (
  id            uuid primary key default gen_random_uuid(),
  shelf_item_id uuid not null references shelf_items(id) on delete cascade,
  member_id     uuid not null references members(id) on delete cascade,
  family_id     uuid not null references families(id) on delete cascade,
  rating        int not null check (rating between 1 and 5),
  q_about       text,   -- "Buku ini tentang apa?"
  q_memorable   text,   -- "Yang paling berkesan?"
  q_for_whom    text,   -- "Untuk siapa cocok?"
  is_public     boolean not null default true,
  slug          text unique,  -- for public URL: /review/[slug]
  published_at  timestamptz default now(),
  created_at    timestamptz default now(),
  unique(shelf_item_id, member_id)  -- one review per member per book
);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================

alter table families     enable row level security;
alter table members      enable row level security;
alter table books        enable row level security;
alter table shelf_items  enable row level security;
alter table reading_logs enable row level security;
alter table streaks      enable row level security;
alter table reviews      enable row level security;

-- Books are readable by everyone (public catalog)
create policy "books_public_read" on books
  for select using (true);

create policy "books_insert" on books
  for insert with check (true);

-- Public reviews are readable by everyone
create policy "reviews_public_read" on reviews
  for select using (is_public = true);

-- Family members can read/write their own family data
-- (We'll use session-based auth via family_id stored client-side for MVP)
create policy "families_public_read" on families
  for select using (true);

create policy "families_insert" on families
  for insert with check (true);

create policy "members_family_read" on members
  for select using (true);

create policy "members_insert" on members
  for insert with check (true);

create policy "shelf_read" on shelf_items
  for select using (true);

create policy "shelf_write" on shelf_items
  for all using (true);

create policy "logs_read" on reading_logs
  for select using (true);

create policy "logs_write" on reading_logs
  for all using (true);

create policy "streaks_read" on streaks
  for select using (true);

create policy "streaks_write" on streaks
  for all using (true);

create policy "reviews_write" on reviews
  for all using (true);

-- ==========================================
-- FUNCTION: update streak after log insert
-- ==========================================
create or replace function update_streak()
returns trigger as $$
declare
  v_member_id uuid := NEW.member_id;
  v_today     date := NEW.log_date;
  v_last_date date;
  v_current   int;
  v_longest   int;
begin
  select last_log_date, current_streak, longest_streak
    into v_last_date, v_current, v_longest
    from streaks where member_id = v_member_id;

  if not found then
    insert into streaks (member_id, current_streak, longest_streak, last_log_date)
    values (v_member_id, 1, 1, v_today);
    return NEW;
  end if;

  if v_last_date = v_today then
    -- already logged today, no change
    return NEW;
  elsif v_last_date = v_today - interval '1 day' then
    -- consecutive day
    v_current := v_current + 1;
  else
    -- streak broken
    v_current := 1;
  end if;

  v_longest := greatest(v_longest, v_current);

  update streaks
    set current_streak = v_current,
        longest_streak = v_longest,
        last_log_date  = v_today,
        updated_at     = now()
    where member_id = v_member_id;

  return NEW;
end;
$$ language plpgsql;

create trigger trg_update_streak
  after insert on reading_logs
  for each row execute function update_streak();
