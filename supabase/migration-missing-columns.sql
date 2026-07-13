-- Migration: Record columns that were added directly via Supabase dashboard
-- Run this in Supabase SQL Editor to ensure schema is documented

-- 1. username on members (added alongside child-auth feature)
ALTER TABLE members ADD COLUMN IF NOT EXISTS username TEXT;

-- Unique index for non-null usernames (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS members_username_idx ON members(username)
  WHERE username IS NOT NULL;

-- 2. member_type on members (ayah/ibu/anak/dewasa)
ALTER TABLE members ADD COLUMN IF NOT EXISTS member_type TEXT
  DEFAULT 'dewasa'
  CHECK (member_type IN ('ayah', 'ibu', 'anak', 'dewasa'));

-- 3. weekly_pages_goal on members (individual reading target)
ALTER TABLE members ADD COLUMN IF NOT EXISTS weekly_pages_goal INTEGER
  DEFAULT 0;
