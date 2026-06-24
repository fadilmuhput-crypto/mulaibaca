"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Bookmark, BookOpen } from "lucide-react";

function ManualForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [title, setTitle] = useState(params.get("title") ?? "");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState<"reading" | "want">("want");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
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
            cover_url: null,
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
      <div>
        <label className="input-label" htmlFor="title">Judul Buku <span className="text-error">*</span></label>
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
        disabled={loading || !title.trim()}
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
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
        <Link
          href="/rak/tambah"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-secondary hover:text-ink rounded-xl"
        >
          ←
        </Link>
        <h1 className="text-h3">Tambah Buku Manual</h1>
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
