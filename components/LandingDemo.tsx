"use client";

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const INK = "#0C0C0A";
const FOREST = "#1E4530";
const AMBER = "#C26E2A";
const PARCHMENT = "#FAF7F2";

const STORAGE_KEY = "mulaibaca_demo";

const BOOKS = [
  { id: 1, title: "Laskar Pelangi", author: "Andrea Hirata", pages: 529, spine: FOREST, accent: "#BFE040" },
  { id: 2, title: "Atomic Habits", author: "James Clear", pages: 306, spine: "#1d4ed8", accent: "#bfdbfe" },
  { id: 3, title: "Bumi Manusia", author: "Pramoedya A. Toer", pages: 535, spine: "#7c2d12", accent: "#fcd34d" },
  { id: 4, title: "Filosofi Teras", author: "Henry Manampiring", pages: 344, spine: "#5b21b6", accent: "#e9d5ff" },
];

type Book = (typeof BOOKS)[number];

export default function LandingDemo() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<Book | null>(null);
  const [pagesInput, setPagesInput] = useState(20);

  const pct = selected ? Math.min(Math.round((pagesInput / selected.pages) * 100), 100) : 0;

  // Restore demo state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { step: s, bookId, pages } = JSON.parse(saved);
        if (s >= 1 && s <= 3) setStep(s);
        const book = BOOKS.find((b) => b.id === bookId);
        if (book) setSelected(book);
        if (typeof pages === "number" && pages > 0) setPagesInput(pages);
      }
    } catch {}
  }, []);

  // Persist state to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        step,
        bookId: selected?.id ?? null,
        pages: pagesInput,
      }));
    } catch {}
  }, [step, selected, pagesInput]);

  function reset() {
    setStep(1);
    setSelected(null);
    setPagesInput(20);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto" }}>
      {/* Step dots */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginBottom: "1.75rem" }}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            style={{
              height: "6px",
              borderRadius: "3px",
              backgroundColor: step >= s ? AMBER : "rgba(255,255,255,0.2)",
              width: step === s ? "28px" : "8px",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* ── STEP 1: Pick a book ── */}
      {step === 1 && (
        <div
          style={{
            backgroundColor: PARCHMENT,
            border: `1.5px solid ${INK}`,
            borderRadius: "14px",
            padding: "1.5rem",
            boxShadow: `5px 5px 0 ${INK}`,
          }}
        >
          <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A8E83", marginBottom: "0.5rem" }}>
            Langkah 1 dari 3
          </p>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, color: INK, letterSpacing: "-0.02em", marginBottom: "1.25rem", lineHeight: 1.2 }}>
            Pilih buku yang sedang<br />ingin kamu baca
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {BOOKS.map((b) => (
              <button
                key={b.id}
                onClick={() => { setSelected(b); setStep(2); }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px",
                  backgroundColor: "#fff",
                  border: `1.5px solid ${INK}`,
                  borderRadius: "8px",
                  boxShadow: `2px 2px 0 ${INK}`,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "transform 0.1s ease, box-shadow 0.1s ease",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1px,-1px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `3px 3px 0 ${INK}`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = `2px 2px 0 ${INK}`; }}
              >
                <div style={{ width: "28px", height: "40px", borderRadius: "3px", backgroundColor: b.spine, flexShrink: 0, border: `1px solid ${INK}` }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: INK, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</p>
                  <p style={{ fontSize: "0.62rem", color: "#7A8E83", marginTop: "2px" }}>{b.author}</p>
                </div>
              </button>
            ))}
          </div>
          <p style={{ fontSize: "0.68rem", color: "#7A8E83", textAlign: "center", marginTop: "1rem" }}>
            Simulasi · progres tersimpan di perangkat ini
          </p>
        </div>
      )}

      {/* ── STEP 2: Log pages ── */}
      {step === 2 && selected && (
        <div
          style={{
            backgroundColor: PARCHMENT,
            border: `1.5px solid ${INK}`,
            borderRadius: "14px",
            padding: "1.5rem",
            boxShadow: `5px 5px 0 ${INK}`,
          }}
        >
          <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7A8E83", marginBottom: "0.5rem" }}>
            Langkah 2 dari 3
          </p>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, color: INK, letterSpacing: "-0.02em", marginBottom: "1.25rem", lineHeight: 1.2 }}>
            Berapa halaman kamu<br />baca hari ini?
          </h3>

          {/* Selected book row */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", backgroundColor: "#fff", border: `1px solid ${INK}`, borderRadius: "8px", marginBottom: "1.5rem" }}>
            <div style={{ width: "28px", height: "40px", borderRadius: "3px", backgroundColor: selected.spine, flexShrink: 0, border: `1px solid ${INK}` }} />
            <div>
              <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: INK }}>{selected.title}</p>
              <p style={{ fontSize: "0.68rem", color: "#7A8E83" }}>{selected.author} · {selected.pages} hal</p>
            </div>
          </div>

          {/* Page counter */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "1.25rem" }}>
            <button
              onClick={() => setPagesInput(Math.max(1, pagesInput - 5))}
              style={{ width: "44px", height: "44px", borderRadius: "8px", border: `1.5px solid ${INK}`, backgroundColor: "#fff", fontSize: "1.25rem", fontWeight: 700, cursor: "pointer", color: INK, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `2px 2px 0 ${INK}` }}
            >−</button>
            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", fontWeight: 800, color: AMBER, lineHeight: 1 }}>{pagesInput}</span>
              <p style={{ fontSize: "0.7rem", color: "#7A8E83", marginTop: "2px" }}>halaman</p>
            </div>
            <button
              onClick={() => setPagesInput(Math.min(selected.pages, pagesInput + 5))}
              style={{ width: "44px", height: "44px", borderRadius: "8px", border: `1.5px solid ${INK}`, backgroundColor: "#fff", fontSize: "1.25rem", fontWeight: 700, cursor: "pointer", color: INK, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `2px 2px 0 ${INK}` }}
            >+</button>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.68rem", color: "#7A8E83" }}>{pagesInput} / {selected.pages} hal</span>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: AMBER }}>{pct}%</span>
            </div>
            <div style={{ height: "8px", backgroundColor: "#E8D5B0", borderRadius: "4px", overflow: "hidden", border: `1px solid rgba(12,12,10,0.15)` }}>
              <div style={{ height: "100%", width: `${pct}%`, backgroundColor: AMBER, borderRadius: "4px", transition: "width 0.3s ease" }} />
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            style={{
              display: "block", width: "100%",
              padding: "0.875rem",
              backgroundColor: AMBER, color: "#fff",
              fontWeight: 700, fontSize: "1rem",
              border: `1.5px solid ${INK}`,
              borderRadius: "8px",
              boxShadow: `3px 3px 0 ${INK}`,
              cursor: "pointer",
            }}
          >
            Catat bacaan hari ini →
          </button>
          <button onClick={reset} style={{ display: "block", width: "100%", marginTop: "10px", padding: "8px", background: "none", border: "none", color: "#7A8E83", fontSize: "0.75rem", cursor: "pointer" }}>
            ← Ganti buku
          </button>
          <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "0.75rem" }}>
            Simulasi · progres tersimpan di perangkat ini
          </p>
        </div>
      )}

      {/* ── STEP 3: Celebration ── */}
      {step === 3 && selected && (
        <div
          style={{
            backgroundColor: PARCHMENT,
            border: `1.5px solid ${INK}`,
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: `5px 5px 0 ${INK}`,
          }}
        >
          {/* Celebration header */}
          <div style={{ backgroundColor: FOREST, padding: "1.5rem", textAlign: "center", borderBottom: `1.5px solid ${INK}` }}>
            <div style={{ fontSize: "2.5rem", lineHeight: 1, marginBottom: "0.5rem" }}>🔥</div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em" }}>
              Streak dimulai!
            </p>
            <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.65)", marginTop: "4px" }}>
              Hari pertamamu bersama {selected.title}
            </p>
          </div>

          <div style={{ padding: "1.25rem" }}>
            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "1.25rem" }}>
              {[
                { label: "Hari", value: "1", icon: "🔥" },
                { label: "Halaman", value: String(pagesInput), icon: "📖" },
                { label: "Selesai", value: `${pct}%`, icon: "✓" },
              ].map((s) => (
                <div key={s.label} style={{ backgroundColor: "#fff", border: `1px solid ${INK}`, borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "1rem", marginBottom: "2px" }}>{s.icon}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 800, color: INK, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: "0.6rem", color: "#7A8E83", marginTop: "2px", fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "0.8125rem", color: "#3D4E45", lineHeight: 1.65, textAlign: "center", marginBottom: "1.25rem" }}>
              <strong>Bayangkan ini setiap hari</strong> — catat progres, jaga streak, dan lihat bagaimana kebiasaan membaca tumbuh bersama orang terdekat.
            </p>

            <Link
              href="/daftar"
              style={{
                display: "block", textAlign: "center",
                padding: "0.875rem",
                backgroundColor: AMBER, color: "#fff",
                fontWeight: 700, fontSize: "1rem",
                border: `1.5px solid ${INK}`,
                borderRadius: "8px",
                boxShadow: `3px 3px 0 ${INK}`,
                textDecoration: "none",
                marginBottom: "10px",
              }}
            >
              Daftar gratis & lanjutkan →
            </Link>
            <button onClick={reset} style={{ display: "block", width: "100%", padding: "8px", background: "none", border: "none", color: "#7A8E83", fontSize: "0.75rem", cursor: "pointer" }}>
              Coba lagi
            </button>
            <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "0.5rem" }}>
              Simulasi · progres tersimpan di perangkat ini
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
