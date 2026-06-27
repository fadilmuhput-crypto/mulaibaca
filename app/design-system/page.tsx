import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Design System — mulaibaca",
  description: "Token warna, tipografi, komponen, dan pola interaksi mulaibaca.",
};

// ─── Colour swatch helper ────────────────────────────────────────────────────
function Swatch({
  token, hex, bg, text = "text-ink", border = "",
}: { token: string; hex: string; bg: string; text?: string; border?: string }) {
  return (
    <div className={`rounded-xl overflow-hidden border border-border`} style={{ boxShadow: "var(--shadow-brutal-xs)" }}>
      <div className={`h-16 ${bg} ${border}`} />
      <div className="px-3 py-2 bg-surface">
        <p className={`text-xs font-semibold ${text} text-ink`}>{token}</p>
        <p className="text-[10px] text-ink-muted font-mono mt-0.5">{hex}</p>
      </div>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-6 pb-16 border-b border-border last:border-0">
      <div>
        <p className="text-overline mb-1">Design System</p>
        <h2 className="text-h1">{title}</h2>
      </div>
      {children}
    </section>
  );
}

// ─── Token row ───────────────────────────────────────────────────────────────
function TokenRow({ name, value, description }: { name: string; value: string; description: string }) {
  return (
    <tr className="border-b border-border">
      <td className="py-3 pr-4 font-mono text-xs text-amber">{name}</td>
      <td className="py-3 pr-4 font-mono text-xs text-ink-secondary">{value}</td>
      <td className="py-3 text-xs text-ink-muted">{description}</td>
    </tr>
  );
}

// ─── Demo box ────────────────────────────────────────────────────────────────
function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-overline mb-3">{label}</p>
      <div className="bg-parchment rounded-2xl border border-border p-6 flex flex-wrap gap-4 items-center">
        {children}
      </div>
    </div>
  );
}

// ─── Nav items ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "intro",       label: "Pendahuluan" },
  { id: "warna",       label: "Warna" },
  { id: "tipografi",   label: "Tipografi" },
  { id: "jarak",       label: "Jarak & Layout" },
  { id: "bayangan",    label: "Bayangan" },
  { id: "tombol",      label: "Tombol" },
  { id: "form",        label: "Form" },
  { id: "kartu",       label: "Kartu" },
  { id: "badge",       label: "Badge & Status" },
  { id: "komponen",    label: "Komponen Lain" },
  { id: "motion",      label: "Motion" },
  { id: "ikon",        label: "Ikon" },
  { id: "aksesibilitas", label: "Aksesibilitas" },
];

export default function DesignSystemPage() {
  return (
    <div className="min-h-dvh bg-parchment">
      {/* ── Top bar ── */}
      <header
        className="sticky top-0 z-40 bg-surface border-b-2 border-ink px-6 py-3 flex items-center justify-between"
        style={{ boxShadow: "var(--shadow-brutal-sm)" }}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="font-display font-black text-ink tracking-tight" style={{ fontSize: "1.1875rem", letterSpacing: "-0.03em" }}>
            mulaibaca
          </Link>
          <span className="text-border select-none">|</span>
          <span className="font-semibold text-sm text-ink-secondary">Design System</span>
          <span className="badge badge-amber text-[10px]">v1.0</span>
        </div>
        <Link href="/dashboard" className="btn-secondary" style={{ minHeight: "36px", padding: "0.375rem 0.875rem", fontSize: "0.8rem" }}>
          ← Kembali ke App
        </Link>
      </header>

      <div className="max-w-[1200px] mx-auto flex">
        {/* ── Sidebar nav ── */}
        <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto py-8 pr-4">
          <p className="text-overline mb-4 px-2">Navigasi</p>
          <nav className="space-y-0.5">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="block px-3 py-2 rounded-lg text-sm text-ink-secondary hover:text-ink hover:bg-cream transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-8 px-3">
            <div className="divider-soft mb-4" />
            <p className="text-[10px] text-ink-muted">
              Updated Juni 2025<br />
              Next.js · Tailwind CSS v4<br />
              Lucide React Icons
            </p>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 px-4 lg:px-10 py-10 space-y-0">

          {/* ══════════════════════════════ INTRO ══════════════════════════════ */}
          <Section id="intro" title="Pendahuluan">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Hangat", desc: "Palet warm parchment + amber terinspirasi dari kertas buku & cahaya lampu baca — menghadirkan rasa familiar dan nyaman.", icon: "🌿" },
                { title: "Jujur", desc: "Neo-brutalist border hitam tebal dan brutal shadow menciptakan kejujuran visual — tidak ada dekorasi berlebihan.", icon: "⬛" },
                { title: "Keluarga", desc: "Desain accessible untuk semua usia, dari anak kecil hingga orang tua, dengan touch target minimal 44px dan kontras tinggi.", icon: "📖" },
              ].map((p) => (
                <div key={p.title} className="card-elevated p-5">
                  <div className="text-2xl mb-3">{p.icon}</div>
                  <h3 className="text-h3 mb-2">{p.title}</h3>
                  <p className="text-body-sm text-ink-secondary">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="card-elevated p-6">
              <h3 className="text-h3 mb-4">Prinsip Desain</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ["Mobile-first", "Semua komponen dirancang untuk layar 375px ke atas"],
                  ["Semantic tokens", "Selalu gunakan CSS variable, bukan raw hex di dalam komponen"],
                  ["Satu CTA primer", "Setiap halaman punya satu tombol primer yang dominan"],
                  ["Accessible by default", "Kontras 4.5:1, label visible, focus ring selalu ada"],
                  ["Brutal consistency", "Border 1.5px solid ink + brutal shadow di semua elemen interaktif"],
                  ["Touch-safe spacing", "Gap minimum 8px antar target tap; min-height 44px"],
                ].map(([title, desc]) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{title}</p>
                      <p className="text-xs text-ink-muted">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════ WARNA ══════════════════════════════ */}
          <Section id="warna" title="Warna">
            <div>
              <p className="text-overline mb-3">Brand Utama</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Swatch token="--color-amber" hex="#C26E2A" bg="bg-amber" />
                <Swatch token="--color-amber-hover" hex="#A35920" bg="bg-amber-hover" />
                <Swatch token="--color-amber-soft" hex="#FDF0E4" bg="bg-amber-soft" border="border border-border" />
                <Swatch token="--color-forest" hex="#1E4530" bg="bg-forest" />
              </div>
            </div>

            <div>
              <p className="text-overline mb-3">Latar & Surface</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Swatch token="--color-parchment" hex="#FAF7F2" bg="bg-parchment" border="border border-border" />
                <Swatch token="--color-surface" hex="#FFFFFF" bg="bg-surface" border="border border-border" />
                <Swatch token="--color-cream" hex="#EDE0CB" bg="bg-cream" />
                <Swatch token="--color-border" hex="#E0D8CE" bg="bg-border" />
              </div>
            </div>

            <div>
              <p className="text-overline mb-3">Teks (Ink Scale)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Swatch token="--color-ink" hex="#0C0C0A" bg="bg-ink" />
                <Swatch token="--color-ink-secondary" hex="#3D4E45" bg="bg-ink-secondary" />
                <Swatch token="--color-ink-muted" hex="#7A8E83" bg="bg-ink-muted" />
              </div>
            </div>

            <div>
              <p className="text-overline mb-3">Semantik</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Swatch token="success" hex="#2A6B3E" bg="bg-success" />
                <Swatch token="success-soft" hex="#EAF4EE" bg="bg-success-soft" border="border border-border" />
                <Swatch token="error" hex="#B83232" bg="bg-error" />
                <Swatch token="error-soft" hex="#FDECEA" bg="bg-error-soft" border="border border-border" />
                <Swatch token="info" hex="#2D4D7A" bg="bg-info" />
                <Swatch token="info-soft" hex="#EBF0F8" bg="bg-info-soft" border="border border-border" />
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 bg-ink">
                <p className="text-xs font-mono text-amber">CSS Custom Properties</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-parchment">
                      <th className="px-5 py-2 text-overline">Token</th>
                      <th className="px-5 py-2 text-overline">Nilai</th>
                      <th className="px-5 py-2 text-overline">Gunakan Untuk</th>
                    </tr>
                  </thead>
                  <tbody className="px-5">
                    {[
                      ["--color-amber", "#C26E2A", "CTA primer, link aktif, aksen brand"],
                      ["--color-forest", "#1E4530", "Tombol sukses, aksen hijau, header"],
                      ["--color-parchment", "#FAF7F2", "Background halaman utama"],
                      ["--color-surface", "#FFFFFF", "Background kartu, modal, input"],
                      ["--color-ink", "#0C0C0A", "Teks utama, border brutal"],
                      ["--color-ink-secondary", "#3D4E45", "Teks sekunder, label"],
                      ["--color-ink-muted", "#7A8E83", "Placeholder, hint, caption"],
                      ["--color-border", "#E0D8CE", "Border input, divider lembut"],
                    ].map(([token, val, desc]) => (
                      <TokenRow key={token} name={token} value={val} description={desc} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-soft rounded-2xl border border-amber/30 p-5">
              <p className="text-sm font-semibold text-amber mb-1">Aturan Warna</p>
              <ul className="text-xs text-ink-secondary space-y-1">
                <li>• Jangan pernah memakai raw hex di dalam komponen — selalu gunakan CSS variable</li>
                <li>• Amber hanya untuk CTA primer dan aksen penting — jangan overuse</li>
                <li>• Pastikan kontras text-on-background minimum 4.5:1 (WCAG AA)</li>
                <li>• Lime (#BFE040) hanya untuk highlight data / stats khusus, bukan UI umum</li>
              </ul>
            </div>
          </Section>

          {/* ══════════════════════════════ TIPOGRAFI ══════════════════════════ */}
          <Section id="tipografi" title="Tipografi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card-elevated p-5">
                <p className="text-overline mb-3">Display / Heading</p>
                <p className="font-display font-black text-4xl text-ink leading-tight">Fraunces</p>
                <p className="text-xs text-ink-muted mt-2 font-mono">Google Fonts · Optical size · Variable</p>
                <p className="text-sm text-ink-secondary mt-3">Digunakan untuk headline, nama brand, dan momen-momen besar. Membawa karakter literary dan kepercayaan diri.</p>
              </div>
              <div className="card-elevated p-5">
                <p className="text-overline mb-3">UI / Body</p>
                <p className="font-sans font-semibold text-3xl text-ink leading-tight">Geist Sans</p>
                <p className="text-xs text-ink-muted mt-2 font-mono">Vercel · Variable · Latin</p>
                <p className="text-sm text-ink-secondary mt-3">Digunakan untuk semua teks UI — label, body, caption. Bersih, legible, dan terasa modern tanpa dingin.</p>
              </div>
            </div>

            <div className="card-elevated p-6 space-y-5">
              <p className="text-overline">Type Scale</p>
              <div className="space-y-4">
                {[
                  { cls: "text-display", label: ".text-display", meta: "Fraunces, clamp(2rem–3rem), w800, ls-3%", sample: "Mulai Baca Hari Ini" },
                  { cls: "text-h1",      label: ".text-h1",      meta: "Fraunces, 1.75rem, w800, ls-2%",            sample: "Rak Buku Kamu" },
                  { cls: "text-h2",      label: ".text-h2",      meta: "Fraunces, 1.375rem, w700, ls-1%",           sample: "Sedang Dibaca" },
                  { cls: "text-h3",      label: ".text-h3",      meta: "Geist, 1.125rem, w600",                     sample: "Progress Minggu Ini" },
                  { cls: "text-body",    label: ".text-body",    meta: "Geist, 1rem, lh1.65",                       sample: "Bangun kebiasaan membaca bersama keluarga" },
                  { cls: "text-body-sm", label: ".text-body-sm", meta: "Geist, 0.875rem, lh1.6",                    sample: "Tambahkan buku ke rakmu dan mulai membaca" },
                  { cls: "text-caption", label: ".text-caption", meta: "Geist, 0.75rem, muted",                     sample: "Diperbarui 2 menit lalu" },
                  { cls: "text-overline",label: ".text-overline",meta: "Geist, 0.6875rem, w700, uppercase, ls+10%", sample: "Koleksi Pilihan" },
                ].map(({ cls, label, meta, sample }) => (
                  <div key={cls} className="flex flex-col sm:flex-row sm:items-baseline gap-2 border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="sm:w-48 flex-shrink-0">
                      <p className="font-mono text-[10px] text-amber">{label}</p>
                      <p className="text-[10px] text-ink-muted">{meta}</p>
                    </div>
                    <p className={cls}>{sample}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-soft rounded-2xl border border-amber/30 p-5">
              <p className="text-sm font-semibold text-amber mb-1">Aturan Tipografi</p>
              <ul className="text-xs text-ink-secondary space-y-1">
                <li>• Body text minimum 16px di mobile — mencegah iOS auto-zoom pada input</li>
                <li>• Line-height body 1.6–1.65 untuk keterbacaan panjang</li>
                <li>• Fraunces hanya untuk heading (H1-H2) dan brand display — bukan body text</li>
                <li>• Jangan ada text di bawah 11px (kecuali overline dan badge yang intentional)</li>
              </ul>
            </div>
          </Section>

          {/* ══════════════════════════════ JARAK ══════════════════════════════ */}
          <Section id="jarak" title="Jarak & Layout">
            <div className="card-elevated p-6">
              <p className="text-overline mb-4">Spacing Scale (4pt Grid)</p>
              <div className="space-y-3">
                {[
                  { token: "0.25rem / 1", px: "4px",  usage: "Spacing internal komponen sangat kecil" },
                  { token: "0.5rem / 2",  px: "8px",  usage: "Gap antar elemen dalam kelompok, padding kecil" },
                  { token: "0.75rem / 3", px: "12px", usage: "Padding input, gap ikon-teks" },
                  { token: "1rem / 4",    px: "16px", usage: "Padding section, gap kartu, margin standar" },
                  { token: "1.25rem / 5", px: "20px", usage: "Padding tombol besar, gap antar komponen" },
                  { token: "1.5rem / 6",  px: "24px", usage: "Padding kartu, section spacing kecil" },
                  { token: "2rem / 8",    px: "32px", usage: "Section spacing utama, padding halaman mobile" },
                  { token: "3rem / 12",   px: "48px", usage: "Section spacing besar, margin antar section" },
                ].map(({ token, px, usage }) => (
                  <div key={px} className="flex items-center gap-4">
                    <div className="w-20 flex-shrink-0">
                      <p className="text-xs font-mono text-amber">{token}</p>
                      <p className="text-[10px] text-ink-muted">{px}</p>
                    </div>
                    <div className="bg-amber-soft border border-amber/20 rounded" style={{ width: px, height: "20px", minWidth: px }} />
                    <p className="text-xs text-ink-secondary">{usage}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-elevated p-5">
                <p className="text-overline mb-3">Breakpoints</p>
                <div className="space-y-2">
                  {[
                    ["sm", "640px", "Tablet kecil / landscape phone"],
                    ["md", "768px", "Tablet"],
                    ["lg", "1024px", "Desktop kecil"],
                    ["xl", "1280px", "Desktop"],
                  ].map(([bp, px, desc]) => (
                    <div key={bp} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-amber w-6">{bp}</span>
                      <span className="font-mono text-xs text-ink-secondary w-16">{px}</span>
                      <span className="text-xs text-ink-muted">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-elevated p-5">
                <p className="text-overline mb-3">Container & Layout</p>
                <div className="space-y-2 text-xs text-ink-secondary">
                  <div className="flex gap-2"><span className="text-amber font-mono">max-w-lg</span><span>512px — konten utama mobile-first</span></div>
                  <div className="flex gap-2"><span className="text-amber font-mono">max-w-xl</span><span>576px — form wide</span></div>
                  <div className="flex gap-2"><span className="text-amber font-mono">px-4</span><span>16px — horizontal padding halaman</span></div>
                  <div className="flex gap-2"><span className="text-amber font-mono">pb-20</span><span>80px — bottom padding (nav bar mobile)</span></div>
                  <div className="flex gap-2"><span className="text-amber font-mono">min-h-dvh</span><span>Gunakan dvh bukan vh untuk mobile</span></div>
                </div>
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════ BAYANGAN ═══════════════════════════ */}
          <Section id="bayangan" title="Bayangan">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { token: "brutal-xs", style: "1px 1px 0 #0C0C0A", cls: "shadow-brutal-xs" },
                { token: "brutal-sm", style: "2px 2px 0 #0C0C0A", cls: "shadow-brutal-sm" },
                { token: "brutal",    style: "4px 4px 0 #0C0C0A", cls: "shadow-brutal" },
                { token: "brutal-lg", style: "6px 6px 0 #0C0C0A", cls: "shadow-brutal-lg" },
              ].map(({ token, style, cls }) => (
                <div key={token} className="flex flex-col items-center gap-4">
                  <div
                    className="w-full h-16 bg-surface rounded-xl border-2 border-ink"
                    style={{ boxShadow: `var(--shadow-${token})` }}
                  />
                  <div className="text-center">
                    <p className="font-mono text-xs text-amber">--shadow-{token}</p>
                    <p className="text-[10px] text-ink-muted font-mono mt-0.5">{style}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-elevated p-5">
              <p className="text-overline mb-3">Kapan Menggunakan</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  ["brutal-xs", "Badge, progress bar, elemen inline kecil"],
                  ["brutal-sm", "Kartu standar, tombol default, input focus"],
                  ["brutal", "Tombol hover state, dropdown, elemen penting"],
                  ["brutal-lg", "Modal, banner penting, elemen yang perlu dominan"],
                ].map(([token, desc]) => (
                  <div key={token} className="flex gap-3">
                    <span className="font-mono text-xs text-amber pt-0.5 flex-shrink-0">{token}</span>
                    <span className="text-xs text-ink-secondary">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════ TOMBOL ═════════════════════════════ */}
          <Section id="tombol" title="Tombol">
            <Demo label="Varian Tombol">
              <button className="btn-primary">Primer</button>
              <button className="btn-secondary">Sekunder</button>
              <button className="btn-ghost-ink">Ghost</button>
              <button className="btn-danger">Bahaya</button>
            </Demo>

            <Demo label="Ukuran Tombol (Primer)">
              <button className="btn-primary-sm">Kecil (sm)</button>
              <button className="btn-primary">Default</button>
              <button className="btn-primary-lg">Besar (lg)</button>
            </Demo>

            <Demo label="State: Disabled">
              <button className="btn-primary" disabled>Primer Disabled</button>
              <button className="btn-secondary" disabled>Sekunder Disabled</button>
              <button className="btn-ghost-ink" disabled>Ghost Disabled</button>
            </Demo>

            <div className="w-full bg-parchment rounded-2xl border border-border p-6">
              <p className="text-overline mb-3">Full-Width Tombol</p>
              <div className="max-w-sm space-y-3">
                <button className="btn-primary-full">Simpan Perubahan</button>
                <button className="btn-primary-full-lg">Daftar Sekarang →</button>
                <button className="btn-secondary-full">Batal</button>
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 bg-ink">
                <p className="text-xs font-mono text-amber">CSS Classes Reference</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-parchment">
                      <th className="px-5 py-2 text-overline">Class</th>
                      <th className="px-5 py-2 text-overline">Min-height</th>
                      <th className="px-5 py-2 text-overline">Kapan Digunakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [".btn-primary",        "44px", "CTA utama satu-satunya per halaman"],
                      [".btn-primary-sm",     "44px", "CTA primer di header / kompak"],
                      [".btn-primary-lg",     "52px", "Hero CTA, action penting halaman"],
                      [".btn-primary-full",   "44px", "Primer full-width di form"],
                      [".btn-primary-full-lg","52px", "Primer full-width besar — onboarding"],
                      [".btn-secondary",      "44px", "Aksi sekunder berdampingan primer"],
                      [".btn-secondary-full", "44px", "Sekunder full-width (misal: Batal)"],
                      [".btn-ghost-ink",      "44px", "Aksi tersier, toolbar, link-like"],
                      [".btn-danger",         "44px", "Hapus, keluar, aksi destruktif"],
                    ].map(([cls, h, desc]) => (
                      <TokenRow key={cls} name={cls} value={h} description={desc} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-amber-soft rounded-2xl border border-amber/30 p-5">
              <p className="text-sm font-semibold text-amber mb-1">Aturan Tombol</p>
              <ul className="text-xs text-ink-secondary space-y-1">
                <li>• Satu tombol primer per halaman — tidak boleh ada dua <code className="bg-amber/10 px-1 rounded">.btn-primary</code> berdampingan</li>
                <li>• Semua tombol min-height 44px untuk touch target compliance</li>
                <li>• Tombol destruktif selalu terpisah visual dari CTA normal</li>
                <li>• Saat loading: disabled + tambahkan spinner, jangan invisible</li>
                <li>• Focus ring amber otomatis pada semua varian — jangan dihapus</li>
              </ul>
            </div>
          </Section>

          {/* ══════════════════════════════ FORM ═══════════════════════════════ */}
          <Section id="form" title="Form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-overline">State Normal</p>
                <div>
                  <label className="input-label" htmlFor="ds-name">Nama lengkap</label>
                  <input id="ds-name" type="text" className="input" placeholder="Masukkan nama kamu" />
                  <p className="input-hint">Nama ini akan tampil di profil publik kamu</p>
                </div>
                <div>
                  <label className="input-label" htmlFor="ds-email">Email</label>
                  <input id="ds-email" type="email" className="input" placeholder="nama@email.com" />
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-overline">State Error</p>
                <div>
                  <label className="input-label" htmlFor="ds-err">Email</label>
                  <input id="ds-err" type="email" className="input-error" defaultValue="bukan-email" />
                  <p className="input-error-msg">Format email tidak valid</p>
                </div>
                <div>
                  <label className="input-label" htmlFor="ds-pass">
                    Password{" "}
                    <span className="text-error text-xs font-normal">*wajib</span>
                  </label>
                  <input id="ds-pass" type="password" className="input-error" placeholder="Min. 8 karakter" />
                  <p className="input-error-msg">Password minimal 8 karakter</p>
                </div>
              </div>
            </div>

            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-3 bg-ink">
                <p className="text-xs font-mono text-amber">CSS Classes Reference</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-parchment">
                      <th className="px-5 py-2 text-overline">Class</th>
                      <th className="px-5 py-2 text-overline">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      [".input", "Input normal — border abu, fokus border hitam + shadow-xs"],
                      [".input-error", "Input error — border merah, fokus shadow merah"],
                      [".input-label", "Label di atas input — 14px semibold"],
                      [".input-hint", "Teks bantuan di bawah input — 12px muted"],
                      [".input-error-msg", "Pesan error di bawah input — 12px merah"],
                      [".input-icon-l", "Padding kiri 2.5rem — ruang ikon kiri"],
                      [".input-icon-r", "Padding kanan 2.5rem — ruang ikon kanan"],
                      [".input-icon-lr", "Padding kiri & kanan — ikon kedua sisi"],
                    ].map(([cls, desc]) => (
                      <TokenRow key={cls} name={cls} value="" description={desc} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════ KARTU ══════════════════════════════ */}
          <Section id="kartu" title="Kartu">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <p className="text-overline mb-3">.card</p>
                <div className="card p-4">
                  <p className="font-semibold text-sm text-ink">Kartu Dasar</p>
                  <p className="text-xs text-ink-muted mt-1">Border hitam tanpa shadow. Untuk konten informatif non-interaktif.</p>
                </div>
              </div>
              <div>
                <p className="text-overline mb-3">.card-elevated</p>
                <div className="card-elevated p-4">
                  <p className="font-semibold text-sm text-ink">Kartu Elevated</p>
                  <p className="text-xs text-ink-muted mt-1">Border + brutal-sm shadow. Untuk konten utama dan form.</p>
                </div>
              </div>
              <div>
                <p className="text-overline mb-3">.card-interactive</p>
                <div className="card-interactive p-4">
                  <p className="font-semibold text-sm text-ink">Kartu Interaktif</p>
                  <p className="text-xs text-ink-muted mt-1">Hover: geser -2px + shadow. Untuk kartu yang bisa diklik.</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-soft rounded-2xl border border-amber/30 p-5">
              <p className="text-sm font-semibold text-amber mb-1">Kapan Pakai Varian Apa</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                {[
                  [".card", "Konten statis: teks, metadata, info panel"],
                  [".card-elevated", "Form sections, profil card, stat summary"],
                  [".card-interactive", "Book card, member card, navigasi ke halaman lain"],
                ].map(([cls, desc]) => (
                  <div key={cls}>
                    <p className="font-mono text-xs text-amber">{cls}</p>
                    <p className="text-xs text-ink-secondary mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════ BADGE ══════════════════════════════ */}
          <Section id="badge" title="Badge & Status">
            <Demo label="Badge Variants">
              <span className="badge badge-amber">Amber</span>
              <span className="badge badge-forest">Forest</span>
              <span className="badge badge-muted">Muted</span>
            </Demo>

            <Demo label="Status dalam Konteks">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm text-ink-secondary">Sudah dibaca</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber" />
                <span className="text-sm text-ink-secondary">Sedang dibaca</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-border" />
                <span className="text-sm text-ink-secondary">Mau dibaca</span>
              </div>
            </Demo>

            <div className="card-elevated p-5">
              <p className="text-overline mb-3">Progress Bar</p>
              <div className="space-y-4 max-w-sm">
                {[25, 60, 90].map((pct) => (
                  <div key={pct}>
                    <div className="flex justify-between text-xs text-ink-muted mb-1">
                      <span>Halaman 75/300</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════ KOMPONEN LAIN ═══════════════════════ */}
          <Section id="komponen" title="Komponen Lain">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-elevated p-5">
                <p className="text-overline mb-3">Divider</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-ink-muted mb-2">.divider — 2px solid ink</p>
                    <div className="divider" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-muted mb-2">.divider-soft — 1px solid border</p>
                    <div className="divider-soft" />
                  </div>
                </div>
              </div>

              <div className="card-elevated p-5">
                <p className="text-overline mb-3">Section Header</p>
                <div className="section-header">
                  <p className="section-title">Sedang Dibaca</p>
                  <a href="#" className="section-link">Lihat semua →</a>
                </div>
                <div className="divider-soft" />
                <p className="text-xs text-ink-muted mt-3">Gunakan <code className="bg-parchment px-1 rounded">.section-header</code> + <code className="bg-parchment px-1 rounded">.section-title</code> + <code className="bg-parchment px-1 rounded">.section-link</code></p>
              </div>
            </div>

            <div className="card-elevated p-5">
              <p className="text-overline mb-4">Alert / Feedback States</p>
              <div className="space-y-3">
                <div className="bg-success-soft border border-success/20 rounded-xl px-4 py-3">
                  <p className="text-sm font-semibold text-success">Berhasil disimpan!</p>
                  <p className="text-xs text-ink-secondary mt-0.5">Perubahan profilmu sudah tersimpan.</p>
                </div>
                <div className="bg-error-soft border border-error/20 rounded-xl px-4 py-3">
                  <p className="text-sm font-semibold text-error">Terjadi kesalahan</p>
                  <p className="text-xs text-ink-secondary mt-0.5">Email tidak valid. Periksa kembali formatnya.</p>
                </div>
                <div className="bg-amber-soft border border-amber/20 rounded-xl px-4 py-3">
                  <p className="text-sm font-semibold text-amber">Perhatian</p>
                  <p className="text-xs text-ink-secondary mt-0.5">Email belum diverifikasi. Cek kotak masukmu.</p>
                </div>
                <div className="bg-info-soft border border-info/20 rounded-xl px-4 py-3">
                  <p className="text-sm font-semibold text-info">Info</p>
                  <p className="text-xs text-ink-secondary mt-0.5">Kamu bergabung ke keluarga Keluarga Baca.</p>
                </div>
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════ MOTION ═════════════════════════════ */}
          <Section id="motion" title="Motion">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-elevated p-5">
                <p className="text-overline mb-4">Token Waktu</p>
                <div className="space-y-2">
                  {[
                    ["80ms",  "ease", "Tombol press/active — feedback instan"],
                    ["150ms", "ease", "Micro-interaction — hover, focus border"],
                    ["200ms", "ease-out", "Komponen muncul — card, badge"],
                    ["300ms", "ease-in-out", "Transisi state — tab switch, accordion"],
                    ["400ms", "ease-out", "Modal masuk, drawer slide"],
                  ].map(([dur, ease, desc]) => (
                    <div key={dur} className="flex gap-3 items-start">
                      <span className="font-mono text-xs text-amber w-12 flex-shrink-0">{dur}</span>
                      <span className="font-mono text-xs text-ink-muted w-20 flex-shrink-0">{ease}</span>
                      <span className="text-xs text-ink-secondary">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-elevated p-5">
                <p className="text-overline mb-4">Aturan Motion</p>
                <ul className="space-y-2 text-xs text-ink-secondary">
                  <li className="flex gap-2"><span className="text-forest mt-0.5">✓</span>Gunakan <code className="bg-parchment px-1 rounded">transform</code> dan <code className="bg-parchment px-1 rounded">opacity</code> saja — hindari animate <code className="bg-parchment px-1 rounded">width/height</code></li>
                  <li className="flex gap-2"><span className="text-forest mt-0.5">✓</span>Tombol brutal: 80ms translate(-1px,-1px) hover, translate(2px,2px) active</li>
                  <li className="flex gap-2"><span className="text-forest mt-0.5">✓</span>Selalu hormati <code className="bg-parchment px-1 rounded">prefers-reduced-motion</code></li>
                  <li className="flex gap-2"><span className="text-error mt-0.5">✗</span>Jangan ada animasi &gt; 500ms di UI biasa</li>
                  <li className="flex gap-2"><span className="text-error mt-0.5">✗</span>Jangan animasi hanya untuk dekorasi tanpa makna</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════ IKON ═══════════════════════════════ */}
          <Section id="ikon" title="Ikon">
            <div className="card-elevated p-6">
              <p className="text-overline mb-4">Library: Lucide React</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Navigasi", icons: "BookOpen, Compass, BarChart2, User, Home" },
                  { label: "Aksi", icons: "Plus, Pencil, Trash2, ChevronRight, ArrowLeft" },
                  { label: "Status", icons: "Check, AlertTriangle, X, Info, Loader2" },
                  { label: "Konten", icons: "Star, Bookmark, Heart, Trophy, Flame" },
                  { label: "Sistem", icons: "Search, Settings, Bell, LogOut, Share2" },
                  { label: "Media", icons: "Image, Upload, Download, ExternalLink, Link" },
                ].map(({ label, icons }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-ink mb-1">{label}</p>
                    <p className="text-[10px] text-ink-muted font-mono">{icons}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card-elevated p-5">
                <p className="text-overline mb-3">Ukuran Ikon</p>
                <div className="space-y-3">
                  {[
                    [10, "Badge, overline kecil"],
                    [12, "Caption, label kompak"],
                    [14, "Tombol sm, nav label"],
                    [16, "Tombol default, heading"],
                    [20, "Avatar, ilustrasi kecil"],
                    [24, "Hero icon, navigation"],
                    [40, "Empty state, onboarding"],
                  ].map(([size, usage]) => (
                    <div key={size} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-amber w-8">{size}px</span>
                      <div className="bg-parchment rounded border border-border flex items-center justify-center" style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
                        <div className="bg-ink-muted rounded-sm" style={{ width: `${Number(size) * 0.6}px`, height: `${Number(size) * 0.6}px` }} />
                      </div>
                      <span className="text-xs text-ink-secondary">{usage}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-elevated p-5">
                <p className="text-overline mb-3">Aturan Ikon</p>
                <ul className="space-y-2 text-xs text-ink-secondary">
                  <li className="flex gap-2"><span className="text-forest">✓</span>Gunakan <strong>Lucide React</strong> secara konsisten — satu library</li>
                  <li className="flex gap-2"><span className="text-forest">✓</span>strokeWidth default <code className="bg-parchment px-1 rounded">1.75</code> untuk ikon UI, <code className="bg-parchment px-1 rounded">2</code> untuk emphasis</li>
                  <li className="flex gap-2"><span className="text-forest">✓</span>Tombol ikon-only wajib ada <code className="bg-parchment px-1 rounded">aria-label</code> atau teks tersembunyi</li>
                  <li className="flex gap-2"><span className="text-forest">✓</span>Area tap minimum 44×44px — gunakan padding jika ikon kecil</li>
                  <li className="flex gap-2"><span className="text-error">✗</span>Jangan gunakan emoji sebagai ikon sistem</li>
                  <li className="flex gap-2"><span className="text-error">✗</span>Jangan mix filled dan outline dalam satu hierarki yang sama</li>
                  <li className="flex gap-2"><span className="text-error">✗</span>Jangan gunakan PNG/raster — selalu SVG</li>
                </ul>
              </div>
            </div>
          </Section>

          {/* ══════════════════════════════ AKSESIBILITAS ════════════════════════ */}
          <Section id="aksesibilitas" title="Aksesibilitas">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Kontras Warna",
                  items: [
                    "Ink (#0C0C0A) on Parchment (#FAF7F2): 17.4:1 ✓ AAA",
                    "Amber (#C26E2A) on White: 4.6:1 ✓ AA",
                    "White on Amber (#C26E2A): 4.6:1 ✓ AA",
                    "White on Forest (#1E4530): 12.2:1 ✓ AAA",
                    "Ink-muted (#7A8E83) on White: 3.8:1 — gunakan max di 14px+",
                  ],
                },
                {
                  title: "Touch Target",
                  items: [
                    "Minimum min-height: 44px di semua elemen interaktif",
                    "Gap antar target minimum 8px",
                    "Ikon kecil: gunakan padding atau hitSlop",
                    "Input fields: min-height 44px sudah built-in di .input",
                    "Nav bar: min-height 56px dengan label + icon",
                  ],
                },
                {
                  title: "Focus & Keyboard",
                  items: [
                    "Focus ring: 2px solid amber, offset 2px — semua .btn sudah memiliki",
                    "Tab order harus sesuai urutan visual",
                    "Modal: fokus masuk ke modal saat terbuka, keluar saat ditutup",
                    "Escape key harus menutup modal/drawer",
                    "Jangan pernah outline: none tanpa pengganti visual",
                  ],
                },
                {
                  title: "Teks & Konten",
                  items: [
                    "Minimum body text 16px di mobile",
                    "Line-height body minimum 1.5 — saat ini 1.6",
                    "Jangan convey info dengan warna saja — tambahkan ikon/teks",
                    "Alt text untuk semua gambar bermakna",
                    "Form label wajib visible — jangan placeholder-only",
                  ],
                },
              ].map(({ title, items }) => (
                <div key={title} className="card-elevated p-5">
                  <p className="text-overline mb-3">{title}</p>
                  <ul className="space-y-1.5">
                    {items.map((item) => (
                      <li key={item} className="text-xs text-ink-secondary flex gap-2">
                        <span className="text-forest flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {/* Footer */}
          <div className="pt-8 pb-16 text-center">
            <p className="text-overline mb-2">mulaibaca design system</p>
            <p className="text-xs text-ink-muted">Dibuat dengan Next.js · Tailwind CSS v4 · Lucide React</p>
            <p className="text-xs text-ink-muted mt-1">Dokumen ini adalah referensi hidup — perbarui saat ada komponen atau token baru</p>
          </div>

        </main>
      </div>
    </div>
  );
}
