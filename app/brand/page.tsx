import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Guideline — Mulaibaca",
  description: "Panduan warna, tipografi, dan komponen UI untuk brand Mulaibaca.",
  robots: { index: false },
};

type Swatch = {
  name: string;
  hex: string;
  var: string;
  use: string;
  textDark?: boolean;
};

const primaryColors: Swatch[] = [
  { name: "Amber", hex: "#C26E2A", var: "--color-amber", use: "CTA · Tombol · Aksen" },
  { name: "Amber Hover", hex: "#A35920", var: "--color-amber-hover", use: "State hover amber" },
  { name: "Amber Soft", hex: "#FDF0E4", var: "--color-amber-soft", use: "Latar amber ringan", textDark: true },
  { name: "Forest", hex: "#1E4530", var: "--color-forest", use: "Logo · Header · Gelap" },
  { name: "Forest Dark", hex: "#122B1D", var: "--color-forest-dark", use: "Latar sangat gelap" },
  { name: "Lime", hex: "#BFE040", var: "--color-lime", use: "Aksen energetik", textDark: true },
];

const neutralColors: Swatch[] = [
  { name: "Parchment", hex: "#FAF7F2", var: "--color-parchment", use: "Background utama", textDark: true },
  { name: "Cream", hex: "#EDE0CB", var: "--color-cream", use: "Card alt · Highlight", textDark: true },
  { name: "Border", hex: "#E0D8CE", var: "--color-border", use: "Garis · Stroke", textDark: true },
  { name: "Ink", hex: "#0C0C0A", var: "--color-ink", use: "Teks utama · Border" },
  { name: "Ink Secondary", hex: "#3D4E45", var: "--color-ink-secondary", use: "Teks sekunder" },
  { name: "Ink Muted", hex: "#7A8E83", var: "--color-ink-muted", use: "Label · Placeholder" },
];

const semanticColors: Swatch[] = [
  { name: "Success", hex: "#2A6B3E", var: "--color-success", use: "Berhasil · Terverifikasi" },
  { name: "Success Soft", hex: "#EAF4EE", var: "--color-success-soft", use: "Latar pesan sukses", textDark: true },
  { name: "Error", hex: "#B83232", var: "--color-error", use: "Error · Peringatan" },
  { name: "Error Soft", hex: "#FDECEA", var: "--color-error-soft", use: "Latar pesan error", textDark: true },
  { name: "Info", hex: "#2D4D7A", var: "--color-info", use: "Info · Notifikasi" },
  { name: "Info Soft", hex: "#EBF0F8", var: "--color-info-soft", use: "Latar pesan info", textDark: true },
];

const logoCombs = [
  { bg: "#1E4530", text: "#C26E2A", label: "Forest + Amber · Utama", primary: true },
  { bg: "#FAF7F2", text: "#1E4530", label: "Parchment + Forest · Light", primary: false },
  { bg: "#C26E2A", text: "#FFFFFF", label: "Amber + White · Marketing", primary: false },
  { bg: "#0C0C0A", text: "#BFE040", label: "Ink + Lime · Bold", primary: false },
  { bg: "#EDE0CB", text: "#0C0C0A", label: "Cream + Ink · Dokumen", primary: false },
  { bg: "#BFE040", text: "#122B1D", label: "Lime + Forest · Accent", primary: false },
];

const typeScale = [
  { label: "Display", size: "42px", weight: "700", style: "italic", family: "display", sample: "mulaibaca" },
  { label: "H1", size: "28px", weight: "700", style: "normal", family: "display", sample: "Rak Bacaanmu" },
  { label: "H2", size: "22px", weight: "700", style: "normal", family: "display", sample: "Sedang Dibaca" },
  { label: "H3", size: "17px", weight: "600", style: "normal", family: "sans", sample: "Target Minggu Ini" },
  { label: "Body", size: "16px", weight: "400", style: "normal", family: "sans", sample: "Kamu sudah membaca 42 halaman hari ini." },
  { label: "Caption", size: "12px", weight: "500", style: "normal", family: "sans", sample: "DIPERBARUI 5 MENIT LALU" },
  { label: "Overline", size: "10px", weight: "700", style: "normal", family: "sans", sample: "KOLEKSI KAMI" },
];

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-4"
      style={{ color: "var(--color-ink-muted)" }}
    >
      {children}
    </p>
  );
}

function ColorSwatch({ swatch }: { swatch: Swatch }) {
  return (
    <div
      className="rounded-lg overflow-hidden border border-[var(--color-ink)]"
      style={{ boxShadow: "var(--shadow-brutal-xs)" }}
    >
      <div className="h-[72px]" style={{ background: swatch.hex }} />
      <div className="p-2.5 bg-white">
        <span className="block text-[11px] font-semibold" style={{ color: "var(--color-ink)" }}>
          {swatch.name}
        </span>
        <span
          className="block text-[10px] font-mono mt-0.5"
          style={{ color: "var(--color-ink-muted)" }}
        >
          {swatch.hex}
        </span>
        <span className="block text-[10px] font-mono" style={{ color: "var(--color-ink-muted)" }}>
          {swatch.var}
        </span>
        <span
          className="block text-[9px] mt-1 leading-[1.4]"
          style={{ color: "var(--color-ink-muted)" }}
        >
          {swatch.use}
        </span>
      </div>
    </div>
  );
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mb-12 ${className}`}>{children}</section>;
}

function Divider() {
  return <hr className="my-10 border-t-[1.5px]" style={{ borderColor: "var(--color-border)" }} />;
}

export default function BrandPage() {
  return (
    <main
      className="min-h-screen px-6 py-10 max-w-4xl mx-auto"
      style={{ background: "var(--color-parchment)", fontFamily: "var(--font-sans)" }}
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <h1
            className="text-[44px] leading-none tracking-tight"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontStyle: "italic", color: "var(--color-forest)" }}
          >
            mulaibaca
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-ink-muted)" }}>
            Pelacak membaca untuk keluarga Indonesia
          </p>
        </div>
        <span
          className="text-[10px] font-mono px-3 py-1.5 rounded"
          style={{
            background: "var(--color-cream)",
            color: "var(--color-ink-muted)",
            border: "1px solid var(--color-border)",
          }}
        >
          Brand Guide v1.0
        </span>
      </div>

      <Divider />

      {/* 01 — Warna Utama */}
      <Section>
        <Overline>01 — Warna utama</Overline>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {primaryColors.map((s) => (
            <ColorSwatch key={s.hex} swatch={s} />
          ))}
        </div>
      </Section>

      {/* 02 — Warna Netral */}
      <Section>
        <Overline>02 — Warna netral & teks</Overline>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {neutralColors.map((s) => (
            <ColorSwatch key={s.hex} swatch={s} />
          ))}
        </div>
      </Section>

      {/* 03 — Warna Semantik */}
      <Section>
        <Overline>03 — Warna semantik</Overline>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {semanticColors.map((s) => (
            <ColorSwatch key={s.hex} swatch={s} />
          ))}
        </div>
      </Section>

      <Divider />

      {/* 04 — Tipografi */}
      <Section>
        <Overline>04 — Tipografi</Overline>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Fraunces */}
          <div
            className="rounded-lg p-5 bg-white"
            style={{ border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal-sm)" }}
          >
            <Overline>Display — Fraunces</Overline>
            <p
              className="text-[32px] leading-tight"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontStyle: "italic", color: "var(--color-ink)" }}
            >
              mulaibaca
            </p>
            <p
              className="text-lg mt-2"
              style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontStyle: "italic", color: "var(--color-ink-secondary)" }}
            >
              Kebiasaan membaca
            </p>
            <ul className="mt-3 text-[10px] leading-[1.8] space-y-0" style={{ color: "var(--color-ink-muted)" }}>
              <li>Google Fonts · Optical size 9–144</li>
              <li>Weight: 400 regular · 700 bold</li>
              <li>Style: Normal · <em>Italic</em></li>
              <li>Digunakan: Logo, heading halaman, nama buku</li>
            </ul>
          </div>
          {/* Geist */}
          <div
            className="rounded-lg p-5 bg-white"
            style={{ border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal-sm)" }}
          >
            <Overline>Body — Geist Sans</Overline>
            <p
              className="text-[28px] font-semibold leading-snug"
              style={{ color: "var(--color-ink)" }}
            >
              Aa Bb Cc 123
            </p>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--color-ink-secondary)" }}>
              Bersih, modern, mudah dibaca<br />di semua ukuran layar.
            </p>
            <ul className="mt-3 text-[10px] leading-[1.8]" style={{ color: "var(--color-ink-muted)" }}>
              <li>Google Fonts · Variable</li>
              <li>Weight: 400 · 500 medium · 600 semibold</li>
              <li>Digunakan: UI, body teks, label, tombol</li>
            </ul>
          </div>
        </div>

        {/* Type scale */}
        <Overline>Skala tipografi</Overline>
        <div
          className="rounded-lg overflow-hidden bg-white"
          style={{ border: "1.5px solid var(--color-border)" }}
        >
          {typeScale.map((t, i) => (
            <div
              key={t.label}
              className="flex items-baseline gap-4 px-4 py-3"
              style={{
                borderBottom: i < typeScale.length - 1 ? "1px solid var(--color-border)" : undefined,
              }}
            >
              <span
                className="shrink-0 w-36 text-[10px] font-mono"
                style={{ color: "var(--color-ink-muted)" }}
              >
                {t.label} / {t.size} / {t.weight}
                {t.style === "italic" ? "i" : ""}
              </span>
              <span
                style={{
                  fontFamily: t.family === "display" ? "var(--font-display)" : "var(--font-sans)",
                  fontSize: t.size,
                  fontWeight: t.weight,
                  fontStyle: t.style,
                  color: t.label === "Caption" || t.label === "Overline" ? "var(--color-ink-muted)" : "var(--color-ink)",
                  textTransform: t.label === "Caption" || t.label === "Overline" ? "uppercase" : undefined,
                  letterSpacing: t.label === "Caption" ? "0.08em" : t.label === "Overline" ? "0.14em" : undefined,
                  lineHeight: 1.2,
                }}
              >
                {t.sample}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Divider />

      {/* 05 — Tombol */}
      <Section>
        <Overline>05 — Tombol</Overline>
        <div
          className="rounded-lg p-5 bg-white"
          style={{ border: "1.5px solid var(--color-border)" }}
        >
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-white"
              style={{
                background: "var(--color-amber)",
                border: "1.5px solid var(--color-ink)",
                boxShadow: "var(--shadow-brutal-sm)",
              }}
            >
              Tambah Buku
            </button>
            <button
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-white"
              style={{
                background: "var(--color-forest)",
                border: "1.5px solid var(--color-ink)",
                boxShadow: "var(--shadow-brutal-sm)",
              }}
            >
              Catat Bacaan
            </button>
            <button
              className="px-5 py-2.5 rounded-md text-sm font-semibold"
              style={{
                background: "white",
                color: "var(--color-ink)",
                border: "1.5px solid var(--color-ink)",
                boxShadow: "var(--shadow-brutal-sm)",
              }}
            >
              Simpan
            </button>
            <button
              className="px-4 py-2 rounded-md text-sm font-semibold"
              style={{
                background: "transparent",
                color: "var(--color-ink)",
                border: "1.5px solid var(--color-border)",
              }}
            >
              Batal
            </button>
            <button
              className="px-3 py-1.5 rounded-md text-xs font-semibold"
              style={{
                background: "var(--color-lime)",
                color: "var(--color-ink)",
                border: "1.5px solid var(--color-ink)",
                boxShadow: "var(--shadow-brutal-xs)",
              }}
            >
              Aksen Lime
            </button>
          </div>
          <p
            className="text-[10px] leading-relaxed"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Semua tombol: border 1.5px solid #0C0C0A · border-radius 6px · box-shadow offset 2px · font Geist 600
          </p>
        </div>
      </Section>

      {/* 06 — Badge */}
      <Section>
        <Overline>06 — Badge & label</Overline>
        <div
          className="rounded-lg p-5 bg-white"
          style={{ border: "1.5px solid var(--color-border)" }}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { bg: "var(--color-amber)", text: "#fff", label: "fiksi" },
              { bg: "var(--color-amber-soft)", text: "var(--color-amber)", label: "non-fiksi" },
              { bg: "var(--color-forest)", text: "#fff", label: "Terverifikasi" },
              { bg: "var(--color-success-soft)", text: "var(--color-success)", label: "✓ Selesai" },
              { bg: "var(--color-error-soft)", text: "var(--color-error)", label: "⚠ Error" },
              { bg: "var(--color-lime)", text: "var(--color-ink)", label: "Baru" },
              { bg: "var(--color-border)", text: "var(--color-ink-secondary)", label: "reminder" },
            ].map((b) => (
              <span
                key={b.label}
                className="inline-block text-[10px] font-semibold px-2 py-1 rounded-full"
                style={{ background: b.bg, color: b.text }}
              >
                {b.label}
              </span>
            ))}
          </div>
          <p className="text-[10px]" style={{ color: "var(--color-ink-muted)" }}>
            Font 10px · font-weight 600 · border-radius 999px · padding 3px 8px
          </p>
        </div>
      </Section>

      {/* 07 — Shadow */}
      <Section>
        <Overline>07 — Shadow system (Neobrutalist)</Overline>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "XS", shadow: "1px 1px 0 #0C0C0A", var: "--shadow-brutal-xs" },
            { label: "SM", shadow: "2px 2px 0 #0C0C0A", var: "--shadow-brutal-sm" },
            { label: "MD", shadow: "4px 4px 0 #0C0C0A", var: "--shadow-brutal" },
            { label: "LG", shadow: "6px 6px 0 #0C0C0A", var: "--shadow-brutal-lg" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div
                className="w-full py-5 rounded-lg bg-white text-center font-semibold text-sm"
                style={{ border: "1.5px solid var(--color-ink)", boxShadow: s.shadow }}
              >
                {s.label}
              </div>
              <span className="text-[9px] font-mono" style={{ color: "var(--color-ink-muted)" }}>
                {s.var}
              </span>
            </div>
          ))}
        </div>
        <p
          className="mt-4 text-[10px] p-3 rounded-lg"
          style={{
            color: "var(--color-ink-secondary)",
            background: "var(--color-cream)",
            border: "1px solid var(--color-border)",
          }}
        >
          Shadow selalu solid (bukan blur) · warna #0C0C0A · offset kanan-bawah · tidak ada spread
        </p>
      </Section>

      <Divider />

      {/* 08 — Kombinasi Logo */}
      <Section>
        <Overline>08 — Kombinasi logo yang direkomendasikan</Overline>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {logoCombs.map((c) => (
            <div
              key={c.label}
              className="rounded-xl p-5 flex flex-col gap-2"
              style={{
                background: c.bg,
                border: c.primary ? "2px solid var(--color-ink)" : "1.5px solid var(--color-ink)",
                boxShadow: c.primary ? "var(--shadow-brutal)" : "var(--shadow-brutal-xs)",
              }}
            >
              <span
                className="text-[26px] leading-tight tracking-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontStyle: "italic",
                  color: c.text,
                }}
              >
                mulaibaca
              </span>
              <span
                className="text-[9px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: c.text, opacity: 0.5 }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
        <p
          className="mt-4 text-[10px] p-3 rounded-lg"
          style={{
            color: "var(--color-ink-secondary)",
            background: "var(--color-cream)",
            border: "1px solid var(--color-border)",
          }}
        >
          Font: Fraunces · weight 700 · italic · letter-spacing -0.5px ·{" "}
          <strong>Gunakan kombinasi pertama (Forest + Amber) sebagai logo utama</strong>
        </p>
      </Section>

      <Divider />

      {/* 09 — Panduan */}
      <Section>
        <Overline>09 — Panduan penggunaan</Overline>
        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="rounded-lg p-4 bg-white"
            style={{ border: "2px solid var(--color-success)" }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3"
              style={{ color: "var(--color-success)" }}
            >
              GUNAKAN
            </p>
            <ul className="text-xs space-y-1.5" style={{ color: "var(--color-ink-secondary)" }}>
              {[
                "Fraunces italic untuk heading & wordmark",
                "Amber sebagai warna aksi utama (CTA)",
                "Forest untuk header & background gelap",
                "Parchment sebagai background default",
                "Hard offset shadow (flat, no blur)",
                "Border 1.5–2px solid #0C0C0A",
                "Lime sparingly sebagai aksen kejutan",
              ].map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-lg p-4 bg-white"
            style={{ border: "2px solid var(--color-error)" }}
          >
            <p
              className="text-[11px] font-bold uppercase tracking-[0.1em] mb-3"
              style={{ color: "var(--color-error)" }}
            >
              HINDARI
            </p>
            <ul className="text-xs space-y-1.5" style={{ color: "var(--color-ink-secondary)" }}>
              {[
                "Gradient atau efek blur",
                "Font selain Fraunces & Geist",
                "Teks putih di atas Lime (#BFE040)",
                "Drop shadow berbasis blur",
                "Warna di luar palet yang ditentukan",
                "Lime sebagai warna dominan/background",
                "Border-radius > 16px pada elemen besar",
              ].map((item) => (
                <li key={item}>✕ {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer
        className="pt-8 pb-2 text-center text-[10px]"
        style={{ color: "var(--color-ink-muted)", borderTop: "1px solid var(--color-border)" }}
      >
        mulaibaca brand guideline v1.0 · untuk keperluan internal
      </footer>
    </main>
  );
}
