import Link from "next/link";
import { BookOpen, Users, Globe, Flame } from "lucide-react";
import LandingDemo from "@/components/LandingDemo";

const features = [
  {
    num: "01",
    Icon: BookOpen,
    title: "Catat Progres Harian",
    desc: "Berapa halaman yang kamu baca hari ini? Catat dalam 10 detik. Streak harian menjagamu tetap konsisten — tanpa tekanan.",
  },
  {
    num: "02",
    Icon: Flame,
    title: "Streak yang Menemani",
    desc: "Tidak perlu berlomba atau terburu-buru. Cukup hadir setiap hari, walau hanya satu halaman. Streak-mu adalah bukti bahwa kebiasaan sedang tumbuh.",
  },
  {
    num: "03",
    Icon: Users,
    title: "Bertumbuh Bersama",
    desc: "Ajak orang terdekatmu bergabung. Lihat progres satu sama lain, saling menyemangati, dan rayakan pencapaian bersama dalam satu ruang keluarga.",
  },
];

const steps = [
  { num: "01", title: "Mulai Catat", desc: "Baca buku apa pun yang kamu suka. Catat halaman yang sudah dibaca — cukup 10 detik." },
  { num: "02", title: "Jaga Streak", desc: "Konsisten setiap hari, walau hanya satu halaman. Streak-mu tumbuh, kebiasaanmu kuat." },
  { num: "03", title: "Ajak Orang Terdekat", desc: "Undang pasangan, saudara, atau teman. Bertumbuh bersama jauh lebih menyenangkan." },
];

const INK = "#0C0C0A";
const FOREST = "#1E4530";
const AMBER = "#C26E2A";
const PARCHMENT = "#FAF7F2";
const LIME = "#BFE040";

export default function LandingPage() {
  return (
    <div className="min-h-dvh" style={{ backgroundColor: PARCHMENT }}>

      {/* NAV */}
      <nav style={{
        borderBottom: `2px solid ${INK}`,
        backgroundColor: PARCHMENT,
        position: "sticky", top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", height: "60px", alignItems: "center", justifyContent: "space-between", padding: "0 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Mulaibaca" width={32} height={32} style={{ borderRadius: "50%" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: INK, letterSpacing: "-0.03em" }}>
              mulaibaca
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/blog" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#3D4E45", textDecoration: "none" }}>
              Blog
            </Link>
            <Link href="/masuk" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#3D4E45", textDecoration: "none" }}>
              Masuk
            </Link>
            <Link href="/daftar" style={{
              display: "inline-flex", alignItems: "center",
              padding: "0.5rem 1rem",
              backgroundColor: INK, color: PARCHMENT,
              fontWeight: 700, fontSize: "0.875rem",
              border: `1.5px solid ${INK}`,
              borderRadius: "5px",
              boxShadow: `2px 2px 0 ${FOREST}`,
              textDecoration: "none",
            }}>
              Mulai Gratis →
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "clamp(3rem, 8vw, 6rem) 1.25rem 4rem" }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center",
          padding: "4px 10px",
          border: `1.5px solid ${INK}`,
          borderRadius: "3px",
          fontSize: "0.62rem", fontWeight: 700,
          letterSpacing: "0.12em", textTransform: "uppercase" as const,
          color: "#3D4E45",
          marginBottom: "1.75rem",
        }}>
          Mulai dari satu halaman
        </div>

        <div className="lg:grid-cols-[1fr_400px]" style={{ display: "grid", gap: "3rem", alignItems: "start" }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3.5rem, 11vw, 7.5rem)",
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: INK,
              marginBottom: "1.25rem",
            }}>
              Mulai<br />
              dari<br />
              <span style={{ color: FOREST, fontStyle: "italic" }}>
                satu halaman.
              </span>
            </h1>

            <div style={{ width: "72px", height: "4px", backgroundColor: AMBER, marginBottom: "1.5rem", borderRadius: "2px" }} />

            <p style={{
              maxWidth: "480px",
              fontSize: "1.0625rem",
              lineHeight: 1.7,
              color: "#3D4E45",
              marginBottom: "2rem",
            }}>
              Setiap kebiasaan membaca dimulai dari satu halaman, satu orang. 
              Mulaibaca membantu kamu membangun kebiasaan itu — dengan catatan harian, 
              streak yang menemani, dan ruang untuk bertumbuh bersama orang-orang terdekat.
            </p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const, marginBottom: "0.875rem" }}>
              <Link href="/daftar" style={{
                display: "inline-flex", alignItems: "center",
                padding: "0.875rem 1.5rem",
                backgroundColor: AMBER, color: "#fff",
                fontWeight: 700, fontSize: "1rem",
                border: `1.5px solid ${INK}`,
                borderRadius: "6px",
                boxShadow: `3px 3px 0 ${INK}`,
                textDecoration: "none",
              }}>
                Mulai Gratis →
              </Link>
              <Link href="/coba" style={{
                display: "inline-flex", alignItems: "center",
                padding: "0.875rem 1.5rem",
                backgroundColor: "transparent", color: INK,
                fontWeight: 600, fontSize: "1rem",
                border: `1.5px solid ${INK}`,
                borderRadius: "6px",
                textDecoration: "none",
              }}>
                Coba tanpa daftar
              </Link>
            </div>
            <p style={{ fontSize: "0.72rem", color: "#7A8E83" }}>
              Gratis selamanya · Tidak perlu kartu kredit
            </p>
          </div>

          {/* App mockup */}
          <div style={{
            border: `1.5px solid ${INK}`,
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: `6px 6px 0 ${INK}`,
            backgroundColor: "#fff",
            maxWidth: "380px",
          }}>
            <div style={{ padding: "12px 16px", backgroundColor: FOREST, borderBottom: `1.5px solid ${INK}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", fontSize: "0.9375rem" }}>mulaibaca</span>
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.55)" }}>Keluarga Putra</span>
              </div>
            </div>
            <div style={{ padding: "16px" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#7A8E83", marginBottom: "10px" }}>Sedang dibaca</p>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ width: "38px", height: "54px", borderRadius: "4px", background: "linear-gradient(135deg,#1d4ed8,#1e40af)", flexShrink: 0, border: `1px solid ${INK}` }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, color: INK, lineHeight: 1.3 }}>Atomic Habits</p>
                  <p style={{ fontSize: "0.72rem", color: "#7A8E83", marginTop: "2px" }}>James Clear</p>
                  <div style={{ marginTop: "8px", height: "5px", backgroundColor: "#E8D5B0", borderRadius: "2px", overflow: "hidden", border: "1px solid rgba(12,12,10,0.15)" }}>
                    <div style={{ height: "100%", width: "58%", backgroundColor: AMBER }} />
                  </div>
                  <p style={{ fontSize: "0.62rem", color: "#7A8E83", marginTop: "3px" }}>175 / 306 hal · 58%</p>
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff", backgroundColor: AMBER, padding: "5px 10px", borderRadius: "4px", border: `1px solid ${INK}`, boxShadow: `1px 1px 0 ${INK}`, flexShrink: 0 }}>+ Log</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "0 16px 12px" }}>
              <div style={{ backgroundColor: FOREST, borderRadius: "6px", padding: "10px", border: `1px solid ${INK}`, boxShadow: `1px 1px 0 ${INK}` }}>
                <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.55)", marginBottom: "3px", textTransform: "uppercase" as const, letterSpacing: "0.08em", fontWeight: 700 }}>Tambah</p>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>+ Buku Baru</p>
              </div>
              <div style={{ backgroundColor: AMBER, borderRadius: "6px", padding: "10px", border: `1px solid ${INK}`, boxShadow: `1px 1px 0 ${INK}` }}>
                <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.65)", marginBottom: "3px", textTransform: "uppercase" as const, letterSpacing: "0.08em", fontWeight: 700 }}>Catat</p>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>✎ Log Baca</p>
              </div>
            </div>
            <div style={{ display: "flex", borderTop: `1.5px solid ${INK}`, padding: "12px 16px" }}>
              {[
                { name: "Ayah", streak: 12, bg: "#dbeafe" },
                { name: "Ibu", streak: 8, bg: "#fce7f3" },
                { name: "Kakak", streak: 5, bg: "#d1fae5" },
              ].map((m) => (
                <div key={m.name} style={{ flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "3px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: m.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: INK, border: `1px solid ${INK}` }}>
                    {m.name[0]}
                  </div>
                  <span style={{ fontSize: "0.6rem", fontWeight: 600, color: INK }}>{m.name}</span>
                  <span style={{ fontSize: "0.62rem", fontWeight: 700, color: AMBER, display: "flex", alignItems: "center", gap: "2px" }}>
                    <Flame size={9} strokeWidth={2} />{m.streak}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES — dark section */}
      <section style={{ backgroundColor: FOREST, borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}`, padding: "5rem 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
              Kenapa Mulaibaca
            </p>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.15)" }} />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, color: "#FAF7F2", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "3rem" }}>
            Bukan sekadar<br />
            <span style={{ color: LIME, fontStyle: "italic" }}>tracker buku</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {features.map((f) => (
              <div key={f.num} style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "10px", padding: "1.5rem", position: "relative" as const, overflow: "hidden" }}>
                <span style={{ position: "absolute" as const, top: "-8px", right: "10px", fontFamily: "var(--font-display)", fontSize: "6rem", fontWeight: 800, color: "rgba(255,255,255,0.04)", lineHeight: 1, userSelect: "none" as const, pointerEvents: "none" as const }}>
                  {f.num}
                </span>
                <div style={{ color: LIME, marginBottom: "1rem" }}>
                  <f.Icon size={26} strokeWidth={1.5} />
                </div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#FAF7F2", marginBottom: "0.5rem" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "rgba(255,255,255,0.62)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "5rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#7A8E83", flexShrink: 0 }}>Cara Kerja</p>
          <div style={{ flex: 1, height: "2px", backgroundColor: INK }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, color: INK, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "3rem" }}>
          Mulai dalam 3 langkah
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0" }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ padding: "0 2rem 2rem 0", borderLeft: i > 0 ? `2px solid ${INK}` : "none", paddingLeft: i > 0 ? "2rem" : "0" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", fontWeight: 800, color: AMBER, lineHeight: 1, display: "block", marginBottom: "1rem" }}>
                {s.num}
              </span>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: INK, marginBottom: "0.5rem" }}>
                {s.title}
              </h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "#3D4E45" }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG SECTION */}
      <section style={{ backgroundColor: INK, borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}`, padding: "4rem 0" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 1.25rem", textAlign: "center" as const }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>
            Mulaibaca Blog
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800, color: PARCHMENT, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "1rem" }}>
            Inspirasi membaca,<br />
            <span style={{ color: LIME }}>dari satu halaman</span>
          </h2>
          <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: "440px", margin: "0 auto 2rem" }}>
            Artikel seputar kebiasaan membaca, tips memilih buku, dan cerita dari para pembaca yang memulai dari satu halaman.
          </p>
          <Link href="/blog" style={{
            display: "inline-flex", alignItems: "center",
            padding: "0.75rem 1.5rem",
            backgroundColor: LIME, color: INK,
            fontWeight: 700, fontSize: "0.9375rem",
            border: `1.5px solid ${INK}`,
            borderRadius: "6px",
            boxShadow: `3px 3px 0 ${FOREST}`,
            textDecoration: "none",
          }}>
            Jelajahi Blog →
          </Link>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section style={{ backgroundColor: FOREST, borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}`, padding: "5rem 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 1.25rem" }}>
          <div style={{ display: "grid", gap: "3rem", alignItems: "center" }} className="lg:grid-cols-[1fr_480px]">

            {/* Left: text */}
            <div>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>
                Coba Tanpa Daftar
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800, color: "#FAF7F2", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "1.25rem" }}>
                Rasakan<br />
                <span style={{ color: LIME, fontStyle: "italic" }}>sebelum daftar</span>
              </h2>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.75, color: "rgba(255,255,255,0.65)", maxWidth: "400px" }}>
                Pilih buku, catat halaman yang kamu baca hari ini, dan lihat bagaimana streak dan progres terbentuk. Tiga langkah — 30 detik.
              </p>
              <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column" as const, gap: "10px" }}>
                {["Tidak perlu akun", "Tidak ada data yang disimpan", "Persis seperti pengalaman nyata"].map((t) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: LIME, border: `1px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3 5.5L6.5 2" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.75)" }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: interactive demo */}
            <LandingDemo />
          </div>
        </div>
      </section>

      {/* CTA — LIME */}
      <section style={{ backgroundColor: LIME, borderTop: `2px solid ${INK}`, borderBottom: `2px solid ${INK}`, padding: "5rem 0" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 1.25rem", textAlign: "center" as const }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#3D4E45", marginBottom: "1.25rem" }}>
            Mulai dari kamu
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 800, color: INK, letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: "1.25rem" }}>
            Satu halaman<br />bisa jadi awal
          </h2>
          <p style={{ fontSize: "1rem", color: "#3D4E45", lineHeight: 1.65, maxWidth: "440px", margin: "0 auto 2.25rem" }}>
            Kebiasaan membaca dimulai dari dirimu. Satu halaman hari ini, esok satu halaman lagi. Sebelum kamu sadari, orang-orang terdekatmu ikut membaca.
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "12px" }}>
            <Link href="/daftar" style={{
              display: "inline-flex", alignItems: "center",
              padding: "1rem 2rem",
              backgroundColor: INK, color: PARCHMENT,
              fontWeight: 700, fontSize: "1rem",
              border: `1.5px solid ${INK}`,
              borderRadius: "6px",
              boxShadow: `4px 4px 0 ${FOREST}`,
              textDecoration: "none",
            }}>
              Mulai Sekarang, Gratis →
            </Link>
            <Link href="/coba" style={{
              fontSize: "0.875rem",
              color: "#3D4E45",
              textDecoration: "underline",
              textDecorationStyle: "dotted" as const,
            }}>
              atau coba dulu tanpa daftar
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `2px solid ${INK}`, padding: "2.5rem 0" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "6px", padding: "0 1.25rem", textAlign: "center" as const }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Mulaibaca" width={28} height={28} style={{ borderRadius: "50%" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.125rem", color: INK, letterSpacing: "-0.025em" }}>mulaibaca</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#7A8E83" }}>Bangun kebiasaan membaca, mulai dari satu halaman · mulaibaca.id</p>
          <p style={{ fontSize: "0.72rem", color: "#7A8E83" }}>© 2026 Mulaibaca</p>
        </div>
      </footer>
    </div>
  );
}
