"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BUKU_ANAK, BUKU_LOKAL, type CuratedBook } from "@/lib/curated-books";
import { BookOpen, Bookmark, Search, ChevronLeft } from "lucide-react";
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

const MOOD_PILLS = [
  { key: "petualangan", label: "Petualangan", tags: ["petualangan", "fantasi"] },
  { key: "inspirasi",   label: "Inspirasi",   tags: ["inspirasi", "pengembangan diri", "pendidikan", "karakter", "edukasi"] },
  { key: "humor",       label: "Humor",        tags: ["humor", "fabel", "cerita rakyat", "legenda", "moral"] },
  { key: "sejarah",     label: "Sejarah",      tags: ["sejarah", "sastra"] },
  { key: "romance",     label: "Romance",      tags: ["romance", "drama", "persahabatan", "keluarga"] },
  { key: "sains",       label: "Sains & Bisnis", tags: ["sains", "filsafat", "non-fiksi", "bisnis", "keuangan"] },
] as const;

type MoodKey = typeof MOOD_PILLS[number]["key"];

const ALL_CURATED = [...BUKU_ANAK, ...BUKU_LOKAL];

function getInspirasiBuku(mood: MoodKey | null): CuratedBook[] {
  if (!mood) {
    // Featured mix: first 4 lokal + first 4 anak
    return [...BUKU_LOKAL.slice(0, 4), ...BUKU_ANAK.slice(0, 4)];
  }
  const moodDef = MOOD_PILLS.find((m) => m.key === mood)!;
  const filtered = ALL_CURATED.filter((b) =>
    b.tags.some((t) => (moodDef.tags as readonly string[]).includes(t))
  );
  return filtered.length >= 2 ? filtered : ALL_CURATED.slice(0, 8);
}

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

function filterCurated(q: string): BookCard[] {
  if (!q.trim()) return [];
  const qLow = q.toLowerCase();
  return ALL_CURATED.filter(
    (b) =>
      b.title.toLowerCase().includes(qLow) ||
      b.author.toLowerCase().includes(qLow) ||
      b.tags.some((t) => t.toLowerCase().includes(qLow))
  ).map(fromCurated);
}

export default function TambahBukuClient({ familyBooks }: { familyBooks: FamilyBook[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeMood, setActiveMood] = useState<MoodKey | null>(null);
  const [curatedResults, setCuratedResults] = useState<BookCard[] | null>(null);
  const [olResults, setOlResults] = useState<BookCard[] | null>(null);
  const [olLoading, setOlLoading] = useState(false);
  const [olError, setOlError] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIdRef = useRef(0);

  const isSearching = curatedResults !== null || olLoading;
  const inspirasiBuku = getInspirasiBuku(activeMood);

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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setCuratedResults(filterCurated(query));
    fetchOL(query);
  }

  function clearSearch() {
    setQuery("");
    setCuratedResults(null);
    setOlResults(null);
    setOlLoading(false);
    setOlError("");
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
      {/* Sticky header */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Link
            href="/rak"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-ink-secondary hover:bg-parchment transition-colors flex-shrink-0"
            aria-label="Kembali ke rak"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </Link>
          <h1 className="text-h2 flex-1">Tambah Buku</h1>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 px-4 pb-3 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Search size={16} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              type="search"
              placeholder="Cari judul atau pengarang…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pl-9"
            />
          </div>
          {query ? (
            <button type="button" onClick={clearSearch} className="btn-ghost-ink px-4 text-sm">
              Batal
            </button>
          ) : (
            <button type="submit" disabled={!query.trim()} className="btn-primary px-5">
              Cari
            </button>
          )}
        </form>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-7">

        {/* ── SEARCH RESULTS ── */}
        {isSearching && (
          <div className="space-y-2">
            {mergedResults.map((card) => (
              <SearchResultCard key={card.id} card={card} adding={adding} onAdd={addBook} />
            ))}
            {olLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card-elevated p-3 flex gap-3 animate-pulse">
                    <div className="w-12 h-16 rounded-lg bg-border flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 bg-border rounded w-3/4" />
                      <div className="h-3 bg-border rounded w-1/2" />
                    </div>
                  </div>
                ))}
                {(curatedResults ?? []).length === 0 && (
                  <p className="text-center text-xs text-ink-muted pt-1">Mencari di OpenLibrary…</p>
                )}
              </div>
            )}
            {olError && <p className="text-xs text-ink-muted text-center py-2">{olError}</p>}
            {noResultsAtAll && (
              <div className="text-center py-10">
                <div className="flex justify-center text-ink-muted mb-3">
                  <Search size={40} strokeWidth={1.25} />
                </div>
                <p className="text-ink-secondary text-sm mb-5">Buku tidak ditemukan di direktori kami.</p>
                <Link href={`/rak/tambah/manual?title=${encodeURIComponent(query)}`} className="btn-primary inline-flex">
                  + Tambah Buku Manual
                </Link>
              </div>
            )}
            {!olLoading && mergedResults.length > 0 && (
              <div className="text-center pt-2 pb-4">
                <p className="text-xs text-ink-muted mb-2">Tidak ada yang cocok?</p>
                <Link href={`/rak/tambah/manual?title=${encodeURIComponent(query)}`} className="btn-ghost-ink inline-flex">
                  + Tambah buku manual
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── DISCOVERY MODE ── */}
        {!isSearching && (
          <>
            {/* 1. Lagi dibaca keluargamu */}
            {familyBooks.length > 0 && (
              <section>
                <h2 className="section-title mb-3">Lagi dibaca keluargamu</h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {familyBooks.map((fb, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-28 bg-surface rounded-xl border border-border p-2"
                    >
                      <BookCover
                        src={fb.coverUrl}
                        title={fb.title}
                        className="w-full h-[88px] rounded-lg mb-2"
                      />
                      <p className="text-xs font-medium text-ink line-clamp-2 leading-tight mb-1">
                        {fb.title}
                      </p>
                      <p className="text-[10px] text-amber font-medium truncate">
                        {fb.memberName}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Mood pills */}
            <section>
              <h2 className="section-title mb-3">Pilih suasana</h2>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {MOOD_PILLS.map((mood) => (
                  <button
                    key={mood.key}
                    onClick={() => setActiveMood(activeMood === mood.key ? null : mood.key)}
                    className={`flex-shrink-0 min-h-[36px] px-4 rounded-full text-sm font-medium border transition-all ${
                      activeMood === mood.key
                        ? "bg-forest text-white border-forest"
                        : "bg-surface border-border text-ink-secondary hover:border-amber/50 hover:text-ink"
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Inspirasi pilihan (grid 2-col) */}
            <section>
              <h2 className="section-title mb-3">
                {activeMood
                  ? `Inspirasi · ${MOOD_PILLS.find((m) => m.key === activeMood)?.label}`
                  : "Inspirasi pilihan"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {inspirasiBuku.map((b) => (
                  <InspirasiBukuCard
                    key={b.title}
                    card={fromCurated(b)}
                    adding={adding}
                    onAdd={addBook}
                  />
                ))}
              </div>
            </section>

            {/* 4 & 5: Horizontal scroll sections — hidden when mood active */}
            {!activeMood && (
              <>
                <section>
                  <div className="section-header">
                    <h2 className="section-title">Penulis Indonesia</h2>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {BUKU_LOKAL.map((b) => (
                      <HScrollCard
                        key={b.title}
                        card={fromCurated(b)}
                        adding={adding}
                        onAdd={addBook}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <div className="section-header">
                    <h2 className="section-title">Untuk Anak</h2>
                  </div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {BUKU_ANAK.map((b) => (
                      <HScrollCard
                        key={b.title}
                        card={fromCurated(b)}
                        adding={adding}
                        onAdd={addBook}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Manual add */}
            <div className="text-center pt-2">
              <p className="text-xs text-ink-muted mb-2">Tidak menemukan buku yang dicari?</p>
              <Link href="/rak/tambah/manual" className="btn-ghost-ink inline-flex">
                + Tambah buku manual
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ────────────────────────────── */

function InspirasiBukuCard({
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
    <div className="card-elevated flex flex-col overflow-hidden">
      <Link href={`/buku/${card.id}`} className="block hover:opacity-90 transition-opacity">
        <BookCover
          src={card.cover_url}
          title={card.title}
          className="w-full h-[130px] rounded-none"
        />
      </Link>
      <div className="p-2.5 flex flex-col gap-2 flex-1">
        <div>
          <Link href={`/buku/${card.id}`}>
            <p className="text-xs font-semibold text-ink line-clamp-2 leading-snug hover:text-amber transition-colors">
              {card.title}
            </p>
          </Link>
          <p className="text-[10px] text-ink-muted mt-0.5 truncate">{card.author}</p>
        </div>
        <div className="flex gap-1.5 mt-auto">
          <button
            onClick={() => onAdd(card, "reading")}
            disabled={!!isAdding}
            className="flex-1 min-h-[36px] rounded-lg bg-amber text-white text-[11px] font-semibold disabled:opacity-40 transition-opacity"
          >
            {adding === card.id + "reading" ? "…" : "Baca"}
          </button>
          <button
            onClick={() => onAdd(card, "want")}
            disabled={!!isAdding}
            className="min-h-[36px] px-2 rounded-lg border border-border text-ink-secondary hover:border-amber/50 transition-colors"
            aria-label="Simpan ke ingin baca"
          >
            <Bookmark size={13} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function HScrollCard({
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
    <div className="flex-shrink-0 w-[108px] bg-surface rounded-xl border border-border p-2 flex flex-col gap-1.5">
      <Link href={`/buku/${card.id}`} className="hover:opacity-90 transition-opacity">
        <BookCover
          src={card.cover_url}
          title={card.title}
          className="w-full h-[84px] rounded-lg"
        />
      </Link>
      <p className="text-[11px] font-medium text-ink line-clamp-2 leading-snug">{card.title}</p>
      <p className="text-[10px] text-ink-muted truncate">{card.author}</p>
      <button
        onClick={() => onAdd(card, "want")}
        disabled={!!isAdding}
        className="mt-auto min-h-[32px] w-full rounded-lg border border-border text-[11px] text-ink-secondary hover:border-amber/60 hover:text-amber disabled:opacity-40 transition-colors"
      >
        {adding === card.id + "want" ? "…" : "+ Simpan"}
      </button>
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
    <div className="card-elevated p-3">
      <div className="flex gap-3">
        <Link href={`/buku/${card.id}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
          <BookCover src={card.cover_url} title={card.title} className="w-12 h-16 rounded-lg" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/buku/${card.id}`}>
            <p className="font-medium text-ink text-sm line-clamp-2 hover:text-amber transition-colors">
              {card.title}
            </p>
          </Link>
          <p className="text-xs text-ink-muted mt-0.5">{card.author}</p>
          {card.description && (
            <p className="text-xs text-ink-secondary mt-1 line-clamp-2 leading-relaxed">
              {card.description}
            </p>
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
              {adding === card.id + "reading" ? "…" : "Sedang Baca"}
            </button>
            <button
              onClick={() => onAdd(card, "want")}
              disabled={!!isAdding}
              className="btn-secondary min-h-[44px] px-3 text-xs flex items-center gap-1.5"
            >
              <Bookmark size={12} strokeWidth={2.5} />
              {adding === card.id + "want" ? "…" : "Mau Baca"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
