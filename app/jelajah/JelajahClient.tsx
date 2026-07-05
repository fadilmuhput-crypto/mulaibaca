"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Book } from "@/lib/books";
import { CATEGORY_TREE, findSubCategory, countBooksInCategory } from "@/lib/category-tree";
import { Bookmark, Search, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import BookCover from "@/components/BookCover";
import type { FamilyBook } from "./page";
import type { JelajahSection, BannerConfig } from "@/lib/jelajah-sections";

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
  isLokal: boolean;
  publisher: string | null;
  published_year: number | null;
  rating_avg: number | null;
  rating_count: number;
  shelf_count: number;
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function bookUrl(card: BookCard): string {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(card.id);
  if (isUUID || /^OL\d+/i.test(card.id)) {
    return `/buku/${toSlug(card.title)}-${card.id.toLowerCase()}`;
  }
  return `/buku/${card.id}`;
}

function fromBook(b: Book): BookCard {
  const allTags = [...new Set([
    ...(b.categories ?? []),
    ...(b.tags ?? []),
  ])];
  return {
    id: b.id ?? toSlug(b.title),
    title: b.title,
    author: b.author,
    cover_url: b.cover_url,
    open_library_id: b.open_library_id,
    total_pages: b.total_pages,
    description: b.description,
    tags: allTags,
    isLokal: false,
    publisher: b.publisher ?? null,
    published_year: b.published_year ?? null,
    rating_avg: b.rating_avg ?? null,
    rating_count: b.rating_count ?? 0,
    shelf_count: b.shelf_count ?? 0,
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
    isLokal: false,
    publisher: null,
    published_year: null,
    rating_avg: null,
    rating_count: 0,
    shelf_count: 0,
  };
}

// Books augmented with combined categories + tags for category matching
function augmentBooks(books: Book[]): Book[] {
  return books.map((b) => ({
    ...b,
    tags: [...new Set([...(b.categories ?? []), ...b.tags])],
  }));
}

// ── Age group helper ─────────────────────────────────────────────────────────

type AgeGroup = "balita" | "anak-awal" | "anak-akhir" | null;

function getAgeGroup(age: number | null): AgeGroup {
  if (age === null) return null;
  if (age <= 3) return "balita";
  if (age <= 8) return "anak-awal";
  if (age <= 12) return "anak-akhir";
  return null;
}

const AGE_GROUPS: { key: AgeGroup; label: string; desc: string; matchTags: string[] }[] = [
  { key: "balita",     label: "Balita (0–3)",    desc: "Buku bergambar & board book", matchTags: ["balita", "toddler", "board book", "picture book"] },
  { key: "anak-awal", label: "Anak Awal (4–8)", desc: "Cerita rakyat & early reader", matchTags: ["anak", "cerita anak", "children"] },
  { key: "anak-akhir",label: "Anak Akhir (9–12)",desc: "Novel & chapter book",         matchTags: ["anak", "chapter book"] },
];

export default function JelajahClient({
  familyBooks,
  allBooks,
  sections,
  trendingBooks,
  personalBooks,
  memberType,
  memberAge,
  memberName,
}: {
  familyBooks: FamilyBook[];
  allBooks: Book[];
  sections: JelajahSection[];
  trendingBooks: Book[];
  personalBooks: Book[];
  memberType: "ayah" | "ibu" | "anak" | "dewasa";
  memberAge: number | null;
  memberName: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const detectedAge = getAgeGroup(memberAge);
  const [activeAgeGroup, setActiveAgeGroup] = useState<AgeGroup>(detectedAge);
  const [curatedResults, setCuratedResults] = useState<BookCard[] | null>(null);
  const [olResults, setOlResults] = useState<BookCard[] | null>(null);
  const [olLoading, setOlLoading] = useState(false);
  const [olError, setOlError] = useState("");
  const [adding, setAdding] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const HISTORY_KEY = "mulaibaca_search_history";

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  function saveToHistory(term: string) {
    const trimmed = term.trim();
    if (!trimmed || trimmed.length < 2) return;
    setSearchHistory((prev) => {
      const next = [trimmed, ...prev.filter((h) => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, 10);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function removeFromHistory(term: string) {
    setSearchHistory((prev) => {
      const next = prev.filter((h) => h !== term);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function clearHistory() {
    setSearchHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
  }

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const titleMatches: string[] = [];
    const authorMatches: string[] = [];
    const seenTitles = new Set<string>();
    const seenAuthors = new Set<string>();
    for (const b of allBooks) {
      if (b.title.toLowerCase().includes(q) && !seenTitles.has(b.title)) {
        titleMatches.push(b.title);
        seenTitles.add(b.title);
        if (titleMatches.length >= 5) break;
      }
    }
    for (const b of allBooks) {
      if (b.author.toLowerCase().includes(q) && !seenAuthors.has(b.author)) {
        authorMatches.push(b.author);
        seenAuthors.add(b.author);
        if (authorMatches.length >= 3) break;
      }
    }
    return [...titleMatches, ...authorMatches].slice(0, 7);
  }, [query, allBooks]);

  // Augment so anak books always have "anak" tag for category matching
  const augmented = augmentBooks(allBooks);

  const displayBooks: Book[] = (() => {
    if (activeSub) {
      const sub = findSubCategory(activeSub);
      if (sub) return augmented.filter((b) => b.tags.some((t) => sub.matchTags.includes(t)));
    }
    if (activeParent) {
      const parent = CATEGORY_TREE.find((c) => c.key === activeParent);
      if (parent) return augmented.filter((b) => b.tags.some((t) => parent.matchTags.includes(t)));
    }
    return augmented;
  })();

  const activeParentNode = CATEGORY_TREE.find((c) => c.key === activeParent);
  const activeSubNode = activeSub ? findSubCategory(activeSub) : null;
  const activeCatLabel = activeSubNode?.label ?? activeParentNode?.label ?? null;

  function selectParent(key: string) {
    if (activeParent === key) {
      setActiveParent(null);
      setActiveSub(null);
    } else {
      setActiveParent(key);
      setActiveSub(null);
    }
  }

  function selectSub(key: string) {
    setActiveSub((prev) => (prev === key ? null : key));
  }

  function filterCurated(q: string): BookCard[] {
    if (!q.trim()) return [];
    const qLow = q.toLowerCase();
    return allBooks
      .filter(
        (b) =>
          b.title.toLowerCase().includes(qLow) ||
          b.author.toLowerCase().includes(qLow) ||
          (b.publisher ?? "").toLowerCase().includes(qLow) ||
          (b.isbn ?? "").toLowerCase().includes(qLow) ||
          b.description.toLowerCase().includes(qLow) ||
          (b.tags ?? []).some((t) => t.toLowerCase().includes(qLow))
      )
      .map(fromBook);
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
    setShowDropdown(false);
    inputRef.current?.blur();
  }

  function selectQuery(term: string) {
    setQuery(term);
    setShowDropdown(false);
    inputRef.current?.focus();
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
    <div className="min-h-screen pb-24">

      {/* ── Sticky header ── */}
      <header className="bg-surface border-b-2 border-ink sticky top-0 z-10">
        <div className="relative max-w-lg mx-auto">
          <div className="flex items-center gap-3 px-4 py-3">
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
                type="text"
                placeholder="Cari judul, pengarang, atau genre…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    saveToHistory(query.trim());
                    setShowDropdown(false);
                  }
                  if (e.key === "Escape") clearSearch();
                }}
                className="input input-icon-lr w-full"
                autoComplete="off"
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

          {/* ── Dropdown: history + suggestions — relative to max-w-lg container ── */}
          {showDropdown && (
            <div
              className="absolute top-full left-3 right-3 bg-surface rounded-2xl border border-border z-50 overflow-hidden"
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
            >
              {/* Search history — shown when input is empty */}
              {!query.trim() && searchHistory.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1.5 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink-muted">Pencarian sebelumnya</span>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={clearHistory}
                      className="text-[10px] text-ink-muted hover:text-error transition-colors"
                    >
                      Hapus semua
                    </button>
                  </div>
                  {searchHistory.map((term) => (
                    <div
                      key={term}
                      className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-parchment transition-colors group cursor-pointer"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectQuery(term)}
                    >
                      <Clock size={13} strokeWidth={2} className="text-ink-muted flex-shrink-0" />
                      <span className="text-sm text-ink flex-1 truncate">{term}</span>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => { e.stopPropagation(); removeFromHistory(term); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center text-ink-muted hover:text-error rounded"
                        aria-label={`Hapus "${term}"`}
                      >
                        <X size={11} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions — shown while typing */}
              {query.trim().length >= 2 && suggestions.length > 0 && (
                <div className="p-2">
                  {suggestions.map((s) => (
                    <div
                      key={s}
                      className="flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-parchment transition-colors cursor-pointer"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        selectQuery(s);
                        saveToHistory(s);
                      }}
                    >
                      <Search size={13} strokeWidth={2} className="text-ink-muted flex-shrink-0" />
                      <span className="text-sm text-ink truncate">{s}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty history state */}
              {!query.trim() && searchHistory.length === 0 && (
                <div className="px-4 py-5 text-center">
                  <p className="text-xs text-ink-muted">Belum ada riwayat pencarian</p>
                </div>
              )}
            </div>
          )}
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
                <div className="w-full h-1 bg-border/50 rounded-full overflow-hidden">
                  <div className="h-full bg-amber rounded-full" style={{ width: "45%" }} />
                </div>
                {(curatedResults ?? []).length === 0 && (
                  <p className="text-center text-xs text-ink-muted pt-1">Mencari…</p>
                )}
              </div>
            )}

            {olError && <p className="text-xs text-ink-muted text-center py-2">{olError}</p>}

            {noResultsAtAll && (
              <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
                <div className="text-4xl mb-3">📚</div>
                <p className="font-semibold text-ink text-sm mb-1">"{query}" tidak ditemukan</p>
                <p className="text-xs text-ink-muted mb-5">Coba kata kunci lain, atau tambahkan buku ini secara manual.</p>
                <Link href={`/jelajah/manual?title=${encodeURIComponent(query)}`} className="btn-primary inline-flex">
                  + Tambah buku ini manual
                </Link>
              </div>
            )}

            {!olLoading && mergedResults.length > 0 && (
              <div className="rounded-xl bg-parchment border border-border p-4 flex items-center justify-between gap-3">
                <p className="text-xs text-ink-secondary">Tidak menemukan yang cocok?</p>
                <Link href={`/jelajah/manual?title=${encodeURIComponent(query)}`} className="btn-ghost-ink text-xs">
                  + Tambah manual
                </Link>
              </div>
            )}
          </div>

        ) : (
          /* ── DISCOVERY MODE ── */
          <div className="py-5 space-y-7">

            {/* Family reading */}
            {familyBooks.length > 0 && (
              <section>
                <SectionLabel>Sedang dibaca keluarga</SectionLabel>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 scroll-fade-wrap">
                  {familyBooks.map((fb, i) => (
                    <div key={i} className="flex-shrink-0 w-28">
                      <BookCover src={fb.coverUrl} title={fb.title} className="w-full h-[88px] rounded-xl mb-1.5" />
                      <p className="text-[11px] font-medium text-ink line-clamp-2 leading-tight">{fb.title}</p>
                      <p className="text-[10px] text-amber font-semibold truncate mt-0.5">{fb.memberName}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Buku Anak section ── */}
            {(() => {
              const anakBooks = augmented.filter((b) => (b.categories ?? []).includes("anak-anak") || (b.categories ?? []).some((c: string) => CATEGORY_TREE[2]?.matchTags.includes(c)));
              if (anakBooks.length === 0) return null;

              const isChild = memberType === "anak";

              // Only show for anak members
              if (!isChild) return null;

              const currentGroup = AGE_GROUPS.find((g) => g.key === activeAgeGroup) ?? AGE_GROUPS[1];
              const filteredBooks = activeAgeGroup
                ? anakBooks.filter((b) => b.tags.some((t) => currentGroup.matchTags.includes(t)))
                : anakBooks;

              return (
                <section>
                  {isChild ? (
                    <div className="mb-3">
                      <SectionLabel className="mb-0.5">
                        {detectedAge ? `Untukmu, ${memberName.split(" ")[0]}!` : "Buku Anak"}
                      </SectionLabel>
                      {detectedAge && (
                        <p className="text-xs text-ink-muted">
                          {currentGroup.desc}
                        </p>
                      )}
                    </div>
                  ) : (
                    <SectionLabel>Buku untuk si kecil</SectionLabel>
                  )}

                  {/* Age group tabs */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 scroll-fade-wrap">
                    {AGE_GROUPS.map((g) => {
                      const count = anakBooks.filter((b) => b.tags.some((t) => g.matchTags.includes(t))).length;
                      const isActive = activeAgeGroup === g.key;
                      return (
                        <button
                          key={g.key}
                          onClick={() => setActiveAgeGroup(isActive ? null : g.key)}
                          className={`flex-shrink-0 flex flex-col items-start px-3 py-2 rounded-xl border-2 text-left transition-all ${
                            isActive
                              ? "border-amber bg-amber text-white"
                              : "border-border bg-surface text-ink-secondary hover:border-amber/40"
                          }`}
                        >
                          <span className="text-xs font-semibold leading-tight">{g.label}</span>
                          <span className={`text-[10px] mt-0.5 ${isActive ? "text-white/80" : "text-ink-muted"}`}>
                            {count} buku
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Book row */}
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 mt-1">
                    {filteredBooks.map((b) => {
                      const card = fromBook(b);
                      return (
                        <div key={b.title} className="flex-shrink-0 w-28">
                          <div className="relative group">
                            <Link href={bookUrl(card)}>
                              <BookCover src={b.cover_url} title={b.title} className="w-full h-[130px] rounded-xl" />
                            </Link>
                          </div>
                          <Link href={bookUrl(card)} className="hover:text-amber transition-colors">
                            <p className="text-[11px] font-medium text-ink line-clamp-2 leading-snug mt-1.5">{b.title}</p>
                          </Link>
                          <p className="text-[10px] text-ink-muted truncate">{b.author}</p>
                          <button
                            onClick={() => addBook(card, "want")}
                            disabled={adding === card.id + "want"}
                            className="mt-1.5 w-full py-1 rounded-lg border border-border text-[10px] font-semibold text-ink-secondary hover:border-amber/50 hover:text-amber transition-colors disabled:opacity-40"
                          >
                            {adding === card.id + "want" ? "…" : "+ Mau Baca"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })()}

            {/* ── Trending — buku yang paling banyak ditambahkan ke rak ── */}
            {trendingBooks.length > 1 && !activeParent && (
              <section>
                <SectionLabel>Trending Minggu Ini</SectionLabel>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 scroll-fade-wrap">
                  {trendingBooks.map((b) => {
                    const c = fromBook(b);
                    return (
                      <div key={b.id} className="flex-shrink-0 w-28">
                        <Link href={bookUrl(c)}>
                          <BookCover src={b.cover_url} title={b.title} className="w-full h-[100px] rounded-xl mb-1.5" />
                        </Link>
                        <Link href={bookUrl(c)} className="hover:text-amber transition-colors">
                          <p className="text-[11px] font-medium text-ink line-clamp-2 leading-tight">{b.title}</p>
                        </Link>
                        <p className="text-[10px] text-ink-muted truncate">{b.author}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── Personal — rekomendasi berdasarkan buku di rak user ── */}
            {personalBooks.length > 1 && !activeParent && (
              <section>
                <SectionLabel>Karena Kamu Baca…</SectionLabel>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 scroll-fade-wrap">
                  {personalBooks.map((b) => {
                    const c = fromBook(b);
                    return (
                      <div key={b.id} className="flex-shrink-0 w-28">
                        <Link href={bookUrl(c)}>
                          <BookCover src={b.cover_url} title={b.title} className="w-full h-[100px] rounded-xl mb-1.5" />
                        </Link>
                        <Link href={bookUrl(c)} className="hover:text-amber transition-colors">
                          <p className="text-[11px] font-medium text-ink line-clamp-2 leading-tight">{b.title}</p>
                        </Link>
                        <p className="text-[10px] text-ink-muted truncate">{b.author}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── DB Sections (featured, grid_v, grid_h, banner) — hanya saat tidak ada filter ── */}
            {!activeParent && sections.map((sec) => (
              <SectionRenderer key={sec.id} section={sec} adding={adding} onAdd={addBook} />
            ))}

            {/* Book grid with category filter */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel className="mb-0">
                  {activeCatLabel ?? "Semua buku"}
                  {" "}
                  <span className="font-normal text-ink-muted">({displayBooks.length})</span>
                </SectionLabel>
                {(activeParent || activeSub) && (
                  <button
                    onClick={() => { setActiveParent(null); setActiveSub(null); }}
                    className="text-[11px] text-ink-muted hover:text-ink flex items-center gap-0.5 transition-colors"
                  >
                    <X size={11} strokeWidth={2.5} />
                    Hapus filter
                  </button>
                )}
              </div>

              {/* Category filter */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 scroll-fade-wrap">
                {CATEGORY_TREE.map((cat) => {
                  const count = countBooksInCategory(augmented, cat.matchTags);
                  const isActive = activeParent === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => selectParent(cat.key)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                        isActive
                          ? "border-ink bg-ink text-white"
                          : "border-border bg-surface text-ink-secondary hover:border-ink/30 hover:text-ink"
                      }`}
                    >
                      {cat.label}
                      {count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-white/20 text-white" : "bg-border text-ink-muted"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Level 2 — sub-categories */}
              {activeParent && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 pb-2 -mx-4 px-4 scroll-fade-wrap">
                  {activeParentNode?.children.map((sub) => {
                    const count = countBooksInCategory(augmented, sub.matchTags);
                    const isActive = activeSub === sub.key;
                    return (
                      <button
                        key={sub.key}
                        onClick={() => count > 0 && selectSub(sub.key)}
                        disabled={count === 0}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isActive
                            ? "border-amber bg-amber text-white"
                            : count === 0
                            ? "border-border/40 bg-parchment text-ink-muted/40 cursor-not-allowed"
                            : "border-border bg-parchment text-ink-secondary hover:border-amber/50 hover:text-ink"
                        }`}
                      >
                        {sub.label}
                        {count > 0 && (
                          <span className={`text-[10px] ${isActive ? "opacity-80" : "text-ink-muted"}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {displayBooks.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                  {displayBooks.map((b) => (
                    <ShelfBookCard
                      key={b.title}
                      card={fromBook(b)}
                      adding={adding}
                      onAdd={addBook}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
                  <p className="text-2xl mb-2">📭</p>
                  <p className="text-sm font-semibold text-ink mb-1">Belum ada buku di sini</p>
                  <p className="text-xs text-ink-muted">Coba kategori lain atau tambahkan buku secara manual</p>
                </div>
              )}
            </section>

            {/* Manual add */}
            <div className="border-t-2 border-dashed border-border pt-6 text-center">
              <p className="text-xs text-ink-muted mb-3">Tidak menemukan buku yang dicari?</p>
              <Link href="/jelajah/manual" className="btn-ghost-ink inline-flex">
                + Tambah buku manual
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Section renderer (DB-driven) ──────────────────── */

function SectionRenderer({
  section,
  adding,
  onAdd,
}: {
  section: JelajahSection;
  adding: string | null;
  onAdd: (card: BookCard, status: "reading" | "want") => void;
}) {
  switch (section.type) {
    case "featured":
      return <FeaturedSection section={section} adding={adding} onAdd={onAdd} />;
    case "grid_v":
      return <GridVSection section={section} adding={adding} onAdd={onAdd} />;
    case "grid_h":
      return <GridHSection section={section} adding={adding} onAdd={onAdd} />;
    case "banner":
      return <BannerSection section={section} />;
    default:
      return null;
  }
}

function FeaturedSection({
  section,
  adding,
  onAdd,
}: {
  section: JelajahSection;
  adding: string | null;
  onAdd: (card: BookCard, status: "reading" | "want") => void;
}) {
  const [idx, setIdx] = useState(0);
  const books = (section.books ?? []).map(fromBook);
  if (books.length === 0) return null;
  const card = books[idx];
  return (
    <section>
      <SectionLabel>{section.title}</SectionLabel>
      {section.subtitle && <p className="text-xs text-ink-muted -mt-2 mb-3">{section.subtitle}</p>}
      <FeaturedCard card={card} adding={adding} onAdd={onAdd} />
      {books.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-ink-muted disabled:opacity-20 hover:border-ink/30"
            aria-label="Sebelumnya"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
          </button>
          <div className="flex gap-1.5">
            {books.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${
                  i === idx ? "w-4 h-2 bg-ink" : "w-2 h-2 bg-border hover:bg-ink-muted"
                }`}
                aria-label={`Buku ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => setIdx((i) => Math.min(books.length - 1, i + 1))}
            disabled={idx === books.length - 1}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-border text-ink-muted disabled:opacity-20 hover:border-ink/30"
            aria-label="Berikutnya"
          >
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </section>
  );
}

function GridVSection({
  section,
  adding,
  onAdd,
}: {
  section: JelajahSection;
  adding: string | null;
  onAdd: (card: BookCard, status: "reading" | "want") => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const books = (section.books ?? []).map(fromBook);
  if (books.length === 0) return null;
  const visible = showAll ? books : books.slice(0, 9);
  return (
    <section>
      <SectionLabel>{section.title}</SectionLabel>
      {section.subtitle && <p className="text-xs text-ink-muted -mt-2 mb-3">{section.subtitle}</p>}
      <div className="grid grid-cols-3 gap-x-3 gap-y-5">
        {visible.map((b) => (
          <ShelfBookCard key={b.id} card={b} adding={adding} onAdd={onAdd} />
        ))}
      </div>
      {!showAll && books.length > 9 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full rounded-xl border border-border py-2.5 text-xs font-semibold text-ink-secondary hover:border-amber/50 hover:text-ink transition-colors"
        >
          Tampilkan {books.length - 9} buku lainnya
        </button>
      )}
    </section>
  );
}

function GridHSection({
  section,
  adding,
  onAdd,
}: {
  section: JelajahSection;
  adding: string | null;
  onAdd: (card: BookCard, status: "reading" | "want") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const books = (section.books ?? []).map(fromBook);
  if (books.length === 0) return null;
  return (
    <section>
      <SectionLabel>{section.title}</SectionLabel>
      {section.subtitle && <p className="text-xs text-ink-muted -mt-2 mb-3">{section.subtitle}</p>}
      {!expanded ? (
        <>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 scroll-fade-wrap">
            {books.map((b) => (
              <div key={b.id} className="flex-shrink-0 w-28">
                <BookCover src={b.cover_url} title={b.title} className="w-full h-[100px] rounded-xl mb-1.5" />
                <p className="text-[11px] font-medium text-ink line-clamp-2 leading-tight">{b.title}</p>
                <p className="text-[10px] text-ink-muted truncate mt-0.5">{b.author}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setExpanded(true)}
            className="mt-3 w-full rounded-xl bg-forest text-white text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5 hover:bg-forest-dark transition-colors"
          >
            Lihat semua ({books.length} buku)
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-x-3 gap-y-5">
            {books.map((b) => (
              <ShelfBookCard key={b.id} card={b} adding={adding} onAdd={onAdd} />
            ))}
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="mt-3 w-full rounded-xl border border-border py-2.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
          >
            Sembunyikan
          </button>
        </>
      )}
    </section>
  );
}

function BannerSection({ section }: { section: JelajahSection }) {
  const cfg = section.config as BannerConfig;
  if (!cfg?.items?.length) return null;
  const layout = cfg.layout ?? 1;
  const items = cfg.items.slice(0, layout);

  return (
    <section>
      {section.title && <SectionLabel>{section.title}</SectionLabel>}
      <div className={`grid gap-3 ${layout === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {items.map((item, i) => (
          <Link
            key={i}
            href={item.link_url || "#"}
            className="relative block rounded-2xl overflow-hidden"
            style={{ aspectRatio: layout === 1 ? "3/1" : "3/2" }}
          >
            {item.image_url && (
              <Image src={item.image_url} alt={item.title ?? `Banner ${i + 1}`} fill className="object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/60" />
            {(item.title || item.cta_text) && (
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {item.title && (
                  <p className="text-white font-bold text-sm leading-tight mb-1.5 drop-shadow">{item.title}</p>
                )}
                {item.cta_text && (
                  <span className="inline-flex items-center gap-1 bg-amber text-white text-[11px] font-semibold px-3 py-1 rounded-lg">
                    {item.cta_text}
                    <ChevronRight size={11} strokeWidth={2.5} />
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
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

function StarDisplay({ rating, count }: { rating: number | null; count: number }) {
  if (rating === null || rating === 0) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5" title={`${rating} dari 5 bintang`}>
      <span className="text-[10px] text-amber leading-none">{'★'.repeat(full)}{half ? '½' : ''}</span>
      <span className="text-[9px] text-ink-muted ml-0.5">({count})</span>
    </span>
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
      <Link href={bookUrl(card)} className="flex-shrink-0">
        <BookCover src={card.cover_url} title={card.title} className="w-[72px] h-[100px] rounded-xl" />
      </Link>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-black text-amber uppercase tracking-[0.1em]">★ Pilihan</span>
          {card.isLokal && <span className="text-[9px] font-semibold text-ink-muted bg-border/60 px-1.5 py-0.5 rounded-full">🇮🇩 Lokal</span>}
        </div>
        <Link href={bookUrl(card)} className="hover:text-amber transition-colors">
          <p className="font-display font-bold text-ink text-base leading-snug line-clamp-2">{card.title}</p>
        </Link>
        <p className="text-xs text-ink-muted mt-0.5 mb-1">{card.author}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-2">
          <StarDisplay rating={card.rating_avg} count={card.rating_count} />
          {card.total_pages && <span className="text-[10px] text-ink-muted/70">{card.total_pages} hlm</span>}
          {card.publisher && <span className="text-[10px] text-ink-muted/70">{card.publisher}</span>}
          {card.published_year && <span className="text-[10px] text-ink-muted/70">{card.published_year}</span>}
        </div>
        {card.description && (
          <p className="text-xs text-ink-secondary leading-relaxed line-clamp-3 mb-3">{card.description}</p>
        )}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onAdd(card, "want")}
            disabled={!!isAdding}
            className="flex items-center gap-1.5 bg-ink text-white text-xs font-semibold px-3 min-h-[34px] rounded-lg hover:bg-ink/80 transition-colors disabled:opacity-40"
          >
            <Bookmark size={12} strokeWidth={2.5} />
            {isAdding ? "…" : "+ Mau Baca"}
          </button>
          <Link
            href={bookUrl(card)}
            className="min-h-[34px] px-3 rounded-lg border border-border text-xs text-ink-secondary hover:border-amber/50 hover:text-amber transition-colors flex items-center"
          >
            Detail
          </Link>
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

  return (
    <div className="flex flex-col">
      <div className="relative">
        <Link href={bookUrl(card)}>
          <BookCover src={card.cover_url} title={card.title} className="w-full h-[120px] rounded-xl" />
        </Link>
        {card.isLokal && (
          <span className="absolute top-1.5 left-1.5 text-[8px] font-bold bg-ink/70 text-white px-1.5 py-0.5 rounded-full leading-none">
            🇮🇩
          </span>
        )}
      </div>
      <Link href={bookUrl(card)} className="hover:text-amber transition-colors">
        <p className="text-[11px] font-semibold text-ink line-clamp-2 leading-snug mt-1.5">{card.title}</p>
      </Link>
      <p className="text-[10px] text-ink-muted truncate mt-0.5">{card.author}</p>
      <StarDisplay rating={card.rating_avg} count={card.rating_count} />
      {card.total_pages && (
        <p className="text-[9px] text-ink-muted/70 mt-0.5">{card.total_pages} hlm</p>
      )}
      {card.tags.length > 0 && (
        <div className="flex gap-1 mt-0.5 flex-wrap mb-1">
          {card.tags.filter(t => t !== "anak").slice(0, 2).map((tag) => (
            <span key={tag} className="text-[8px] bg-parchment text-ink-muted px-1 py-0.5 rounded-full leading-none">{tag}</span>
          ))}
        </div>
      )}
      <button
        onClick={() => onAdd(card, "want")}
        disabled={!!isAdding}
        className="mt-auto w-full py-1.5 rounded-lg border border-border text-[11px] font-semibold text-ink-secondary hover:border-amber/50 hover:text-amber transition-colors disabled:opacity-40"
      >
        {isAdding ? "…" : "+ Mau Baca"}
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
    <div className="bg-surface rounded-2xl border border-border p-3">
      <div className="flex gap-3">
        <Link href={bookUrl(card)} className="flex-shrink-0">
          <BookCover src={card.cover_url} title={card.title} className="w-14 h-[76px] rounded-lg" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <Link href={bookUrl(card)} className="flex-1 hover:text-amber transition-colors">
              <p className="font-semibold text-ink text-sm line-clamp-2">{card.title}</p>
            </Link>
            {card.isLokal && (
              <span className="flex-shrink-0 text-[9px] font-semibold text-ink-muted bg-border/60 px-1.5 py-0.5 rounded-full mt-0.5">🇮🇩 Lokal</span>
            )}
          </div>
          <p className="text-xs text-ink-muted mt-0.5">{card.author}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            <StarDisplay rating={card.rating_avg} count={card.rating_count} />
            {card.total_pages && <span className="text-[10px] text-ink-muted/70">{card.total_pages} hlm</span>}
            {card.publisher && <span className="text-[10px] text-ink-muted/70">{card.publisher}</span>}
            {card.published_year && <span className="text-[10px] text-ink-muted/70">{card.published_year}</span>}
          </div>
          {card.description && (
            <p className="text-xs text-ink-secondary mt-1 line-clamp-2 leading-relaxed">{card.description}</p>
          )}
          {card.tags.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {card.tags.filter(t => t !== "anak").slice(0, 3).map((tag) => (
                <span key={tag} className="badge">{tag}</span>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={() => onAdd(card, "want")}
              disabled={!!isAdding}
              className="btn-primary-sm flex items-center gap-1.5"
            >
              <Bookmark size={12} strokeWidth={2} />
              {isAdding ? "…" : "+ Mau Baca"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
