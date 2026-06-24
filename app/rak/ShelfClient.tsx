"use client";

import { useState } from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";

type Book = {
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number | null;
};

type ShelfItem = {
  id: string;
  status: "want" | "reading" | "done";
  current_page: number;
  books: Book | null;
};

const TABS = [
  { key: "reading", label: "Dibaca",   count_label: "sedang dibaca" },
  { key: "want",    label: "Mau Baca", count_label: "ingin dibaca" },
  { key: "done",    label: "Selesai",  count_label: "selesai dibaca" },
] as const;

export default function ShelfClient({
  initialShelf,
  reviewedIds,
}: {
  initialShelf: ShelfItem[];
  reviewedIds: string[];
}) {
  const [tab, setTab] = useState<"reading" | "want" | "done">("reading");
  const [shelf, setShelf] = useState(initialShelf);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState("");
  const [justFinished, setJustFinished] = useState<{ id: string; title: string } | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  const filtered = shelf.filter((i) => i.status === tab);

  async function updateProgress(id: string, currentPage: number) {
    const res = await fetch(`/api/shelf/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_page: currentPage }),
    });
    if (res.ok) {
      const updated = await res.json();
      setShelf((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
    }
    setEditingId(null);
  }

  async function markReading(id: string) {
    setStartingId(id);
    const res = await fetch(`/api/shelf/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "reading" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setShelf((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
      setTab("reading");
    }
    setStartingId(null);
  }

  async function markDone(id: string) {
    const item = shelf.find((i) => i.id === id);
    const res = await fetch(`/api/shelf/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setShelf((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
      setJustFinished({ id, title: item?.books?.title ?? "Buku" });
      setTab("done");
    }
  }

  async function removeFromShelf(id: string) {
    if (!confirm("Hapus buku dari rak?")) return;
    const res = await fetch(`/api/shelf/${id}`, { method: "DELETE" });
    if (res.ok) setShelf((prev) => prev.filter((i) => i.id !== id));
  }

  const readingCount = shelf.filter((i) => i.status === "reading").length;
  const wantCount    = shelf.filter((i) => i.status === "want").length;
  const doneCount    = shelf.filter((i) => i.status === "done").length;
  const counts = { reading: readingCount, want: wantCount, done: doneCount };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => {
          const count = counts[t.key];
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-ink text-surface"
                  : "bg-surface border border-border text-ink-secondary hover:border-amber/50"
              }`}
            >
              {t.label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  tab === t.key ? "bg-white/20" : "bg-border text-ink-muted"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Congratulations banner after marking done */}
      {justFinished && tab === "done" && (
        <div className="bg-success-soft border border-success/20 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🎉</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-success">
              Selesai membaca &ldquo;{justFinished.title}&rdquo;!
            </p>
            <p className="text-xs text-ink-muted mt-0.5 mb-2">
              Bagaimana pendapatmu? Tulis review singkat dan inspirasi orang lain.
            </p>
            <div className="flex gap-2">
              <Link
                href={`/review/tulis?shelf=${justFinished.id}`}
                className="btn-primary-sm text-xs"
              >
                Tulis Review →
              </Link>
              <button
                onClick={() => setJustFinished(null)}
                className="text-xs text-ink-muted hover:text-ink min-h-[44px] px-3"
              >
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">
            {tab === "reading" ? "📖" : tab === "want" ? "🔖" : "🏆"}
          </div>
          <p className="text-ink-secondary text-sm mb-4">
            {tab === "reading"
              ? "Belum ada buku yang sedang dibaca"
              : tab === "want"
              ? "Belum ada buku dalam daftar ingin baca"
              : "Belum ada buku yang selesai dibaca"}
          </p>
          <Link href="/rak/tambah" className="btn-secondary inline-flex">
            + Tambah buku
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const book = item.books;
            if (!book) return null;
            const progress =
              book.total_pages && item.current_page
                ? Math.min(Math.round((item.current_page / book.total_pages) * 100), 100)
                : 0;
            const isReviewed = reviewedIds.includes(item.id);

            return (
              <div key={item.id} className="card-elevated p-3">
                <div className="flex gap-3">
                  <BookCover src={book.cover_url} title={book.title} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink text-sm">{book.title}</p>
                    {book.author && (
                      <p className="text-xs text-ink-muted">{book.author}</p>
                    )}

                    {tab === "reading" && (
                      <div className="mt-2">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-1.5">
                          {editingId === item.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                updateProgress(item.id, parseInt(pageInput) || 0);
                              }}
                              className="flex gap-2 items-center"
                            >
                              <input
                                type="number"
                                value={pageInput}
                                onChange={(e) => setPageInput(e.target.value)}
                                className="w-20 px-2 py-1.5 text-xs border border-amber rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-amber/30 bg-parchment"
                                autoFocus
                                min={0}
                                max={book.total_pages ?? 9999}
                              />
                              <span className="text-xs text-ink-muted">/ {book.total_pages ?? "?"} hal</span>
                              <button type="submit" className="text-xs font-medium text-amber hover:text-amber-hover min-h-[36px] px-2">
                                Simpan
                              </button>
                              <button type="button" onClick={() => setEditingId(null)} className="text-xs text-ink-muted hover:text-ink min-h-[36px] px-1">
                                Batal
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => { setEditingId(item.id); setPageInput(String(item.current_page ?? 0)); }}
                              className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-amber transition-colors min-h-[36px] pr-2 group"
                            >
                              <span className="w-4 h-4 rounded bg-border group-hover:bg-amber-soft flex items-center justify-center transition-colors">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </span>
                              {item.current_page
                                ? `Hal ${item.current_page} / ${book.total_pages ?? "?"}`
                                : "Update halaman"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Done tab: review status */}
                    {tab === "done" && (
                      <div className="mt-2">
                        {isReviewed ? (
                          <span className="badge-forest">✓ Sudah direview</span>
                        ) : (
                          <Link href={`/review/tulis?shelf=${item.id}`} className="btn-primary-sm text-xs">
                            Tulis Review →
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-1 items-end justify-start">
                    {tab === "want" && (
                      <button
                        onClick={() => markReading(item.id)}
                        disabled={startingId === item.id}
                        className="min-h-[44px] px-3 text-xs font-semibold text-forest hover:bg-success-soft rounded-xl transition-colors disabled:opacity-50"
                      >
                        {startingId === item.id ? "…" : "Mulai Baca"}
                      </button>
                    )}
                    {tab === "reading" && (
                      <button
                        onClick={() => markDone(item.id)}
                        className="min-h-[44px] px-3 text-xs font-semibold text-success hover:bg-success-soft rounded-xl transition-colors"
                      >
                        Selesai ✓
                      </button>
                    )}
                    <button
                      onClick={() => removeFromShelf(item.id)}
                      className="min-h-[44px] px-3 text-xs text-ink-muted hover:text-error hover:bg-error-soft rounded-xl transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
