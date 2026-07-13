import Link from "next/link";
import { Users, Target, Heart, Share2, ArrowRight, BookOpen } from "lucide-react";

const benefits = [
  {
    Icon: Users,
    title: "Pantau Bersama",
    desc: "Lihat progres membaca seluruh anggota lingkar dalam satu tampilan. Siapa yang paling rajin? Siapa yang lagi asyik baca buku apa?",
  },
  {
    Icon: Target,
    title: "Tantangan Mingguan",
    desc: "Setel target halaman mingguan untuk lingkar. Capai bersama, rayakan bersama.",
  },
  {
    Icon: Heart,
    title: "Saling Semangat",
    desc: "Setiap anggota punya streak sendiri. Streak tertinggi, halaman terbanyak — semua terlihat dan bisa saling memotivasi.",
  },
  {
    Icon: Share2,
    title: "Undang Mudah",
    desc: "Bagikan kode undangan ke pasangan, anak, atau teman. Mereka langsung join dan bisa ikut mencatat bacaan.",
  },
];

export default function LingkarBacaLanding() {
  return (
    <div className="min-h-dvh bg-parchment">
      <header className="bg-surface border-b-2 border-ink px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="font-display font-black text-ink tracking-tight" style={{ fontSize: "1.1875rem", letterSpacing: "-0.03em" }}>
          mulaibaca
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/masuk" className="text-sm font-semibold text-ink-secondary hover:text-ink transition-colors">
            Masuk
          </Link>
          <Link href="/daftar" className="btn-primary-sm">
            Mulai Gratis
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-14">
        {/* Hero */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-soft border border-amber/20 rounded-full text-xs font-semibold text-amber">
            <Users size={12} /> Fitur Grup
          </div>
          <h1 className="font-display text-4xl font-black text-ink leading-tight tracking-tight">
            Baca Bareng,<br />
            <span className="text-forest">Makin Semangat</span>
          </h1>
          <p className="text-ink-secondary text-base max-w-md mx-auto leading-relaxed">
            Ajak pasangan, anak, atau teman dalam satu Lingkar Baca. Pantau progres,
            saling menyemangati, dan rayakan pencapaian membaca bersama.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/lingkar-baca/buat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-parchment font-bold rounded-xl border-2 border-ink shadow-[3px_3px_0_#1E4530] hover:shadow-[1px_1px_0_#1E4530] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Buat Lingkar Baru <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
            <Link
              href="/lingkar-baca/gabung"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface text-ink font-bold rounded-xl border-2 border-border hover:border-amber/40 transition-colors"
            >
              Punya Kode? Gabung
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <h2 className="text-center font-display text-2xl font-black text-ink">Cara Kerja</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Buat Lingkar", desc: "Beri nama lingkar bacamu. Jadi admin dan atur tantangan mingguan." },
              { step: "2", title: "Undang Anggota", desc: "Bagikan kode undangan. Anggota tinggal masuk & mulai mencatat." },
              { step: "3", title: "Tumbuh Bareng", desc: "Pantau streak, halaman, dan progres setiap anggota dalam satu dashboard." },
            ].map((s) => (
              <div key={s.step} className="bg-surface rounded-2xl border border-border p-5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-soft flex items-center justify-center mx-auto font-display font-black text-lg text-amber">
                  {s.step}
                </div>
                <h3 className="font-bold text-ink">{s.title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="space-y-6">
          <h2 className="text-center font-display text-2xl font-black text-ink">Kenapa Lingkar Baca?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-surface rounded-2xl border border-border p-5 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                  <Icon size={20} className="text-forest" />
                </div>
                <h3 className="font-bold text-ink">{title}</h3>
                <p className="text-xs text-ink-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Manage kids */}
        <section className="bg-surface rounded-3xl border-2 border-ink p-6 sm:p-8 text-center space-y-3">
          <BookOpen size={32} strokeWidth={1.25} className="text-forest mx-auto" />
          <h2 className="font-display text-xl font-black text-ink">Punya Anak yang Baru Belajar Baca?</h2>
          <p className="text-sm text-ink-muted max-w-sm mx-auto leading-relaxed">
            Admin bisa menambahkan anggota tanpa email — cocok untuk anak yang belum punya akun.
            Pantau bacaan mereka, setel target, dan lihat progres dari dashboard lingkar.
          </p>
          <Link href="/lingkar-baca/saya/tambah" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber hover:text-amber-dark transition-colors">
            Cara tambah anggota <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 pb-8">
          <h2 className="font-display text-2xl font-black text-ink">Siap Membaca Bareng?</h2>
          <p className="text-ink-muted text-sm">Gratis. Tidak perlu kartu kredit.</p>
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ink text-parchment font-bold rounded-xl border-2 border-ink shadow-[3px_3px_0_#1E4530] hover:shadow-[1px_1px_0_#1E4530] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-lg"
          >
            Mulai Sekarang <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </section>
      </main>
    </div>
  );
}
