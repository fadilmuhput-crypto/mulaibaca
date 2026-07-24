"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BookCover from "@/components/BookCover";
import { Search, X, Camera, Sparkles } from "lucide-react";
import type { AdminBook } from "./page";
import { CATEGORY_TREE, findSubCategory } from "@/lib/category-tree";

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
  description: string;
  cover_url: string;
  open_library_id: string;
  isbn: string;
  total_pages: string;
  categories: string[];
  tags: string[];
  publisher: string;
  published_year: string;
  language: string;
  is_active: boolean;
};

function initForm(book?: AdminBook): FormData {
  return {
    title: book?.title ?? "",
    author: book?.author ?? "",
    description: book?.description ?? "",
    cover_url: book?.cover_url ?? "",
    open_library_id: book?.open_library_id ?? "",
    isbn: book?.isbn ?? "",
    total_pages: book?.total_pages ? String(book.total_pages) : "",
    categories: book?.categories ?? [],
    tags: book?.tags ?? [],
    publisher: book?.publisher ?? "",
    published_year: book?.published_year ? String(book.published_year) : "",
    language: book?.language ?? "id",
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [olQuery, setOlQuery] = useState("");
  const [olResults, setOlResults] = useState<OLResult[]>([]);
  const [olLoading, setOlLoading] = useState(false);
  const [olOpen, setOlOpen] = useState(false);

  const [aiEnriching, setAiEnriching] = useState(false);
  const [aiEnrichError, setAiEnrichError] = useState("");

  function set(key: keyof FormData, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/cover", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal upload");
      set("cover_url", data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal upload foto");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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

  async function aiEnrich() {
    if (!book?.id) return;
    setAiEnriching(true);
    setAiEnrichError("");
    try {
      const res = await fetch("/api/books/ai-enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id }),
      });
      const data = await res.json();
      if (data.error) {
        setAiEnrichError(data.error);
        return;
      }
      if (data.updated?.length === 0) {
        setAiEnrichError("Tidak ada field baru yang bisa diisi.");
        return;
      }
      setForm((prev) => {
        const next = { ...prev };
        if (data.description && typeof data.description === "string") {
          next.description = data.description;
        }
        if (data.categories && Array.isArray(data.categories)) {
          next.categories = data.categories;
        }
        if (data.tags && Array.isArray(data.tags)) {
          next.tags = data.tags;
        }
        return next;
      });
    } catch {
      setAiEnrichError("Gagal terhubung ke AI");
    } finally {
      setAiEnriching(false);
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
    if (!form.total_pages || Number(form.total_pages) < 1) {
      setError("Total halaman wajib diisi");
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

      {/* AI Enrich (edit mode only) */}
      {book?.id && (
        <div className="bg-purple-50/50 rounded-2xl border border-purple-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600" /> AI Enrichment
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                Generate deskripsi, kategori, dan tags otomatis pakai AI. Hasilnya bisa dicek dulu sebelum disimpan.
              </p>
            </div>
            <button
              type="button"
              onClick={aiEnrich}
              disabled={aiEnriching}
              className="btn-secondary text-sm flex items-center gap-1.5 px-4 py-2 disabled:opacity-50"
            >
              <Sparkles size={14} className={aiEnriching ? "animate-pulse" : ""} />
              {aiEnriching ? "Memproses…" : "AI Enrich"}
            </button>
          </div>
          {aiEnrichError && (
            <p className="text-xs text-error mt-2 bg-error-soft rounded-lg px-3 py-2">{aiEnrichError}</p>
          )}
        </div>
      )}

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
          <label className="input-label">ISBN</label>
          <input type="text" value={form.isbn} onChange={(e) => set("isbn", e.target.value)} className="input" placeholder="cth: 9780735211292" />
        </div>
        <div>
          <label className="input-label">Penerbit</label>
          <input type="text" value={form.publisher} onChange={(e) => set("publisher", e.target.value)} className="input" placeholder="Nama penerbit" />
        </div>
        <div>
          <label className="input-label">Tahun Terbit</label>
          <input type="number" min={1000} max={2099} value={form.published_year} onChange={(e) => set("published_year", e.target.value)} className="input" placeholder="cth: 2024" />
        </div>
        <div>
          <label className="input-label">Total Halaman *</label>
          <input type="number" min={1} value={form.total_pages} onChange={(e) => set("total_pages", e.target.value)} placeholder="cth: 320" className="input" required />
        </div>
        <div>
          <label className="input-label">Open Library ID</label>
          <input type="text" value={form.open_library_id} onChange={(e) => set("open_library_id", e.target.value)} placeholder="cth: OL82538W" className="input" />
        </div>
        <div>
          <label className="input-label">Bahasa</label>
          <select value={form.language} onChange={(e) => set("language", e.target.value)} className="input">
            <option value="id">Indonesia</option>
            <option value="en">Inggris</option>
            <option value="ar">Arab</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="input-label">Cover</label>
          <div className="flex gap-3 items-start">
            <div className="relative flex-shrink-0">
              <BookCover src={form.cover_url || null} title={form.title} className="w-14 h-20 rounded-lg" />
              {uploading && (
                <div className="absolute inset-0 bg-ink/40 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <input type="url" value={form.cover_url} onChange={(e) => set("cover_url", e.target.value)} placeholder="https://covers.openlibrary.org/b/isbn/…" className="input" />
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-ghost-ink text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
                  <Camera size={13} strokeWidth={2} />
                  {uploading ? "Mengupload…" : "Upload foto"}
                </button>
                {uploadError && <span className="text-xs text-error">{uploadError}</span>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} className="hidden" aria-label="Upload foto cover" />
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="input-label">Deskripsi</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Ringkasan singkat buku ini…" className="input resize-none" />
        </div>
      </div>

      {/* Kategori dari CATEGORY_TREE */}
      <div>
        <label className="input-label">Kategori</label>
        {form.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {form.categories.map((key) => {
              const sub = findSubCategory(key);
              return (
                <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-forest text-white text-xs font-semibold">
                  {sub?.label ?? key}
                  <button type="button" onClick={() => set("categories", form.categories.filter((c) => c !== key))} className="hover:text-white/70 ml-0.5">
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </span>
              );
            })}
          </div>
        )}
        <div className="rounded-xl border border-border bg-parchment p-3 space-y-3">
          {CATEGORY_TREE.map((root) => (
            <div key={root.key}>
              <p className="text-[10px] font-semibold text-ink-secondary mb-1.5">{root.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {root.children.map((sub) => {
                  const active = form.categories.includes(sub.key);
                  return (
                    <button
                      key={sub.key}
                      type="button"
                      onClick={() => {
                        if (active) {
                          set("categories", form.categories.filter((c: string) => c !== sub.key));
                        } else {
                          set("categories", [...form.categories, sub.key]);
                        }
                      }}
                      className={`text-[11px] px-2 py-1 rounded-lg border transition-all ${
                        active
                          ? "bg-forest text-white border-forest font-semibold"
                          : "bg-surface border-border text-ink-secondary hover:border-amber/50 hover:text-ink"
                      }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="input-label">Tags</label>
        <div className="flex gap-2 mb-2">
          <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Ketik tag lalu Enter…" className="input flex-1" />
          <button type="button" onClick={addTag} className="btn-secondary px-4 text-sm">Tambah</button>
        </div>
        {form.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {form.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-soft text-amber text-xs font-semibold border border-amber/30">
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
