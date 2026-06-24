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
  { key: "reading", label: "Dibaca",    icon: "📖" },
  { key: "want",    label: "Mau Baca",  icon: "🔖" },
  { key: "done",    label: "Selesai",   icon: "✅" },
] as const;

export default function ShelfClient({ initialShelf }: { initialShelf: ShelfItem[] }) {
  const [tab, setTab] = useState<"reading" | "want" | "done">("reading");
  const [shelf, setShelf] = useState(initialShelf);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState("");

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

  async function markDone(id: string) {
    const res = await fetch(`/api/shelf/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setShelf((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
      setTab("done");
    }
  }

  async function removeFromShelf(id: string) {
    if (!confirm("Hapus buku dari rak?")) return;
    const res = await fetch(`/api/shelf/${id}`, { method: "DELETE" });
    if (res.ok) setShelf((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => {
          const count = shelf.filter((i) => i.status === t.key).length;
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
                              <span className="text-xs text-ink-muted">
                                / {book.total_pages ?? "?"} hal
                              </span>
                              <button
                                type="submit"
                                className="text-xs font-medium text-amber hover:text-amber-hover min-h-[36px] px-2"
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="text-xs text-ink-muted hover:text-ink min-h-[36px] px-2"
                              >
                                Batal
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setPageInput(String(item.current_page ?? 0));
                              }}
                              className="text-xs text-ink-muted hover:text-amber transition-colors min-h-[36px] pr-2"
                            >
                              {item.current_page
                                ? `Hal ${item.current_page} / ${book.total_pages ?? "?"}`
                                : "Update halaman →"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons — min 44px touch targets */}
                  <div className="flex flex-col gap-1 items-end justify-start">
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
