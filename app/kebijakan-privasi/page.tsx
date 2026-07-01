import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Mulaibaca",
  description: "Kebijakan privasi Mulaibaca — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pengguna.",
  alternates: { canonical: "https://mulaibaca.id/kebijakan-privasi" },
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="min-h-dvh bg-parchment">
      <header className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl font-display font-bold text-forest">mulaibaca</Link>
          <span className="text-xs text-ink-muted">/ kebijakan-privasi</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-h1">Kebijakan Privasi</h1>
          <p className="text-sm text-ink-muted mt-1">Terakhir diperbarui: Juli 2026</p>
        </div>

        <section className="space-y-4">
          <p className="text-sm text-ink-secondary leading-relaxed">
            Mulaibaca (&ldquo;Kami&rdquo;) menghormati privasi pengguna (&ldquo;Anda&rdquo;). Kebijakan ini menjelaskan bagaimana Kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda saat menggunakan layanan di mulaibaca.id.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">1. Data yang Dikumpulkan</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">Kami mengumpulkan data berikut:</p>
          <ul className="list-disc pl-5 text-sm text-ink-secondary leading-relaxed space-y-1">
            <li><strong>Data akun:</strong> nama, alamat email, username, kata sandi (dienkripsi) — saat Anda mendaftar.</li>
            <li><strong>Data profil:</strong> foto profil, bio, preferensi membaca — jika Anda melengkapinya.</li>
            <li><strong>Data aktivitas:</strong> buku yang ditambahkan ke rak, catatan bacaan, halaman yang dibaca, streak, review — untuk menjalankan layanan inti.</li>
            <li><strong>Data keluarga:</strong> hubungan antar anggota, kode undangan — untuk fitur Keluarga.</li>
            <li><strong>Data teknis:</strong> alamat IP, jenis peramban, sistem operasi, halaman yang dikunjungi — melalui Google Analytics (hanya dengan izin Anda).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">2. Penggunaan Data</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">Data Anda digunakan untuk:</p>
          <ul className="list-disc pl-5 text-sm text-ink-secondary leading-relaxed space-y-1">
            <li>Menyediakan dan menjalankan layanan inti Mulaibaca (catatan bacaan, streak, keluarga).</li>
            <li>Menyimpan progres membaca agar tersinkronisasi di seluruh perangkat.</li>
            <li>Menganalisis penggunaan aplikasi secara agregat untuk meningkatkan kualitas layanan (dengan izin).</li>
            <li>Mengirim notifikasi terkait aktivitas (streak, pengingat) — dapat dimatikan kapan saja.</li>
            <li>Merespon pertanyaan, masukan, dan komplain dari Anda.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">3. Penyimpanan &amp; Keamanan</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Data Anda disimpan di server <strong>Supabase</strong> (infrastruktur AWS, region Asia Tenggara). Kami menerapkan enkripsi dalam perjalanan (TLS) dan enkripsi saat istirahat. Kata sandi di-hash menggunakan algoritma standar industri.
          </p>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Akses ke data Anda terbatas pada sistem yang membutuhkan untuk menjalankan layanan. Kami tidak menjual data pribadi Anda kepada pihak ketiga.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">4. Cookie &amp; Pelacakan</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Mulaibaca menggunakan cookie untuk menyimpan sesi login Anda (cookie autentikasi). Kami juga menggunakan <strong>Google Analytics</strong> untuk memahami pola penggunaan secara agregat — fitur ini hanya aktif setelah Anda memberikan izin melalui banner cookie.
          </p>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Anda dapat menarik izin kapan saja dengan menghapus cookie melalui pengaturan peramban.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">5. Hak Anda</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">Anda berhak untuk:</p>
          <ul className="list-disc pl-5 text-sm text-ink-secondary leading-relaxed space-y-1">
            <li><strong>Mengakses</strong> data pribadi yang Kami simpan.</li>
            <li><strong>Memperbaiki</strong> data yang tidak akurat melalui halaman Profil.</li>
            <li><strong>Mengekspor</strong> data bacaan Anda kapan saja.</li>
            <li><strong>Menghapus</strong> akun beserta seluruh data terkait — hubungi Kami melalui halaman Bantuan.</li>
            <li><strong>Menolak</strong> pelacakan Google Analytics dengan tidak menyetujui banner cookie.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">6. Data Anak-anak</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Fitur Keluarga memungkinkan orang tua menambahkan anak sebagai anggota. Data anak dikelola oleh akun orang tua. Kami tidak dengan sengaja mengumpulkan data anak di bawah 13 tahun tanpa persetujuan orang tua.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">7. Perubahan Kebijakan</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email atau pemberitahuan di aplikasi.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">8. Kontak</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Jika ada pertanyaan tentang kebijakan privasi ini, hubungi Kami melalui halaman{' '}
            <Link href="/bantuan" className="text-amber font-semibold underline underline-offset-2">Bantuan</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
