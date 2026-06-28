"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, BookOpen, ChevronRight } from "lucide-react";
import BookCover from "@/components/BookCover";
import { BUKU_LOKAL, BUKU_ANAK } from "@/lib/curated-books";

type BookOption = {
  title: string;
  author: string;
  cover_url: string | null;
  open_library_id: string | null;
  total_pages: number | null;
};

const ALL_CURATED: BookOption[] = [...BUKU_LOKAL, ...BUKU_ANAK];

function searchCurated(q: string): BookOption[] {
  const low = q.toLowerCase();
  return ALL_CURATED.filter(
    (b) => b.title.toLowerCase().includes(low) || b.author.toLowerCase().includes(low)
  ).slice(0, 6);
}

type OLDoc = {
  title: string;
  author_name?: string[];
  cover_edition_key?: string;
  number_of_pages_median?: number;
  key: string;
};

function olToBook(doc: OLDoc): BookOption {
  return {
    title: doc.title,
    author: doc.author_name?.[0] ?? "Pengarang tidak diketahui",
    cover_url: doc.cover_edition_key
      ? `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-M.jpg`
      : null,
    open_library_id: doc.key.replace("/works/", ""),
    total_pages: doc.number_of_pages_median ?? null,
  };
}

export default function OnboardingBukuPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [curatedResults, setCuratedResults] = useState<BookOption[]>([]);
  const [olResults, setOlResults] = useState<BookOption[]>([]);
  const [olLoading, setOlLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleQuery = useCallback((q: string) => {
    setQuery(q);
    setError("");
    if (!q.trim() || q.length < 2) {
      setCuratedResults([]);
      setOlResults([]);
      setOlLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    setCuratedResults(searchCurated(q));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setOlLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10&fields=title,author_name,cover_edition_key,number_of_pages_median,key`
        );
        const data = await res.json();
        const docs: OLDoc[] = data.docs ?? [];
        const curatedTitles = new Set(searchCurated(q).map((b) => b.title.toLowerCase()));
        const ol = docs
          .filter((d) => d.title && !curatedTitles.has(d.title.toLowerCase()))
          .slice(0, 5)
          .map(olToBook);
        setOlResults(ol);
      } catch {
        setOlResults([]);
      } finally {
        setOlLoading(false);
      }
    }, 600);
  }, []);

  async function addBook(book: BookOption) {
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/shelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: {
            title: book.title,
            author: book.author,
            cover_url: book.cover_url,
            isbn: null,
            open_library_id: book.open_library_id,
            total_pages: book.total_pages,
          },
          status: "reading",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menambahkan buku");
      const params = new URLSearchParams({
        id: data.id,
        title: book.title,
        cover: book.cover_url ?? "",
      });
      router.push(`/onboarding/log?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan buku");
      setAdding(false);
    }
  }

  const allResults = [...curatedResults, ...olResults];
  const showResults = query.trim().length >= 2;

  return (
    <div className="min-h-dvh bg-parchment flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-4 pt-8 pb-4">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="text-xl font-display font-bold text-forest">
            mulaibaca
          </Link>
        </div>
      </header>

      {/* Step indicator */}
      <div className="flex-shrink-0 px-4 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-1.5">
              <div className="w-6 h-1.5 rounded-full bg-amber" />
              <div className="w-6 h-1.5 rounded-full bg-border" />
            </div>
            <span className="text-xs text-ink-muted font-medium">Langkah 1 dari 2</span>
          </div>
          <h1 className="text-h1 mt-3">Sedang baca buku apa?</h1>
          <p className="text-sm text-ink-muted mt-1">
            Cari buku yang sedang kamu baca sekarang untuk mulai melacak bacaanmu.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-4">
        <div className="max-w-lg mx-auto">
          <div className="relative">
            <Search
              size={16}
              strokeWidth={2}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Ketik judul atau nama pengarang…"
              className="input input-icon-l w-full"
              disabled={adding}
              autoComplete="off"
            />
          </div>
          {error && (
            <p className="text-error text-sm mt-2 bg-error-soft rounded-xl px-3 py-2">{error}</p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-2">
          {adding && (
            <div className="flex items-center justify-center py-12 gap-3 text-ink-muted">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Menambahkan ke rak…</span>
            </div>
          )}

          {!adding && !showResults && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-amber-soft flex items-center justify-center mx-auto mb-4">
                <BookOpen size={26} strokeWidth={1.75} className="text-amber" />
              </div>
              <p className="text-sm font-semibold text-ink">Cari bukumu di atas</p>
              <p className="text-xs text-ink-muted mt-1 max-w-xs mx-auto">
                Ketik minimal 2 huruf — kami cari dari koleksi kurasi dan OpenLibrary
              </p>
            </div>
          )}

          {!adding && showResults && allResults.length === 0 && !olLoading && (
            <div className="text-center py-8">
              <p className="text-sm font-semibold text-ink">Buku tidak ditemukan</p>
              <p className="text-xs text-ink-muted mt-1">
                Coba kata kunci lain, atau{" "}
                <button
                  onClick={() => addBook({ title: query.trim(), author: "Pengarang tidak diketahui", cover_url: null, open_library_id: null, total_pages: null })}
                  className="text-amber font-semibold hover:text-amber-hover"
                >
                  tambah manual
                </button>
              </p>
            </div>
          )}

          {!adding && showResults && allResults.map((book, i) => (
            <button
              key={`${book.title}-${i}`}
              onClick={() => addBook(book)}
              className="w-full bg-surface rounded-2xl border border-border p-3.5 flex items-center gap-3 text-left hover:border-amber/50 hover:bg-amber-soft/20 transition-all group"
            >
              <BookCover
                src={book.cover_url}
                title={book.title}
                className="w-9 h-12 rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{book.title}</p>
                <p className="text-xs text-ink-muted truncate mt-0.5">{book.author}</p>
                {book.total_pages && (
                  <p className="text-xs text-ink-muted mt-0.5">{book.total_pages} hal</p>
                )}
              </div>
              <ChevronRight
                size={16}
                strokeWidth={2}
                className="flex-shrink-0 text-ink-muted group-hover:text-amber transition-colors"
              />
            </button>
          ))}

          {!adding && showResults && olLoading && (
            <div className="flex items-center justify-center py-6 gap-2 text-ink-muted">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs">Mencari di OpenLibrary…</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer skip */}
      <div className="flex-shrink-0 px-4 pb-8 pt-4 border-t border-border bg-parchment">
        <div className="max-w-lg mx-auto text-center">
          <Link
            href="/dashboard"
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Lewati untuk sekarang →
          </Link>
        </div>
      </div>
    </div>
  );
}
