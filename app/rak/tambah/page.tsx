"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type OLBook = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  isbn?: string[];
  number_of_pages_median?: number;
};

export default function TambahBukuPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OLBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&fields=key,title,author_name,cover_i,isbn,number_of_pages_median&limit=10`
      );
      const data = await res.json();
      setResults(data.docs ?? []);
      if ((data.docs ?? []).length === 0) setError("Buku tidak ditemukan");
    } catch {
      setError("Gagal mencari buku");
    } finally {
      setLoading(false);
    }
  }

  async function addBook(book: OLBook, status: "reading" | "want") {
    const key = book.key;
    setAdding(key + status);
    try {
      const coverUrl = book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : null;
      const olId = book.key.replace("/works/", "");
      const res = await fetch("/api/shelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: {
            title: book.title,
            author: book.author_name?.[0] ?? null,
            cover_url: coverUrl,
            isbn: book.isbn?.[0] ?? null,
            open_library_id: olId,
            total_pages: book.number_of_pages_median ?? null,
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
      setAdding(null);
    }
  }

  return (
    <div className="min-h-screen bg-parchment pb-20">
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/rak" className="text-ink-secondary hover:text-ink text-lg">←</Link>
        <h1 className="font-display font-semibold text-ink">Tambah Buku</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="search"
            placeholder="Cari judul atau pengarang…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-3 bg-amber text-white rounded-xl font-medium hover:bg-amber-hover transition-colors disabled:opacity-60"
          >
            {loading ? "…" : "Cari"}
          </button>
        </form>

        {error && <p className="text-center text-red-400 text-sm mb-4">{error}</p>}

        <div className="space-y-3">
          {results.map((book) => {
            const coverUrl = book.cover_i
              ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
              : null;
            const isAdding = adding?.startsWith(book.key);
            return (
              <div
                key={book.key}
                className="bg-surface rounded-2xl border border-border p-3 flex gap-3"
              >
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                  {coverUrl ? (
                    <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📗</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink text-sm line-clamp-2">{book.title}</p>
                  {book.author_name?.[0] && (
                    <p className="text-xs text-ink-muted mt-0.5">{book.author_name[0]}</p>
                  )}
                  {book.number_of_pages_median && (
                    <p className="text-xs text-ink-muted">{book.number_of_pages_median} hal</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => addBook(book, "reading")}
                      disabled={!!isAdding}
                      className="text-xs bg-amber text-white px-3 py-1 rounded-lg font-medium hover:bg-amber-hover transition-colors disabled:opacity-60"
                    >
                      {adding === book.key + "reading" ? "…" : "Sedang Baca"}
                    </button>
                    <button
                      onClick={() => addBook(book, "want")}
                      disabled={!!isAdding}
                      className="text-xs bg-surface border border-border text-ink-secondary px-3 py-1 rounded-lg hover:border-amber/50 transition-colors disabled:opacity-60"
                    >
                      {adding === book.key + "want" ? "…" : "Mau Baca"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
