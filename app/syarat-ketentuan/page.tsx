import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan — Mulaibaca",
  description: "Syarat dan ketentuan penggunaan layanan Mulaibaca.",
  alternates: { canonical: "https://mulaibaca.id/syarat-ketentuan" },
};

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-dvh bg-parchment">
      <header className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl font-display font-bold text-forest">mulaibaca</Link>
          <span className="text-xs text-ink-muted">/ syarat-ketentuan</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-h1">Syarat &amp; Ketentuan</h1>
          <p className="text-sm text-ink-muted mt-1">Terakhir diperbarui: Juli 2026</p>
        </div>

        <section className="space-y-4">
          <p className="text-sm text-ink-secondary leading-relaxed">
            Dengan menggunakan Mulaibaca (&ldquo;Layanan&rdquo;), Anda menyetujui syarat dan ketentuan berikut. Jika tidak setuju, mohon tidak menggunakan Layanan ini.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">1. Akun</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Anda bertanggung jawab menjaga kerahasiaan kata sandi dan keamanan akun. Setiap aktivitas yang terjadi dalam akun Anda adalah tanggung jawab Anda.
          </p>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Anda harus berusia minimal 13 tahun untuk menggunakan Layanan, atau memiliki izin orang tua jika di bawah 13 tahun.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">2. Penggunaan Layanan</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">Anda setuju untuk tidak:</p>
          <ul className="list-disc pl-5 text-sm text-ink-secondary leading-relaxed space-y-1">
            <li>Menggunakan Layanan untuk aktivitas melanggar hukum.</li>
            <li>Menyebarkan konten yang bersifat spam, ancaman, atau pelecehan.</li>
            <li>Mencoba mengakses akun pengguna lain tanpa izin.</li>
            <li>Menyalahgunakan fitur Keluarga untuk tujuan di luar membangun kebiasaan membaca.</li>
            <li>Melakukan逆向 engineering, scraping berlebihan, atau membebani server secara tidak wajar.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">3. Konten Pengguna</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Data bacaan, catatan, review, dan konten lain yang Anda masukkan ke Mulaibaca tetap milik Anda. Kami hanya menggunakan data tersebut untuk menjalankan Layanan.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">4. Batasan Tanggung Jawab</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Mulaibaca disediakan &ldquo;sebagaimana adanya&rdquo; (as is). Kami tidak menjamin Layanan bebas dari gangguan atau kesalahan. Kami tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan Layanan.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">5. Penghentian</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Kami dapat menangguhkan atau menghentikan akses Anda jika melanggar syarat ini. Anda dapat menghapus akun kapan saja melalui pengaturan Profil atau dengan menghubungi tim melalui halaman Bantuan.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">6. Perubahan Syarat</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Syarat ini dapat diperbarui sewaktu-waktu. Penggunaan Layanan setelah perubahan berarti Anda menyetujui syarat yang baru.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">7. Hukum yang Berlaku</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Syarat ini tunduk pada hukum Republik Indonesia. Penyelesaian sengketa diupayakan melalui musyawarah terlebih dahulu.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-h2">8. Kontak</h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Pertanyaan tentang syarat ini dapat disampaikan melalui halaman{' '}
            <Link href="/bantuan" className="text-amber font-semibold underline underline-offset-2">Bantuan</Link>.
          </p>
        </section>
      </main>
    </div>
  );
}
