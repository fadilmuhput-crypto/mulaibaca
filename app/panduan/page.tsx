import Link from "next/link";

const SECTIONS = [
  {
    title: "Apa itu Mulaibaca?",
    content: "Mulaibaca adalah ruang baca digital untuk keluarga. Kamu bisa mencatat buku yang sedang dibaca, mau dibaca, dan sudah selesai dibaca — bareng anggota keluarga lain."
  },
  {
    title: "Memulai",
    items: [
      { label: "Buat akun", desc: "Daftar dengan email di halaman daftar, lalu ikuti petunjuknya." },
      { label: "Jelajahi buku", desc: "Temukan buku dari koleksi kurasi atau cari直接从 OpenLibrary di halaman Jelajah." },
      { label: "Tambahkan ke Rak", desc: "Tekan tombol \"Mau Baca\" atau \"Sedang Baca\" untuk menambahkan buku ke rak pribadimu." },
    ]
  },
  {
    title: "Mengelola Keluarga",
    items: [
      { label: "Undang anggota", desc: "Di halaman Keluarga, kamu dapat menambahkan anggota keluarga lewat kode undangan atau link." },
      { label: "Kelola peran", desc: "Setiap anggota bisa punya peran: Ayah, Ibu, Anak, atau Dewasa. Kamu bisa mengubahnya di halaman Profil dan Keluarga." },
      { label: "Buku keluarga", desc: "Lihat apa yang sedang dibaca anggota keluarga lain dari halaman Jelajah." },
    ]
  },
  {
    title: "Mencatat Bacaan",
    items: [
      { label: "Rak Buku", desc: "Semua buku yang kamu tandai muncul di Rak. Bisa difilter berdasarkan status: sedang dibaca, mau dibaca, atau selesai." },
      { label: "Catat progres", desc: "Klik buku di Rak untuk mengubah status atau memberikan review." },
      { label: "Target mingguan", desc: "Kamu bisa mengatur target halaman per minggu dan melihat statistik bacaan." },
    ]
  },
  {
    title: "Mengelola Profil & Akun",
    items: [
      { label: "Profil", desc: "Di halaman Profil kamu bisa mengubah nama, avatar, username, role, dan target bacaan mingguan." },
      { label: "Update email/password", desc: "Di pengaturan akun, kamu bisa memperbarui email dan password." },
    ]
  },
];

export default function PanduanPage() {
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
          <p className="text-sm text-ink-muted mt-1">Semua yang perlu kamu tahu tentang Mulaibaca</p>
        </div>

        {SECTIONS.map((sec) => (
          <section key={sec.title}>
            <h2 className="text-h2 mb-3">{sec.title}</h2>
            {"content" in sec && sec.content && (
              <p className="text-body text-ink-secondary leading-relaxed">{sec.content}</p>
            )}
            {"items" in sec && sec.items && (
              <div className="space-y-4">
                {sec.items.map((item) => (
                  <div key={item.label} className="bg-surface rounded-xl border border-border p-4">
                    <p className="font-semibold text-ink text-sm">{item.label}</p>
                    <p className="text-sm text-ink-secondary mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        <div className="bg-amber-soft rounded-2xl border border-amber/30 p-5 text-center space-y-3">
          <p className="font-semibold text-ink">Masih punya pertanyaan?</p>
          <Link href="/bantuan" className="btn-primary inline-flex">Hubungi kami</Link>
        </div>
      </main>
    </div>
  );
}
