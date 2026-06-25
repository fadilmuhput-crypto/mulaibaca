-- Seed: 50 buku editorial tambahan (batch Juni 2026)
-- Jalankan di Supabase Dashboard → SQL Editor
-- Idempotent: hanya insert jika title belum ada

INSERT INTO curated_books (title, author, cover_url, open_library_id, total_pages, description, category, tags, is_active, sort_order)
SELECT * FROM (VALUES

  -- ─── Fiksi Indonesia Tambahan ───
  ('Rembulan Tenggelam di Wajahmu', 'Tere Liye', NULL, NULL, 400,
   'Rey, seorang yatim piatu yang tumbuh penuh kepahitan, mendapat kesempatan menjawab lima pertanyaan besar hidupnya sebelum ajal menjemput.',
   'lokal', ARRAY['fiksi','spiritualitas','drama'], true, 0),

  ('Hafalan Shalat Delisa', 'Tere Liye', NULL, NULL, 268,
   'Delisa, bocah 6 tahun dari Aceh, kehilangan segalanya dalam tsunami 2004 — namun semangatnya untuk menghafal shalat tak pernah padam.',
   'lokal', ARRAY['fiksi','keluarga','spiritualitas','sejarah'], true, 0),

  ('Kau, Aku, dan Sepucuk Angpau Merah', 'Tere Liye', NULL, NULL, 512,
   'Borno dan Mei, dua anak muda di tepi Sungai Kapuas Kalimantan, terhubung lewat sebuah angpau merah dan takdir yang tak terduga.',
   'lokal', ARRAY['fiksi','romance','budaya'], true, 0),

  ('Bumi', 'Tere Liye', NULL, NULL, 440,
   'Raib, gadis 15 tahun, tiba-tiba menghilang saat bercermin. Petualangan seru di dunia paralel bersama Seli dan Ali dimulai.',
   'lokal', ARRAY['fiksi','petualangan','fantasi','remaja'], true, 0),

  ('Ranah 3 Warna', 'Ahmad Fuadi', NULL, NULL, 473,
   'Alif meninggalkan Gontor dan mengejar mimpi kuliah di Bandung, lalu hijrah ke Kanada — perjuangan keras anak Minang menembus batas dunia.',
   'lokal', ARRAY['fiksi','inspirasi','pendidikan','petualangan'], true, 0),

  ('Rantau 1 Muara', 'Ahmad Fuadi', NULL, NULL, 424,
   'Alif akhirnya tiba di New York mengejar beasiswa bergengsi. Penutup Trilogi Negeri 5 Menara yang menyentuh tentang ketekunan dan cinta.',
   'lokal', ARRAY['fiksi','inspirasi','pendidikan'], true, 0),

  ('Sirkus Pohon', 'Andrea Hirata', NULL, NULL, 383,
   'Kisah Sobri yang jatuh cinta pada Dinda, putri seorang bos sirkus di kampung Melayu yang penuh warna dan keriuhan.',
   'lokal', ARRAY['fiksi','romance','humor','budaya'], true, 0),

  ('Orang-Orang Biasa', 'Andrea Hirata', NULL, NULL, 312,
   'Sepuluh orang biasa dengan profesi rendahan bersatu merampok bank demi membiayai pendidikan anak mereka. Komedi kriminal penuh hati.',
   'lokal', ARRAY['fiksi','humor','persahabatan','sosial'], true, 0),

  ('Larung', 'Ayu Utami', NULL, NULL, 228,
   'Sekuel Saman. Saman dan empat perempuan temannya melanjutkan perjuangan melawan rezim, cinta, dan trauma yang tak kunjung usai.',
   'lokal', ARRAY['sastra','fiksi','sosial'], true, 0),

  ('Negeri Van Oranje', 'Wahyuningrat, D. Purnomo, A. Widiarsa, R.P. Permana', NULL, NULL, 424,
   'Lima mahasiswa Indonesia berkuliah di Belanda dan menjalani petualangan cinta, budaya, dan persahabatan di negeri kincir angin.',
   'lokal', ARRAY['fiksi','petualangan','romance','persahabatan'], true, 0),

  ('Senja dan Fajar', 'Boy Candra', NULL, NULL, 230,
   'Dua jiwa yang saling bertemu di sela kesepian — kisah cinta yang sederhana, hangat, dan dekat di hati anak muda Indonesia.',
   'lokal', ARRAY['fiksi','romance'], true, 0),

  ('Perempuan Berkalung Sorban', 'Abidah El Khalieqy', NULL, NULL, 280,
   'Annisa tumbuh di pesantren konservatif dan berjuang menuntut kesetaraan hak perempuan di tengah budaya patriarki yang kuat.',
   'lokal', ARRAY['fiksi','sosial','feminisme','agama'], true, 0),

  ('Madre', 'Dewi Lestari (Dee)', NULL, NULL, 184,
   'Kumpulan cerita pendek Dee yang eksperimental — dari cerita roti sourdough warisan leluhur hingga kisah fiksi sains yang menawan.',
   'lokal', ARRAY['fiksi','cerpen','sastra'], true, 0),

  ('Summer in Seoul', 'Ilana Tan', NULL, NULL, 288,
   'Sandy bertemu Jung Tae-yang di Seoul musim panas. Roman manis berlatar Korea yang hangat dan menggemaskan.',
   'lokal', ARRAY['romance','fiksi'], true, 0),

  -- ─── Non-Fiksi Indonesia Tambahan ───
  ('Habibie & Ainun', 'B.J. Habibie', NULL, NULL, 323,
   'Memoar cinta Presiden ke-3 RI kepada istrinya Ainun — kisah nyata yang membuktikan bahwa cinta sejati melampaui segala capaian.',
   'lokal', ARRAY['non-fiksi','biografi','cinta','sejarah'], true, 0),

  ('Berani Tidak Disukai', 'Fumitake Koga & Ichiro Kishimi',
   'https://covers.openlibrary.org/b/isbn/9781501197284-M.jpg', NULL, 272,
   'Filsafat Adler dikemas dalam dialog Socrates: keberanian untuk hidup bebas dari pengakuan orang lain dan masa lalu yang membelenggu.',
   'lokal', ARRAY['non-fiksi','filsafat','pengembangan diri','terjemahan'], true, 0),

  ('Bersyukur Tanpa Batas', 'Arvan Pradiansyah', NULL, NULL, 240,
   'Panduan menemukan kebahagiaan sejati lewat rasa syukur — cara pandang yang mengubah keluhan menjadi kekuatan.',
   'lokal', ARRAY['non-fiksi','pengembangan diri','spiritualitas'], true, 0),

  ('Self Driving', 'Rene Suhardono', NULL, NULL, 204,
   'Panduan menemukan pekerjaan yang benar-benar bermakna — bukan sekadar karier, tapi hidup yang kamu pilih dengan sadar.',
   'lokal', ARRAY['non-fiksi','karier','pengembangan diri'], true, 0),

  -- ─── Sastra Jepang ───
  ('Norwegian Wood', 'Haruki Murakami',
   'https://covers.openlibrary.org/b/isbn/9780375704024-M.jpg', 'OL273882W', 296,
   'Toru Watanabe mengenang cintanya pada Naoko — gadis rapuh yang terjebak antara hidup dan kematian di Tokyo tahun 1960-an.',
   'lokal', ARRAY['fiksi','sastra','romance','terjemahan'], true, 0),

  ('Kafka on the Shore', 'Haruki Murakami',
   'https://covers.openlibrary.org/b/isbn/9780099494094-M.jpg', 'OL7981479W', 505,
   'Kafka Tamura melarikan diri dari rumah, sementara Nakata si tua bodoh mencari sesuatu yang tak ia mengerti. Dua kisah yang berjalin secara misterius.',
   'lokal', ARRAY['fiksi','sastra','misteri','surreal','terjemahan'], true, 0),

  ('1Q84', 'Haruki Murakami',
   'https://covers.openlibrary.org/b/isbn/9780307593313-M.jpg', 'OL16084990W', 944,
   'Aomame dan Tengo hidup dalam Tokyo 1984 yang perlahan berubah menjadi dunia paralel bernama 1Q84, dengan dua bulan di langit malam.',
   'lokal', ARRAY['fiksi','sastra','surreal','terjemahan'], true, 0),

  ('Kitchen', 'Banana Yoshimoto',
   'https://covers.openlibrary.org/b/isbn/9780802150868-M.jpg', 'OL2627024W', 152,
   'Mikage menemukan ketenangan hidup hanya di dapur setelah kehilangan neneknya. Novela Jepang yang lembut, menyentuh, dan penuh kehangatan.',
   'lokal', ARRAY['fiksi','sastra','keluarga','terjemahan'], true, 0),

  ('Totto-chan: Gadis Cilik di Tepi Jendela', 'Tetsuko Kuroyanagi',
   'https://covers.openlibrary.org/b/isbn/9781568360911-M.jpg', 'OL3327941W', 231,
   'Totto-chan dikeluarkan dari sekolah dasar karena terlalu aktif. Di sekolah baru dalam gerbong kereta, ia menemukan metode belajar yang benar-benar bebas.',
   'lokal', ARRAY['non-fiksi','biografi','pendidikan','terjemahan'], true, 0),

  ('Convenience Store Woman', 'Sayaka Murata',
   'https://covers.openlibrary.org/b/isbn/9780802128898-M.jpg', 'OL27292069W', 176,
   'Keiko hidup bahagia sebagai kasir minimarket selama 18 tahun — satire tajam tentang tekanan sosial untuk "normal" di Jepang.',
   'lokal', ARRAY['fiksi','sastra','sosial','terjemahan'], true, 0),

  ('Confessions', 'Kanae Minato',
   'https://covers.openlibrary.org/b/isbn/9780316200929-M.jpg', 'OL24206553W', 240,
   'Seorang guru SMP mengumumkan rencana balas dendam terhadap murid yang membunuh anaknya. Thriller psikologis Jepang yang menghantui.',
   'lokal', ARRAY['fiksi','thriller','misteri','terjemahan'], true, 0),

  ('Kokoro', 'Natsume Soseki',
   'https://covers.openlibrary.org/b/isbn/9780895269010-M.jpg', 'OL96479W', 248,
   'Sensei — tokoh misterius yang menyimpan rahasia berat — mengungkap kebenaran hidupnya dalam surat yang menggetarkan jiwa.',
   'lokal', ARRAY['sastra','fiksi','filsafat','terjemahan'], true, 0),

  -- ─── Sastra Dunia Klasik ───
  ('1984', 'George Orwell',
   'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg', 'OL1168007W', 328,
   'Winston Smith hidup di bawah pengawasan Big Brother yang omnipresent. Distopia paling ikonik sepanjang masa tentang kebebasan dan kontrol.',
   'lokal', ARRAY['fiksi','distopia','sastra','terjemahan'], true, 0),

  ('Animal Farm', 'George Orwell',
   'https://covers.openlibrary.org/b/isbn/9780451526342-M.jpg', 'OL1168008W', 144,
   'Para hewan mengambil alih ladang dari manusia — alegori tajam tentang revolusi yang berujung pada tirani yang lebih buruk.',
   'lokal', ARRAY['fiksi','alegori','politik','sastra','terjemahan'], true, 0),

  ('The Little Prince', 'Antoine de Saint-Exupéry',
   'https://covers.openlibrary.org/b/isbn/9780156012195-M.jpg', 'OL35120W', 96,
   'Pangeran kecil dari asteroid kecil bertemu pilot yang terdampar di gurun Sahara. Kisah filosofis tentang persahabatan, cinta, dan makna hidup.',
   'lokal', ARRAY['fiksi','filsafat','klasik','terjemahan'], true, 0),

  ('Crime and Punishment', 'Fyodor Dostoevsky',
   'https://covers.openlibrary.org/b/isbn/9780486415871-M.jpg', 'OL166894W', 576,
   'Raskolnikov membunuh seorang rentenir demi teori moralnya sendiri — dan perlahan dihancurkan oleh rasa bersalah yang tak tertanggungkan.',
   'lokal', ARRAY['sastra','fiksi','psikologi','klasik','terjemahan'], true, 0),

  ('To Kill a Mockingbird', 'Harper Lee',
   'https://covers.openlibrary.org/b/isbn/9780061935466-M.jpg', 'OL2798721W', 336,
   'Scout Finch menyaksikan ayahnya, pengacara Atticus, membela pria kulit hitam yang dituduh tanpa bukti di Alabama selatan.',
   'lokal', ARRAY['sastra','fiksi','keadilan','klasik','terjemahan'], true, 0),

  ('Pride and Prejudice', 'Jane Austen',
   'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg', 'OL66554W', 432,
   'Elizabeth Bennet bertemu Mr. Darcy yang sombong dan kaya. Romansa klasik yang mengkritik prasangka sosial dengan kecerdasan dan humor.',
   'lokal', ARRAY['sastra','romance','klasik','terjemahan'], true, 0),

  ('The Great Gatsby', 'F. Scott Fitzgerald',
   'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg', 'OL2657873W', 208,
   'Jay Gatsby yang misterius dan kaya mengejar mimpi yang sudah berlalu di antara kemewahan dan kehampaan Amerika era 1920-an.',
   'lokal', ARRAY['sastra','fiksi','klasik','terjemahan'], true, 0),

  ('Brave New World', 'Aldous Huxley',
   'https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg', 'OL65669W', 311,
   'Dunia masa depan di mana manusia diproduksi massal dan kebahagiaan dipaksakan. Distopia tentang bahaya stabilitas di atas kebebasan.',
   'lokal', ARRAY['fiksi','distopia','sains','terjemahan'], true, 0),

  ('Les Misérables', 'Victor Hugo',
   'https://covers.openlibrary.org/b/isbn/9780451419439-M.jpg', 'OL166545W', 1488,
   'Jean Valjean, mantan narapidana yang bertobat, menjalani hidup baru yang terus dibayangi oleh Inspektur Javert. Epos tentang keadilan dan penebusan.',
   'lokal', ARRAY['sastra','fiksi','sejarah','klasik','terjemahan'], true, 0),

  ('The Stranger', 'Albert Camus',
   'https://covers.openlibrary.org/b/isbn/9780679720201-M.jpg', 'OL38788W', 159,
   'Meursault membunuh seorang Arab tanpa alasan jelas dan menghadapi pengadilan tanpa emosi. Novel absurdisme Camus yang mengusik pikiran.',
   'lokal', ARRAY['sastra','filsafat','absurdisme','terjemahan'], true, 0),

  -- ─── Non-Fiksi Internasional Tambahan ───
  ('How to Win Friends and Influence People', 'Dale Carnegie',
   'https://covers.openlibrary.org/b/isbn/9780671027032-M.jpg', 'OL7432229W', 320,
   'Buku komunikasi dan hubungan manusia yang paling banyak dibaca sepanjang masa — prinsip-prinsip sederhana membangun relasi yang tulus.',
   'lokal', ARRAY['non-fiksi','komunikasi','pengembangan diri','terjemahan'], true, 0),

  ('Think and Grow Rich', 'Napoleon Hill',
   'https://covers.openlibrary.org/b/isbn/9781585424337-M.jpg', 'OL7196072W', 320,
   '13 prinsip kesuksesan yang dirangkum dari wawancara ratusan orang terkaya Amerika. Klasik motivasi bisnis sejak 1937.',
   'lokal', ARRAY['non-fiksi','bisnis','pengembangan diri','terjemahan'], true, 0),

  ('The 48 Laws of Power', 'Robert Greene',
   'https://covers.openlibrary.org/b/isbn/9780140280197-M.jpg', 'OL15390W', 480,
   '48 hukum kekuasaan yang dipelajari dari sejarah para pemimpin, strategi, dan tirani — buku tentang dinamika kekuatan manusia.',
   'lokal', ARRAY['non-fiksi','strategi','sejarah','terjemahan'], true, 0),

  ('Ego Is the Enemy', 'Ryan Holiday',
   'https://covers.openlibrary.org/b/isbn/9781591847816-M.jpg', NULL, 256,
   'Ego adalah musuh terbesar ambisi kita — pelajaran dari Marcus Aurelius, Howard Hughes, dan para pemimpin besar tentang kerendahan hati.',
   'lokal', ARRAY['non-fiksi','filsafat','pengembangan diri','terjemahan'], true, 0),

  ('Digital Minimalism', 'Cal Newport',
   'https://covers.openlibrary.org/b/isbn/9780525536512-M.jpg', 'OL27358956W', 304,
   'Filosofi penggunaan teknologi dengan niat — pilih dengan cermat alat digital yang benar-benar mendukung nilai hidupmu.',
   'lokal', ARRAY['non-fiksi','produktivitas','teknologi','terjemahan'], true, 0),

  ('Range: Why Generalists Triumph', 'David Epstein',
   'https://covers.openlibrary.org/b/isbn/9780735214484-M.jpg', NULL, 352,
   'Berlawanan dengan teori 10.000 jam — generalis yang mencoba banyak bidang justru lebih siap menghadapi dunia yang kompleks.',
   'lokal', ARRAY['non-fiksi','psikologi','pengembangan diri','terjemahan'], true, 0),

  ('Educated', 'Tara Westover',
   'https://covers.openlibrary.org/b/isbn/9780399590504-M.jpg', 'OL27303548W', 352,
   'Tara tumbuh di keluarga survivalist Idaho tanpa pendidikan formal — hingga ia berhasil masuk Cambridge dan Harvard dengan kemampuannya sendiri.',
   'lokal', ARRAY['non-fiksi','biografi','pendidikan','terjemahan'], true, 0),

  ('Becoming', 'Michelle Obama',
   'https://covers.openlibrary.org/b/isbn/9781524763138-M.jpg', 'OL27316777W', 448,
   'Memoar mantan First Lady Amerika yang menceritakan perjalanannya dari South Side Chicago hingga Gedung Putih — tentang identitas dan tujuan.',
   'lokal', ARRAY['non-fiksi','biografi','inspirasi','terjemahan'], true, 0),

  ('The Power of Habit', 'Charles Duhigg',
   'https://covers.openlibrary.org/b/isbn/9781400069286-M.jpg', 'OL25641938W', 371,
   'Ilmu di balik kebiasaan manusia dan organisasi — cue, routine, reward — dan bagaimana kita bisa mengubahnya secara sadar.',
   'lokal', ARRAY['non-fiksi','psikologi','pengembangan diri','terjemahan'], true, 0),

  ('Grit: The Power of Passion and Perseverance', 'Angela Duckworth',
   'https://covers.openlibrary.org/b/isbn/9781501111105-M.jpg', NULL, 352,
   'Riset Angela Duckworth membuktikan bahwa bakat bukanlah segalanya — kombinasi passion dan ketekunan (grit) jauh lebih menentukan kesuksesan.',
   'lokal', ARRAY['non-fiksi','psikologi','pengembangan diri','terjemahan'], true, 0),

  ('Quiet: The Power of Introverts', 'Susan Cain',
   'https://covers.openlibrary.org/b/isbn/9780307352149-M.jpg', NULL, 368,
   'Satu dari tiga orang adalah introvert. Susan Cain mengungkap kekuatan tersembunyi mereka dan mengapa dunia butuh keduanya.',
   'lokal', ARRAY['non-fiksi','psikologi','pengembangan diri','terjemahan'], true, 0)

) AS new_books(title, author, cover_url, open_library_id, total_pages, description, category, tags, is_active, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM curated_books cb WHERE cb.title = new_books.title
);
