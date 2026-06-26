-- Seed: Buku Anak-Anak (Batch 2) — melengkapi kategori yang belum terwakili
-- Jalankan di Supabase Dashboard → SQL Editor setelah seed-anak.sql
-- Idempotent: hanya insert jika title belum ada (case-insensitive)

INSERT INTO curated_books (title, author, cover_url, open_library_id, isbn, total_pages, description, category, categories, tags, publisher, published_year, language, is_active, sort_order)
SELECT * FROM (VALUES

  -- ══════════════════════════════════════════════
  -- FABEL & DONGENG NUSANTARA (tambahan)
  -- ══════════════════════════════════════════════
  ('Cinderella', 'Adaptasi', NULL, NULL, NULL, 48,
   'Gadis baik hati yang diperlakukan kasar oleh ibu tiri dan saudari tirinya akhirnya pergi ke pesta dansa berkat bantuan ibu peri.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['dongeng', 'cerita anak', 'anak', 'children', 'klasik'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Putri Salju dan Tujuh Kurcaci', 'Adaptasi', NULL, NULL, NULL, 48,
   'Putri Salju yang cantik diusir oleh ratu jahat dan berlindung di pondok tujuh kurcaci di tengah hutan.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['dongeng', 'cerita anak', 'anak', 'children', 'klasik'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Putri Tidur', 'Adaptasi', NULL, NULL, NULL, 48,
   'Seorang putri tertidur selama seratus tahun akibat kutukan, lalu dibangunkan oleh ciuman pangeran yang berani.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['dongeng', 'cerita anak', 'anak', 'children', 'klasik'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Si Kancil Mencuri Timun', 'Cerita Rakyat Indonesia', NULL, NULL, NULL, 40,
   'Kancil yang cerdik mencuri timun dari kebun petani dengan berbagai akal bulus. Fabel klasik tentang kecerdasan versus kecerobohan.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['cerita rakyat', 'fabel', 'anak', 'dongeng', 'Indonesia'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Kera dan Ayam', 'Cerita Rakyat Indonesia', NULL, NULL, NULL, 36,
   'Persahabatan antara kera dan ayam yang selalu rukun. Kisah sederhana tentang tolong-menolong dan kesetiaan.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['cerita rakyat', 'fabel', 'anak', 'dongeng', 'Indonesia'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Belalang dan Semut', 'Adaptasi Aesop', NULL, NULL, NULL, 32,
   'Belalang yang malas bermain musik sepanjang musim panas, sementara semut bekerja keras menyiapkan makanan untuk musim dingin.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['fabel', 'dongeng', 'anak', 'cerita anak', 'moral', 'klasik'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Kura-Kura dan Kelinci', 'Adaptasi Aesop', NULL, NULL, NULL, 32,
   'Kelinci sombong menantang kura-kura berlomba, lalu tertidur di tengah jalan. Kura-kura yang pelan tapi tetap bergerak justru menang.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['fabel', 'dongeng', 'anak', 'cerita anak', 'moral', 'klasik'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Singa dan Tikus', 'Adaptasi Aesop', NULL, NULL, NULL, 32,
   'Singa besar menolong tikus kecil. Saat singa terjerat jaring, tikus kecil datang membalas budi. Kebaikan tak pernah sia-sia.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['fabel', 'dongeng', 'anak', 'cerita anak', 'moral', 'klasik'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('The Ugly Duckling', 'Hans Christian Andersen',
   'https://covers.openlibrary.org/b/isbn/9780735812725-M.jpg', NULL, '9780735812725', 32,
   'Anak itik yang berbeda dari saudara-saudaranya diejek karena dianggap jelek. Namun ia tumbuh menjadi angsa yang cantik. Kisah tentang penerimaan diri.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['dongeng', 'cerita anak', 'anak', 'children', 'klasik', 'moral'],
   'NorthSouth Books', 1999, 'id', true, 0),

  ('The Emperor''s New Clothes', 'Hans Christian Andersen',
   'https://covers.openlibrary.org/b/isbn/9780698116562-M.jpg', 'OL6109891W', '9780698116562', 32,
   'Kaisar yang sombong tertipu oleh penjahit yang mengaku bisa membuat baju ajaib. Hanya seorang anak polos yang berani mengatakan kebenaran.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['dongeng', 'cerita anak', 'anak', 'children', 'klasik', 'moral'],
   'Puffin Books', 1998, 'id', true, 0),

  ('The Little Mermaid', 'Hans Christian Andersen',
   'https://covers.openlibrary.org/b/isbn/9780689811533-M.jpg', 'OL347293W', '9780689811533', 48,
   'Putri duyung kecil rela mengorbankan suaranya demi bisa berjalan di darat dan mendapatkan cinta pangeran. Dongeng klasik yang mengharukan.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['dongeng', 'cerita anak', 'anak', 'children', 'klasik', 'fantasi'],
   'Simon & Schuster', 1997, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- KOMIK & NOVEL GRAFIS ANAK
  -- ══════════════════════════════════════════════
  ('Tintin: Petualangan Tintin di Negeri Soviet', 'Hergé',
   'https://covers.openlibrary.org/b/isbn/9780316358149-M.jpg', NULL, '9780316358149', 144,
   'Tintin, wartawan muda pemberani, memulai petualangan pertamanya ke Uni Soviet bersama Milo si anjing setia.',
   'anak', ARRAY['fiksi', 'komik-grafis'], ARRAY['komik', 'petualangan', 'anak', 'chapter book', 'children'],
   'Gramedia Pustaka Utama', 1930, 'id', true, 0),

  ('Asterix si Galia', 'René Goscinny',
   'https://covers.openlibrary.org/b/isbn/9780752866077-M.jpg', 'OL44629W', '9780752866077', 48,
   'Asterix dan Obelix, dua prajurit Galia, melindungi desa mereka dari invasi Romawi berkat ramuan ajaib sang dukun.',
   'anak', ARRAY['fiksi', 'komik-grafis'], ARRAY['komik', 'petualangan', 'humor', 'anak', 'children'],
   'Hachette', 1961, 'id', true, 0),

  ('Garfield: Kucing Gemuk Pemalas', 'Jim Davis',
   'https://covers.openlibrary.org/b/isbn/9780345464460-M.jpg', 'OL280919W', '9780345464460', 128,
   'Koleksi strip komik Garfield — kucing oranye gemuk yang suka makan lasagna, benci Senin, dan pemiliknya Jon Arbuckle.',
   'anak', ARRAY['fiksi', 'komik-grafis'], ARRAY['komik', 'humor', 'anak', 'children'],
   'Ballantine Books', 1980, 'id', true, 0),

  ('Petualangan Nobita: Doraemon', 'Fujiko F. Fujio',
   'https://covers.openlibrary.org/b/isbn/9781421521888-M.jpg', 'OL24309849W', '9781421521888', 192,
   'Doraemon, kucing robot dari abad 22, datang membantu Nobita yang ceroboh dengan alat-alat ajaib dari kantong empat dimensinya.',
   'anak', ARRAY['fiksi', 'komik-grafis'], ARRAY['komik', 'petualangan', 'anak', 'children', 'manga'],
   'Elex Media Komputindo', 1970, 'id', true, 0),

  ('Crayon Shinchan', 'Yoshito Usui',
   NULL, NULL, NULL, 120,
   'Keseharian Shinchan, bocah TK yang nakal, lugu, dan kocak bersama keluarga dan teman-temannya di Kasukabe.',
   'anak', ARRAY['fiksi', 'komik-grafis'], ARRAY['komik', 'humor', 'anak', 'children', 'manga'],
   'Elex Media Komputindo', 1992, 'id', true, 0),

  ('Detektif Conan (Case Closed) #1', 'Gosho Aoyama',
   'https://covers.openlibrary.org/b/isbn/9781421555029-M.jpg', NULL, '9781421555029', 192,
   'Shinichi Kudo, detektif SMA jenius, mengecil menjadi anak SD setelah diracuni. Ia menyamar sebagai Conan Edogawa dan terus memecahkan kasus.',
   'anak', ARRAY['fiksi', 'komik-grafis'], ARRAY['komik', 'misteri', 'anak', 'children', 'manga'],
   'Elex Media Komputindo', 1994, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- BUKU ISLAMI & PENDIDIKAN AGAMA ANAK
  -- ══════════════════════════════════════════════
  ('Kisah Para Nabi untuk Anak', 'Abu Hurairah', NULL, NULL, NULL, 128,
   'Kisah 25 nabi dan rasul yang dikisahkan dengan bahasa sederhana untuk anak. Dilengkapi ilustrasi dan pesan moral dari setiap kisah.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['agama', 'edukasi', 'anak', 'children', 'islam', 'moral'],
   'Mizan Kids', 2018, 'id', true, 0),

  ('Aku Cinta Al-Quran', 'Tim Pustaka', NULL, NULL, NULL, 24,
   'Mengajarkan anak untuk mencintai Al-Quran sejak dini. Dilengkapi aktivitas seru dan kisah-kisah inspiratif dari dalam Al-Quran.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['agama', 'edukasi', 'anak', 'children', 'islam'],
   'Zikrul Kids', 2019, 'id', true, 0),

  ('Rukun Islam untuk Anak', 'Tim Pustaka', NULL, NULL, NULL, 32,
   'Belajar rukun Islam dengan cara menyenangkan: dari syahadat hingga haji. Disertai ilustrasi dan latihan sederhana.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['agama', 'edukasi', 'anak', 'children', 'islam'],
   'Zikrul Kids', 2019, 'id', true, 0),

  ('Doa Sehari-Hari untuk Anak', 'Tim Pustaka', NULL, NULL, NULL, 32,
   'Kumpulan doa pendek sehari-hari untuk anak: bangun tidur, makan, belajar, dan tidur. Dilengkapi teks Arab, latin, dan arti.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['agama', 'edukasi', 'anak', 'children', 'islam'],
   'Zikrul Kids', 2019, 'id', true, 0),

  ('Assalamualaikum: Belajar Sopan Santun', 'Nurul Ihsan', NULL, NULL, NULL, 24,
   'Cerita tentang pentingnya mengucapkan salam dan bersikap sopan dalam keseharian. Dilengkapi hadits dan adab Islami.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['agama', 'edukasi', 'anak', 'children', 'islam', 'moral'],
   'Luxima', 2020, 'id', true, 0),

  ('Seri Akhlak Mulia: Jujur', 'Nurul Ihsan', NULL, NULL, NULL, 24,
   'Kisah anak-anak yang belajar tentang kejujuran dalam kehidupan sehari-hari. Dilengkapi ayat Al-Quran dan hadits terkait.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['agama', 'edukasi', 'anak', 'children', 'islam', 'moral'],
   'Luxima', 2020, 'id', true, 0),

  ('Seri Akhlak Mulia: Tolong Menolong', 'Nurul Ihsan', NULL, NULL, NULL, 24,
   'Cerita tentang indahnya saling membantu sesama. Mengajarkan nilai kepedulian dan empati pada anak sejak dini.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['agama', 'edukasi', 'anak', 'children', 'islam', 'moral'],
   'Luxima', 2020, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- BUKU AKTIVITAS & KETERAMPILAN ANAK
  -- ══════════════════════════════════════════════
  ('Buku Aktivitas: Belajar Mengenal Angka 1–10', 'Tim Pustaka', NULL, NULL, NULL, 48,
   'Buku aktivitas untuk PAUD/TK: menulis angka, berhitung sederhana, mewarnai, dan menempel stiker. Stimulasi motorik halus dan kognitif.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['edukasi', 'aktivitas', 'anak', 'balita', 'children'],
   'Erlangga for Kids', 2021, 'id', true, 0),

  ('Buku Aktivitas: Belajar Membaca', 'Tim Pustaka', NULL, NULL, NULL, 48,
   'Metode belajar membaca untuk anak TK dan SD kelas 1. Dilengkapi latihan mengeja, membaca kata, dan kalimat sederhana.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['edukasi', 'aktivitas', 'anak', 'children', 'belajar'],
   'Erlangga for Kids', 2021, 'id', true, 0),

  ('Buku Mewarnai: Binatang Lucu', 'Tim Pustaka', NULL, NULL, NULL, 32,
   'Buku mewarnai dengan 30 gambar binatang lucu. Melatih kreativitas dan motorik halus anak. Cocok untuk usia 3–7 tahun.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['edukasi', 'aktivitas', 'anak', 'balita', 'children', 'mewarnai'],
   'Erlangga for Kids', 2020, 'id', true, 0),

  ('Origami untuk Anak: Seri Hewan', 'Tim Pustaka', NULL, NULL, NULL, 48,
   'Panduan origami sederhana untuk anak: lipat kertas menjadi berbagai bentuk hewan. Dilengkapi langkah bergambar dan kertas lipat.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['edukasi', 'aktivitas', 'anak', 'children', 'keterampilan'],
   'Gramedia Pustaka Utama', 2020, 'id', true, 0),

  ('100+ Percobaan Sains Seru untuk Anak', 'Elizabeth Snoke Harris',
   'https://covers.openlibrary.org/b/isbn/9781606521687-M.jpg', NULL, '9781606521687', 192,
   '101 eksperimen sains sederhana menggunakan barang sehari-hari. Dari gunung berapi soda kue hingga kristal garam. Aman dan edukatif!',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['sains', 'edukasi', 'anak', 'children', 'aktivitas'],
   'Reader''s Digest', 2011, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- BUKU ANAK TENTANG SAINS & ALAM
  -- ══════════════════════════════════════════════
  ('The Magic School Bus: Inside the Earth', 'Joanna Cole',
   'https://covers.openlibrary.org/b/isbn/9780590407595-M.jpg', 'OL7789553W', '9780590407595', 48,
   'Ibu Guru Frizzle membawa murid-muridnya naik bus ajaib menyusuri inti bumi. Belajar sains dengan petualangan yang seru!',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['sains', 'edukasi', 'anak', 'children', 'petualangan'],
   'Scholastic', 1987, 'id', true, 0),

  ('The Magic School Bus: Inside the Human Body', 'Joanna Cole',
   'https://covers.openlibrary.org/b/isbn/9780590408271-M.jpg', 'OL2860743W', '9780590408271', 48,
   'Bus ajaib mengecil dan masuk ke tubuh seorang murid! Petualangan seru mempelajari organ tubuh manusia.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['sains', 'edukasi', 'anak', 'children', 'petualangan'],
   'Scholastic', 1989, 'id', true, 0),

  ('National Geographic Kids: Why?', 'National Geographic',
   'https://covers.openlibrary.org/b/isbn/9781426309430-M.jpg', NULL, '9781426309430', 224,
   '100 pertanyaan ''mengapa'' yang paling sering ditanyakan anak — dari mengapa langit biru hingga mengapa zebra belang. Jawaban ilmiah yang mudah dipahami.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['sains', 'edukasi', 'anak', 'children', 'ensiklopedi'],
   'National Geographic, 2012', 2012, 'id', true, 0),

  ('Animals: A Children''s Encyclopedia', 'DK Publishing',
   'https://covers.openlibrary.org/b/isbn/9780756682259-M.jpg', NULL, '9780756682259', 304,
   'Ensiklopedia hewan bergambar untuk anak — dari A (aardvark) hingga Z (zebra). Dilengkapi foto spektakuler dan fakta menakjubkan.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['sains', 'edukasi', 'anak', 'children', 'ensiklopedi', 'hewan'],
   'DK Children', 2011, 'id', true, 0),

  ('Space: A Children''s Encyclopedia', 'DK Publishing',
   'https://covers.openlibrary.org/b/isbn/9780756670638-M.jpg', NULL, '9780756670638', 256,
   'Ensiklopedia antariksa bergambar untuk anak — planet, bintang, roket, dan astronot. Foto dari NASA dan fakta luar angkasa yang mencengangkan.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['sains', 'edukasi', 'anak', 'children', 'ensiklopedi'],
   'DK Children', 2010, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- BUKU ANAK POPULER LAINNYA
  -- ══════════════════════════════════════════════
  ('The Little Prince (Pangeran Kecil)', 'Antoine de Saint-Exupéry',
   'https://covers.openlibrary.org/b/isbn/9780156012195-M.jpg', 'OL35120W', '9780156012195', 96,
   'Pangeran kecil dari asteroid B-612 bertemu pilot yang terdampar di gurun Sahara. Kisah filosofis tentang persahabatan, cinta, dan makna hidup.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'filsafat', 'anak', 'children', 'dongeng'],
   'Harcourt', 1943, 'id', true, 0),

  ('Winnie the Pooh', 'A.A. Milne',
   'https://covers.openlibrary.org/b/isbn/9780525444430-M.jpg', 'OL20891W', '9780525444430', 176,
   'Petualangan Pooh si beruang gemar madu dan teman-temannya di Hundred Acre Wood — Piglet, Eeyore, Tigger, dan Christopher Robin.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'petualangan', 'anak', 'children', 'dongeng'],
   'Dutton', 1926, 'id', true, 0),

  ('The Jungle Book', 'Rudyard Kipling',
   'https://covers.openlibrary.org/b/isbn/9780140366846-M.jpg', 'OL20892W', '9780140366846', 224,
   'Mowgli, bocah yang dibesarkan serigala di hutan India, berteman dengan Baloo si beruang dan Bagheera si macan kumbang.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'petualangan', 'anak', 'children', 'dongeng'],
   'Puffin Books', 1894, 'id', true, 0),

  ('Heidi', 'Johanna Spyri',
   'https://covers.openlibrary.org/b/isbn/9780140366785-M.jpg', 'OL56150W', '9780140366785', 288,
   'Heidi, yatim piatu ceria, tinggal bersama kakeknya di pegunungan Alpen Swiss. Kisah mengharukan tentang cinta, alam, dan kesederhanaan.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'petualangan', 'anak', 'children', 'keluarga'],
   'Puffin Books', 1880, 'id', true, 0),

  ('A Little Princess', 'Frances Hodgson Burnett',
   'https://covers.openlibrary.org/b/isbn/9780141321073-M.jpg', 'OL14852310W', '9780141321073', 288,
   'Sara Crewe, putri seorang pengusaha kaya, jatuh miskin setelah ayahnya meninggal. Ia bertahan dengan imajinasi dan kebaikan hatinya.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'drama', 'anak', 'children', 'keluarga'],
   'Puffin Books', 1905, 'id', true, 0),

  ('Pippi Longstocking', 'Astrid Lindgren',
   'https://covers.openlibrary.org/b/isbn/9780140368789-M.jpg', 'OL263079W', '9780140368789', 160,
   'Pippi, gadis kecil super kuat dengan rambut oranye dikuncir, tinggal sendiri di Villa Villekulla bersama kuda dan monyetnya.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'petualangan', 'anak', 'children', 'humor'],
   'Puffin Books', 1945, 'id', true, 0),

  ('The Wonderful Wizard of Oz', 'L. Frank Baum',
   'https://covers.openlibrary.org/b/isbn/9780140366938-M.jpg', 'OL76463W', '9780140366938', 208,
   'Dorothy dan Toto tersapu angin topan ke negeri Oz. Bersama Scarecrow, Tin Woodman, dan Cowardly Lion, ia mencari jalan pulang.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'petualangan', 'anak', 'children', 'fantasi'],
   'Puffin Books', 1900, 'id', true, 0),

  ('Coraline', 'Neil Gaiman',
   'https://covers.openlibrary.org/b/isbn/9780061139376-M.jpg', 'OL2651623W', '9780061139376', 192,
   'Coraline menemukan pintu rahasia menuju dunia paralel yang tampak sempurna — tapi ada ''ibu lain'' dengan kancing di matanya. Seru dan menegangkan.',
   'lokal', ARRAY['fiksi'], ARRAY['fantasi', 'misteri', 'anak', 'chapter book', 'children'],
   'HarperCollins', 2002, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- BUKU REMAJA INDONESIA (tambahan)
  -- ══════════════════════════════════════════════
  ('Rindu', 'Tere Liye',
   NULL, NULL, NULL, 544,
   'Kisah berlatar kapal uap 1938 membawa rombongan haji Indonesia. Lima pertanyaan besar tentang kehidupan, takdir, dan Tuhan.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'sejarah', 'spiritualitas', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2015, 'id', true, 0),

  ('Rembulan Tenggelam di Wajahmu', 'Tere Liye',
   NULL, NULL, NULL, 400,
   'Rey, seorang yatim piatu yang tumbuh penuh kepahitan, mendapat kesempatan menjawab lima pertanyaan besar hidupnya sebelum ajal menjemput.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'spiritualitas', 'drama', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2020, 'id', true, 0),

  ('Hafalan Shalat Delisa', 'Tere Liye',
   NULL, NULL, NULL, 268,
   'Delisa, bocah 6 tahun dari Aceh, kehilangan segalanya dalam tsunami 2004 — namun semangatnya untuk menghafal shalat tak pernah padam.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'keluarga', 'spiritualitas', 'sejarah', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2005, 'id', true, 0),

  ('Ranah 3 Warna', 'Ahmad Fuadi',
   NULL, NULL, NULL, 473,
   'Alif meninggalkan Gontor dan mengejar mimpi kuliah di Bandung, lalu hijrah ke Kanada — perjuangan keras anak Minang menembus batas dunia.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'inspirasi', 'pendidikan', 'petualangan', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2011, 'id', true, 0),

  ('Rantau 1 Muara', 'Ahmad Fuadi',
   NULL, NULL, NULL, 424,
   'Alif akhirnya tiba di New York mengejar beasiswa bergengsi. Penutup Trilogi Negeri 5 Menara yang menyentuh tentang ketekunan dan cinta.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'inspirasi', 'pendidikan', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2013, 'id', true, 0),

  ('Bidadari-Bidadari Surga', 'Tere Liye',
   NULL, NULL, NULL, 348,
   'Kisah Laisa, kakak tertua yang mengorbankan segalanya demi adik-adiknya meraih pendidikan dan impian.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'keluarga', 'inspirasi', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2007, 'id', true, 0),

  ('Daun yang Jatuh Tak Pernah Membenci Angin', 'Tere Liye',
   NULL, NULL, NULL, 264,
   'Tania jatuh cinta pada Danar, pria yang menyelamatkan keluarganya dari kemiskinan. Kisah cinta yang menyentuh tentang keikhlasan.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'romance', 'keluarga', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('5 Cm', 'Donny Dhirgantoro',
   NULL, NULL, NULL, 381,
   'Lima sahabat menapaki puncak Mahameru dengan tekad bahwa impian harus diletakkan di depan mata, sejauh 5 cm dari kening.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'petualangan', 'persahabatan', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2005, 'id', true, 0),

  ('Ayahku Bukan Pembohong', 'Tere Liye',
   NULL, NULL, NULL, 304,
   'Dam tumbuh besar mendengar kisah-kisah luar biasa dari ayahnya. Apakah semua itu nyata, atau hanya dongeng?',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'keluarga', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2018, 'id', true, 0),

  ('Garis Waktu', 'Fiersa Besari',
   NULL, NULL, NULL, 240,
   'Kumpulan tulisan tentang patah hati, harapan, dan kebebasan. Fiersa Besari dalam bahasa yang dekat di hati anak muda.',
   'lokal', ARRAY['fiksi'], ARRAY['puisi', 'inspirasi', 'remaja', 'Indonesia'],
   'Media Kita', 2016, 'id', true, 0),

  ('Konspirasi Alam Semesta', 'Fiersa Besari',
   NULL, NULL, NULL, 256,
   'Novel perdana Fiersa Besari. Kisah seorang musisi jalanan yang mengejar mimpi dan menemukan cinta di jalan yang tidak terduga.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'romance', 'musik', 'remaja', 'Indonesia'],
   'Media Kita', 2017, 'id', true, 0),

  ('Summer in Seoul', 'Ilana Tan',
   NULL, NULL, NULL, 288,
   'Sandy bertemu Jung Tae-yang di Seoul musim panas. Roman manis berlatar Korea yang hangat dan menggemaskan.',
   'lokal', ARRAY['fiksi'], ARRAY['romance', 'fiksi', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2015, 'id', true, 0),

  ('Winter in Tokyo', 'Ilana Tan',
   NULL, NULL, NULL, 344,
   'Keiko dan Kazuto bertetangga di Tokyo musim dingin. Roman manis dengan latar Jepang yang hangat dan melankolis.',
   'lokal', ARRAY['fiksi'], ARRAY['romance', 'fiksi', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2014, 'id', true, 0),

  ('Sunshine Becomes You', 'Ilana Tan',
   NULL, NULL, NULL, 312,
   'Alexa, gadis Indonesia yang tinggal di New York, bertemu kembali dengan masa lalunya di Seoul. Romansa lintas negara yang manis.',
   'lokal', ARRAY['fiksi'], ARRAY['romance', 'fiksi', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2012, 'id', true, 0),

  ('Negeri Van Oranje', 'Wahyuningrat dkk',
   NULL, NULL, NULL, 424,
   'Lima mahasiswa Indonesia berkuliah di Belanda dan menjalani petualangan cinta, budaya, dan persahabatan di negeri kincir angin.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'petualangan', 'romance', 'persahabatan', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2012, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- BUKU PENGEMBANGAN DIRI REMAJA
  -- ══════════════════════════════════════════════
  ('Filosofi Teras', 'Henry Manampiring',
   NULL, NULL, NULL, 296,
   'Panduan praktis Stoisisme gaya Indonesia — filosofi Yunani-Romawi kuno yang relevan untuk menghadapi kecemasan dan tekanan hidup modern.',
   'lokal', ARRAY['non-fiksi'], ARRAY['non-fiksi', 'filsafat', 'pengembangan diri', 'remaja'],
   'Kompas Gramedia', 2018, 'id', true, 0),

  ('Sebuah Seni untuk Bersikap Bodo Amat', 'Mark Manson',
   'https://covers.openlibrary.org/b/isbn/9780062457714-M.jpg', 'OL20082940W', '9780062457714', 272,
   'Pandangan kontra-intuitif tentang hidup baik: pilih dengan cermat apa yang layak kamu pedulikan, dan biarkan sisanya.',
   'lokal', ARRAY['non-fiksi'], ARRAY['non-fiksi', 'pengembangan diri', 'remaja', 'terjemahan'],
   'Gramedia Pustaka Utama', 2016, 'id', true, 0),

  ('Atomic Habits (Terjemahan)', 'James Clear',
   'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg', 'OL20082940W', '9780735211292', 320,
   'Panduan praktis membentuk kebiasaan baik dan menghilangkan kebiasaan buruk melalui perubahan kecil yang konsisten.',
   'lokal', ARRAY['non-fiksi'], ARRAY['non-fiksi', 'pengembangan diri', 'remaja', 'produktivitas', 'terjemahan'],
   'Gramedia Pustaka Utama', 2018, 'id', true, 0)

) AS new_books(title, author, cover_url, open_library_id, isbn, total_pages, description, category, categories, tags, publisher, published_year, language, is_active, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM curated_books cb WHERE LOWER(cb.title) = LOWER(new_books.title)
);
