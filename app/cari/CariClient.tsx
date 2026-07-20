"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import type { Book } from "@/lib/books";
import { CATEGORY_TREE, findSubCategory } from "@/lib/category-tree";
import { Search, ChevronLeft, X, Bookmark, BookOpen } from "lucide-react";

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
  return {
    id: b.id ?? toSlug(b.title),
    title: b.title,
    author: b.author,
    cover_url: b.cover_url,
    open_library_id: b.open_library_id,
    total_pages: b.total_pages,
    description: b.description ?? "",
    tags: [...new Set([...(b.categories ?? []), ...b.tags])],
  };
}

type OLResult = {
  ol_id: string;
  title: string;
  author: string;
  first_publish_year: number | null;
  isbn: string | null;
  cover_url: string | null;
  total_pages: number | null;
  already_exists: boolean;
};

export default function CariClient({ allBooks }: { allBooks: Book[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [olResults, setOlResults] = useState<OLResult[] | null>(null);
  const [olLoading, setOlLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    setOlResults(null);
  }, [query, activeSub, activeParent]);

  const filtered = useMemo(() => {
    let list = allBooks;
    if (activeSub) {
      const sub = findSubCategory(activeSub);
      if (sub) list = list.filter((b) => b.tags.some((t) => sub.matchTags.includes(t)));
    } else if (activeParent) {
      const parent = CATEGORY_TREE.find((c) => c.key === activeParent);
      if (parent) list = list.filter((b) => b.tags.some((t) => parent.matchTags.includes(t)));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allBooks, query, activeParent, activeSub]);

  const results = filtered.map(fromBook);

  async function searchOL() {
    setOlLoading(true);
    try {
      const res = await fetch(`/api/books/search-ol?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      setOlResults(json.data ?? []);
    } catch {
      setOlResults([]);
    } finally {
      setOlLoading(false);
    }
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
    } catch {
      // ignore
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-surface border-b-2 border-ink sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/jelajah"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-secondary hover:text-ink rounded-xl"
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
              onChange={(e) => {
                setQuery(e.target.value);
                const url = e.target.value.trim() ? `/cari?q=${encodeURIComponent(e.target.value)}` : "/cari";
                window.history.replaceState(null, "", url);
              }}
              className="input input-icon-lr w-full"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
          {CATEGORY_TREE.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveParent(activeParent === cat.key ? null : cat.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                activeParent === cat.key
                  ? "border-ink bg-ink text-surface"
                  : "border-border bg-surface text-ink-secondary hover:border-ink/30"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sub-categories */}
        {activeParent && (() => {
          const parent = CATEGORY_TREE.find((c) => c.key === activeParent);
          if (!parent) return null;
          return (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
              {parent.children.map((sub) => (
                <button
                  key={sub.key}
                  onClick={() => setActiveSub(activeSub === sub.key ? null : sub.key)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeSub === sub.key
                      ? "border-amber bg-amber text-white"
                      : "border-border bg-parchment text-ink-secondary hover:border-amber/50"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          );
        })()}

        {/* Results count */}
        <p className="text-xs text-ink-muted mb-4">
          {results.length} hasil
          {query && <> untuk &quot;{query}&quot;</>}
        </p>

        {/* Results */}
        {results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl mb-3">🔍</p>
            <p className="text-sm font-semibold text-ink mb-1">Tidak ditemukan</p>
            <p className="text-xs text-ink-muted mb-4">Coba kata kunci lain atau ubah filter kategori</p>
            {query.trim().length >= 2 && !olResults && (
              <button
                onClick={searchOL}
                disabled={olLoading}
                className="btn-primary-sm mx-auto"
              >
                {olLoading ? "Mencari…" : "Cari di OpenLibrary"}
              </button>
            )}
            {olResults && olResults.length === 0 && (
              <p className="text-xs text-ink-muted">Tidak ditemukan juga di OpenLibrary</p>
            )}
          </div>
        ) : (
          <>
          {olResults && olResults.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setOlResults(null)}
                className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 mb-2 transition-colors"
              >
                &larr; Kembali ke hasil lokal
              </button>
            </div>
          )}
          <div className="space-y-3">
            {results.map((card) => {
              const isAdding = adding?.startsWith(card.id);
              return (
                <div key={card.id} className="bg-surface rounded-2xl border border-border p-3">
                  <div className="flex gap-3">
                    <Link href={bookUrl(card)} className="flex-shrink-0">
                      <BookCover src={card.cover_url} title={card.title} className="w-12 h-16 rounded-lg" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={bookUrl(card)} className="hover:text-amber transition-colors">
                        <p className="font-semibold text-ink text-sm line-clamp-2">{card.title}</p>
                      </Link>
                      <p className="text-xs text-ink-muted mt-0.5">{card.author}</p>
                      {card.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {card.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="badge">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2">
                        <button
                          onClick={() => addBook(card, "want")}
                          disabled={!!isAdding}
                          className="btn-primary-sm flex items-center gap-1.5"
                        >
                          <Bookmark size={12} strokeWidth={2} />
                          {isAdding ? "…" : "Mau Baca"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}

        {olResults && olResults.length > 0 && (
          <div className="space-y-3 mt-6">
            <p className="text-xs font-semibold text-ink-muted mb-3">
              Hasil dari OpenLibrary:
            </p>
            {olResults.map((r) => {
              const isAdding = adding?.startsWith(r.ol_id);
              return (
                <div key={r.ol_id} className="bg-surface rounded-2xl border border-border p-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-12 h-16 rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden">
                      {r.cover_url ? (
                        <img src={r.cover_url} alt={r.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen size={20} className="text-ink-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink text-sm line-clamp-2">{r.title}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{r.author}</p>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        {r.total_pages && `${r.total_pages} hlm`}
                        {r.total_pages && r.first_publish_year && " · "}
                        {r.first_publish_year && `Terbit ${r.first_publish_year}`}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={async () => {
                            setAdding(r.ol_id + "want");
                            try {
                              const res = await fetch("/api/shelf", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  book: {
                                    title: r.title,
                                    author: r.author,
                                    cover_url: r.cover_url,
                                    isbn: r.isbn,
                                    open_library_id: r.ol_id,
                                    total_pages: r.total_pages,
                                  },
                                  status: "want",
                                }),
                              });
                              if (!res.ok) throw new Error();
                              router.push("/rak");
                            } catch {
                              setAdding(null);
                            }
                          }}
                          disabled={!!isAdding || r.already_exists}
                          className={`btn-primary-sm flex items-center gap-1.5 ${
                            r.already_exists ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <Bookmark size={12} strokeWidth={2} />
                          {r.already_exists ? "Sudah ada" : isAdding ? "…" : "Mau Baca"}
                        </button>
                        <Link
                          href={`https://openlibrary.org${r.ol_id.startsWith("OL") ? `/works/${r.ol_id}` : ""}`}
                          target="_blank"
                          className="text-xs text-ink-muted hover:text-ink self-center transition-colors"
                        >
                          OL
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
