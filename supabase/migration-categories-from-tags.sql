-- Migration: update categories & subcategories berdasarkan tags
-- Jalankan di Supabase Dashboard → SQL Editor
-- Idempotent: aman dijalankan berulang kali

-- 1. Tambah kolom subcategories jika belum ada
ALTER TABLE curated_books ADD COLUMN IF NOT EXISTS subcategories text[] DEFAULT '{}'::text[];

-- 2. Update categories (root category keys dari CATEGORY_TREE)
--    Hanya untuk baris yang categories-nya NULL atau kosong
UPDATE curated_books
SET categories = (
  SELECT COALESCE(ARRAY_AGG(DISTINCT cat_key), '{}'::text[])
  FROM UNNEST(tags) AS t(tag)
  INNER JOIN (VALUES
    ('fiksi',       ARRAY['fiksi','novel','sastra','cerpen','antologi','romance','cinta','thriller','misteri','suspens','kriminal','crime','horor','horror','fantasi','paranormal','petualangan','sci-fi','fiksi ilmiah','distopia','surreal','fiksi sejarah','historical fiction','humor','komedi','alegori','satire','cerita rakyat','legenda','fabel','rakyat','dongeng','puisi','sajak','drama','klasik']),
    ('non-fiksi',    ARRAY['non-fiksi','biografi','memoar','pengembangan diri','produktivitas','kebiasaan','motivasi','inspirasi','bisnis','karier','keuangan','marketing','startup','strategi','komunikasi','psikologi','filsafat','absurdisme','sejarah','sosial','budaya','politik','sains','teknologi','agama','spiritualitas','islam','masakan','kuliner','perjalanan','travel','olahraga','sports','seni','musik','parenting','keluarga']),
    ('anak-anak',    ARRAY['anak','balita','cerita anak','picture book','board book','children','children''s']),
    ('remaja',       ARRAY['remaja','young adult','ya','teen']),
    ('komik-grafis', ARRAY['komik','manga','novel grafis','graphic novel','webtoon','comics']),
    ('referensi',    ARRAY['pendidikan','edukasi','belajar','bahasa','bahasa inggris','english','kamus','referensi','ensiklopedi','moral','nilai','karakter'])
  ) AS m(cat_key, match_tags) ON t.tag = ANY(match_tags)
)
WHERE (categories IS NULL OR categories = '{}')
  AND tags IS NOT NULL
  AND array_length(tags, 1) > 0;

-- 3. Update subcategories (subcategory keys dari CATEGORY_TREE)
UPDATE curated_books
SET subcategories = (
  SELECT COALESCE(ARRAY_AGG(DISTINCT sub_key), '{}'::text[])
  FROM UNNEST(tags) AS t(tag)
  INNER JOIN (VALUES
    -- fiksi
    ('sastra-klasik',       ARRAY['sastra','klasik','drama']),
    ('kontemporer',         ARRAY['kontemporer','contemporary']),
    ('romance',             ARRAY['romance','cinta']),
    ('thriller-misteri',    ARRAY['thriller','misteri','suspens','kriminal','crime']),
    ('horor',               ARRAY['horor','horror']),
    ('fantasi',             ARRAY['fantasi','paranormal','petualangan']),
    ('fiksi-ilmiah',        ARRAY['sci-fi','fiksi ilmiah','distopia','surreal']),
    ('fiksi-sejarah',       ARRAY['fiksi sejarah','historical fiction','sejarah']),
    ('humor',               ARRAY['humor','komedi','alegori','satire']),
    ('cerita-rakyat',       ARRAY['cerita rakyat','legenda','fabel','rakyat','dongeng']),
    ('puisi',               ARRAY['puisi','sajak']),
    -- non-fiksi
    ('biografi-memoar',     ARRAY['biografi','memoar']),
    ('pengembangan-diri',   ARRAY['pengembangan diri','produktivitas','kebiasaan','motivasi','mindset','inspirasi']),
    ('bisnis-karier',       ARRAY['bisnis','karier','keuangan','marketing','startup','strategi','komunikasi']),
    ('psikologi-filsafat',  ARRAY['psikologi','filsafat','absurdisme']),
    ('sejarah-budaya',      ARRAY['sejarah','sosial','budaya','politik']),
    ('sains-teknologi',     ARRAY['sains','teknologi']),
    ('agama-spiritualitas', ARRAY['agama','spiritualitas','islam']),
    ('masakan',             ARRAY['masakan','kuliner','resep']),
    ('perjalanan',          ARRAY['perjalanan','travel']),
    ('olahraga',            ARRAY['olahraga','sports']),
    ('seni-musik',          ARRAY['seni','musik','art','music']),
    ('parenting-keluarga',  ARRAY['parenting','keluarga']),
    -- anak-anak
    ('balita',              ARRAY['balita','toddler','board book','picture book']),
    ('anak-awal',           ARRAY['anak','cerita anak','children']),
    ('anak-akhir',          ARRAY['anak','chapter book']),
    -- remaja
    ('fiksi-remaja',        ARRAY['remaja','young adult','ya']),
    ('fantasi-remaja',      ARRAY['fantasi','remaja']),
    ('romance-remaja',      ARRAY['romance','remaja']),
    -- komik-grafis
    ('manga',               ARRAY['manga']),
    ('komik-barat',         ARRAY['komik','comics']),
    ('novel-grafis',        ARRAY['novel grafis','graphic novel']),
    ('webtoon',             ARRAY['webtoon']),
    -- referensi
    ('pendidikan',          ARRAY['pendidikan','edukasi','belajar']),
    ('bahasa',              ARRAY['bahasa','bahasa inggris','english']),
    ('kamus-referensi',     ARRAY['kamus','referensi','ensiklopedi']),
    ('nilai-karakter',      ARRAY['moral','nilai','karakter'])
  ) AS m(sub_key, match_tags) ON t.tag = ANY(match_tags)
)
WHERE tags IS NOT NULL
  AND array_length(tags, 1) > 0;

-- 4. Verifikasi: lihat sample hasil update
SELECT 
  title,
  category,
  tags,
  categories,
  subcategories
FROM curated_books
WHERE (categories IS NOT NULL AND categories != '{}')
   OR (subcategories IS NOT NULL AND subcategories != '{}')
ORDER BY title
LIMIT 20;
