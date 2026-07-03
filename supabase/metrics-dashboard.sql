-- ============================================================
-- MULAIBACA METRICS DASHBOARD
-- Jalankan di Supabase SQL Editor → ⚡ Save as SQL Snippet
-- ============================================================

-- ─────────────────────────────
-- 1. PERTUMBUHAN (Growth)
-- ─────────────────────────────

-- Total akumulasi
select
  (select count(*) from families)        as total_keluarga,
  (select count(*) from members)         as total_anggota,
  (select count(*) from members where auth_user_id is not null) as total_terdaftar,
  (select count(*) from members where auth_user_id is null)     as total_anak;

-- Keluarga baru per hari (last 30 days)
select
  date_trunc('day', created_at)::date as tanggal,
  count(*)                            as keluarga_baru
from families
where created_at >= now() - interval '30 days'
group by 1
order by 1;

-- Anggota baru per hari (last 30 days, only registered)
select
  date_trunc('day', m.created_at)::date as tanggal,
  count(*)                              as anggota_baru
from members m
where m.auth_user_id is not null
  and m.created_at >= now() - interval '30 days'
group by 1
order by 1;

-- Breakdown tipe anggota
select member_type, count(*)::int as jumlah
from members
group by 1
order by 2 desc;

-- ─────────────────────────────
-- 2. AKTIVITAS MEMBACA (Engagement)
-- ─────────────────────────────

-- Aktif hari ini / 7 hari / 30 hari
select
  (select count(distinct member_id) from reading_logs where log_date = current_date)                               as aktif_hari_ini,
  (select count(distinct member_id) from reading_logs where log_date >= current_date - interval '7 days')           as aktif_7_hari,
  (select count(distinct member_id) from reading_logs where log_date >= current_date - interval '30 days')          as aktif_30_hari,
  (select count(*) from members where auth_user_id is not null)                                                    as total_terdaftar;

-- Log per hari (last 30 days)
select
  log_date                     as tanggal,
  count(*)::int                as total_log,
  count(distinct member_id)::int as unique_pembaca,
  sum(pages_read)::int         as total_halaman
from reading_logs
where log_date >= current_date - interval '30 days'
group by 1
order by 1;

-- Rata-rata halaman per sesi
select
  round(avg(pages_read)::numeric, 1) as rata_halaman_per_sesi,
  round(avg(duration_minutes)::numeric, 1) as rata_durasi_per_sesi,
  sum(pages_read)::int as total_halaman_semua,
  sum(duration_minutes)::int as total_menit_semua,
  count(*)::int as total_sesi
from reading_logs;

-- Total waktu baca hari ini
select
  coalesce(sum(pages_read)::int, 0) as halaman_hari_ini,
  coalesce(sum(duration_minutes)::int, 0) as menit_hari_ini,
  count(distinct member_id)::int as pembaca_aktif
from reading_logs
where log_date = current_date;

-- ─────────────────────────────
-- 3. STREAK (Kebiasaan Membaca)
-- ─────────────────────────────

-- Distribusi streak
select
  case
    when current_streak = 0 then '0 — Belum mulai'
    when current_streak between 1 and 2 then '1–2 hari'
    when current_streak between 3 and 6 then '3–6 hari'
    when current_streak between 7 and 13 then '7–13 hari (1 minggu)'
    when current_streak between 14 and 20 then '14–20 hari (2 minggu)'
    when current_streak between 21 and 29 then '21–29 hari (3 minggu)'
    when current_streak between 30 and 59 then '30–59 hari (1 bulan)'
    when current_streak between 60 and 99 then '60–99 hari (2 bulan)'
    else '100+ hari'
  end as kategori_streak,
  count(*)::int as jumlah_anggota
from streaks s
join members m on m.id = s.member_id and m.auth_user_id is not null
group by 1
order by 1;

-- Top 10 streak tertinggi
select
  m.name,
  s.current_streak,
  s.longest_streak,
  s.last_log_date
from streaks s
join members m on m.id = s.member_id
where m.auth_user_id is not null
order by s.current_streak desc
limit 10;

-- Rata-rata streak
select
  round(avg(current_streak)::numeric, 1) as rata_streak,
  max(current_streak)::int as streak_tertinggi
from streaks s
join members m on m.id = s.member_id and m.auth_user_id is not null;

-- ─────────────────────────────
-- 4. BUKU & RAK (Content)
-- ─────────────────────────────

-- Total buku di katalog
select
  count(*)::int as total_buku,
  count(*) filter (where is_curated)::int as curated,
  count(*) filter (where open_library_id is not null)::int as dari_open_library,
  count(*) filter (where enrichment_status = 'enriched')::int as enriched,
  count(*) filter (where enrichment_status = 'pending')::int as pending_enrich
from books;

-- Status rak (want / reading / done)
select
  status,
  count(*)::int as jumlah_item,
  count(distinct member_id)::int as unique_anggota
from shelf_items
group by 1
order by 1;

-- Buku paling banyak di-rak
select
  b.title,
  b.author,
  count(si.id)::int               as total_di_rak,
  count(*) filter (where si.status = 'reading')::int as dibaca,
  count(*) filter (where si.status = 'done')::int    as selesai
from shelf_items si
join books b on b.id = si.book_id
group by b.id, b.title, b.author
order by 4 desc
limit 20;

-- Buku selesai per minggu (last 12 weeks)
select
  date_trunc('week', si.finished_at)::date as minggu,
  count(*)::int                            as buku_selesai
from shelf_items si
where si.status = 'done'
  and si.finished_at >= now() - interval '12 weeks'
group by 1
order by 1;

-- ─────────────────────────────
-- 5. REVIEW
-- ─────────────────────────────

-- Total & rata-rata rating
select
  count(*)::int                         as total_review,
  round(avg(rating)::numeric, 2)        as rata_rating,
  count(*) filter (where is_public)::int as publik,
  min(published_at)::date               as review_pertama,
  max(published_at)::date               as review_terbaru
from reviews;

-- Distribusi rating
select
  rating as bintang,
  count(*)::int as jumlah
from reviews
group by 1
order by 1;

-- Review per hari (last 30 days)
select
  date_trunc('day', published_at)::date as tanggal,
  count(*)::int                         as review_baru
from reviews
where published_at >= now() - interval '30 days'
group by 1
order by 1;

-- Buku paling banyak di-review
select
  b.title,
  b.author,
  count(r.id)::int           as total_review,
  round(avg(r.rating)::numeric, 1) as rata_rating
from reviews r
join shelf_items si on si.id = r.shelf_item_id
join books b on b.id = si.book_id
group by b.id, b.title, b.author
order by 3 desc
limit 15;

-- ─────────────────────────────
-- 6. KELUARGA (Social)
-- ─────────────────────────────

-- Ukuran keluarga
select
  case
    when jml = 1 then '1 — Sendiri'
    when jml = 2 then '2 — Pasangan'
    when jml between 3 and 4 then '3–4 — Keluarga kecil'
    when jml between 5 and 6 then '5–6 — Keluarga sedang'
    else '7+ — Keluarga besar'
  end as ukuran_keluarga,
  count(*)::int as jumlah_keluarga
from (
  select family_id, count(*)::int as jml
  from members
  group by family_id
) sub
group by 1
order by 1;

-- Keluarga dengan total streak terbanyak
select
  f.name,
  count(m.id)::int as anggota,
  sum(s.current_streak)::int as total_streak,
  max(s.current_streak)::int as streak_tertinggi
from families f
join members m on m.family_id = f.id
left join streaks s on s.member_id = m.id
group by f.id, f.name
having sum(s.current_streak) > 0
order by 3 desc
limit 10;

-- ─────────────────────────────
-- 7. ONBOARDING FUNNEL
-- ─────────────────────────────

with anggota as (
  select
    m.id,
    m.auth_user_id is not null as punya_akun,
    exists (select 1 from shelf_items si where si.member_id = m.id) as punya_buku,
    exists (select 1 from reading_logs rl where rl.member_id = m.id) as punya_log,
    (m.weekly_pages_goal > 0) as punya_target,
    exists (select 1 from members m2 where m2.family_id = m.family_id and m2.id != m.id) as punya_keluarga
  from members m
)
select
  count(*)::int                                   as total_anggota,
  count(*) filter (where punya_akun)::int         as punya_akun,
  count(*) filter (where punya_buku)::int         sebagai_tambah_buku,
  count(*) filter (where punya_log)::int          sebagai_catat_bacaan,
  count(*) filter (where punya_target)::int       sebagai_atur_target,
  count(*) filter (where punya_keluarga)::int     sebagai_ajak_keluarga,
  count(*) filter (where punya_buku and punya_log and punya_target)::int   sebagai_selesai_3_langkah
from anggota;

-- ─────────────────────────────
-- 8. NOTIFIKASI
-- ─────────────────────────────

select
  type,
  count(*)::int as total,
  count(*) filter (where is_read)::int as sudah_dibaca
from notifications
group by 1
order by 1;

-- ─────────────────────────────
-- 9. RINGKASAN (Snapshot hari ini)
-- ─────────────────────────────

select
  now()::date as tanggal,
  -- Growth
  (select count(*) from families)                                             as total_keluarga,
  (select count(*) from members)                                              as total_anggota,
  (select count(*) from members where auth_user_id is not null)               as total_terdaftar,
  (select count(*) from members where auth_user_id is null)                   sebagai_total_anak,
  -- Activity Today
  (select count(distinct member_id) from reading_logs where log_date = current_date) as pembaca_aktif_hari_ini,
  (select coalesce(sum(pages_read), 0) from reading_logs where log_date = current_date) as halaman_hari_ini,
  (select count(*) from reading_logs where log_date = current_date)           sebagai_sesi_hari_ini,
  -- Content
  (select count(*) from books)                                                sebagai_total_buku,
  (select count(*) from shelf_items)                                          sebagai_total_item_rak,
  (select count(*) from shelf_items where status = 'reading')                 sebagai_sedang_dibaca,
  (select count(*) from shelf_items where status = 'done')                    sebagai_selesai,
  (select count(*) from reviews)                                              sebagai_total_review,
  -- Streak
  (select round(avg(current_streak)::numeric, 1) from streaks s
     join members m on m.id = s.member_id and m.auth_user_id is not null)     sebagai_rata_streak,
  (select count(*) from streaks where current_streak >= 7)                    sebagai_streak_7_hari;

-- ============================================================
-- REAL-TIME DASHBOARD VIA SUPABASE
-- ============================================================
-- Cara pakai:
-- 1. Buka Supabase → SQL Editor → paste queries di atas
-- 2. Save sebagai snippet: "📊 Metrics Dashboard"
-- 3. Untuk real-time:
--    a. Buka Supabase → Reports → buat report dari query favorit
--    b. Atau gunakan Metabase / Grafana terhubung ke DB
--    c. Atau buat halaman admin sendiri di /admin/metrics
--       yang fetch dari API endpoint /api/metrics
-- ============================================================
