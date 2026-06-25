"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CuratedBook } from "@/lib/curated-books";
import { BookOpen, Bookmark, Search, ChevronLeft, X } from "lucide-react";
import BookCover from "@/components/BookCover";
import type { FamilyBook } from "./page";

type OLBook = {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  isbn?: string[];
  number_of_pages_median?: number;
};

type BookCard = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  open_library_id: string | null;
  total_pages: number | null;
  description: string;
  tags: string[];
};

type Section = "semua" | "lokal" | "anak";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "semua",  label: "Semua" },
  { key: "lokal",  label: "Penulis Lokal" },
  { key: "anak",   label: "Untuk Anak" },
];

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function fromCurated(b: CuratedBook): BookCard {
  return {
    id: toSlug(b.title),
    title: b.title,
    author: b.author,
    cover_url: b.cover_url,
    open_library_id: b.open_library_id,
    total_pages: b.total_pages,
    description: b.description,
    tags: b.tags,
  };
}

function fromOL(b: OLBook): BookCard {
  const olId = b.key.replace("/works/", "");
  return {
    id: olId,
    title: b.title,
    author: b.author_name?.[0] ?? "—",
    cover_url: b.cover_i
      ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`
      : null,
    open_library_id: olId,
    total_pages: b.number_of_pages_median ?? null,
    description: "",
    tags: [],
  };
}

export default function TambahBukuClient({
  familyBooks,
  anakBooks,
  lokalBooks,
}: {
  familyBooks: FamilyBook[];
  anakBooks: CuratedBook[];
  lokalBooks: CuratedBook[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [section, setSection] = useState<Section>("semua");
  const [curatedResults, setCuratedResults] = useState<BookCard[] | null>(null);
  const [olResults, setOlResults] = useState<BookCard[] | null>(null);
  const [olLoading, setOlLoading] = useState(false);
  const [olError, setOlError] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCurated = [...lokalBooks, ...anakBooks];

  // Pick featured: first curated book with cover + description
  const featured = allCurated.find((b) => b.cover_url && b.description);

  // Books to show in grid based on section
  const displayBooks: CuratedBook[] =
    section === "lokal" ? lokalBooks
    : section === "anak" ? anakBooks
    : allCurated;

  function filterCurated(q: string): BookCard[] {
    if (!q.trim()) return [];
    const qLow = q.toLowerCase();
    return allCurated
      .filter(
        (b) =>
          b.title.toLowerCase().includes(qLow) ||
          b.author.toLowerCase().includes(qLow) ||
          b.tags.some((t) => t.toLowerCase().includes(qLow))
      )
      .map(fromCurated);
  }

  const isSearching = curatedResults !== null || olLoading;

  useEffect(() => {
    if (!query.trim()) {
      setCuratedResults(null);
      setOlResults(null);
      setOlLoading(false);
      setOlError("");
      return;
    }
    setCuratedResults(filterCurated(query));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOL(query), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function fetchOL(q: string) {
    const searchId = ++searchIdRef.current;
    setOlLoading(true);
    setOlError("");
    try {
      const url = `https://openlibrary.org/search.json?fields=key,title,author_name,cover_i,isbn,number_of_pages_median&limit=12&q=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (searchId !== searchIdRef.current) return;
      const olCards = (data.docs ?? []).map(fromOL);
      const curated = filterCurated(q);
      const seen = new Set(curated.map((b) => b.title.toLowerCase()));
      setOlResults(olCards.filter((b: BookCard) => !seen.has(b.title.toLowerCase())));
    } catch {
      if (searchId !== searchIdRef.current) return;
      setOlError("Gagal memuat dari OpenLibrary.");
    } finally {
      if (searchId !== searchIdRef.current) return;
      setOlLoading(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setCuratedResults(null);
    setOlResults(null);
    setOlLoading(false);
    setOlError("");
    inputRef.current?.blur();
  }

  async function addBook(card: BookCard, status: "reading" | "want") {
    const key = card.id + status;
    setAdding(key);
    try {
      const res = await fetch("/api/shelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book: {
            title: card.title,
            author: card.author,
            cover_url: card.cover_url,
            isbn: null,
            open_library_id: card.open_library_id,
            total_pages: card.total_pages,
          },
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/rak");
    } catch (err) {
      setOlError(err instanceof Error ? err.message : "Gagal menambahkan buku");
    } finally {
      setAdding(null);
    }
  }

  const mergedResults = [...(curatedResults ?? []), ...(olResults ?? [])];
  const noResultsAtAll = isSearching && mergedResults.length === 0 && !olLoading;

  return (
    <div className="min-h-screen bg-parchment pb-24">
      {/* ── Sticky header ── */}
      <header className="bg-surface border-b-2 border-ink sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Link
            href="/rak"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-ink-secondary hover:bg-parchment transition-colors flex-shrink-0"
            aria-label="Kembali ke rak"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </Link>
          <div className="relative flex-1">
            <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Cari judul, pengarang, atau genre…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-9 pr-9 w-full"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-ink-muted hover:text-ink"
                aria-label="Hapus pencarian"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4">

        {/* ── SEARCH RESULTS ── */}
        {isSearching ? (
          <div className="py-5 space-y-2">
            {mergedResults.map((card) => (
              <SearchResultCard key={card.id} card={card} adding={adding} onAdd={addBook} />
            ))}

            {olLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface rounded-2xl border border-border p-3 flex gap-3 animate-pulse">
                    <div className="w-12 h-16 rounded-lg bg-border flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-border rounded w-3/4" />
                      <div className="h-3 bg-border rounded w-1/2" />
                    </div>
                  </div>
                ))}
                {(curatedResults ?? []).length === 0 && (
                  <p className="text-center text-xs text-ink-muted pt-1">Mencari di katalog OpenLibrary…</p>
                )}
              </div>
            )}

            {olError && <p className="text-xs text-ink-muted text-center py-2">{olError}</p>}

            {noResultsAtAll && (
              <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
                <div className="text-4xl mb-3">📚</div>
                <p className="font-semibold text-ink text-sm mb-1">"{query}" tidak ditemukan</p>
                <p className="text-xs text-ink-muted mb-5">Coba kata kunci lain, atau tambahkan buku ini secara manual.</p>
                <Link href={`/rak/tambah/manual?title=${encodeURIComponent(query)}`} className="btn-primary inline-flex">
                  + Tambah buku ini manual
                </Link>
              </div>
            )}

            {!olLoading && mergedResults.length > 0 && (
              <div className="rounded-xl bg-parchment border border-border p-4 flex items-center justify-between gap-3">
                <p className="text-xs text-ink-secondary">Tidak menemukan yang cocok?</p>
                <Link href={`/rak/tambah/manual?title=${encodeURIComponent(query)}`} className="btn-ghost-ink text-xs">
                  + Tambah manual
                </Link>
              </div>
            )}
          </div>

        ) : (
          /* ── DISCOVERY MODE ── */
          <div className="py-5 space-y-8">

            {/* Family reading */}
            {familyBooks.length > 0 && (
              <section>
                <SectionLabel>Sedang dibaca keluarga</SectionLabel>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
                  {familyBooks.map((fb, i) => (
                    <div key={i} className="flex-shrink-0 w-24">
                      <BookCover src={fb.coverUrl} title={fb.title} className="w-full h-[88px] rounded-xl mb-1.5" />
                      <p className="text-[11px] font-medium text-ink line-clamp-2 leading-tight">{fb.title}</p>
                      <p className="text-[10px] text-amber font-semibold truncate mt-0.5">{fb.memberName}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Featured book — library spotlight */}
            {featured && (
              <section>
                <SectionLabel>Pilihan editorial</SectionLabel>
                <FeaturedCard card={fromCurated(featured)} adding={adding} onAdd={addBook} />
              </section>
            )}

            {/* Section tabs */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel className="mb-0">Koleksi kami</SectionLabel>
                <div className="flex gap-1 bg-parchment rounded-xl p-1 border border-border">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSection(s.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        section === s.key
                          ? "bg-ink text-white"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3-col book grid — library shelf feel */}
              <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                {displayBooks.map((b) => (
                  <ShelfBookCard
                    key={b.title}
                    card={fromCurated(b)}
                    adding={adding}
                    onAdd={addBook}
                  />
                ))}
              </div>

              {displayBooks.length === 0 && (
                <p className="text-center text-sm text-ink-muted py-8">Belum ada buku di bagian ini.</p>
              )}
            </section>

            {/* Manual add */}
            <div className="border-t-2 border-dashed border-border pt-6 text-center">
              <p className="text-xs text-ink-muted mb-3">Tidak menemukan buku yang dicari?</p>
              <Link href="/rak/tambah/manual" className="btn-ghost-ink inline-flex">
                + Tambah buku manual
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Helper components ─────────────────────────────── */

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-[11px] font-black text-ink-muted uppercase tracking-[0.12em] mb-3 ${className}`}>
      {children}
    </h2>
  );
}

function FeaturedCard({
  card,
  adding,
  onAdd,
}: {
  card: BookCard;
  adding: string | null;
  onAdd: (card: BookCard, status: "reading" | "want") => void;
}) {
  const isAdding = adding?.startsWith(card.id);
  return (
    <div
      className="bg-surface rounded-2xl overflow-hidden flex gap-4 p-4"
      style={{ border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal-sm)" }}
    >
      <BookCover src={card.cover_url} title={card.title} className="w-[72px] h-[100px] rounded-xl flex-shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-[10px] font-black text-amber uppercase tracking-[0.1em] mb-1">★ Pilihan</span>
        <p className="font-display font-bold text-ink text-base leading-snug line-clamp-2">{card.title}</p>
        <p className="text-xs text-ink-muted mt-0.5 mb-2">{card.author}</p>
        {card.description && (
          <p className="text-xs text-ink-secondary leading-relaxed line-clamp-3 mb-3">{card.description}</p>
        )}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onAdd(card, "reading")}
            disabled={!!isAdding}
            className="flex items-center gap-1.5 bg-ink text-white text-xs font-semibold px-3 min-h-[34px] rounded-lg hover:bg-ink/80 transition-colors disabled:opacity-40"
          >
            <BookOpen size={12} strokeWidth={2.5} />
            {adding === card.id + "reading" ? "…" : "Baca Sekarang"}
          </button>
          <button
            onClick={() => onAdd(card, "want")}
            disabled={!!isAdding}
            className="min-h-[34px] px-3 rounded-lg border border-border text-ink-secondary hover:border-amber/50 hover:text-amber transition-colors"
            aria-label="Simpan ke ingin baca"
          >
            <Bookmark size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShelfBookCard({
  card,
  adding,
  onAdd,
}: {
  card: BookCard;
  adding: string | null;
  onAdd: (card: BookCard, status: "reading" | "want") => void;
}) {
  const isAdding = adding?.startsWith(card.id);
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Cover — tap to toggle actions */}
      <div className="relative" onClick={() => setShowActions((v) => !v)}>
        <BookCover
          src={card.cover_url}
          title={card.title}
          className="w-full h-[120px] rounded-xl cursor-pointer"
        />
        {showActions && (
          <div className="absolute inset-0 bg-ink/70 rounded-xl flex flex-col items-center justify-center gap-2 p-2">
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(card, "reading"); }}
              disabled={!!isAdding}
              className="w-full py-1.5 rounded-lg bg-amber text-white text-[11px] font-bold disabled:opacity-50"
            >
              {adding === card.id + "reading" ? "…" : "Baca"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(card, "want"); }}
              disabled={!!isAdding}
              className="w-full py-1.5 rounded-lg bg-white/10 border border-white/30 text-white text-[11px] font-semibold disabled:opacity-50"
            >
              {adding === card.id + "want" ? "…" : "Simpan"}
            </button>
          </div>
        )}
      </div>
      <p className="text-[11px] font-semibold text-ink line-clamp-2 leading-snug mt-1.5">{card.title}</p>
      <p className="text-[10px] text-ink-muted truncate mt-0.5">{card.author}</p>
    </div>
  );
}

function SearchResultCard({
  card,
  adding,
  onAdd,
}: {
  card: BookCard;
  adding: string | null;
  onAdd: (card: BookCard, status: "reading" | "want") => void;
}) {
  const isAdding = adding?.startsWith(card.id);
  return (
    <div className="bg-surface rounded-2xl border border-border p-3">
      <div className="flex gap-3">
        <BookCover src={card.cover_url} title={card.title} className="w-12 h-16 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ink text-sm line-clamp-2">{card.title}</p>
          <p className="text-xs text-ink-muted mt-0.5">{card.author}</p>
          {card.description && (
            <p className="text-xs text-ink-secondary mt-1 line-clamp-2 leading-relaxed">{card.description}</p>
          )}
          {card.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {card.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="badge">{tag}</span>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={() => onAdd(card, "reading")}
              disabled={!!isAdding}
              className="btn-primary-sm flex items-center gap-1.5"
            >
              <BookOpen size={12} strokeWidth={2.5} />
              {adding === card.id + "reading" ? "…" : "Baca"}
            </button>
            <button
              onClick={() => onAdd(card, "want")}
              disabled={!!isAdding}
              className="btn-secondary min-h-[44px] px-3 text-xs flex items-center gap-1.5"
            >
              <Bookmark size={12} strokeWidth={2.5} />
              {adding === card.id + "want" ? "…" : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
