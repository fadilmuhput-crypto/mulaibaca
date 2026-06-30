import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-route";

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
    card: "summary",
    title: "Panduan — Mulaibaca",
    description: "Panduan lengkap menggunakan Mulaibaca.",
  },
};

const FALLBACK_GUIDES = [
  {
    title: "Apa itu Mulaibaca?",
    content:
      "Mulaibaca adalah aplikasi pencatat bacaan untuk keluarga. Setiap anggota keluarga punya rak buku sendiri, bisa mencatat progres baca harian, menjaga streak, dan saling memantau perkembangan literasi.\n\nTidak ada gangguan sosial, tidak ada notifikasi yang mengganggu. Mulaibaca fokus membantu kamu dan keluarga membangun kebiasaan membaca yang konsisten.",
  },
  {
    title: "Daftar & Mulai",
    content:
      "Ada tiga cara memulai Mulaibaca:\n\n1. Daftar biasa — Buat akun di halaman Daftar. Masukkan nama, email, dan password. Setelah itu kamu bisa membuat ruang keluarga baru.\n\n2. Bergabung pakai kode undangan — Jika keluargamu sudah punya ruang di Mulaibaca, cukup masukkan kode undangan di halaman Bergabung. Kode bisa didapat dari anggota keluarga yang sudah terdaftar (bagikan dari dashboard). Link undangan juga bisa langsung dibagikan dengan kode.\n\n3. Coba dulu — Ingin eksplorasi dulu tanpa daftar? Buka halaman Coba, kamu akan langsung masuk ke dashboard dengan akun sementara.",
  },
  {
    title: "Dashboard & Streak Bacaan",
    content:
      "Dashboard adalah halaman utama setelah login. Di sini kamu bisa melihat:\n\n- Api (streak) — jumlah hari berturut-turut kamu mencatat bacaan.\n- Target mingguan — halaman yang ingin kamu capai dalam seminggu.\n- Daftar periksa onboarding — panduan langkah awal jika baru pertama kali.\n- Sedang dibaca — buku yang sedang kamu baca, lengkap dengan progres halaman.\n- Anggota keluarga — foto profil anggota keluarga lain yang juga aktif.\n- Kode undangan — untuk mengajak anggota keluarga lain bergabung.",
  },
  {
    title: "Rak Buku",
    content:
      "Setiap anggota punya rak buku pribadi dengan tiga tab:\n\n- Mau Baca — buku yang ingin kamu baca di lain waktu. Tekan Mulai Baca untuk memindahkan ke status Dibaca.\n- Dibaca — buku yang sedang kamu baca saat ini. Kamu bisa mengupdate halaman terakhir, menandai selesai, atau langsung mencatat log bacaan.\n- Selesai — buku yang sudah kamu tuntaskan. Dari sini kamu bisa langsung menulis review.\n\nUntuk menambah buku, buka Jelajah atau Cari, atau tambah manual.",
  },
  {
    title: "Catat Log Bacaan",
    content:
      "Setiap hari kamu bisa mencatat jumlah halaman yang sudah dibaca:\n\n1. Buka halaman Log Baca (ikon pensil di navigasi bawah).\n2. Pilih buku yang sedang kamu baca.\n3. Masukkan jumlah halaman — pakai tombol +10, preset, atau ketik manual.\n4. Tambahkan catatan (opsional).\n\nLog hari ini akan otomatis memperpanjang streak bacaanmu. Catatan bisa dilihat di halaman Catatan.",
  },
  {
    title: "Jelajah & Cari Buku",
    content:
      "Temukan buku baru lewat halaman Jelajah:\n\n- Rekomendasi personal — berdasarkan kategori buku di rakmu.\n- Sedang dibaca keluarga — lihat apa yang dibaca anggota keluarga lain.\n- Sedang tren — buku yang paling banyak ditambah ke rak.\n- Bagian kurasi — koleksi pilihan tim Mulaibaca.\n\nButuh buku tertentu? Gunakan halaman Cari. Jika tidak ditemukan, kamu bisa tambah buku secara manual.",
  },
  {
    title: "Review Buku",
    content:
      "Setelah selesai membaca, kamu bisa menulis review:\n\n- Beri rating bintang 1-5.\n- Jawab tiga pertanyaan: tentang apa buku ini, apa yang paling berkesan, dan untuk siapa cocok.\n- Atur visibilitas: Publik atau Privat.\n- Atur anonimitas: tampilkan nama atau sembunyikan.\n\nReview publik akan muncul di halaman Review. Pengaturan bisa diubah kapan saja dari halaman detail review.",
  },
  {
    title: "Keluarga & Pantau Progres",
    content:
      "Fitur keluarga memungkinkan kamu membuat ruang baca bersama:\n\n- Buat ruang keluarga saat mendaftar, lalu undang anggota lewat kode undangan.\n- Admin bisa menambah anggota dengan peran: Ayah, Ibu, Anak, atau Dewasa.\n- Untuk anak, bisa memasukkan tanggal lahir agar rekomendasi lebih sesuai.\n- Admin juga bisa switch akun untuk mengelola profil anggota lain.\n\nHalaman Keluarga menampilkan progres semua anggota: streak, halaman mingguan, buku yang dibaca.",
  },
  {
    title: "Profil & Pengaturan",
    content:
      "Halaman Profil berisi:\n- Statistik bacaan: buku selesai, total halaman, streak terpanjang.\n- Edit identitas: nama, avatar, username (untuk profil publik).\n- Target mingguan: atur jumlah halaman per minggu.\n\nUsername bisa digunakan untuk membagikan profil publik: mulaibaca.id/u/namausername.",
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
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl font-display font-bold text-forest">mulaibaca</Link>
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
