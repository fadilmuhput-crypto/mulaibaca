"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BUKU_ANAK, BUKU_LOKAL, KATEGORI, type CuratedBook } from "@/lib/curated-books";

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

type Tab = "semua" | "anak" | "lokal" | "kategori";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function fromCurated(b: CuratedBook): BookCard {
  return {
    id: b.open_library_id ?? toSlug(b.title),
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

export default function TambahBukuPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("semua");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function doSearch(q: string, subject?: string) {
    setLoading(true);
    setError("");
    try {
      let url = `https://openlibrary.org/search.json?fields=key,title,author_name,cover_i,isbn,number_of_pages_median&limit=15`;
      if (q.trim()) url += `&q=${encodeURIComponent(q)}`;
      if (subject) url += `&subject=${encodeURIComponent(subject)}`;
      if (tab === "anak" && !subject) url += `&subject=juvenile_literature`;

      const res = await fetch(url);
      const data = await res.json();
      const olCards = (data.docs ?? []).map(fromOL);

      // Merge curated matches first (deduplicated)
      const pool =
        tab === "anak" ? BUKU_ANAK
        : tab === "lokal" ? BUKU_LOKAL
        : [...BUKU_ANAK, ...BUKU_LOKAL];

      const qLow = q.toLowerCase();
      const curatedMatches = q.trim()
        ? pool
            .filter(
              (b) =>
                b.title.toLowerCase().includes(qLow) ||
                b.author.toLowerCase().includes(qLow)
            )
            .map(fromCurated)
        : [];

      const seen = new Set(curatedMatches.map((b) => b.title.toLowerCase()));
      const merged = [
        ...curatedMatches,
        ...olCards.filter((b) => !seen.has(b.title.toLowerCase())),
      ];
      setResults(merged);
      if (merged.length === 0) setError("Buku tidak ditemukan.");
    } catch {
      setError("Gagal mencari buku. Periksa koneksi internet.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    doSearch(query);
  }

  function changeTab(t: Tab) {
    setTab(t);
    setResults(null);
    setError("");
    if (query.trim() && t !== "kategori") doSearch(query);
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
      setError(err instanceof Error ? err.message : "Gagal menambahkan buku");
    } finally {
      setAdding(null);
    }
  }

  const showKategoriGrid = tab === "kategori" && results === null;
  const showCuratedHome = tab === "semua" && results === null && !loading;
  const showAnakGrid = tab === "anak" && results === null && !loading;
  const showLokalGrid = tab === "lokal" && results === null && !loading;
  const showResults = results !== null;

  return (
    <div className="min-h-screen bg-parchment pb-24">
      {/* Sticky header */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/rak"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-ink-secondary hover:bg-parchment transition-colors"
            aria-label="Kembali ke rak"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-h2">Tambah Buku</h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 px-4 pb-3">
          <input
            type="search"
            placeholder="Cari judul atau pengarang…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value.trim()) setResults(null);
            }}
            className="input flex-1"
          />
          <button type="submit" disabled={loading || !query.trim()} className="btn-primary px-5">
            {loading ? "…" : "Cari"}
          </button>
        </form>

        {/* Tabs */}
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
          {(
            [
              { key: "semua", label: "Semua" },
              { key: "anak", label: "Buku Anak" },
              { key: "lokal", label: "Lokal" },
              { key: "kategori", label: "Kategori" },
            ] as { key: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => changeTab(t.key)}
              className={`flex-shrink-0 min-h-[36px] px-4 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-ink text-surface"
                  : "bg-border/60 text-ink-secondary hover:bg-border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {error && (
          <div className="bg-error-soft border border-error/20 rounded-xl px-4 py-3 text-sm text-error text-center">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-elevated p-3 flex gap-3 animate-pulse">
                <div className="w-12 h-16 rounded-lg bg-border flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border rounded w-3/4" />
                  <div className="h-3 bg-border rounded w-1/2" />
                  <div className="h-3 bg-border rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Category grid */}
        {showKategoriGrid && (
          <div>
            <p className="text-body-sm text-ink-secondary mb-4">
              Pilih kategori untuk melihat rekomendasi buku
            </p>
            <div className="grid grid-cols-2 gap-3">
              {KATEGORI.map((k) => (
                <button
                  key={k.key}
                  onClick={() => doSearch(query || k.label, k.subject)}
                  className="card-interactive p-4 flex items-center gap-3 text-left"
                >
                  <span className="text-2xl">{k.emoji}</span>
                  <span className="text-sm font-medium text-ink leading-tight">{k.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Curated home: Semua tab */}
        {showCuratedHome && (
          <>
            <section>
              <div className="section-header">
                <h2 className="section-title">Buku Anak Pilihan</h2>
                <button onClick={() => changeTab("anak")} className="section-link">
                  Lihat semua →
                </button>
              </div>
              <div className="space-y-2">
                {BUKU_ANAK.slice(0, 4).map((b) => (
                  <BookCardRow
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
                <h2 className="section-title">Buku Lokal Indonesia</h2>
                <button onClick={() => changeTab("lokal")} className="section-link">
                  Lihat semua →
                </button>
              </div>
              <div className="space-y-2">
                {BUKU_LOKAL.slice(0, 4).map((b) => (
                  <BookCardRow
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

        {/* Anak full list */}
        {showAnakGrid && (
          <section>
            <p className="text-body-sm text-ink-secondary mb-4">
              {BUKU_ANAK.length} buku anak pilihan untuk keluarga
            </p>
            <div className="space-y-2">
              {BUKU_ANAK.map((b) => (
                <BookCardRow
                  key={b.title}
                  card={fromCurated(b)}
                  adding={adding}
                  onAdd={addBook}
                />
              ))}
            </div>
          </section>
        )}

        {/* Lokal full list */}
        {showLokalGrid && (
          <section>
            <p className="text-body-sm text-ink-secondary mb-4">
              {BUKU_LOKAL.length} buku karya lokal dan terjemahan populer
            </p>
            <div className="space-y-2">
              {BUKU_LOKAL.map((b) => (
                <BookCardRow
                  key={b.title}
                  card={fromCurated(b)}
                  adding={adding}
                  onAdd={addBook}
                />
              ))}
            </div>
          </section>
        )}

        {/* Search results */}
        {showResults && !loading && (
          <div className="space-y-2">
            {results!.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-ink-secondary text-sm mb-5">
                  Buku tidak ditemukan di direktori kami.
                </p>
                <Link
                  href={`/rak/tambah/manual?title=${encodeURIComponent(query)}`}
                  className="btn-primary inline-flex"
                >
                  + Tambah Buku Manual
                </Link>
              </div>
            ) : (
              results!.map((card) => (
                <BookCardRow
                  key={card.id}
                  card={card}
                  adding={adding}
                  onAdd={addBook}
                />
              ))
            )}
          </div>
        )}

        {/* Manual add suggestion at bottom of results */}
        {showResults && !loading && results!.length > 0 && (
          <div className="text-center pt-2 pb-4">
            <p className="text-xs text-ink-muted mb-2">Tidak ada yang cocok?</p>
            <Link
              href={`/rak/tambah/manual?title=${encodeURIComponent(query)}`}
              className="btn-ghost-ink inline-flex"
            >
              + Tambah buku manual
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function BookCardRow({
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
        {/* Cover — links to detail */}
        <Link
          href={`/buku/${card.id}`}
          className="w-12 h-16 rounded-lg overflow-hidden bg-cream flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          {card.cover_url ? (
            <img
              src={card.cover_url}
              alt={card.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">📗</div>
          )}
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
              className="btn-primary-sm"
            >
              {adding === card.id + "reading" ? "…" : "Sedang Baca"}
            </button>
            <button
              onClick={() => onAdd(card, "want")}
              disabled={!!isAdding}
              className="btn-secondary min-h-[44px] px-3 text-xs"
            >
              {adding === card.id + "want" ? "…" : "Mau Baca"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
