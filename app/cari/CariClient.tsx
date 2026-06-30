"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import type { Book } from "@/lib/books";
import { CATEGORY_TREE, findSubCategory } from "@/lib/category-tree";
import { Search, ChevronLeft, X, Bookmark } from "lucide-react";

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

export default function CariClient({ allBooks }: { allBooks: Book[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQ);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [activeSub, setActiveSub] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

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
            <p className="text-xs text-ink-muted">Coba kata kunci lain atau ubah filter kategori</p>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  );
}
