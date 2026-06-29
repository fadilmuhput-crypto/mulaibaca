-- ==========================================
-- MULAIBACA BLOG SETUP
-- Jalankan SEMUA query ini di Supabase SQL Editor
-- ==========================================

-- 1. BUAT TABEL (skip jika sudah ada)
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

-- 2. ROW LEVEL SECURITY
alter table blog_posts enable row level security;

create policy "blog_posts_public_read" on blog_posts
  for select using (is_published = true);

create policy "blog_posts_admin_all" on blog_posts
  for all using (true);

-- 3. SEED DATA (10 ARTIKEL)
-- Aman dijalankan berulang kali (ON CONFLICT skip)
insert into blog_posts (title, slug, excerpt, content, author_name, cover_image, is_published, published_at) values
(
  'Cara Membangun Budaya Membaca di Rumah untuk Keluarga Indonesia',
  'cara-membangun-budaya-membaca-di-rumah',
  'Panduan praktis untuk orang tua dalam membangun kebiasaan membaca bersama keluarga, mulai dari menyediakan pojok baca hingga memilih buku yang tepat.',
  '<p>Membangun budaya membaca di rumah bukanlah hal yang instan, tetapi dengan konsistensi dan pendekatan yang tepat, setiap keluarga bisa melakukannya. Berikut adalah langkah-langkah praktis yang bisa Anda terapkan:</p>

<h2>1. Sediakan Pojok Baca Keluarga</h2>
<p>Tidak perlu ruangan besar. Cukup sediakan sudut kecil di rumah yang nyaman dengan bantal, pencahayaan yang baik, dan rak buku yang mudah dijangkau anak-anak. Biarkan mereka memilih buku yang menarik minatnya.</p>

<h2>2. Jadikan Membaca sebagai Rutinitas</h2>
<p>Luangkan waktu 15–20 menit setiap hari untuk membaca bersama. Bisa dilakukan setelah makan malam atau sebelum tidur. Konsistensi lebih penting daripada durasi.</p>

<h2>3. Orang Tua sebagai Teladan</h2>
<p>Anak-anak belajar dari apa yang mereka lihat. Ketika mereka melihat orang tua membaca, mereka akan menganggap membaca sebagai aktivitas yang normal dan menyenangkan.</p>

<h2>4. Biarkan Anak Memilih</h2>
<p>Kunjungi toko buku atau perpustakaan bersama dan biarkan anak memilih buku yang menarik minatnya. Ketertarikan pribadi adalah motivator terkuat untuk membaca.</p>

<h2>5. Diskusikan Apa yang Dibaca</h2>
<p>Tanyakan pendapat anak tentang cerita yang dibaca. Diskusi kecil setelah membaca membantu anak memproses informasi dan mengembangkan kemampuan berpikir kritis.</p>

<p>Ingatlah bahwa tujuan utama adalah menumbuhkan kecintaan pada membaca, bukan memaksakan target jumlah buku. Nikmati prosesnya bersama keluarga!</p>',
  'Tim Mulaibaca',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
  true, now()
) on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, content, author_name, cover_image, is_published, published_at) values
(
  '10 Rekomendasi Buku Anak Usia 2–4 Tahun untuk Stimulasi Dini',
  'rekomendasi-buku-anak-usia-2-4-tahun',
  'Kumpulan buku anak terbaik untuk usia batita dan prasekolah. Pilihannya mulai dari buku sensory, board book, hingga cerita interaktif.',
  '<p>Memilih buku yang tepat untuk anak usia 2–4 tahun bisa menjadi tantangan tersendiri. Pada usia ini, anak-anak membutuhkan buku yang merangsang indra, sederhana, dan interaktif. Berikut rekomendasi dari Mulaibaca:</p>

<h2>1. Buku dengan Tekstur Berbeda (Touch and Feel)</h2>
<p>Buku-buku yang memiliki elemen tekstur membantu merangsang indra peraba anak. Anak-anak suka menyentuh bulu domba yang lembut atau sisik ikan yang kasar.</p>

<h2>2. Board Book dengan Warna Kontras</h2>
<p>Board book yang kokoh dengan ilustrasi warna-warni kontras sangat cocok untuk batita. Mereka bisa membolak-balik halaman tanpa khawatir merobek kertas.</p>

<h2>3. Buku Lift-the-Flap</h2>
<p>Buku dengan lipatan yang bisa dibuka memberikan elemen kejutan yang membuat anak-anak antusias. Setiap kali mereka membuka lipatan, ada sesuatu yang baru untuk ditemukan.</p>

<h2>4. Buku Cerita Sederhana dengan Pengulangan</h2>
<p>Cerita dengan pola pengulangan seperti "Brown Bear, Brown Bear, What Do You See?" membantu anak belajar bahasa dan memprediksi apa yang akan terjadi selanjutnya.</p>

<h2>5. Buku Lagu dan Nursery Rhyme</h2>
<p>Buku yang berisi lagu anak-anak klasik membantu mengembangkan kemampuan bahasa dan ritme. Nyanyikan bersama sambil menunjuk kata-kata di halaman.</p>

<p>Yang terpenting, pilihlah buku yang juga Anda nikmati untuk dibacakan. Antusiasme orang tua akan menular kepada si kecil!</p>',
  'Tim Mulaibaca',
  'https://images.unsplash.com/photo-1596461427651-abbc058040ef?w=800&q=80',
  true, now()
) on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, content, author_name, cover_image, is_published, published_at) values
(
  'Tips Memilih Buku Bacaan untuk Anak Usia SD (6–12 Tahun)',
  'tips-memilih-buku-anak-usia-sd',
  'Panduan memilih buku yang sesuai dengan tahap perkembangan membaca anak SD, dari pembaca pemula hingga mahir.',
  '<p>Usia SD adalah masa kritis dalam perkembangan literasi anak. Pada fase ini, anak-anak bertransisi dari "belajar membaca" menjadi "membaca untuk belajar". Berikut tips memilih buku yang tepat:</p>

<h2>Kenali Tahap Membaca Anak</h2>
<p>Setiap anak berkembang dengan kecepatan berbeda. Kenali apakah anak Anda masih di tahap membaca dengan bantuan, sudah mulai membaca mandiri, atau sudah lancar membaca. Pilihlah buku yang sesuai dengan tahap mereka.</p>

<h2>Pertimbangkan Minat Anak</h2>
<p>Anak yang suka dinosaurus, misalnya, akan lebih termotivasi membaca jika diberikan buku tentang dinosaurus. Cari tahu apa yang sedang menjadi favorit anak dan gunakan itu sebagai pintu masuk ke dunia membaca.</p>

<h2>Variasikan Jenis Buku</h2>
<p>Jangan hanya memberikan buku cerita fiksi. Berikan juga buku non-fiksi, komik edukatif, ensiklopedia anak, dan majalah anak. Variasi akan memperkaya pengalaman membaca dan pengetahuan mereka.</p>

<h2>Perhatikan Tingkat Kesulitan</h2>
<p>Aturan praktis: anak seharusnya bisa membaca setidaknya 95% kata dalam buku dengan lancar. Jika terlalu sulit, anak akan frustrasi. Jika terlalu mudah, mereka akan bosan.</p>

<h2>Libatkan Anak dalam Memilih</h2>
<p>Ajak anak ke toko buku atau perpustakaan dan biarkan mereka memilih sendiri buku yang menarik minatnya. Rasa memiliki ini akan meningkatkan motivasi membaca.</p>

<p>Ingatlah bahwa setiap anak memiliki jalur belajarnya sendiri. Yang terpenting adalah menjaga agar membaca tetap menjadi aktivitas yang menyenangkan!</p>',
  'Tim Mulaibaca',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80',
  true, now()
) on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, content, author_name, cover_image, is_published, published_at) values
(
  'Mengapa Membaca Nyaring (Read Aloud) Penting untuk Perkembangan Anak?',
  'pentingnya-membaca-nyaring-read-aloud',
  'Temukan manfaat membaca nyaring untuk perkembangan bahasa, kognitif, dan emosional anak. Plus tips praktis memulai read aloud di rumah.',
  '<p>Membaca nyaring atau read aloud adalah aktivitas membacakan buku dengan suara keras kepada anak. Kegiatan ini mungkin terlihat sederhana, tetapi dampaknya pada perkembangan anak sangat luar biasa.</p>

<h2>Manfaat Read Aloud</h2>

<h3>1. Mengembangkan Kosakata</h3>
<p>Anak-anak yang sering dibacakan buku memiliki kosakata yang lebih kaya dibandingkan yang tidak. Mereka terpapar pada kata-kata yang mungkin tidak muncul dalam percakapan sehari-hari.</p>

<h3>2. Membangun Koneksi Emosional</h3>
<p>Momen membaca bersama menciptakan ikatan yang kuat antara orang tua dan anak. Suara hangat orang tua dan kedekatan fisik saat membaca memberikan rasa aman dan nyaman.</p>

<h3>3. Mengembangkan Kemampuan Mendengar</h3>
<p>Read aloud melatih anak untuk mendengarkan dengan penuh perhatian — keterampilan penting yang akan berguna di sekolah dan kehidupan.</p>

<h3>4. Memperkenalkan Struktur Cerita</h3>
<p>Melalui read aloud, anak belajar tentang alur cerita, karakter, konflik, dan resolusi. Ini adalah fondasi untuk pemahaman bacaan di kemudian hari.</p>

<h2>Tips Read Aloud untuk Orang Tua</h2>
<ul>
<li>Gunakan suara yang ekspresif — karakter berbeda dengan suara berbeda</li>
<li>Ajak anak berinteraksi: tanyakan "menurutmu apa yang akan terjadi?"</li>
<li>Jangan takut mengulang buku yang sama — pengulangan membantu pemahaman</li>
<li>Bacalah dengan kecepatan yang nyaman untuk anak</li>
<li>Ikuti minat anak, bahkan jika itu berarti membaca buku yang sama 20 kali</li>
</ul>

<p>Mulailah read aloud sejak dini, dan jadikan ini sebagai ritual harian yang dinanti-nantikan oleh keluarga Anda!</p>',
  'Tim Mulaibaca',
  'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80',
  true, now()
) on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, content, author_name, cover_image, is_published, published_at) values
(
  'Peran Ayah dalam Membangun Literasi Keluarga',
  'peran-ayah-membangun-literasi-keluarga',
  'Dads, peran Anda sama pentingnya dalam menumbuhkan cinta membaca pada anak. Simak tips dan manfaatnya di sini.',
  '<p>Sering kali, kegiatan membaca anak lebih identik dengan ibu. Padahal, peran ayah dalam membangun literasi keluarga sama pentingnya dan memberikan dampak unik tersendiri.</p>

<h2>Mengapa Peran Ayah Penting?</h2>

<h3>1. Memberikan Perspektif Berbeda</h3>
<p>Ayah sering kali memiliki gaya membaca yang berbeda — lebih ekspresif, lebih fisik, dan lebih petualang. Gaya ini memberikan pengalaman membaca yang berbeda dan menyegarkan bagi anak.</p>

<h3>2. Mematahkan Stereotip Gender</h3>
<p>Ketika anak melihat ayahnya membaca, mereka belajar bahwa membaca bukanlah aktivitas yang gender-spesifik. Ini penting terutama untuk anak laki-laki yang sering menganggap membaca sebagai aktivitas feminin.</p>

<h3>3. Memperkuat Ikatan</h3>
<p>Read aloud bersama ayah menciptakan momen kualitas yang tak tergantikan. Ini adalah waktu di mana ayah dan anak terhubung tanpa gangguan gadget atau pekerjaan.</p>

<h2>Tips untuk Ayah</h2>
<ul>
<li>Jadwalkan waktu khusus — bahkan 10 menit sehari sudah cukup</li>
<li>Pilih buku yang Anda nikmati juga — antusiasme itu menular</li>
<li>Bacakan buku tentang hobi Anda: olahraga, alam, sains</li>
<li>Gunakan suara dan gerakan — anak-anak menyukai ayah yang ekspresif</li>
<li>Diskusikan cerita: "Apa yang akan kamu lakukan jika kamu jadi tokoh itu?"</li>
</ul>

<p>Literasi bukanlah kompetisi. Ayah dan ibu memiliki peran yang sama penting dan saling melengkapi. Yang terpenting adalah anak melihat bahwa membaca adalah aktivitas keluarga yang menyenangkan.</p>',
  'Tim Mulaibaca',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
  true, now()
) on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, content, author_name, cover_image, is_published, published_at) values
(
  'Cara Mengelola Screen Time dan Mendorong Minat Baca Anak',
  'mengelola-screen-time-mendorong-minat-baca',
  'Kiat menyeimbangkan waktu layar dan kebiasaan membaca anak. Strategi yang realistis untuk keluarga modern.',
  '<p>Di era digital, gadget adalah bagian tak terpisahkan dari kehidupan keluarga. Daripada melarang sepenuhnya, pendekatan yang lebih bijak adalah mengelola screen time dan menjadikan buku sebagai alternatif yang menarik.</p>

<h2>Strategi Mengelola Screen Time</h2>

<h3>1. Buat Zona Bebas Gadget</h3>
<p>Tentukan area di rumah yang bebas dari gadget — misalnya kamar tidur atau meja makan. Di zona ini, hanya buku dan percakapan yang boleh ada.</p>

<h3>2. Tetapkan Waktu Layar yang Jelas</h3>
<p>Buat kesepakatan keluarga tentang kapan dan berapa lama anak boleh menggunakan gadget. Konsistenlah dengan aturan ini.</p>

<h3>3. Jadikan Membaca sebagai Alternatif Pertama</h3>
<p>Sebelum menawarkan gadget saat anak bosan, arahkan mereka ke buku. Sediakan buku-buku menarik yang mudah dijangkau.</p>

<h2>Membuat Buku Semenarik Gadget</h2>
<ul>
<li>Pilih buku dengan ilustrasi yang kaya dan warna-warni</li>
<li>Gunakan buku interaktif: pop-up, lift-the-flap, atau buku dengan aktivitas</li>
<li>Coba buku audio atau buku digital untuk variasi</li>
<li>Buat tantangan membaca dengan hadiah sederhana</li>
<li>Ajak anak membuat buku cerita mereka sendiri</li>
</ul>

<h2>Gunakan Teknologi dengan Bijak</h2>
<p>Bukan berarti teknologi harus dijauhi sepenuhnya. Ada banyak aplikasi membaca yang berkualitas, buku digital interaktif, dan audiobook yang bisa menjadi pelengkap pengalaman membaca anak.</p>

<p>Yang terpenting adalah keseimbangan. Bukan gadget vs buku, melainkan bagaimana keduanya bisa saling melengkapi dalam perjalanan literasi anak.</p>',
  'Tim Mulaibaca',
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
  true, now()
) on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, content, author_name, cover_image, is_published, published_at) values
(
  'Membaca untuk Remaja: Tantangan dan Cara Mengatasinya',
  'membaca-untuk-remaja-tantangan-dan-cara-mengatasinya',
  'Masa remaja adalah fase krusial literasi. Simak cara membuat remaja tetap tertarik membaca di tengah godaan media sosial.',
  '<p>Masa remaja adalah salah satu periode paling menantang untuk menjaga minat baca. Media sosial, game, dan tuntutan akademik sering kali membuat membaca untuk kesenangan menjadi prioritas yang terpinggirkan.</p>

<h2>Tantangan Membaca pada Remaja</h2>

<h3>1. Kompetisi dengan Media Sosial</h3>
<p>Remaja menghabiskan rata-rata 5–7 jam per hari di layar. Membaca buku harus bersaing dengan notifikasi, video pendek, dan pesan instan.</p>

<h3>2. Anggapan Membaca Itu Membosankan</h3>
<p>Bagi remaja yang tidak dibiasakan membaca sejak kecil, buku sering dianggap sebagai aktivitas yang lambat dan tidak menarik.</p>

<h3>3. Tekanan Akademik</h3>
<p>Buku pelajaran dan tugas sekolah yang menumpuk membuat remaja enggan membaca buku lain di waktu luang.</p>

<h2>Cara Mengatasinya</h2>

<h3>1. Beri Kebebasan Memilih</h3>
<p>Jangan memaksakan buku "bermutu" atau "klasik". Biarkan remaja membaca apa pun yang menarik minatnya: novel grafis, komik, buku fans, atau bahkan majalah. Yang penting adalah membaca.</p>

<h3>2. Gunakan Teknologi</h3>
<p>E-book dan audiobook bisa menjadi pintu masuk. Remaja yang tidak suka membaca teks bisa mulai dengan audiobook saat bepergian atau berolahraga.</p>

<h3>3. Ciptakan Komunitas Membaca</h3>
<p>Dorong remaja untuk membuat klub buku bersama teman-temannya. Diskusi tentang buku yang sama bisa menjadi pengalaman sosial yang menyenangkan.</p>

<h3>4. Jadilah Teladan</h3>
<p>Remaja lebih mungkin membaca jika mereka melihat orang tua dan kakak-adik mereka juga membaca. Tunjukkan bahwa membaca adalah bagian dari gaya hidup, bukan tugas.</p>

<p>Ingatlah: target kita adalah menumbuhkan cinta membaca jangka panjang, bukan memaksakan jumlah buku tertentu dalam waktu singkat.</p>',
  'Tim Mulaibaca',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80',
  true, now()
) on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, content, author_name, cover_image, is_published, published_at) values
(
  'Membuat Perpustakaan Mini di Rumah: Panduan Lengkap',
  'membuat-perpustakaan-mini-di-rumah',
  'Cara mudah dan hemat membuat perpustakaan mini di rumah untuk keluarga. Mulai dari rak buku hingga sistem peminjaman sederhana.',
  '<p>Memiliki perpustakaan mini di rumah adalah impian banyak keluarga. Tidak perlu ruangan besar atau anggaran mahal. Berikut panduan lengkapnya:</p>

<h2>1. Pilih Lokasi yang Tepat</h2>
<p>Perpustakaan mini tidak harus di ruangan terpisah. Manfaatkan sudut ruang keluarga, area di bawah tangga, atau lorong yang tidak terpakai. Yang penting adalah lokasi yang nyaman dan mudah diakses.</p>

<h2>2. Sediakan Rak Buku yang Fungsional</h2>
<p>Rak buku tidak perlu mahal. Rak kayu sederhana, rak kawat, atau bahkan kardus bekas yang dihias bisa menjadi tempat penyimpanan buku yang menarik. Atur buku dengan sampul menghadap ke depan agar lebih menarik untuk anak-anak.</p>

<h2>3. Kategorikan Buku</h2>
<p>Kelompokkan buku berdasarkan kategori: buku anak usia dini, buku anak SD, buku remaja, buku dewasa, atau berdasarkan genre. Ini memudahkan anggota keluarga menemukan buku yang dicari.</p>

<h2>4. Buat Sistem Peminjaman Sederhana</h2>
<p>Untuk keluarga besar, buat sistem peminjaman sederhana. Buku catatan kecil atau spreadsheet bisa digunakan untuk mencatat buku yang dipinjam dan dikembalikan. Ini mengajarkan tanggung jawab pada anak.</p>

<h2>5. Rawat Koleksi Buku</h2>
<p>Ajari anak cara merawat buku: mencuci tangan sebelum membaca, tidak membanting buku, dan mengembalikan ke rak setelah selesai. Rawat buku dengan sampul plastik jika perlu.</p>

<h2>6. Perbarui Koleksi Secara Berkala</h2>
<p>Tukar buku dengan teman atau keluarga, kunjungi perpustakaan umum, atau manfaatkan layanan pinjam buku online untuk menyegarkan koleksi tanpa mengeluarkan biaya besar.</p>

<p>Ingatlah bahwa perpustakaan mini yang sukses bukanlah yang terbesar atau termahal, melainkan yang paling sering digunakan oleh seluruh anggota keluarga.</p>',
  'Tim Mulaibaca',
  'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800&q=80',
  true, now()
) on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, content, author_name, cover_image, is_published, published_at) values
(
  'Jurnal Membaca Keluarga: Cara Seru Tracking Progres Bacaan',
  'jurnal-membaca-keluarga-tracking-progres',
  'Manfaat membuat jurnal membaca keluarga dan cara memulainya. Plus template sederhana yang bisa digunakan.',
  '<p>Jurnal membaca keluarga adalah salah satu alat paling efektif untuk membangun budaya literasi di rumah. Selain membantu tracking progres, jurnal juga menjadi kenang-kenangan berharga perjalanan membaca keluarga.</p>

<h2>Manfaat Jurnal Membaca Keluarga</h2>

<h3>1. Visualisasi Progres</h3>
<p>Melihat buku-buku yang sudah selesai dibaca memberikan rasa pencapaian. Anak-anak termotivasi ketika mereka bisa melihat seberapa banyak yang sudah mereka baca.</p>

<h3>2. Mendorong Refleksi</h3>
<p>Menulis pendapat tentang buku yang dibaca membantu anak mengembangkan pemikiran kritis dan kemampuan menulis.</p>

<h3>3. Menjadi Kenangan</h3>
<p>Jurnal membaca adalah dokumentasi perjalanan literasi keluarga. Di masa depan, akan sangat berharga melihat kembali buku apa saja yang dibaca bersama.</p>

<h2>Cara Memulai Jurnal Membaca Keluarga</h2>

<h3>1. Pilih Format</h3>
<p>Bisa berupa buku catatan fisik, spreadsheet digital, atau aplikasi khusus seperti Mulaibaca. Pilih format yang paling nyaman untuk keluarga Anda.</p>

<h3>2. Tentukan Informasi yang Dicatat</h3>
<p>Informasi dasar: judul buku, penulis, tanggal selesai baca. Untuk yang lebih detail: rating, kesan, kata favorit dari buku, atau gambar adegan favorit.</p>

<h3>3. Buat Rutinitas</h3>
<p>Jadwalkan waktu tertentu untuk mengisi jurnal, misalnya setiap akhir pekan. Bisa juga diisi setelah selesai membaca buku.</p>

<h3>4. Rayakan Milestone</h3>
<p>Berikan penghargaan sederhana setiap kali mencapai target tertentu: 10 buku, 50 buku, atau streak membaca 30 hari berturut-turut.</p>

<p>Dengan Mulaibaca, Anda bisa tracking progres membaca seluruh anggota keluarga secara otomatis. Mulai dari log harian, streak, hingga review buku — semuanya tercatat rapi dalam satu platform.</p>',
  'Tim Mulaibaca',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80',
  true, now()
) on conflict (slug) do nothing;

insert into blog_posts (title, slug, excerpt, content, author_name, cover_image, is_published, published_at) values
(
  'Review Buku vs Log Membaca: Mana yang Lebih Penting untuk Perkembangan Literasi Anak?',
  'review-buku-vs-log-membaca-literasi-anak',
  'Para ahli sepakat: keduanya penting. Simak perbedaan fungsi review buku dan log membaca, serta bagaimana keduanya saling melengkapi.',
  '<p>Dalam perjalanan literasi anak, ada dua aktivitas yang sering membingungkan orang tua: review buku (menulis ulasan) dan log membaca (mencatat progres). Mana yang lebih penting?</p>

<p>Jawabannya: keduanya penting, tetapi untuk tujuan yang berbeda.</p>

<h2>Log Membaca: Membangun Konsistensi</h2>
<p>Log membaca berfokus pada kuantitas dan konsistensi. Ini mencatat: buku apa yang dibaca, berapa halaman, berapa lama, dan tanggal membacanya.</p>
<p><strong>Manfaat:</strong> Membantu membangun kebiasaan, memberikan motivasi visual, dan membantu orang tua memantau perkembangan anak.</p>

<h2>Review Buku: Mengembangkan Pemikiran Kritis</h2>
<p>Review buku berfokus pada kualitas pemahaman. Ini mendorong anak untuk: menganalisis cerita, menyampaikan pendapat, dan merekomendasikan buku kepada orang lain.</p>
<p><strong>Manfaat:</strong> Mengembangkan kemampuan berpikir kritis, menulis, dan komunikasi.</p>

<h2>Mengapa Keduanya Diperlukan?</h2>
<p>Log membaca dan review buku saling melengkapi. Log membaca membangun kebiasaan dan konsistensi, sementara review buku mengembangkan kedalaman pemahaman. Anak yang hanya membuat log tanpa review mungkin kehilangan kesempatan untuk merefleksikan bacaannya. Sebaliknya, anak yang hanya membuat review tanpa log mungkin sulit membangun rutinitas yang konsisten.</p>

<h2>Cara Mengintegrasikan Keduanya</h2>
<ul>
<li>Gunakan log membaca sebagai rutinitas harian (5 menit)</li>
<li>Gunakan review buku sebagai aktivitas mingguan atau per buku</li>
<li>Untuk anak yang lebih kecil, review bisa berupa gambar atau diskusi lisan</li>
<li>Untuk remaja, review bisa lebih mendalam dan analitis</li>
</ul>

<p>Dengan Mulaibaca, keluarga bisa melakukan keduanya secara mudah — mencatat log harian dan menulis review buku dalam satu platform.</p>',
  'Tim Mulaibaca',
  'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
  true, now()
) on conflict (slug) do nothing;
