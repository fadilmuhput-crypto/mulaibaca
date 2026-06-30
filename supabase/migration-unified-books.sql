-- ============================================================
-- Migration: Unified Books Directory
-- 1. Add enrichment columns to both tables
-- 2. Merge curated_books into books
-- 3. Migrate jelajah_section_books FK to books
-- 4. Drop curated_books
-- 5. Add search indexes
-- ============================================================

-- 0. Enable pg_trgm for fuzzy search (required by indexes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Add enrichment columns to all relevant tables
ALTER TABLE curated_books
  ADD COLUMN IF NOT EXISTS description       text,
  ADD COLUMN IF NOT EXISTS categories        text[]       default '{}',
  ADD COLUMN IF NOT EXISTS tags              text[]       default '{}',
  ADD COLUMN IF NOT EXISTS publisher         text,
  ADD COLUMN IF NOT EXISTS published_year    int,
  ADD COLUMN IF NOT EXISTS language          text         default 'id';

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS description       text,
  ADD COLUMN IF NOT EXISTS categories        text[]       default '{}',
  ADD COLUMN IF NOT EXISTS tags              text[]       default '{}',
  ADD COLUMN IF NOT EXISTS publisher         text,
  ADD COLUMN IF NOT EXISTS published_year    int,
  ADD COLUMN IF NOT EXISTS language          text         default 'id',
  ADD COLUMN IF NOT EXISTS is_curated        boolean      default false,
  ADD COLUMN IF NOT EXISTS enrichment_status  text         default 'pending'
    check (enrichment_status in ('pending', 'enriched', 'failed')),
  ADD COLUMN IF NOT EXISTS is_active         boolean      default true,
  ADD COLUMN IF NOT EXISTS sort_order        int          default 0,
  ADD COLUMN IF NOT EXISTS updated_at        timestamptz  default now();

-- 2. Merge curated_books into books
-- 2a. Insert curated books that don't exist yet in books
INSERT INTO books (title, author, cover_url, isbn, open_library_id, total_pages,
                   description, categories, tags, publisher, published_year,
                   language, is_curated, enrichment_status, is_active, sort_order)
SELECT
  cb.title, cb.author, cb.cover_url, cb.isbn, cb.open_library_id, cb.total_pages,
  cb.description, cb.categories, cb.tags, cb.publisher, cb.published_year,
  COALESCE(cb.language, 'id'), true, 'enriched', cb.is_active, cb.sort_order
FROM curated_books cb
WHERE NOT EXISTS (
  SELECT 1 FROM books b
  WHERE (b.open_library_id IS NOT NULL AND b.open_library_id = cb.open_library_id)
     OR (b.open_library_id IS NULL AND LOWER(b.title) = LOWER(cb.title)
         AND COALESCE(LOWER(b.author), '') = COALESCE(LOWER(cb.author), ''))
);

-- 2b. Update existing books with richer curated data (by open_library_id)
UPDATE books b
SET
  description       = COALESCE(b.description, cb.description),
  categories        = CASE WHEN b.categories IS NULL OR array_length(b.categories, 1) IS NULL THEN cb.categories ELSE b.categories END,
  tags              = CASE WHEN b.tags IS NULL OR array_length(b.tags, 1) IS NULL THEN cb.tags ELSE b.tags END,
  publisher         = COALESCE(b.publisher, cb.publisher),
  published_year    = COALESCE(b.published_year, cb.published_year),
  language          = COALESCE(b.language, cb.language, 'id'),
  is_curated        = true,
  enrichment_status = 'enriched',
  is_active         = COALESCE(b.is_active, cb.is_active, true),
  sort_order        = COALESCE(b.sort_order, cb.sort_order, 0),
  updated_at        = now()
FROM curated_books cb
WHERE b.open_library_id IS NOT NULL AND b.open_library_id = cb.open_library_id;

-- 3. Migrate jelajah_section_books FK from curated_books to books
ALTER TABLE jelajah_section_books
  ADD COLUMN IF NOT EXISTS book_id uuid;

-- 3a. Match by open_library_id
UPDATE jelajah_section_books jsb
SET book_id = b.id
FROM curated_books cb
JOIN books b ON b.open_library_id = cb.open_library_id
WHERE cb.id = jsb.curated_book_id;

-- 3b. Match remaining by title (case insensitive, any book - curated or user-added)
UPDATE jelajah_section_books jsb
SET book_id = b.id
FROM curated_books cb
JOIN books b ON b.title ILIKE cb.title
WHERE cb.id = jsb.curated_book_id
  AND jsb.book_id IS NULL;

-- 3c. Delete any orphan section_books that couldn't be matched
DELETE FROM jelajah_section_books WHERE book_id IS NULL;

-- 3d. Drop old FK and column, set new FK
ALTER TABLE jelajah_section_books
  DROP CONSTRAINT IF EXISTS jelajah_section_books_curated_book_id_fkey;

ALTER TABLE jelajah_section_books
  DROP COLUMN IF EXISTS curated_book_id;

ALTER TABLE jelajah_section_books
  ALTER COLUMN book_id SET NOT NULL;

ALTER TABLE jelajah_section_books
  ADD CONSTRAINT jelajah_section_books_book_id_fkey
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

-- 4. Drop curated_books table (CASCADE will also drop any remaining references)
DROP TABLE IF EXISTS curated_books CASCADE;

-- 5. Add search indexes on books
CREATE INDEX IF NOT EXISTS books_title_trgm_idx ON books
  USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS books_author_trgm_idx ON books
  USING gin (COALESCE(author, '') gin_trgm_ops);

CREATE INDEX IF NOT EXISTS books_categories_idx ON books
  USING gin (categories);

CREATE INDEX IF NOT EXISTS books_tags_idx ON books
  USING gin (tags);

CREATE INDEX IF NOT EXISTS books_active_sort_idx ON books
  (is_active, sort_order, title)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS books_fts_idx ON books
  USING gin (to_tsvector('simple',
    coalesce(title, '') || ' ' ||
    coalesce(author, '') || ' ' ||
    coalesce(description, '')
  ));
