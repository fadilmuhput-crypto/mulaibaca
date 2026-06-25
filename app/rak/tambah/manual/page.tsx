"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bookmark, BookOpen, Camera, X, ChevronLeft } from "lucide-react";
import BookCover from "@/components/BookCover";

function ManualForm() {
  const router = useRouter();
  const params = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(params.get("title") ?? "");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState<"reading" | "want">("want");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cover upload state
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    setCoverPreview(URL.createObjectURL(file));
    setCoverUrl(null);
    setUploadError("");
    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/cover", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal upload foto");
      setCoverUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal upload foto");
      setCoverPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function removeCover() {
    setCoverPreview(null);
    setCoverUrl(null);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (uploading) { setError("Tunggu foto selesai diupload"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: {
            title: title.trim(),
            author: author.trim() || null,
            cover_url: coverUrl ?? null,
            isbn: null,
            open_library_id: null,
            total_pages: pages ? parseInt(pages) : null,
          },
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/rak");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan buku");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Cover upload */}
      <div>
        <p className="input-label mb-2">
          Foto Cover <span className="text-ink-muted font-normal">(opsional)</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverChange}
          className="hidden"
          aria-label="Upload foto cover buku"
        />
        {!coverPreview ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-28 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-ink-muted hover:border-amber/50 hover:text-amber hover:bg-amber-soft/20 transition-all"
          >
            <Camera size={28} strokeWidth={1.5} />
            <span className="text-sm">Ambil foto atau pilih dari galeri</span>
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <BookCover
                src={coverPreview}
                title={title || "Cover"}
                className="w-20 h-[108px] rounded-xl"
              />
              {uploading && (
                <div className="absolute inset-0 bg-ink/40 rounded-xl flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {uploading && <p className="text-sm text-ink-secondary">Mengupload foto…</p>}
              {!uploading && coverUrl && (
                <p className="text-sm text-forest font-medium">Foto berhasil diupload</p>
              )}
              {uploadError && <p className="text-sm text-error">{uploadError}</p>}
              <button
                type="button"
                onClick={removeCover}
                className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted hover:text-error transition-colors"
              >
                <X size={12} strokeWidth={2.5} />
                Hapus foto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="input-label" htmlFor="title">
          Judul Buku <span className="text-error">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul buku"
          className="input mt-1"
          required
          autoFocus
        />
      </div>

      {/* Author */}
      <div>
        <label className="input-label" htmlFor="author">Pengarang</label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Nama pengarang (opsional)"
          className="input mt-1"
        />
      </div>

      {/* Pages */}
      <div>
        <label className="input-label" htmlFor="pages">Jumlah Halaman</label>
        <input
          id="pages"
          type="number"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="Contoh: 320"
          className="input mt-1"
          min={1}
        />
        <p className="input-hint">Untuk tracking progress membaca</p>
      </div>

      {/* Status */}
      <div>
        <p className="input-label mb-2">Tambahkan ke</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStatus("want")}
            className={`min-h-[64px] rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${
              status === "want"
                ? "border-amber bg-amber-soft text-amber"
                : "border-border text-ink-secondary hover:border-amber/40"
            }`}
          >
            <Bookmark size={20} strokeWidth={1.75} />
            Mau Baca
          </button>
          <button
            type="button"
            onClick={() => setStatus("reading")}
            className={`min-h-[64px] rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${
              status === "reading"
                ? "border-forest bg-success-soft text-forest"
                : "border-border text-ink-secondary hover:border-forest/40"
            }`}
          >
            <BookOpen size={20} strokeWidth={1.75} />
            Sedang Baca
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-soft border border-error/20 rounded-xl px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || uploading || !title.trim()}
        className="btn-primary-full-lg"
      >
        {loading ? "Menyimpan…" : "Simpan ke Rak"}
      </button>
    </form>
  );
}

export default function ManualPage() {
  return (
    <div className="min-h-screen bg-parchment pb-10">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Link
            href="/rak/tambah"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-secondary hover:text-ink rounded-xl"
            aria-label="Kembali"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </Link>
          <h1 className="text-h3">Tambah Buku Manual</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <p className="text-body-sm text-ink-secondary mb-6">
          Tidak menemukan buku yang dicari? Isi informasi buku secara manual.
        </p>
        <Suspense fallback={null}>
          <ManualForm />
        </Suspense>
      </main>
    </div>
  );
}
