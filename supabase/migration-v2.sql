-- Migration v2: Switch to Supabase Auth
-- Run this in Supabase SQL Editor AFTER migration v1 (schema.sql)

-- 1. Add auth_user_id and email to members
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS email text;

-- Make auth_user_id unique: 1 auth user = 1 member
CREATE UNIQUE INDEX IF NOT EXISTS members_auth_user_id_idx ON members(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- Make pin_hash optional now (legacy, keep column for data safety)
ALTER TABLE members ALTER COLUMN pin_hash SET DEFAULT '';

-- 2. Drop old permissive policies
DROP POLICY IF EXISTS "families_public_read" ON families;
DROP POLICY IF EXISTS "families_insert" ON families;
DROP POLICY IF EXISTS "members_family_read" ON members;
DROP POLICY IF EXISTS "members_insert" ON members;
DROP POLICY IF EXISTS "shelf_read" ON shelf_items;
DROP POLICY IF EXISTS "shelf_write" ON shelf_items;
DROP POLICY IF EXISTS "logs_read" ON reading_logs;
DROP POLICY IF EXISTS "logs_write" ON reading_logs;
DROP POLICY IF EXISTS "streaks_read" ON streaks;
DROP POLICY IF EXISTS "streaks_write" ON streaks;
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
DROP POLICY IF EXISTS "reviews_write" ON reviews;
DROP POLICY IF EXISTS "books_public_read" ON books;
DROP POLICY IF EXISTS "books_insert" ON books;

-- Helper: get current user's family_id
CREATE OR REPLACE FUNCTION my_family_id() RETURNS uuid AS $$
  SELECT family_id FROM members WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper: get current user's member_id
CREATE OR REPLACE FUNCTION my_member_id() RETURNS uuid AS $$
  SELECT id FROM members WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. New RLS policies

-- FAMILIES: read own family, insert when authenticated
CREATE POLICY "families_read_own" ON families
  FOR SELECT USING (id = my_family_id());

CREATE POLICY "families_insert_auth" ON families
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- MEMBERS: read all members in same family
CREATE POLICY "members_read_family" ON members
  FOR SELECT USING (family_id = my_family_id() OR auth_user_id = auth.uid());

CREATE POLICY "members_insert_auth" ON members
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "members_update_own" ON members
  FOR UPDATE USING (auth_user_id = auth.uid());

-- BOOKS: public read, authenticated insert
CREATE POLICY "books_public_read" ON books
  FOR SELECT USING (true);

CREATE POLICY "books_insert_auth" ON books
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- SHELF: read family's shelves, write own
CREATE POLICY "shelf_read_family" ON shelf_items
  FOR SELECT USING (family_id = my_family_id());

CREATE POLICY "shelf_write_own" ON shelf_items
  FOR ALL USING (member_id = my_member_id());

CREATE POLICY "shelf_insert_own" ON shelf_items
  FOR INSERT WITH CHECK (member_id = my_member_id() AND family_id = my_family_id());

-- READING LOGS: read family's logs, write own
CREATE POLICY "logs_read_family" ON reading_logs
  FOR SELECT USING (member_id IN (SELECT id FROM members WHERE family_id = my_family_id()));

CREATE POLICY "logs_write_own" ON reading_logs
  FOR ALL USING (member_id = my_member_id());

CREATE POLICY "logs_insert_own" ON reading_logs
  FOR INSERT WITH CHECK (member_id = my_member_id());

-- STREAKS: read family's streaks, write own
CREATE POLICY "streaks_read_family" ON streaks
  FOR SELECT USING (member_id IN (SELECT id FROM members WHERE family_id = my_family_id()));

CREATE POLICY "streaks_write_own" ON streaks
  FOR ALL USING (member_id = my_member_id());

-- REVIEWS: public reviews readable by all, write own
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (is_public = true OR member_id = my_member_id());

CREATE POLICY "reviews_write_own" ON reviews
  FOR ALL USING (member_id = my_member_id());

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (member_id = my_member_id());
