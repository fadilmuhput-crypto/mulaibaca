-- Seed: Buku Anak-Anak
-- Jalankan di Supabase Dashboard → SQL Editor
-- Idempotent: hanya insert jika title belum ada (case-insensitive)

INSERT INTO curated_books (title, author, cover_url, open_library_id, isbn, total_pages, description, category, categories, tags, publisher, published_year, language, is_active, sort_order)
SELECT * FROM (VALUES

  -- ══════════════════════════════════════════════
  -- BALITA & BAYI (0–3)
  -- ══════════════════════════════════════════════
  ('The Very Hungry Caterpillar', 'Eric Carle',
   'https://covers.openlibrary.org/b/isbn/9780399226908-M.jpg', 'OL27258W', '9780399226908', 32,
   'Seekor ulat kecil yang sangat lapar makan berbagai makanan selama seminggu sebelum akhirnya berubah menjadi kupu-kupu yang cantik.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'edukasi', 'balita', 'toddler', 'children'],
   'Philomel Books', 1969, 'id', true, 0),

  ('Brown Bear, Brown Bear, What Do You See?', 'Bill Martin Jr.',
   'https://covers.openlibrary.org/b/isbn/9780805047905-M.jpg', 'OL2631575W', '9780805047905', 32,
   'Buku interaktif dengan ilustrasi warna-warni: beruang coklat melihat burung merah, burung merah melihat bebek kuning, dan seterusnya. Mengajarkan warna dan hewan pada balita.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'edukasi', 'balita', 'toddler', 'children'],
   'Henry Holt and Co.', 1967, 'id', true, 0),

  ('Goodnight Moon', 'Margaret Wise Brown',
   'https://covers.openlibrary.org/b/isbn/9780694003617-M.jpg', 'OL26745W', '9780694003617', 32,
   'Kisah kelinci kecil yang mengucapkan selamat malam pada semua benda di kamarnya sebelum tidur. Buku malam hari klasik yang menenangkan.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'balita', 'toddler', 'bedtime', 'children'],
   'Harper & Row', 1947, 'id', true, 0),

  ('Dear Zoo', 'Rod Campbell',
   'https://covers.openlibrary.org/b/isbn/9781416947370-M.jpg', 'OL257922W', '9781416947370', 18,
   'Seorang anak menulis surat ke kebun binatang dan dikirimi berbagai hewan — terlalu besar, terlalu tinggi, terlalu liar! Buku interaktif dengan flap.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'interaktif', 'balita', 'toddler', 'board book', 'children'],
   'Little Simon', 1982, 'id', true, 0),

  ('Where''s Spot?', 'Eric Hill',
   'https://covers.openlibrary.org/b/isbn/9780399240461-M.jpg', 'OL2302099W', '9780399240461', 22,
   'Sally si induk anjing mencari Spot yang bersembunyi di berbagai tempat. Buku pop-up klasik yang mengajarkan konsep lokasi dan objek pada balita.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'interaktif', 'balita', 'toddler', 'board book', 'children'],
   'Warne', 1980, 'id', true, 0),

  ('The Wheels on the Bus', 'Annie Kubler',
   'https://covers.openlibrary.org/b/isbn/9780859538785-M.jpg', 'OL24797586W', '9780859538785', 12,
   'Buku lagu populer tentang bus yang rodanya berputar-putar. Disertai gerakan tangan yang bisa ditiru balita. Cocok untuk bernyanyi bersama.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'lagu', 'balita', 'toddler', 'board book', 'children'],
   'Child''s Play', 2001, 'id', true, 0),

  ('Head, Shoulders, Knees, and Toes', 'Annie Kubler',
   'https://covers.openlibrary.org/b/isbn/9780859537283-M.jpg', 'OL24797587W', '9780859537283', 12,
   'Buku lagu klasik untuk mengenal anggota tubuh. Disertai ilustrasi ceria dan panduan gerakan. Stimulasi motorik dan bahasa untuk balita.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'lagu', 'balita', 'toddler', 'board book', 'children'],
   'Child''s Play', 2002, 'id', true, 0),

  ('Giraffes Can''t Dance', 'Giles Andreae',
   'https://covers.openlibrary.org/b/isbn/9780545392556-M.jpg', NULL, '9780545392556', 32,
   'Jerapah Gerald ingin menari tapi semua hewan menertawakannya. Dengan bantuan teman, ia menemukan iramanya sendiri. Cerita tentang percaya diri.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'balita', 'toddler', 'children', 'percaya diri'],
   'Orchard Books', 1999, 'id', true, 0),

  ('We''re Going on a Bear Hunt', 'Michael Rosen',
   'https://covers.openlibrary.org/b/isbn/9780689845361-M.jpg', 'OL245929W', '9780689845361', 36,
   'Sebuah keluarga berpetualang mencari beruang — melewati rumput tinggi, sungai berlumpur, dan hutan gelap. Buku interaktif penuh suara seru!',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'petualangan', 'balita', 'toddler', 'children'],
   'Margaret K. McElderry', 1989, 'id', true, 0),

  ('Guess How Much I Love You', 'Sam McBratney',
   'https://covers.openlibrary.org/b/isbn/9780763642648-M.jpg', 'OL1553432W', '9780763642648', 32,
   'Little Nutbrown Hare dan Big Nutbrown Hare saling mengungkapkan betapa besar cinta mereka. Kisah penghantar tidur yang hangat dan menyentuh.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'balita', 'toddler', 'bedtime', 'children', 'keluarga'],
   'Candlewick', 1994, 'id', true, 0),

  ('I Love You Forever', 'Robert Munsch',
   'https://covers.openlibrary.org/b/isbn/9780920668375-M.jpg', 'OL2674562W', '9780920668375', 32,
   'Seorang ibu menyanyikan lagu cinta untuk bayinya setiap malam — dan saat bayinya tumbuh dewasa, cinta itu tak pernah pudar. Lagu abadi tentang kasih ibu.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'balita', 'toddler', 'children', 'keluarga', 'bedtime'],
   'Firefly Books', 1986, 'id', true, 0),

  ('Aku Sayang Bunda', 'Watiek Ideo', NULL, NULL, NULL, 24,
   'Buku boardbook tentang kasih sayang antara anak dan ibu. Ilustrasi ceria dan cerita sederhana untuk balita. Bagian dari seri karakter positif.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'balita', 'board book', 'toddler', 'edukasi', 'Indonesia'],
   'Najwa Publishing', 2020, 'id', true, 0),

  ('Aku Bisa Makan Sendiri', 'Watiek Ideo', NULL, NULL, NULL, 20,
   'Buku interaktif untuk balita belajar makan sendiri. Dilengkapi dengan panduan sensorik dan motorik halus.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'balita', 'board book', 'toddler', 'edukasi', 'Indonesia'],
   'Najwa Publishing', 2021, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- ANAK AWAL (4–8)
  -- ══════════════════════════════════════════════
  ('Kancil dan Buaya', 'Cerita Rakyat Indonesia',
   NULL, NULL, NULL, 48,
   'Kisah Si Kancil yang cerdik berhasil menyeberangi sungai dengan cara mengelabui para buaya. Cerita rakyat Nusantara yang mengajarkan akal dan kecerdikan.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['cerita rakyat', 'fabel', 'anak', 'dongeng', 'Indonesia'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Timun Mas', 'Cerita Rakyat Indonesia',
   NULL, NULL, NULL, 48,
   'Seorang gadis bernama Timun Mas harus kabur dari raksasa menggunakan benda-benda ajaib pemberian ibunya. Legenda Jawa yang penuh pesan moral.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['cerita rakyat', 'legenda', 'anak', 'dongeng', 'Indonesia'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Bawang Merah dan Bawang Putih', 'Cerita Rakyat Indonesia',
   NULL, NULL, NULL, 48,
   'Perbandingan antara Bawang Putih yang baik hati dengan Bawang Merah yang dengki. Cerita rakyat Indonesia yang mengajarkan kebaikan dan kejujuran.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['cerita rakyat', 'moral', 'anak', 'dongeng', 'Indonesia'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Malin Kundang', 'Cerita Rakyat Sumatera Barat',
   NULL, NULL, NULL, 48,
   'Kisah anak durhaka yang dikutuk menjadi batu oleh ibunya setelah mengingkari asal-usulnya. Legenda Sumatera Barat tentang pentingnya berbakti.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['cerita rakyat', 'legenda', 'anak', 'dongeng', 'moral', 'Indonesia'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Roro Jonggrang', 'Cerita Rakyat Jawa Tengah',
   NULL, NULL, NULL, 48,
   'Legenda tentang Bandung Bondowoso yang membangun seribu candi dalam semalam untuk memperistri Roro Jonggrang. Asal-usul Candi Prambanan.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['cerita rakyat', 'legenda', 'anak', 'dongeng', 'Indonesia'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Si Kancil Anak Nakal', 'Murti Bunanta',
   NULL, NULL, NULL, 56,
   'Petualangan Si Kancil yang nakal namun cerdas dalam menghadapi berbagai situasi di hutan Nusantara. Disertai pesan moral di setiap cerita.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['fabel', 'Indonesia', 'anak', 'dongeng', 'cerita anak'],
   'Balai Pustaka', 2015, 'id', true, 0),

  ('Asal Mula Danau Toba', 'Cerita Rakyat Sumatera Utara',
   NULL, NULL, NULL, 48,
   'Legenda terbentuknya Danau Toba dari Sumatera Utara. Kisah seorang petani yang menikahi ikan mas jelmaan putri dan janji yang dilanggar.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['cerita rakyat', 'legenda', 'anak', 'dongeng', 'Indonesia'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('Si Pitung', 'Cerita Rakyat Betawi',
   NULL, NULL, NULL, 56,
   'Legenda pahlawan rakyat Betawi yang membela orang miskin melawan penjajah dan tuan tanah. Kisah kepahlawanan dan keadilan dari Jakarta tempo dulu.',
   'anak', ARRAY['fiksi', 'anak-anak', 'cerita rakyat'], ARRAY['cerita rakyat', 'legenda', 'anak', 'dongeng', 'pahlawan', 'Indonesia'],
   'Gramedia Pustaka Utama', 2010, 'id', true, 0),

  ('The Cat in the Hat', 'Dr. Seuss',
   'https://covers.openlibrary.org/b/isbn/9780394800011-M.jpg', 'OL20787W', '9780394800011', 72,
   'Kucing misterius bertopi datang berkunjung saat ibu sedang pergi. Kekacauan seru terjadi di rumah! Buku berima yang asyik dibaca nyaring.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'humor', 'anak', 'cerita anak', 'children', 'rhyming'],
   'Random House', 1957, 'id', true, 0),

  ('Green Eggs and Ham', 'Dr. Seuss',
   'https://covers.openlibrary.org/b/isbn/9780394800165-M.jpg', 'OL20791W', '9780394800165', 64,
   'Sam-I-Am terus menawarkan telur hijau dan ham kepada temannya yang ogah-ogahan. Buku ikonik tentang mencoba hal baru dengan irama yang riang.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'humor', 'anak', 'cerita anak', 'children', 'rhyming'],
   'Random House', 1960, 'id', true, 0),

  ('Where the Wild Things Are', 'Maurice Sendak',
   'https://covers.openlibrary.org/b/isbn/9780060254926-M.jpg', 'OL46375W', '9780060254926', 48,
   'Max berseragam serigala berlayar ke negeri para monster liar dan menjadi raja mereka. Petualangan imajinatif tentang emosi dan pulang ke rumah.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'petualangan', 'anak', 'cerita anak', 'children', 'fantasi'],
   'Harper & Row', 1963, 'id', true, 0),

  ('The Gruffalo', 'Julia Donaldson',
   'https://covers.openlibrary.org/b/isbn/9780142403877-M.jpg', 'OL278182W', '9780142403877', 32,
   'Tikus kecil berjalan di hutan dan mengaku akan bertemu Gruffalo — monster mengerikan yang ia ciptakan sendiri. Tapi ternyata Gruffalo benar-benar ada!',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'petualangan', 'anak', 'cerita anak', 'children', 'humor'],
   'Dial Books', 1999, 'id', true, 0),

  ('Room on the Broom', 'Julia Donaldson',
   'https://covers.openlibrary.org/b/isbn/9780142501122-M.jpg', 'OL278183W', '9780142501122', 32,
   'Seorang penyihir baik hati terus menambah teman di sapu terbangnya sampai sapunya patah. Lalu seekor naga lapar datang mengancam!',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'petualangan', 'anak', 'cerita anak', 'children', 'persahabatan'],
   'Dial Books', 2001, 'id', true, 0),

  ('The Very Busy Spider', 'Eric Carle',
   'https://covers.openlibrary.org/b/isbn/9780399229190-M.jpg', 'OL27259W', '9780399229190', 32,
   'Seekor laba-laba sibuk membuat jaringnya meskipun berbagai hewan mengajaknya bermain. Mengajarkan ketekunan dan kerja keras pada anak.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'edukasi', 'anak', 'cerita anak', 'children', 'hewan'],
   'Philomel Books', 1984, 'id', true, 0),

  ('Stellaluna', 'Janell Cannon',
   'https://covers.openlibrary.org/b/isbn/9780152002840-M.jpg', 'OL1500796W', '9780152002840', 48,
   'Stellaluna si kelelawar kecil terpisah dari ibunya dan tinggal bersama keluarga burung. Kisah tentang persahabatan dan penerimaan perbedaan.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'persahabatan', 'anak', 'cerita anak', 'children', 'hewan'],
   'Harcourt', 1993, 'id', true, 0),

  ('The Rainbow Fish', 'Marcus Pfister',
   'https://covers.openlibrary.org/b/isbn/9781558580091-M.jpg', 'OL3327942W', '9781558580091', 32,
   'Ikan pelangi dengan sisik berkilauan belajar bahwa berbagi membuatnya lebih bahagia daripada menjadi yang terindah sendirian.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'moral', 'anak', 'cerita anak', 'children', 'persahabatan'],
   'NorthSouth Books', 1992, 'id', true, 0),

  ('Don''t Let the Pigeon Drive the Bus!', 'Mo Willems',
   'https://covers.openlibrary.org/b/isbn/9780786819881-M.jpg', 'OL276498W', '9780786819881', 40,
   'Merpati yang lucu dan memaksa mencoba berbagai cara untuk mengemudikan bus. Buku interaktif yang mengajak anak berkata ''tidak'' dengan tegas.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'humor', 'anak', 'cerita anak', 'children', 'interaktif'],
   'Hyperion', 2003, 'id', true, 0),

  ('The Day the Crayons Quit', 'Drew Daywalt',
   'https://covers.openlibrary.org/b/isbn/9780399255373-M.jpg', 'OL2655131W', '9780399255373', 40,
   'Krayon-krayon Duncan mogok! Merah lelah jadi warna apel, krem frustrasi, dan hitam bosan cuma jadi garis tepi. Kreatif dan jenaka!',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'humor', 'anak', 'cerita anak', 'children', 'kreativitas'],
   'Philomel Books', 2013, 'id', true, 0),

  ('Each Peach Pear Plum', 'Janet & Allan Ahlberg',
   'https://covers.openlibrary.org/b/isbn/9780140509195-M.jpg', 'OL1007306W', '9780140509195', 32,
   'Buku teka-teki bergambar indah: ''Each peach pear plum, I spy Tom Thumb''. Anak diajak mencari tokoh dongeng di setiap halaman.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['picture book', 'interaktif', 'anak', 'cerita anak', 'children', 'teka-teki'],
   'Viking', 1978, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- ANAK AKHIR (9–12)
  -- ══════════════════════════════════════════════
  ('Charlie and the Chocolate Factory', 'Roald Dahl',
   'https://covers.openlibrary.org/b/isbn/9780142410318-M.jpg', 'OL36741W', '9780142410318', 176,
   'Charlie Bucket memenangkan Golden Ticket dan diajak masuk ke pabrik cokelat milik Willy Wonka yang penuh keajaiban dan kejutan.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['petualangan', 'humor', 'anak', 'chapter book', 'fantasi', 'children'],
   'Puffin Books', 1964, 'id', true, 0),

  ('Matilda', 'Roald Dahl',
   'https://covers.openlibrary.org/b/isbn/9780142410370-M.jpg', 'OL26745W', '9780142410370', 240,
   'Matilda adalah gadis kecil yang sangat cerdas namun diabaikan keluarganya. Ia menemukan bahwa dirinya memiliki kekuatan telekinetik yang luar biasa.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['petualangan', 'humor', 'anak', 'chapter book', 'fantasi', 'children'],
   'Puffin Books', 1988, 'id', true, 0),

  ('The BFG', 'Roald Dahl',
   'https://covers.openlibrary.org/b/isbn/9780142410387-M.jpg', 'OL26746W', '9780142410387', 208,
   'Sophie bertemu BFG (Big Friendly Giant) yang tidak seperti raksasa lain — ia menangkap mimpi, bukan memakan anak-anak!',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['petualangan', 'humor', 'anak', 'chapter book', 'fantasi', 'children'],
   'Puffin Books', 1982, 'id', true, 0),

  ('James and the Giant Peach', 'Roald Dahl',
   'https://covers.openlibrary.org/b/isbn/9780140374247-M.jpg', 'OL26749W', '9780140374247', 144,
   'James Henry Trotter masuk ke dalam sebuah persik raksasa dan bersama serangga-serangga temannya mengarungi petualangan lintas samudra.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['petualangan', 'humor', 'anak', 'chapter book', 'fantasi', 'children'],
   'Puffin Books', 1961, 'id', true, 0),

  ('Fantastic Mr. Fox', 'Roald Dahl',
   'https://covers.openlibrary.org/b/isbn/9780142410349-M.jpg', 'OL26750W', '9780142410349', 96,
   'Mr. Fox, rubah cerdik, mencuri makanan dari tiga petani jahat. Mereka bersekongkol menangkapnya, tapi Mr. Fox punya rencana brilian!',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['petualangan', 'humor', 'anak', 'chapter book', 'children', 'hewan'],
   'Puffin Books', 1970, 'id', true, 0),

  ('The Witches', 'Roald Dahl',
   'https://covers.openlibrary.org/b/isbn/9780142410110-M.jpg', 'OL26751W', '9780142410110', 208,
   'Penyihir sebenarnya ada di mana-mana — dan mereka membenci anak-anak! Seorang bocah dan neneknya harus menggagalkan rencana jahat mereka.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['petualangan', 'humor', 'anak', 'chapter book', 'fantasi', 'children'],
   'Puffin Books', 1983, 'id', true, 0),

  ('Harry Potter dan Batu Bertuah', 'J.K. Rowling',
   'https://covers.openlibrary.org/b/isbn/9780439708180-M.jpg', 'OL82538W', '9780439708180', 368,
   'Harry Potter, bocah yatim yang tinggal bersama paman dan bibinya yang kejam, menemukan bahwa ia adalah penyihir dan diundang ke Sekolah Sihir Hogwarts.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['fantasi', 'petualangan', 'anak', 'chapter book', 'children'],
   'Scholastic', 1997, 'id', true, 0),

  ('Harry Potter dan Kamar Rahasia', 'J.K. Rowling',
   'https://covers.openlibrary.org/b/isbn/9780439064873-M.jpg', 'OL28210482W', '9780439064873', 384,
   'Tahun kedua Harry di Hogwarts diwarnai pesan misterius di dinding dan serangan yang membekukan siswa. Siapa pewaris Slytherin?',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['fantasi', 'petualangan', 'anak', 'chapter book', 'children'],
   'Scholastic', 1998, 'id', true, 0),

  ('Harry Potter dan Tawanan Azkaban', 'J.K. Rowling',
   'https://covers.openlibrary.org/b/isbn/9780439136365-M.jpg', 'OL28210483W', '9780439136365', 448,
   'Sirius Black, pembunuh berbahaya kabur dari Azkaban. Tahun ketiga Harry di Hogwarts penuh dengan Dementor, peta nakal, dan rahasia masa lalu.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['fantasi', 'petualangan', 'anak', 'chapter book', 'children'],
   'Scholastic', 1999, 'id', true, 0),

  ('Diary of a Wimpy Kid', 'Jeff Kinney',
   'https://covers.openlibrary.org/b/isbn/9780810993136-M.jpg', 'OL12718837W', '9780810993136', 224,
   'Greg Heffley menulis catatan harian tentang kehidupannya yang konyol di SMP — penuh drama persahabatan, tawa, dan pelajaran berharga.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['humor', 'anak', 'chapter book', 'komik', 'children'],
   'Amulet Books', 2007, 'id', true, 0),

  ('The Lightning Thief (Percy Jackson #1)', 'Rick Riordan',
   'https://covers.openlibrary.org/b/isbn/9780786838653-M.jpg', 'OL3472445W', '9780786838653', 400,
   'Percy Jackson tahu ia berbeda — sampai ia menemukan bahwa ia adalah putra Poseidon dan para dewa Olimpus benar-benar nyata!',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['fantasi', 'petualangan', 'anak', 'chapter book', 'children', 'mitologi'],
   'Disney-Hyperion', 2005, 'id', true, 0),

  ('Charlotte''s Web', 'E.B. White',
   'https://covers.openlibrary.org/b/isbn/9780064410939-M.jpg', 'OL2319160W', '9780064410939', 192,
   'Wilbur si babi kecil selamat dari penyembelihan berkat tulisan ajaib Charlotte si laba-laba di sarangnya. Kisah abadi tentang persahabatan.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'persahabatan', 'anak', 'chapter book', 'children', 'hewan'],
   'Harper & Row', 1952, 'id', true, 0),

  ('The Lion, the Witch and the Wardrobe', 'C.S. Lewis',
   'https://covers.openlibrary.org/b/isbn/9780064404990-M.jpg', 'OL70948W', '9780064404990', 208,
   'Empat bersaudara Pevensie menemukan dunia ajaib Narnia di balik lemari pakaian — negeri yang terperangkap musim dingin abadi oleh Penyihir Putih.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['fantasi', 'petualangan', 'anak', 'chapter book', 'children', 'klasik'],
   'HarperCollins', 1950, 'id', true, 0),

  ('Bridge to Terabithia', 'Katherine Paterson',
   'https://covers.openlibrary.org/b/isbn/9780064401845-M.jpg', 'OL241273W', '9780064401845', 176,
   'Jess dan Leslie menciptakan kerajaan imajiner Terabithia di hutan. Persahabatan mereka mengubah hidup — hingga tragedi datang menguji.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['drama', 'persahabatan', 'anak', 'chapter book', 'children', 'klasik'],
   'HarperCollins', 1977, 'id', true, 0),

  ('Wonder', 'R.J. Palacio',
   'https://covers.openlibrary.org/b/isbn/9780375869020-M.jpg', 'OL26422403W', '9780375869020', 320,
   'Auggie Pullman, lahir dengan kelainan wajah, mulai bersekolah reguler untuk pertama kalinya. Kisah inspiratif tentang kebaikan dan penerimaan.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['drama', 'inspirasi', 'anak', 'chapter book', 'children'],
   'Knopf', 2012, 'id', true, 0),

  ('Holes', 'Louis Sachar',
   'https://covers.openlibrary.org/b/isbn/9780440414803-M.jpg', 'OL249256W', '9780440414803', 272,
   'Stanley Yelnats dikirim ke kamp penjara di tengah gurun tempat para narapidana menggali lubang seharian. Tapi ada rahasia terkubur di sana.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['petualangan', 'misteri', 'anak', 'chapter book', 'children'],
   'Farrar, Straus and Giroux', 1998, 'id', true, 0),

  ('The Tale of Despereaux', 'Kate DiCamillo',
   'https://covers.openlibrary.org/b/isbn/9780763617226-M.jpg', 'OL3652986W', '9780763617226', 272,
   'Despereaux Tilling, tikus kecil bertelinga besar yang jatuh cinta pada seorang putri, memulai petualangan berani — meski seluruh kerajaan melarangnya.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['petualangan', 'fantasi', 'anak', 'chapter book', 'children'],
   'Candlewick', 2003, 'id', true, 0),

  ('Because of Winn-Dixie', 'Kate DiCamillo',
   'https://covers.openlibrary.org/b/isbn/9780763625580-M.jpg', 'OL3652987W', '9780763625580', 224,
   'India Opal Buloni, sepuluh tahun, pindah ke kota baru dan menemukan teman spesial: seekor anjing liar yang lucu bernama Winn-Dixie.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['drama', 'persahabatan', 'anak', 'chapter book', 'children', 'keluarga'],
   'Candlewick', 2000, 'id', true, 0),

  ('The Hobbit', 'J.R.R. Tolkien',
   'https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg', 'OL27594W', '9780547928227', 336,
   'Bilbo Baggins, hobbit yang cinta ketenangan, dipaksa ikut petualangan oleh Gandalf dan 13 kurcaci untuk merebut kembali gunung Erebor dari naga Smaug.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['fantasi', 'petualangan', 'anak', 'chapter book', 'children', 'klasik'],
   'Houghton Mifflin', 1937, 'id', true, 0),

  ('Peter Pan', 'J.M. Barrie',
   'https://covers.openlibrary.org/b/isbn/9780141322605-M.jpg', 'OL24603973W', '9780141322605', 240,
   'Peter Pan, bocah ajaib yang tak mau besar, membawa Wendy dan adik-adiknya ke Neverland — petualangan melawan Kapten Hook dan bajak laut.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['fantasi', 'petualangan', 'anak', 'chapter book', 'children', 'klasik'],
   'Puffin Books', 1911, 'id', true, 0),

  ('Alice''s Adventures in Wonderland', 'Lewis Carroll',
   'https://covers.openlibrary.org/b/isbn/9780141439761-M.jpg', 'OL46256W', '9780141439761', 176,
   'Alice jatuh ke lubang kelinci dan memasuki dunia aneh Wonderland tempat segala sesuatu mungkin terjadi — bersama Kucing Cheshire, Hatter Gila, dan Ratu Hati.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['fantasi', 'petualangan', 'anak', 'chapter book', 'children', 'klasik'],
   'Macmillan', 1865, 'id', true, 0),

  ('The Secret Garden', 'Frances Hodgson Burnett',
   'https://covers.openlibrary.org/b/isbn/9780141321066-M.jpg', 'OL249223W', '9780141321066', 336,
   'Mary Lennox, yatim piatu yang manja, menemukan taman rahasia yang terkunci di perkebunan pamannya. Merawat taman itu mengubah hidup mereka semua.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'petualangan', 'anak', 'chapter book', 'children', 'keluarga'],
   'Puffin Books', 1911, 'id', true, 0),

  ('Anne of Green Gables', 'L.M. Montgomery',
   'https://covers.openlibrary.org/b/isbn/9780140366686-M.jpg', 'OL21131739W', '9780140366686', 400,
   'Anne Shirley, gadis yatim piatu berimajinasi liar, dikirim ke Green Gables secara tidak sengaja — dan mengubah kehidupan keluarga Cuthbert selamanya.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'drama', 'anak', 'chapter book', 'children', 'keluarga'],
   'Puffin Books', 1908, 'id', true, 0),

  ('The Phantom Tollbooth', 'Norton Juster',
   'https://covers.openlibrary.org/b/isbn/9780394820378-M.jpg', 'OL279045W', '9780394820378', 272,
   'Milo menerima tol tol ajaib dan mengendarai mobil mainannya ke dunia kata-kata dan angka — penuh permainan kata dan petualangan imajinatif.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['petualangan', 'fantasi', 'anak', 'chapter book', 'children', 'klasik'],
   'Random House', 1961, 'id', true, 0),

  ('The Adventures of Tom Sawyer', 'Mark Twain',
   'https://covers.openlibrary.org/b/isbn/9780143107323-M.jpg', 'OL9266331W', '9780143107323', 272,
   'Tom Sawyer, bocah nakal Mississippi yang jenaka, memimpin petualangan sepanjang sungai — dari mengecat pagar hingga berhadapan dengan pembunuh sungguhan.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['klasik', 'petualangan', 'anak', 'chapter book', 'children'],
   'Penguin Classics', 1876, 'id', true, 0),

  ('From the Mixed-Up Files of Mrs. Basil E. Frankweiler', 'E.L. Konigsburg',
   'https://covers.openlibrary.org/b/isbn/9780689711819-M.jpg', 'OL268684W', '9780689711819', 176,
   'Claudia dan adiknya Jamie kabur dari rumah dan tinggal diam-diam di Museum Metropolitan New York. Mereka memecahkan misteri patung indah.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['petualangan', 'misteri', 'anak', 'chapter book', 'children'],
   'Atheneum', 1967, 'id', true, 0),

  ('Laskar Pelangi Versi Anak', 'Andrea Hirata',
   NULL, NULL, NULL, 120,
   'Adaptasi untuk anak-anak dari kisah persahabatan dan semangat sekolah sepuluh anak Belitung yang menginspirasi. Versi ringan dengan bahasa yang sesuai.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['Indonesia', 'inspirasi', 'anak', 'chapter book', 'persahabatan', 'edukasi'],
   'Bentang Pustaka', 2012, 'id', true, 0),

  ('Kumpulan Dongeng Nusantara', 'Murti Bunanta',
   NULL, NULL, NULL, 160,
   'Kumpulan 20 dongeng klasik dari berbagai daerah di Indonesia: dari Aceh hingga Papua. Mengajarkan nilai-nilai luhur dan cinta tanah air.',
   'anak', ARRAY['fiksi', 'anak-anak'], ARRAY['cerita rakyat', 'dongeng', 'anak', 'chapter book', 'Indonesia'],
   'Gramedia Pustaka Utama', 2016, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- BUKU NONFIKSI ANAK
  -- ══════════════════════════════════════════════
  ('Ensiklopedia Pertamaku: Tubuhku', 'Sophie Giles', NULL, NULL, NULL, 32,
   'Buku ensiklopedia bergambar untuk anak tentang tubuh manusia. Dilengkapi foto dan ilustrasi menarik yang mudah dipahami.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['edukasi', 'ensiklopedi', 'anak', 'sains', 'children'],
   'Bhuana Ilmu Populer', 2019, 'id', true, 0),

  ('Ensiklopedia Pertamaku: Hewan', 'Sophie Giles', NULL, NULL, NULL, 32,
   'Ensiklopedia pertama untuk anak tentang dunia hewan. Dari hewan peliharaan hingga satwa liar di hutan dan lautan.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['edukasi', 'ensiklopedi', 'anak', 'sains', 'hewan', 'children'],
   'Bhuana Ilmu Populer', 2019, 'id', true, 0),

  ('Aku Anak Berani: Buku Anti Cemas', 'Dewi S. P.', NULL, NULL, NULL, 24,
   'Buku aktivitas untuk membantu anak mengelola kecemasan. Dilengkapi latihan pernapasan, visualisasi, dan afirmasi sederhana.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['edukasi', 'psikologi', 'anak', 'aktivitas', 'children', 'parenting'],
   'Pustaka Jiwa', 2021, 'id', true, 0),

  ('Seri Hadits untuk Anak: Jujur itu Baik', 'Fadhila A.', NULL, NULL, NULL, 24,
   'Mengajarkan hadits-hadits pilihan untuk anak dengan cerita sehari-hari yang dekat dengan keseharian mereka. Dilengkapi ilustrasi ceria.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['edukasi', 'agama', 'anak', 'moral', 'nilai', 'children'],
   'Zikrul Kids', 2020, 'id', true, 0),

  ('Seri Hadits untuk Anak: Bersyukur', 'Fadhila A.', NULL, NULL, NULL, 24,
   'Hadits tentang bersyukur dikisahkan lewat petualangan Dafa dan Dina sehari-hari. Anak diajak mensyukuri hal-hal kecil.',
   'anak', ARRAY['anak-anak', 'referensi'], ARRAY['edukasi', 'agama', 'anak', 'moral', 'nilai', 'children'],
   'Zikrul Kids', 2020, 'id', true, 0),

  -- ══════════════════════════════════════════════
  -- BUKU REMAJA (13+) — kategori 'lokal' karena konten lebih matang
  -- ══════════════════════════════════════════════
  ('Bumi', 'Tere Liye',
   NULL, NULL, NULL, 440,
   'Raib, gadis 15 tahun, tiba-tiba menghilang saat bercermin. Petualangan seru di dunia paralel bersama Seli dan Ali dimulai.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'petualangan', 'fantasi', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2014, 'id', true, 0),

  ('Hujan', 'Tere Liye',
   NULL, NULL, NULL, 320,
   'Lail dan Soke Bahtera menjalani persahabatan di dunia masa depan yang baru bangkit setelah bencana besar menghancurkan peradaban.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'sains', 'romance', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2016, 'id', true, 0),

  ('Negeri 5 Menara', 'Ahmad Fuadi',
   NULL, NULL, NULL, 423,
   'Alif Fikri, anak Minang, mengikuti pendidikan di pesantren modern Gontor dan menemukan mimpi besar bersama sahabat-sahabatnya.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'inspirasi', 'pendidikan', 'remaja', 'Indonesia'],
   'Gramedia Pustaka Utama', 2009, 'id', true, 0),

  ('Sang Pemimpi', 'Andrea Hirata',
   NULL, NULL, NULL, 292,
   'Ikal dan Arai, dua sepupu dari Belitung, nekat merantau ke Perancis hanya bermodalkan mimpi dan tekad baja.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'inspirasi', 'persahabatan', 'remaja', 'Indonesia'],
   'Bentang Pustaka', 2006, 'id', true, 0),

  ('Dilan: Dia adalah Dilanku Tahun 1990', 'Pidi Baiq',
   NULL, NULL, NULL, 231,
   'Kisah cinta SMA di Bandung tahun 1990 antara Milea dan Dilan, pemuda geng motor yang romantis dan jenaka.',
   'lokal', ARRAY['fiksi'], ARRAY['romance', 'remaja', 'Indonesia'],
   'Pastel Books', 2014, 'id', true, 0),

  ('Perahu Kertas', 'Dewi Lestari (Dee)',
   NULL, NULL, NULL, 444,
   'Kisah cinta Kugy dan Keenan yang ditemukan kembali lewat perahu kertas mimpi dan seni, menembus waktu dan jarak.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'romance', 'remaja', 'Indonesia'],
   'Bentang Pustaka', 2009, 'id', true, 0),

  ('The Hunger Games', 'Suzanne Collins',
   'https://covers.openlibrary.org/b/isbn/9780439023481-M.jpg', 'OL572504W', '9780439023481', 384,
   'Katniss Everdeen menjadi sukarelana menggantikan adiknya dalam Hunger Games — pertarungan brutal di mana hanya satu dari 24 peserta yang selamat.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'distopia', 'petualangan', 'remaja', 'young adult'],
   'Scholastic', 2008, 'id', true, 0),

  ('Twilight', 'Stephenie Meyer',
   'https://covers.openlibrary.org/b/isbn/9780316015844-M.jpg', 'OL572505W', '9780316015844', 544,
   'Bella Swan pindah ke kota hujan Forks dan jatuh cinta pada Edward Cullen — yang ternyata adalah vampire. Cinta terlarang yang mendebarkan.',
   'lokal', ARRAY['fiksi'], ARRAY['fantasi', 'romance', 'remaja', 'young adult'],
   'Little, Brown', 2005, 'id', true, 0),

  ('The Fault in Our Stars', 'John Green',
   'https://covers.openlibrary.org/b/isbn/9780525478812-M.jpg', 'OL26298675W', '9780525478812', 336,
   'Hazel dan Gus, dua remaja pengidap kanker, bertemu di kelompok dukungan dan memulai perjalanan mengharukan ke Amsterdam untuk menemui penulis favorit mereka.',
   'lokal', ARRAY['fiksi'], ARRAY['romance', 'drama', 'remaja', 'young adult'],
   'Dutton Books', 2012, 'id', true, 0),

  ('Divergent', 'Veronica Roth',
   'https://covers.openlibrary.org/b/isbn/9780062024039-M.jpg', 'OL25908940W', '9780062024039', 496,
   'Dalam masyarakat yang terbagi dalam lima faksi, Beatrice Prior harus memilih jalannya — tapi ia berbeda, dan perbedaan itu bisa mematikan.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'distopia', 'petualangan', 'remaja', 'young adult'],
   'Katherine Tegen Books', 2011, 'id', true, 0),

  ('The Book Thief', 'Markus Zusak',
   'https://covers.openlibrary.org/b/isbn/9780375842207-M.jpg', 'OL276357W', '9780375842207', 576,
   'Liesel Meminger, gadis kecil di Jerman Nazi, mencuri buku untuk bertahan hidup. Kisah diceritakan dari sudut pandang Kematian yang puitis.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'sejarah', 'drama', 'remaja', 'young adult'],
   'Knopf', 2005, 'id', true, 0),

  ('Looking for Alaska', 'John Green',
   'https://covers.openlibrary.org/b/isbn/9780142402511-M.jpg', 'OL2981435W', '9780142402511', 288,
   'Miles Halter meninggalkan rumah untuk mencari ''Great Perhaps'' di sekolah asrama, di mana ia bertemu Alaska Young — gadis jenius dan penuh teka-teki.',
   'lokal', ARRAY['fiksi'], ARRAY['drama', 'romance', 'remaja', 'young adult'],
   'Dutton Books', 2005, 'id', true, 0),

  ('The Maze Runner', 'James Dashner',
   'https://covers.openlibrary.org/b/isbn/9780385737951-M.jpg', 'OL24408578W', '9780385737951', 384,
   'Thomas terbangun di Glade — sebuah tempat terbuka dikelilingi labirin raksasa — tanpa ingatan sedikit pun. Bersama para Glader, ia harus mencari jalan keluar.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'distopia', 'petualangan', 'remaja', 'young adult'],
   'Delacorte Press', 2009, 'id', true, 0),

  ('The Giver', 'Lois Lowry',
   'https://covers.openlibrary.org/b/isbn/9780544336261-M.jpg', 'OL7394105W', '9780544336261', 240,
   'Jonas tinggal di dunia yang sempurna — tanpa rasa sakit, konflik, atau pilihan. Sampai ia dipilih menjadi Penerima, dan mulai melihat kebenaran yang mengerikan.',
   'lokal', ARRAY['fiksi'], ARRAY['fiksi', 'distopia', 'filsafat', 'remaja', 'young adult'],
   'Houghton Mifflin', 1993, 'id', true, 0)

) AS new_books(title, author, cover_url, open_library_id, isbn, total_pages, description, category, categories, tags, publisher, published_year, language, is_active, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM curated_books cb WHERE LOWER(cb.title) = LOWER(new_books.title)
);
