import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-route";
import BackButton from "@/components/BackButton";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Panduan — Mulaibaca",
  description: "Panduan lengkap menggunakan Mulaibaca. Pelajari cara membuat ruang keluarga, menambahkan anggota, mencatat buku, dan bertumbuh bersama.",
  alternates: { canonical: "https://mulaibaca.id/panduan" },
  openGraph: {
    title: "Panduan — Mulaibaca",
    description: "Panduan lengkap menggunakan Mulaibaca.",
    url: "https://mulaibaca.id/panduan",
  },
  twitter: {
    card: "summary_large_image",
    title: "Panduan — Mulaibaca",
    description: "Panduan lengkap menggunakan Mulaibaca.",
  },
};

const FALLBACK_GUIDES = [
  {
    title: "Apa itu Mulaibaca?",
    content:
      "Mulaibaca adalah aplikasi pencatat bacaan yang bisa digunakan sendiri atau bersama orang terdekat.\n\nSetiap anggota punya rak buku pribadi, bisa mencatat progres baca harian, menjaga streak, dan saling melihat perkembangan literasi.\n\nAda dua tipe Lingkar Baca:\n- Lingkar Keluarga — untuk keluarga dengan peran Ayah, Ibu, Anak. Admin bisa tambah akun anak dan switch untuk mengelola.\n- Lingkar Teman — untuk pasangan, teman, atau komunitas. Semua anggota setara.\n\nTidak ada notifikasi yang mengganggu. Mulaibaca fokus membantu kamu membangun kebiasaan membaca yang konsisten.",
  },
  {
    title: "Daftar & Mulai",
    content:
      "Ada tiga cara memulai Mulaibaca:\n\n1. Daftar biasa — Buat akun di halaman Daftar. Masukkan nama, email, password. Setelah itu kamu bisa membuat atau bergabung ke Lingkar Baca.\n\n2. Bergabung pakai kode undangan — Jika keluargamu sudah punya Lingkar Baca, masukkan kode undangan di halaman Gabung (mulaibaca.id/lingkar-baca/gabung). Kode bisa didapat dari anggota yang sudah terdaftar. Link undangan langsung bisa dibagikan, contoh: mulaibaca.id/lingkar-baca/gabung?code=XXXXXXX.\n\n3. Coba dulu — Ingin eksplorasi tanpa daftar? Buka halaman Coba, kamu langsung masuk dashboard dengan akun sementara. Data bisa diupgrade ke akun permanen kapan saja.",
  },
  {
    title: "Dashboard & Streak Bacaan",
    content:
      "Dashboard adalah halaman utama setelah login. Di sini kamu bisa melihat:\n\n- Streak — jumlah hari berturut-turut kamu mencatat bacaan. Klik badge streak untuk langsung mencatat log.\n- Daftar periksa onboarding — panduan langkah awal jika baru pertama kali: tambah buku, catat log, atur target.\n- Target mingguan — progres halaman minggu ini, bisa diatur dari Edit Profil.\n- Lanjut Baca — buku yang sedang kamu baca dengan progres halaman.\n- Aktivitas terbaru — timeline aktivitas kamu dan teman yang kamu ikuti.",
  },
  {
    title: "Rak Buku",
    content:
      "Setiap anggota punya rak buku pribadi dengan tiga tab:\n\n- Mau Baca — buku yang ingin kamu baca nanti. Tekan Mulai Baca untuk pindah ke Dibaca. Bisa dihapus dari rak.\n- Dibaca — buku yang sedang kamu baca. Tampilan list dengan progres bar. Kamu bisa update halaman langsung, catat log, atau tandai selesai. Saat selesai, sisa halaman otomatis tercatat dan muncul banner perayaan.\n- Selesai — buku yang sudah dituntaskan. Dari sini bisa langsung tulis review atau lihat review yang sudah ada.\n\nSetiap tab bisa diurutkan: Terbaru, A-Z, Z-A, atau berdasarkan progres.\n\nUntuk menambah buku, buka Jelajah atau Cari, atau tambah manual jika tidak ditemukan.",
  },
  {
    title: "Catat Log Bacaan",
    content:
      "Setiap hari kamu bisa mencatat halaman yang sudah dibaca:\n\n1. Buka halaman Catat (ikon pensil di navigasi bawah).\n2. Pilih buku yang sedang kamu baca. Jika buku tidak ada di rak, ada tautan untuk mencari di Jelajah.\n3. Tentukan rentang halaman — Dari hal berapa sampai hal berapa. Jumlah halaman otomatis terhitung.\n4. Gunakan timer untuk mencatat durasi baca (opsional).\n5. Tambahkan catatan dan foto (opsional).\n6. Tekan Catat — muncul popup perayaan: jumlah halaman, streak, dan tombol catat lagi atau kembali ke dashboard.\n\nJika buku selesai (halaman akhir >= total halaman), kamu akan diajak menulis review.\n\nLog hari ini bisa dilihat langsung di halaman Catat. Semua log tersedia di halaman Catatan.\n\nLog hari ini otomatis memperpanjang streak bacaanmu.",
  },
  {
    title: "Jelajah & Cari Buku",
    content:
      "Temukan buku baru lewat halaman Jelajah. Bagian atas terdapat pencarian sticky dengan saran otomatis dari database lokal dan OpenLibrary.\n\nSaat tidak mencari, tersedia bagian:\n- Sedang dibaca keluarga — lihat buku yang sedang dibaca anggota Lingkar Baca lain.\n- Buku Anak (untuk anggota dengan peran Anak) — tab berdasarkan kelompok usia: Balita (0–3), Anak Awal (4–8), Anak Akhir (9–12), Remaja (13+).\n- Trending Minggu Ini — 10 buku terpopuler minggu ini.\n- Karena Kamu Baca... — rekomendasi berdasarkan kategori buku di rakmu.\n- Bagian kurasi — koleksi pilihan tim Mulaibaca.\n- Semua buku — katalog lengkap dengan filter kategori dan subkategori.\n\nButuh buku tertentu? Gunakan halaman Cari. Jika tidak ditemukan, kamu bisa tambah buku secara manual.",
  },
  {
    title: "Review Buku",
    content:
      "Setelah selesai membaca, kamu bisa menulis review:\n\n1. Beri rating bintang 1–5 dengan label: Kurang bagus, Lumayan, Bagus, Sangat bagus, Luar biasa!\n2. Jawab tiga pertanyaan:\n   - Buku ini tentang apa?\n   - Yang paling berkesan?\n   - Untuk siapa cocok?\n3. Atur visibilitas: Publik atau Privat.\n4. Atur anonimitas: tampilkan nama atau sembunyikan (hanya untuk review publik).\n\nReview publik akan muncul di halaman Review dan di profil publikmu. Pengaturan bisa diubah kapan saja dari halaman detail review.",
  },
  {
    title: "Lingkar Baca",
    content:
      "Lingkar Baca adalah ruang untuk membaca bersama. Ada dua tipe:\n\nLingkar Keluarga:\n- Peran: Ayah, Ibu, Anak, atau Dewasa.\n- Admin bisa menambah akun anak tanpa email (cukup nama, tanggal lahir, avatar).\n- Admin bisa switch akun untuk mengelola profil dan mencatat bacaan anak.\n- Usia anak muncul sebagai label (Balita, Anak Awal, Anak Akhir, Remaja) dan memengaruhi rekomendasi buku.\n- Maksimal 8 anggota.\n\nLingkar Teman:\n- Semua anggota setara (peran Dewasa).\n- Maksimal 20 anggota.\n\nHalaman Lingkar Baca (mulaibaca.id/lingkar-baca/saya) menampilkan:\n- Ringkasan: streak keluarga, halaman minggu ini, buku yang dibaca.\n- Tantangan Mingguan: target halaman seluruh keluarga dengan progress bar.\n- Aktivitas Anggota: profil, streak, progres, dan buku yang sedang dibaca per anggota.\n- Undang Anggota: kode undangan yang bisa disalin atau dibagikan lewat WhatsApp. Untuk Lingkar Keluarga, tersedia tombol Tambah Akun Anak.\n\nKode undangan bisa diatur ulang kapan saja dari halaman Edit Profil.",
  },
  {
    title: "Profil & Pengaturan",
    content:
      "Halaman Edit Profil berisi:\n- Avatar — pilih dari 6 ikon yang tersedia.\n- Nama tampilan — nama yang muncul di profil.\n- Username — untuk profil publik di mulaibaca.id/u/username. Hanya bisa diatur sekali.\n- Tanggal lahir — menampilkan usia otomatis.\n- Target membaca mingguan — atur target halaman per minggu (preset 25/50/100/150 atau custom).\n\nProfil publik bisa dibagikan dan menampilkan: statistik bacaan, buku yang sedang dibaca, buku selesai, dan review.\n\nHalaman Progress menampilkan:\n- Streak saat ini dan terpanjang.\n- Grafik garis 30 hari — klik titik untuk melihat detail tanggal dan halaman.\n- Statistik: total halaman, buku selesai, rata-rata per hari.\n- Aktivitas — timeline log, review, dan pencapaian.\n\nKamu bisa mengikuti pengguna lain lewat halaman Cari Teman untuk melihat aktivitas mereka di dashboard.",
  },
];

export default async function PanduanPage() {
  const admin = createAdminClient();
  const { data: dbGuides } = await admin
    .from("help_guides")
    .select("title, content")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const guides: { title: string; content: string | null }[] = dbGuides?.length ? dbGuides : FALLBACK_GUIDES;

  return (
    <div className="min-h-dvh bg-parchment">
      <header className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-1">
          <BackButton />
          <span className="font-display font-bold text-xl text-forest">mulaibaca</span>
          <span className="text-xs text-ink-muted">/ panduan</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-10">
        <div>
          <h1 className="text-h1">Panduan</h1>
          <p className="text-sm text-ink-muted mt-1">Panduan lengkap menggunakan Mulaibaca bersama keluarga</p>
        </div>

        <div className="space-y-6">
          {guides.map((guide, idx) => (
            <section key={idx}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-amber text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <h2 className="text-h2">{guide.title}</h2>
              </div>
              {guide.content && (
                <div className="bg-surface rounded-xl border border-border p-4">
                  <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-wrap">{guide.content}</p>
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="bg-amber-soft rounded-2xl border border-amber/30 p-5 text-center space-y-3">
          <p className="font-semibold text-ink">Masih punya pertanyaan?</p>
          <Link href="/bantuan" className="btn-primary inline-flex">Hubungi kami</Link>
        </div>
      </main>
    </div>
  );
}
