"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";

const CATEGORIES = [
  { key: "komplain", label: "⚠️ Komplain" },
  { key: "inquiry", label: "❓ Pertanyaan" },
  { key: "saran", label: "💡 Saran" },
  { key: "bug", label: "🐛 Lapor Bug" },
  { key: "lainnya", label: "✉️ Lainnya" },
];

export default function BantuanPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || null, email: email || null, category, subject: subject || null, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-dvh bg-parchment flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
            <Check size={28} strokeWidth={2} className="text-forest" />
          </div>
          <h1 className="text-h1 mb-2">Pesan terkirim!</h1>
          <p className="text-sm text-ink-muted mb-6">Tim kami akan merespon secepatnya.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-primary">Ke Beranda</Link>
            <button onClick={() => { setDone(false); setMessage(""); setSubject(""); setCategory(""); setName(""); setEmail(""); }} className="btn-secondary">
              Kirim lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-parchment">
      <header className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl font-display font-bold text-forest">mulaibaca</Link>
          <span className="text-xs text-ink-muted">/ bantuan</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-h1">Hubungi Kami</h1>
          <p className="text-sm text-ink-muted mt-1">Ada pertanyaan atau masalah? Isi form di bawah.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="input-label">Nama</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu" className="input" />
            </div>
            <div>
              <label htmlFor="email" className="input-label">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" className="input" />
            </div>
          </div>

          <div>
            <label className="input-label">Kategori *</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(category === c.key ? "" : c.key)}
                  className={`px-3 py-1.5 rounded-xl border text-sm transition-all ${
                    category === c.key
                      ? "border-amber bg-amber-soft text-amber font-semibold"
                      : "border-border text-ink-secondary hover:border-amber/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="input-label">Subjek</label>
            <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Inti pesan kamu" className="input" />
          </div>

          <div>
            <label htmlFor="message" className="input-label">Pesan *</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Ceritakan detailnya…"
              className="input resize-none mt-1 w-full"
              required
              autoFocus
            />
          </div>

          {error && (
            <p role="alert" className="text-error text-sm bg-error-soft rounded-xl px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={sending || !message.trim()} className="btn-primary-full-lg flex items-center justify-center gap-2">
            {sending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Mengirim…
              </>
            ) : "Kirim Pesan →"}
          </button>
        </form>

        <div className="mt-8 space-y-2 text-center text-sm text-ink-muted">
          <p>Atau lihat <Link href="/faq" className="text-amber hover:text-amber-hover font-medium">FAQ</Link> atau <Link href="/panduan" className="text-amber hover:text-amber-hover font-medium">Panduan</Link></p>
        </div>
      </main>
    </div>
  );
}
