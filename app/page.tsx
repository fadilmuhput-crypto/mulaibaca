import Link from "next/link";
import { BookOpen, Users, Globe, Flame, Sprout } from "lucide-react";

const features = [
  {
    Icon: BookOpen,
    title: "Track Progres Harian",
    desc: "Catat halaman yang kamu baca setiap hari. Streak harian bikin kamu semangat tidak berhenti.",
  },
  {
    Icon: Users,
    title: "Satu Keluarga, Satu Platform",
    desc: "Suami, istri, dan anak — semua bisa punya rak buku sendiri dalam satu Family Space.",
  },
  {
    Icon: Globe,
    title: "Review yang Menginspirasi",
    desc: "Setiap buku yang selesai, tulis review singkat. Otomatis jadi halaman publik yang bisa dibaca siapa saja.",
  },
];

const steps = [
  { step: "01", title: "Buat Family Space", desc: "Daftarkan keluargamu dalam satu menit. Undang anggota lewat link." },
  { step: "02", title: "Tambah Buku", desc: "Cari buku yang sedang kamu baca. Atau input manual kalau bukumu langka." },
  { step: "03", title: "Log Setiap Hari", desc: "Berapa halaman kamu baca hari ini? Cukup 10 detik. Streak-mu terjaga." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF7F2" }}>
      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b" style={{ borderColor: "#E0D8CE", backgroundColor: "rgba(250,247,242,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1C2B1E" }}>mulaibaca</span>
          <div className="flex items-center gap-4">
            <Link href="/masuk" className="text-sm font-medium" style={{ color: "#4B5B4F" }}>Masuk</Link>
            <Link href="/daftar" className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "#C17A3E" }}>Mulai Gratis →</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-20 text-center md:pt-28">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold" style={{ borderColor: "#E0D8CE", color: "#8A9B8F" }}>
          <Sprout size={12} strokeWidth={2} /> Gerakan Literasi Keluarga Indonesia
        </div>
        <h1 className="mx-auto max-w-3xl text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.08] tracking-tight" style={{ fontFamily: "var(--font-display)", color: "#1C2B1E" }}>
          Mulai baca.<br />
          <span style={{ color: "#C17A3E" }}>Bersama keluarga.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed" style={{ color: "#4B5B4F" }}>
          Platform untuk membangun kebiasaan membaca di lingkungan keluarga — tracking harian, review buku yang jadi inspirasi publik, dan streak yang bikin semua anggota keluarga semangat.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/daftar" className="rounded-xl px-6 py-3 text-base font-bold text-white shadow-sm" style={{ backgroundColor: "#C17A3E" }}>Buat Family Space Gratis →</Link>
          <Link href="/review" className="rounded-xl border px-6 py-3 text-base font-semibold" style={{ borderColor: "#C4BAB0", color: "#4B5B4F" }}>Lihat contoh review</Link>
        </div>
        <p className="mt-5 text-xs" style={{ color: "#8A9B8F" }}>Gratis selamanya untuk 1 keluarga · Tidak perlu kartu kredit</p>

        {/* Mini mockup */}
        <div className="mx-auto mt-16 max-w-sm overflow-hidden rounded-2xl border shadow-xl" style={{ borderColor: "#E0D8CE", backgroundColor: "#fff" }}>
          <div className="px-5 py-4" style={{ backgroundColor: "#2D5A3D" }}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>mulaibaca</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Keluarga Putra</span>
            </div>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8A9B8F" }}>Sedang dibaca</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-12 w-9 flex-shrink-0 rounded" style={{ background: "linear-gradient(135deg,#1d4ed8,#1e40af)" }} />
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "#1C2B1E" }}>Atomic Habits</p>
                <p className="text-xs" style={{ color: "#8A9B8F" }}>James Clear</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "#E8D5B0" }}>
                  <div className="h-full rounded-full" style={{ width: "58%", backgroundColor: "#C17A3E" }} />
                </div>
              </div>
              <span className="rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: "#C17A3E" }}>+ Log</span>
            </div>
          </div>
          <div className="flex border-t px-5 py-3" style={{ borderColor: "#E0D8CE" }}>
            {[{ name: "Fadil", streak: 12, bg: "#dbeafe" }, { name: "Istri", streak: 8, bg: "#fce7f3" }, { name: "Anak", streak: 5, bg: "#d1fae5" }].map((m) => (
              <div key={m.name} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: m.bg, color: "#1C2B1E" }}>{m.name[0]}</div>
                <span className="text-[10px] font-semibold" style={{ color: "#1C2B1E" }}>{m.name}</span>
                <span className="text-[10px] font-bold flex items-center gap-0.5" style={{ color: "#C17A3E" }}><Flame size={10} strokeWidth={2} />{m.streak}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y py-20" style={{ borderColor: "#E0D8CE", backgroundColor: "#fff" }}>
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest" style={{ color: "#8A9B8F" }}>Kenapa Mulaibaca?</p>
          <h2 className="mb-12 text-center text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1C2B1E" }}>Bukan sekadar tracker buku</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border p-6" style={{ borderColor: "#E0D8CE", backgroundColor: "#FAF7F2" }}>
                <div className="mb-4" style={{ color: "#2D5A3D" }}><f.Icon size={32} strokeWidth={1.5} /></div>
                <h3 className="mb-2 text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "#1C2B1E" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4B5B4F" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest" style={{ color: "#8A9B8F" }}>Cara Kerja</p>
        <h2 className="mb-12 text-center text-3xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#1C2B1E" }}>Mulai dalam 3 langkah</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-col">
              <span className="mb-3 text-5xl font-bold leading-none" style={{ fontFamily: "var(--font-display)", color: "#E8D5B0" }}>{s.step}</span>
              <h3 className="mb-2 text-lg font-bold" style={{ color: "#1C2B1E" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#4B5B4F" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MOVEMENT CTA */}
      <section className="py-20" style={{ backgroundColor: "#2D5A3D" }}>
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>Bergabung dalam gerakan</p>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: "var(--font-display)" }}>Indonesia membaca dimulai dari rumah</h2>
          <p className="mb-8 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            Satu keluarga yang membaca setiap hari bisa menginspirasi keluarga lain. Review yang kamu tulis hari ini bisa jadi alasan seseorang memulai buku besok.
          </p>
          <Link href="/daftar" className="inline-block rounded-xl px-7 py-3.5 text-base font-bold text-white" style={{ backgroundColor: "#C17A3E" }}>Mulai Sekarang, Gratis →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10" style={{ borderColor: "#E0D8CE" }}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 text-center">
          <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: "#1C2B1E" }}>mulaibaca</span>
          <p className="text-xs" style={{ color: "#8A9B8F" }}>Platform membaca keluarga Indonesia · mulaibaca.my.id</p>
          <p className="text-xs" style={{ color: "#8A9B8F" }}>© 2026 Mulaibaca</p>
        </div>
      </footer>
    </div>
  );
}
