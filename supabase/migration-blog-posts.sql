-- Mulaibaca Blog Posts
-- Run this in Supabase SQL Editor

create table if not exists blog_posts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique not null,
  content       text not null default '',
  excerpt       text not null default '',
  author_name   text not null default 'Tim Mulaibaca',
  cover_image   text,
  published_at  timestamptz,
  is_published  boolean not null default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table blog_posts enable row level security;

create policy "blog_posts_public_read" on blog_posts
  for select using (is_published = true);

create policy "blog_posts_admin_all" on blog_posts
  for all using (true);
