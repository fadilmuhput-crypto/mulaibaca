-- Migration: Add source column to books
-- Tracks how each book was added to the catalog

-- 1. Add source column
ALTER TABLE books ADD COLUMN source text DEFAULT 'admin_manual'
  CHECK (source IN ('user_manual', 'admin_manual', 'import', 'cron', 'seed'));

-- 2. Detect source for existing books:
--    is_curated=true → admin manually curated the catalog
--    is_curated=false + has open_library_id → imported from OL/Goodreads
--    is_curated=false + no open_library_id → user manual input
UPDATE books SET source = CASE
  WHEN is_curated = true THEN 'admin_manual'
  WHEN open_library_id IS NOT NULL THEN 'import'
  ELSE 'user_manual'
END;

-- 3. Add index for filtering
CREATE INDEX IF NOT EXISTS books_source_idx ON books (source);
