"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Check, X, Eye, EyeOff } from "lucide-react";
import type { HelpFaq } from "./page";

export default function FaqAdminClient({ initialFaqs }: { initialFaqs: HelpFaq[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [adding, setAdding] = useState(false);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function addFaq() {
    if (!newQ.trim() || !newA.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/help/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQ, answer: newA }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setFaqs((prev) => [...prev, data]);
    setNewQ("");
    setNewA("");
    setAdding(false);
    setSaving(false);
  }

  function startEdit(faq: HelpFaq) {
    setEditingId(faq.id);
    setEditQ(faq.question);
    setEditA(faq.answer);
    setError("");
  }

  async function saveEdit(id: string) {
    if (!editQ.trim() || !editA.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/help/faqs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: editQ, answer: editA }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error); setSaving(false); return; }
    setFaqs((prev) => prev.map((f) => f.id === id ? { ...f, question: editQ.trim(), answer: editA.trim() } : f));
    setEditingId(null);
    setSaving(false);
  }

  async function toggleActive(faq: HelpFaq) {
    const next = !faq.is_active;
    setFaqs((prev) => prev.map((f) => f.id === faq.id ? { ...f, is_active: next } : f));
    await fetch(`/api/admin/help/faqs/${faq.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: next }),
    });
  }

  async function deleteFaq(id: string) {
    if (!confirm("Hapus FAQ ini?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/help/faqs/${id}`, { method: "DELETE" });
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    setDeletingId(null);
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = faqs.findIndex((f) => f.id === id);
    if (idx + dir < 0 || idx + dir >= faqs.length) return;
    const next = [...faqs];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    const reordered = next.map((f, i) => ({ ...f, sort_order: i + 1 }));
    setFaqs(reordered);
    await fetch("/api/admin/help/faqs/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((f) => ({ id: f.id, sort_order: f.sort_order })) }),
    });
  }

  return (
    <div className="space-y-2">
      {faqs.length === 0 && !adding && (
        <div className="rounded-2xl border-2 border-dashed border-border py-10 text-center">
          <p className="text-sm text-ink-muted">Belum ada FAQ.</p>
        </div>
      )}

      {faqs.map((faq, idx) => (
        <div
          key={faq.id}
          className={`bg-surface rounded-xl border transition-colors ${
            faq.is_active ? "border-border" : "border-border/40 opacity-60"
          }`}
        >
          {editingId === faq.id ? (
            <div className="p-4 space-y-3">
              <input
                value={editQ}
                onChange={(e) => setEditQ(e.target.value)}
                placeholder="Pertanyaan"
                className="input w-full text-sm"
              />
              <textarea
                value={editA}
                onChange={(e) => setEditA(e.target.value)}
                placeholder="Jawaban"
                rows={3}
                className="input w-full text-sm resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(faq.id)}
                  disabled={saving}
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Check size={13} strokeWidth={2.5} />
                  {saving ? "Menyimpan…" : "Simpan"}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="btn-ghost-ink text-xs px-3 py-1.5"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-0.5 flex-shrink-0 mt-0.5">
                  <button
                    onClick={() => move(faq.id, -1)}
                    disabled={idx === 0}
                    className="w-6 h-6 flex items-center justify-center rounded text-ink-muted hover:text-ink disabled:opacity-20"
                  >
                    <ChevronUp size={14} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => move(faq.id, 1)}
                    disabled={idx === faqs.length - 1}
                    className="w-6 h-6 flex items-center justify-center rounded text-ink-muted hover:text-ink disabled:opacity-20"
                  >
                    <ChevronDown size={14} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink leading-snug">{faq.question}</p>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed line-clamp-2">{faq.answer}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(faq)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink transition-colors"
                    title={faq.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {faq.is_active ? <Eye size={14} strokeWidth={2} /> : <EyeOff size={14} strokeWidth={2} />}
                  </button>
                  <button
                    onClick={() => startEdit(faq)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-muted hover:text-amber transition-colors"
                  >
                    <Pencil size={13} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => deleteFaq(faq.id)}
                    disabled={deletingId === faq.id}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-muted hover:text-error transition-colors"
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <div className="bg-surface rounded-xl border-2 border-amber/40 p-4 space-y-3">
          <input
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            placeholder="Pertanyaan baru…"
            className="input w-full text-sm"
            autoFocus
          />
          <textarea
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
            placeholder="Jawaban…"
            rows={3}
            className="input w-full text-sm resize-none"
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={addFaq}
              disabled={saving || !newQ.trim() || !newA.trim()}
              className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <Check size={13} strokeWidth={2.5} />
              {saving ? "Menyimpan…" : "Tambah"}
            </button>
            <button onClick={() => { setAdding(false); setNewQ(""); setNewA(""); setError(""); }} className="btn-ghost-ink text-xs px-3 py-1.5">
              Batal
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-ink-muted hover:border-amber/40 hover:text-ink transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={15} strokeWidth={2.5} />
          Tambah FAQ
        </button>
      )}
    </div>
  );
}
