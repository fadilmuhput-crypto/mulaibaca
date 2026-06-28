"use client";

import { useState } from "react";
import { X, MessageSquarePlus, Check, Lightbulb, Bug, BookOpen, Mail } from "lucide-react";

const CATEGORIES = [
  { key: "saran",   label: "Saran",   icon: Lightbulb },
  { key: "bug",     label: "Bug",     icon: Bug },
  { key: "konten",  label: "Konten",  icon: BookOpen },
  { key: "lainnya", label: "Lainnya", icon: Mail },
];

export default function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState("");
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
        body: JSON.stringify({ category, message }),
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg bg-surface rounded-t-3xl sm:rounded-2xl p-6 space-y-4"
        style={{ border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-h3 flex items-center gap-2">
              <MessageSquarePlus size={18} strokeWidth={1.75} className="text-amber" />
              Beri Masukan
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">Bantu kami terus berkembang</p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-muted hover:text-ink rounded-xl"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {done ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-3">
              <Check size={24} strokeWidth={2} className="text-forest" />
            </div>
            <p className="font-semibold text-ink">Terima kasih!</p>
            <p className="text-sm text-ink-muted mt-1">Masukan kamu sudah kami terima.</p>
            <button onClick={onClose} className="btn-secondary mt-4">Tutup</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="input-label mb-2">Kategori</p>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const active = category === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCategory(active ? "" : c.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all ${
                        active
                          ? "border-amber bg-amber-soft text-amber font-semibold"
                          : "border-border text-ink-secondary hover:border-amber/40"
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.75} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="feedback-msg" className="input-label">Pesan *</label>
              <textarea
                id="feedback-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Ceritakan pengalamanmu, atau fitur yang kamu inginkan…"
                className="input resize-none mt-1 w-full"
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-error text-sm bg-error-soft rounded-xl px-4 py-2">{error}</p>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={sending || !message.trim()} className="btn-primary flex-1">
                {sending ? "Mengirim…" : "Kirim Masukan"}
              </button>
              <button type="button" onClick={onClose} className="btn-ghost-ink px-4">Batal</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
