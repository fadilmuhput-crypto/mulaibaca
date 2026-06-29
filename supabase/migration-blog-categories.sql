-- Mulaibaca Blog Categories
-- Jalankan di Supabase SQL Editor setelah migration-blog-posts.sql

alter table blog_posts add column if not exists category text;

do $$
begin
  -- Update existing posts with categories
  update blog_posts set category = 'tips-membaca' where slug = 'cara-membangun-budaya-membaca-di-rumah';
  update blog_posts set category = 'review-buku' where slug = 'rekomendasi-buku-anak-usia-2-4-tahun';
  update blog_posts set category = 'tips-membaca' where slug = 'tips-memilih-buku-anak-usia-sd';
  update blog_posts set category = 'tips-membaca' where slug = 'pentingnya-membaca-nyaring-read-aloud';
  update blog_posts set category = 'inspirasi' where slug = 'peran-ayah-membangun-literasi-keluarga';
  update blog_posts set category = 'kebiasaan' where slug = 'mengelola-screen-time-mendorong-minat-baca';
  update blog_posts set category = 'tips-membaca' where slug = 'membaca-untuk-remaja-tantangan-dan-cara-mengatasinya';
  update blog_posts set category = 'inspirasi' where slug = 'membuat-perpustakaan-mini-di-rumah';
  update blog_posts set category = 'kebiasaan' where slug = 'jurnal-membaca-keluarga-tracking-progres';
  update blog_posts set category = 'tips-membaca' where slug = 'review-buku-vs-log-membaca-literasi-anak';
end $$;
