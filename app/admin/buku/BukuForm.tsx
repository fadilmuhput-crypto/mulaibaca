"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BookCover from "@/components/BookCover";
import { Search, X } from "lucide-react";
import type { AdminBook } from "./page";

type OLResult = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
};

type FormData = {
  title: string;
  author: string;
  category: "anak" | "lokal";
  description: string;
  cover_url: string;
  open_library_id: string;
  total_pages: string;
  tags: string[];
  is_active: boolean;
};

function initForm(book?: AdminBook): FormData {
  return {
    title: book?.title ?? "",
    author: book?.author ?? "",
    category: book?.category ?? "lokal",
    description: book?.description ?? "",
    cover_url: book?.cover_url ?? "",
    open_library_id: book?.open_library_id ?? "",
    total_pages: book?.total_pages ? String(book.total_pages) : "",
    tags: book?.tags ?? [],
    is_active: book?.is_active ?? true,
  };
}

export default function BukuForm({
  book,
  onSubmit,
}: {
  book?: AdminBook;
  onSubmit: (data: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initForm(book));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");

  const [olQuery, setOlQuery] = useState("");
  const [olResults, setOlResults] = useState<OLResult[]>([]);
  const [olLoading, setOlLoading] = useState(false);
  const [olOpen, setOlOpen] = useState(false);

  function set(key: keyof FormData, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function searchOL() {
    if (!olQuery.trim()) return;
    setOlLoading(true);
    setOlResults([]);
    try {
      const url = `https://openlibrary.org/search.json?fields=key,title,author_name,cover_i,number_of_pages_median&limit=6&q=${encodeURIComponent(olQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      setOlResults(data.docs ?? []);
      setOlOpen(true);
    } catch {
      // ignore OL errors
    } finally {
      setOlLoading(false);
    }
  }

  function applyOLResult(r: OLResult) {
    const olId = r.key.replace("/works/", "");
    setForm((prev) => ({
      ...prev,
      title: r.title ?? prev.title,
      author: r.author_name?.[0] ?? prev.author,
      cover_url: r.cover_i
        ? `https://covers.openlibrary.org/b/id/${r.cover_i}-M.jpg`
        : prev.cover_url,
      open_library_id: olId,
      total_pages: r.number_of_pages_median ? String(r.number_of_pages_median) : prev.total_pages,
    }));
    setOlOpen(false);
    setOlQuery("");
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      set("tags", [...form.tags, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    set("tags", form.tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      setError("Judul dan pengarang wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* OL Lookup */}
      <div className="bg-parchment rounded-2xl border border-border p-4">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          Cari di OpenLibrary untuk pre-fill
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Judul atau pengarang…"
            value={olQuery}
            onChange={(e) => setOlQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchOL())}
            className="input flex-1"
          />
          <button
            type="button"
            onClick={searchOL}
            disabled={olLoading || !olQuery.trim()}
            className="btn-secondary px-4"
          >
            <Search size={16} strokeWidth={2} />
          </button>
        </div>

        {olOpen && olResults.length > 0 && (
          <div className="mt-3 space-y-2">
            {olResults.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => applyOLResult(r)}
                className="w-full flex gap-3 items-center p-2.5 rounded-xl border border-border bg-surface hover:border-amber/50 hover:bg-amber-soft/30 transition-all text-left"
              >
                <BookCover
                  src={r.cover_i ? `https://covers.openlibrary.org/b/id/${r.cover_i}-S.jpg` : null}
                  title={r.title}
                  className="w-8 h-11 rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink line-clamp-1">{r.title}</p>
                  <p className="text-xs text-ink-muted">{r.author_name?.[0] ?? "—"}</p>
                </div>
                <span className="text-xs text-amber font-medium flex-shrink-0">Pre-fill →</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOlOpen(false)}
              className="text-xs text-ink-muted hover:text-ink mt-1"
            >
              Tutup
            </button>
          </div>
        )}
        {olLoading && <p className="text-xs text-ink-muted mt-2">Mencari…</p>}
      </div>

      {/* Core fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="input-label">Judul *</label>
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className="input" required />
        </div>
        <div>
          <label className="input-label">Pengarang *</label>
          <input type="text" value={form.author} onChange={(e) => set("author", e.target.value)} className="input" required />
        </div>
        <div>
          <label className="input-label">Kategori *</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as "anak" | "lokal")}
            className="input"
          >
            <option value="lokal">Lokal / Umum</option>
            <option value="anak">Anak</option>
          </select>
        </div>
        <div>
          <label className="input-label">Total Halaman</label>
          <input
            type="number" min={1}
            value={form.total_pages}
            onChange={(e) => set("total_pages", e.target.value)}
            placeholder="cth: 320"
            className="input"
          />
        </div>
        <div>
          <label className="input-label">Open Library ID</label>
          <input
            type="text"
            value={form.open_library_id}
            onChange={(e) => set("open_library_id", e.target.value)}
            placeholder="cth: OL82538W"
            className="input"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="input-label">Cover URL</label>
          <div className="flex gap-3 items-start">
            <input
              type="url"
              value={form.cover_url}
              onChange={(e) => set("cover_url", e.target.value)}
              placeholder="https://covers.openlibrary.org/b/isbn/…"
              className="input flex-1"
            />
            {form.cover_url && (
              <BookCover
                src={form.cover_url}
                title={form.title}
                className="w-12 h-16 rounded-lg flex-shrink-0"
              />
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="input-label">Deskripsi</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Ringkasan singkat buku ini…"
            className="input resize-none"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="input-label">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="cth: petualangan, fiksi, sejarah…"
            className="input flex-1"
          />
          <button type="button" onClick={addTag} className="btn-secondary px-4 text-sm">
            Tambah
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cream text-ink-secondary text-xs font-medium border border-border"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-error">
                  <X size={11} strokeWidth={2.5} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => set("is_active", !form.is_active)}
          className={`w-11 h-6 rounded-full transition-colors relative ${form.is_active ? "bg-forest" : "bg-border"}`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${form.is_active ? "left-5" : "left-0.5"}`}
          />
        </div>
        <span className="text-sm text-ink-secondary">
          {form.is_active ? "Aktif — tampil di discovery" : "Nonaktif — disembunyikan"}
        </span>
      </label>

      {error && (
        <p role="alert" className="text-error text-sm bg-error-soft rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary-lg">
          {saving ? "Menyimpan…" : book ? "Simpan perubahan" : "Tambah buku"}
        </button>
        <button type="button" onClick={() => router.push("/admin/buku")} className="btn-ghost-ink">
          Batal
        </button>
      </div>
    </form>
  );
}
