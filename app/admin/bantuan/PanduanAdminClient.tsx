"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, Check, Eye, EyeOff, Upload, X, ImageIcon } from "lucide-react";
import type { HelpGuide } from "./page";

export default function PanduanAdminClient({ initialGuides }: { initialGuides: HelpGuide[] }) {
  const [guides, setGuides] = useState(initialGuides);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function resetForm() {
    setFormTitle("");
    setFormContent("");
    setFormImage(null);
    setError("");
  }

  function startAdd() {
    resetForm();
    setEditingId(null);
    setAdding(true);
  }

  function startEdit(g: HelpGuide) {
    setAdding(false);
    setFormTitle(g.title);
    setFormContent(g.content ?? "");
    setFormImage(g.image_url);
    setEditingId(g.id);
    setError("");
  }

  async function uploadImage(file: File): Promise<string | null> {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/help/guides/upload", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error); return null; }
    return data.url as string;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setFormImage(url);
    e.target.value = "";
  }

  async function addGuide() {
    if (!formTitle.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/help/guides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: formTitle, content: formContent || null, image_url: formImage }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setSaving(false); return; }
    setGuides((prev) => [...prev, data]);
    resetForm();
    setAdding(false);
    setSaving(false);
  }

  async function saveEdit(id: string) {
    if (!formTitle.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/help/guides/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: formTitle, content: formContent || null, image_url: formImage }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error); setSaving(false); return; }
    setGuides((prev) =>
      prev.map((g) => g.id === id ? { ...g, title: formTitle.trim(), content: formContent || null, image_url: formImage } : g)
    );
    setEditingId(null);
    resetForm();
    setSaving(false);
  }

  async function toggleActive(g: HelpGuide) {
    const next = !g.is_active;
    setGuides((prev) => prev.map((item) => item.id === g.id ? { ...item, is_active: next } : item));
    await fetch(`/api/admin/help/guides/${g.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: next }),
    });
  }

  async function deleteGuide(id: string) {
    if (!confirm("Hapus panduan ini?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/help/guides/${id}`, { method: "DELETE" });
    setGuides((prev) => prev.filter((g) => g.id !== id));
    setDeletingId(null);
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = guides.findIndex((g) => g.id === id);
    if (idx + dir < 0 || idx + dir >= guides.length) return;
    const next = [...guides];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    const reordered = next.map((g, i) => ({ ...g, sort_order: i + 1 }));
    setGuides(reordered);
    await fetch("/api/admin/help/guides/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((g) => ({ id: g.id, sort_order: g.sort_order })) }),
    });
  }

  function FormBlock({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
    return (
      <div className="bg-surface rounded-xl border-2 border-amber/40 p-4 space-y-3">
        <input
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Judul panduan…"
          className="input w-full text-sm"
          autoFocus
        />
        <textarea
          value={formContent}
          onChange={(e) => setFormContent(e.target.value)}
          placeholder="Isi panduan (opsional)…"
          rows={4}
          className="input w-full text-sm resize-none"
        />

        {/* Image upload */}
        <div>
          {formImage ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <Image src={formImage} alt="Preview" width={400} height={200} className="w-full h-40 object-cover" />
              <button
                onClick={() => setFormImage(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/70 text-white flex items-center justify-center hover:bg-error transition-colors"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-xl border-2 border-dashed border-border py-4 text-xs font-medium text-ink-muted hover:border-amber/40 hover:text-ink transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><Upload size={14} className="animate-bounce" /> Mengunggah…</>
              ) : (
                <><ImageIcon size={14} /> Tambah gambar (opsional)</>
              )}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
        </div>

        {error && <p className="text-xs text-error">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={saving || uploading || !formTitle.trim()}
            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Check size={13} strokeWidth={2.5} />
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
          <button onClick={onCancel} className="btn-ghost-ink text-xs px-3 py-1.5">
            Batal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {guides.length === 0 && !adding && (
        <div className="rounded-2xl border-2 border-dashed border-border py-10 text-center">
          <p className="text-sm text-ink-muted">Belum ada panduan.</p>
        </div>
      )}

      {guides.map((g, idx) => (
        <div key={g.id}>
          {editingId === g.id ? (
            <FormBlock
              onSave={() => saveEdit(g.id)}
              onCancel={() => { setEditingId(null); resetForm(); }}
            />
          ) : (
            <div className={`bg-surface rounded-xl border transition-colors ${g.is_active ? "border-border" : "border-border/40 opacity-60"}`}>
              <div className="p-4 flex items-start gap-3">
                <div className="flex flex-col gap-0.5 flex-shrink-0 mt-0.5">
                  <button onClick={() => move(g.id, -1)} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center rounded text-ink-muted hover:text-ink disabled:opacity-20">
                    <ChevronUp size={14} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => move(g.id, 1)} disabled={idx === guides.length - 1} className="w-6 h-6 flex items-center justify-center rounded text-ink-muted hover:text-ink disabled:opacity-20">
                    <ChevronDown size={14} strokeWidth={2.5} />
                  </button>
                </div>

                {g.image_url && (
                  <Image src={g.image_url} alt={g.title} width={56} height={56} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink leading-snug">{g.title}</p>
                  {g.content && (
                    <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">{g.content}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(g)} className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-muted hover:text-ink transition-colors" title={g.is_active ? "Nonaktifkan" : "Aktifkan"}>
                    {g.is_active ? <Eye size={14} strokeWidth={2} /> : <EyeOff size={14} strokeWidth={2} />}
                  </button>
                  <button onClick={() => startEdit(g)} className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-muted hover:text-amber transition-colors">
                    <Pencil size={13} strokeWidth={2} />
                  </button>
                  <button onClick={() => deleteGuide(g.id)} disabled={deletingId === g.id} className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-muted hover:text-error transition-colors">
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        <FormBlock
          onSave={addGuide}
          onCancel={() => { setAdding(false); resetForm(); }}
        />
      ) : (
        <button
          onClick={startAdd}
          className="w-full rounded-xl border-2 border-dashed border-border py-3 text-sm font-semibold text-ink-muted hover:border-amber/40 hover:text-ink transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={15} strokeWidth={2.5} />
          Tambah Panduan
        </button>
      )}
    </div>
  );
}
