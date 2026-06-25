"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BookCover from "@/components/BookCover";
import { Search, Users, CheckCircle2, AlertCircle, Camera } from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
  open_library_id: string | null;
  total_pages: number | null;
  shelf_items: { count: number }[];
};

type OLResult = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  isbn?: string[];
  number_of_pages_median?: number;
};

type FormData = {
  title: string;
  author: string;
  cover_url: string;
  isbn: string;
  open_library_id: string;
  total_pages: string;
};

export default function EditLibraryClient({ book }: { book: Book }) {
  const router = useRouter();
  const usage = book.shelf_items?.[0]?.count ?? 0;

  const [form, setForm] = useState<FormData>({
    title: book.title ?? "",
    author: book.author ?? "",
    cover_url: book.cover_url ?? "",
    isbn: book.isbn ?? "",
    open_library_id: book.open_library_id ?? "",
    total_pages: book.total_pages ? String(book.total_pages) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [olQuery, setOlQuery] = useState(book.title);
  const [olResults, setOlResults] = useState<OLResult[]>([]);
  const [olLoading, setOlLoading] = useState(false);
  const [olOpen, setOlOpen] = useState(false);

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    setSuccess(false);
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
      const url = `https://openlibrary.org/search.json?fields=key,title,author_name,cover_i,isbn,number_of_pages_median&limit=6&q=${encodeURIComponent(olQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      setOlResults(data.docs ?? []);
      setOlOpen(true);
    } catch {
      // ignore
    } finally {
      setOlLoading(false);
    }
  }

  function applyOLResult(r: OLResult) {
    setForm((prev) => ({
      ...prev,
      title: r.title || prev.title,
      author: r.author_name?.[0] || prev.author,
      cover_url: r.cover_i
        ? `https://covers.openlibrary.org/b/id/${r.cover_i}-M.jpg`
        : prev.cover_url,
      isbn: r.isbn?.[0] || prev.isbn,
      open_library_id: r.key.replace("/works/", "") || prev.open_library_id,
      total_pages: r.number_of_pages_median ? String(r.number_of_pages_median) : prev.total_pages,
    }));
    setOlOpen(false);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Judul wajib diisi"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/library/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          author: form.author || null,
          cover_url: form.cover_url || null,
          isbn: form.isbn || null,
          open_library_id: form.open_library_id || null,
          total_pages: form.total_pages ? Number(form.total_pages) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { key: "cover", label: "Cover", ok: !!form.cover_url },
    { key: "halaman", label: "Halaman", ok: !!form.total_pages },
    { key: "pengarang", label: "Pengarang", ok: !!form.author },
    { key: "isbn", label: "ISBN", ok: !!form.isbn },
  ];
  const filled = fields.filter((f) => f.ok).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Book context */}
      <div className="bg-surface rounded-2xl border border-border p-4 flex gap-4 items-center">
        <BookCover src={form.cover_url || null} title={form.title} className="w-14 h-20 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink">{form.title || "—"}</p>
          <p className="text-sm text-ink-muted">{form.author || "Pengarang belum diisi"}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <Users size={11} strokeWidth={2} />
              {usage} pengguna punya buku ini
            </span>
            <div className="flex gap-1">
              {fields.map((f) => (
                <span
                  key={f.key}
                  title={f.label}
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    f.ok ? "text-forest" : "text-amber/50"
                  }`}
                >
                  {f.ok
                    ? <CheckCircle2 size={14} strokeWidth={2.5} />
                    : <AlertCircle size={14} strokeWidth={2.5} />}
                </span>
              ))}
            </div>
            <span className="text-xs text-ink-muted">{filled}/4 lengkap</span>
          </div>
        </div>
      </div>

      {/* OL lookup */}
      <div className="bg-parchment rounded-2xl border border-border p-4">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
          Cari di OpenLibrary untuk pre-fill
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={olQuery}
            onChange={(e) => setOlQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchOL())}
            placeholder="Judul atau pengarang…"
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
            <button type="button" onClick={() => setOlOpen(false)} className="text-xs text-ink-muted hover:text-ink">
              Tutup
            </button>
          </div>
        )}
        {olLoading && <p className="text-xs text-ink-muted mt-2">Mencari…</p>}
      </div>

      {/* Form fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="input-label">Judul *</label>
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className="input" required />
        </div>
        <div>
          <label className="input-label">Pengarang</label>
          <input type="text" value={form.author} onChange={(e) => set("author", e.target.value)} className="input" placeholder="Nama pengarang" />
        </div>
        <div>
          <label className="input-label">Total Halaman</label>
          <input type="number" min={1} value={form.total_pages} onChange={(e) => set("total_pages", e.target.value)} className="input" placeholder="cth: 320" />
        </div>
        <div>
          <label className="input-label">ISBN</label>
          <input type="text" value={form.isbn} onChange={(e) => set("isbn", e.target.value)} className="input" placeholder="cth: 9780735211292" />
        </div>
        <div>
          <label className="input-label">Open Library ID</label>
          <input type="text" value={form.open_library_id} onChange={(e) => set("open_library_id", e.target.value)} className="input" placeholder="cth: OL82538W" />
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
              <input
                type="url"
                value={form.cover_url}
                onChange={(e) => set("cover_url", e.target.value)}
                className="input"
                placeholder="https://covers.openlibrary.org/b/isbn/…"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="btn-ghost-ink text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                >
                  <Camera size={13} strokeWidth={2} />
                  {uploading ? "Mengupload…" : "Upload foto"}
                </button>
                {uploadError && <span className="text-xs text-error">{uploadError}</span>}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverUpload}
                className="hidden"
                aria-label="Upload foto cover"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-error text-sm bg-error-soft rounded-xl px-4 py-3">{error}</p>
      )}
      {success && (
        <p className="text-forest text-sm bg-forest/8 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 size={16} strokeWidth={2} />
          Data buku berhasil disimpan
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary-lg">
          {saving ? "Menyimpan…" : "Simpan perubahan"}
        </button>
        <button type="button" onClick={() => router.push("/admin/perpustakaan")} className="btn-ghost-ink">
          ← Kembali
        </button>
      </div>
    </form>
  );
}
