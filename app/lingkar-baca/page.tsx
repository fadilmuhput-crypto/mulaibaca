import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { Users, Heart, Share2, ArrowRight, BookOpen, Target, Baby, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Lingkar Baca — Mulaibaca",
  description: "Baca bareng keluarga atau teman di Lingkar Baca. Pantau progres, jaga streak, dan rayakan pencapaian membaca bersama orang terdekat.",
  alternates: { canonical: "https://mulaibaca.id/lingkar-baca" },
  openGraph: {
    title: "Lingkar Baca — Mulaibaca",
    description: "Baca bareng keluarga atau teman. Pantau progres dan rayakan pencapaian bersama.",
    url: "https://mulaibaca.id/lingkar-baca",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lingkar Baca — Mulaibaca",
    description: "Baca bareng keluarga atau teman. Pantau progres dan rayakan pencapaian bersama.",
  },
};

export default async function LingkarBacaLanding() {
  const session = await getSession();
  if (session) {
    redirect("/lingkar-baca/saya");
  }

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
        </section>

        {/* Two types */}
        <section className="grid sm:grid-cols-2 gap-4">
          <div className="bg-surface rounded-3xl border-2 border-border p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-forest/10 flex items-center justify-center">
              <Users size={24} className="text-forest" />
            </div>
            <h2 className="font-display text-xl font-black text-ink">Lingkar Keluarga</h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Untuk keluarga dengan anak. Pantau bacaan anak, setel tantangan,
              dan kelola akun bacaan anak tanpa perlu email.
            </p>
            <div className="flex gap-2">
              {[Baby, Heart, User].map((Icon, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-parchment border border-border flex items-center justify-center">
                  <Icon size={14} className="text-ink-muted" />
                </div>
              ))}
            </div>
            <Link
              href="/lingkar-baca/buat"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-forest hover:text-forest/80 transition-colors"
            >
              Buat Lingkar Keluarga <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>

          <div className="bg-surface rounded-3xl border-2 border-border p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-soft flex items-center justify-center">
              <Heart size={24} className="text-amber" />
            </div>
            <h2 className="font-display text-xl font-black text-ink">Lingkar Teman</h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Untuk teman, pasangan, atau komunitas. Saling lihat progres dan
              streak tanpa fitur peran keluarga.
            </p>
            <Link
              href="/lingkar-baca/buat"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-amber hover:text-amber/80 transition-colors"
            >
              Buat Lingkar Teman <ArrowRight size={14} strokeWidth={2.5} />
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <h2 className="text-center font-display text-2xl font-black text-ink">Cara Kerja</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Buat Lingkar", desc: "Pilih tipe (keluarga atau teman), beri nama, atur peran." },
              { step: "2", title: "Undang Anggota", desc: "Bagikan kode undangan. Anggota tinggal masuk & mulai mencatat." },
              { step: "3", title: "Tumbuh Bareng", desc: "Pantau streak, halaman, dan progres setiap anggota." },
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

        {/* Join */}
        <section className="text-center space-y-4 pb-8">
          <h2 className="font-display text-2xl font-black text-ink">Punya Kode Undangan?</h2>
          <p className="text-ink-muted text-sm">Langsung gabung ke lingkar yang sudah ada.</p>
          <Link
            href="/lingkar-baca/gabung"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ink text-parchment font-bold rounded-xl border-2 border-ink shadow-[3px_3px_0_#1E4530] hover:shadow-[1px_1px_0_#1E4530] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-lg"
          >
            Gabung Sekarang <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </section>
      </main>
    </div>
  );
}
