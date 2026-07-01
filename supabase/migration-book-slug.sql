-- Add slug column to books table
ALTER TABLE books ADD COLUMN IF NOT EXISTS slug TEXT;

-- Generate slugs for existing books
UPDATE books SET slug = lower(regexp_replace(regexp_replace(title, '[^a-z0-9\s]', '', 'gi'), '\s+', '-', 'gi'));

-- Resolve duplicates by appending -1, -2, etc.
UPDATE books b1 SET slug = b1.slug || '-' || sub.rn
FROM (
  SELECT id, row_number() OVER (PARTITION BY slug ORDER BY created_at) - 1 AS rn
  FROM books
) sub
WHERE b1.id = sub.id AND sub.rn > 0;

-- Add UNIQUE constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_slug ON books(slug);
