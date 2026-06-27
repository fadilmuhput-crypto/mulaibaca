"use client";

import { useState } from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import { BookOpen, Bookmark, Trophy, Sparkles, Check, PenLine, Eye, EyeOff, User, UserX } from "lucide-react";

type Book = {
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number | null;
  open_library_id: string | null;
};

type ShelfItem = {
  id: string;
  status: "want" | "reading" | "done";
  current_page: number;
  books: Book | null;
};

export type ReviewInfo = {
  shelf_item_id: string;
  slug: string | null;
  is_public: boolean;
  is_anonymous: boolean;
};

const TABS = [
  { key: "want",    label: "Mau Baca", icon: Bookmark },
  { key: "reading", label: "Dibaca",   icon: BookOpen },
  { key: "done",    label: "Selesai",  icon: Trophy },
] as const;

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function bookUrl(book: Book): string {
  if (book.open_library_id) {
    return `/buku/${toSlug(book.title)}-${book.open_library_id.toLowerCase()}`;
  }
  return `/buku/${toSlug(book.title)}`;
}

type Visibility = "public" | "anonymous" | "private";

function getVisibility(r: ReviewInfo): Visibility {
  if (!r.is_public) return "private";
  if (r.is_anonymous) return "anonymous";
  return "public";
}

const VISIBILITY_LABELS: Record<Visibility, { label: string; icon: React.ReactNode }> = {
  public:    { label: "Publik",  icon: <Eye size={10} strokeWidth={2.5} /> },
  anonymous: { label: "Anonim", icon: <UserX size={10} strokeWidth={2.5} /> },
  private:   { label: "Privat", icon: <EyeOff size={10} strokeWidth={2.5} /> },
};

const NEXT_VISIBILITY: Record<Visibility, Visibility> = {
  public: "anonymous",
  anonymous: "private",
  private: "public",
};

export default function ShelfClient({
  initialShelf,
  reviews: initialReviews,
}: {
  initialShelf: ShelfItem[];
  reviews: ReviewInfo[];
}) {
  const [tab, setTab] = useState<"reading" | "want" | "done">("want");
  const [shelf, setShelf] = useState(initialShelf);
  const [reviews, setReviews] = useState(initialReviews);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pageInput, setPageInput] = useState("");
  const [justFinished, setJustFinished] = useState<{ id: string; title: string } | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

  const filtered = shelf.filter((i) => i.status === tab);
  const readingCount = shelf.filter((i) => i.status === "reading").length;
  const wantCount    = shelf.filter((i) => i.status === "want").length;
  const doneCount    = shelf.filter((i) => i.status === "done").length;
  const counts = { reading: readingCount, want: wantCount, done: doneCount };

  const totalPagesDone = shelf
    .filter((i) => i.status === "done")
    .reduce((s, i) => s + (i.books?.total_pages ?? 0), 0);

  function getReview(shelfItemId: string): ReviewInfo | undefined {
    return reviews.find((r) => r.shelf_item_id === shelfItemId);
  }

  async function toggleVisibility(review: ReviewInfo) {
    if (!review.slug || togglingSlug === review.slug) return;
    const next = NEXT_VISIBILITY[getVisibility(review)];
    const is_public = next !== "private";
    const is_anonymous = next === "anonymous";
    setTogglingSlug(review.slug);
    try {
      const res = await fetch("/api/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: review.slug, is_public, is_anonymous }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => r.slug === review.slug ? { ...r, is_public, is_anonymous } : r)
        );
      }
    } finally {
      setTogglingSlug(null);
    }
  }

  async function updateProgress(id: string, currentPage: number) {
    setSavingId(id);
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
    setSavingId(null);
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

  return (
    <div>
      {/* Stats bar */}
      {(readingCount + doneCount) > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-0.5">
          {readingCount > 0 && (
            <div className="flex items-center gap-1.5 bg-surface brutal-border rounded-xl px-3 py-2 flex-shrink-0">
              <BookOpen size={13} strokeWidth={2} className="text-amber" />
              <span className="text-xs font-semibold text-ink">{readingCount}</span>
              <span className="text-xs text-ink-muted">sedang dibaca</span>
            </div>
          )}
          {doneCount > 0 && (
            <div className="flex items-center gap-1.5 bg-surface brutal-border rounded-xl px-3 py-2 flex-shrink-0">
              <Trophy size={13} strokeWidth={2} className="text-forest" />
              <span className="text-xs font-semibold text-ink">{doneCount}</span>
              <span className="text-xs text-ink-muted">selesai</span>
            </div>
          )}
          {totalPagesDone > 0 && (
            <div className="flex items-center gap-1.5 bg-surface brutal-border rounded-xl px-3 py-2 flex-shrink-0">
              <span className="text-xs font-semibold text-ink">{totalPagesDone.toLocaleString("id-ID")}</span>
              <span className="text-xs text-ink-muted">halaman selesai</span>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => {
          const count = counts[t.key];
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-ink text-surface brutal-border brutal-shadow-xs"
                  : "bg-surface brutal-border text-ink-secondary hover:border-amber/50"
              }`}
            >
              <Icon size={14} strokeWidth={2} />
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

      {/* Just finished banner */}
      {justFinished && tab === "done" && (
        <div className="bg-forest rounded-2xl p-4 mb-4 flex items-start gap-3 brutal-border brutal-shadow-sm">
          <Sparkles size={20} strokeWidth={1.75} className="text-white/80 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              Selesai membaca &ldquo;{justFinished.title}&rdquo;!
            </p>
            <p className="text-xs text-white/70 mt-0.5 mb-3">
              Tulis review singkat dan inspirasi pembaca lain.
            </p>
            <div className="flex gap-2">
              <Link href={`/review/tulis?shelf=${justFinished.id}`} className="bg-white text-forest text-xs font-semibold px-4 py-2 rounded-lg hover:bg-parchment transition-colors">
                Tulis Review →
              </Link>
              <button onClick={() => setJustFinished(null)} className="text-xs text-white/60 hover:text-white min-h-[36px] px-3">
                Nanti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-14">
          <div className="flex justify-center text-ink-muted mb-3">
            {tab === "reading" ? <BookOpen size={40} strokeWidth={1.25} /> : tab === "want" ? <Bookmark size={40} strokeWidth={1.25} /> : <Trophy size={40} strokeWidth={1.25} />}
          </div>
          <p className="text-ink-secondary text-sm mb-4">
            {tab === "reading"
              ? "Yuk, mulai dengan buku pertama!"
              : tab === "want"
              ? "Simpan buku yang ingin kamu baca nanti"
              : "Buku yang selesai dibaca akan muncul di sini"}
          </p>
          <Link href="/jelajah" className="btn-secondary inline-flex">+ Tambah buku</Link>
        </div>
      )}

      {/* ── DIBACA tab ── */}
      {tab === "reading" && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((item) => {
            const book = item.books;
            if (!book) return null;
            const progress = book.total_pages && item.current_page
              ? Math.min(Math.round((item.current_page / book.total_pages) * 100), 100)
              : 0;
            const url = bookUrl(book);

            return (
              <div key={item.id} className="bg-surface rounded-2xl brutal-border brutal-shadow-xs overflow-hidden">
                <div className="h-1 bg-parchment">
                  <div
                    className="h-full transition-all rounded-r-full"
                    style={{ width: `${progress}%`, backgroundColor: progress >= 100 ? "var(--color-forest)" : "var(--color-amber)" }}
                  />
                </div>

                <div className="p-3 flex gap-3">
                  <Link href={url} className="flex-shrink-0">
                    <BookCover src={book.cover_url} title={book.title} className="w-16 h-[88px] rounded-xl" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={url} className="hover:text-amber transition-colors">
                      <p className="font-semibold text-ink text-sm leading-snug line-clamp-2">{book.title}</p>
                    </Link>
                    {book.author && <p className="text-xs text-ink-muted mt-0.5 truncate">{book.author}</p>}

                    <div className="mt-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-ink-muted">
                          {editingId === item.id ? "Update halaman" : (
                            item.current_page
                              ? `Hal ${item.current_page}${book.total_pages ? ` / ${book.total_pages}` : ""}`
                              : "Belum mulai"
                          )}
                        </span>
                        {progress > 0 && (
                          <span className="text-xs font-bold text-amber">{progress}%</span>
                        )}
                      </div>
                      <div className="h-2 bg-parchment rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progress}%`, backgroundColor: "var(--color-amber)" }}
                        />
                      </div>
                    </div>

                    {editingId === item.id ? (
                      <form
                        onSubmit={(e) => { e.preventDefault(); updateProgress(item.id, parseInt(pageInput) || 0); }}
                        className="flex gap-2 items-center mt-2"
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={pageInput}
                          onChange={(e) => setPageInput(e.target.value.replace(/[^0-9]/g, ""))}
                          className="w-20 px-2 py-1.5 text-xs border-[1.5px] border-amber rounded-lg text-center focus:outline-none focus:border-ink bg-parchment"
                          autoFocus
                          min={0}
                          max={book.total_pages ?? 9999}
                        />
                        <span className="text-xs text-ink-muted">/ {book.total_pages ?? "?"}</span>
                        <button type="submit" disabled={savingId === item.id} className="text-xs font-semibold text-amber min-h-[36px] px-2 disabled:opacity-50">
                          {savingId === item.id ? "…" : "Simpan"}
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="text-xs text-ink-muted min-h-[36px] px-1">Batal</button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <Link
                          href="/log"
                          className="flex items-center gap-1 text-xs font-semibold text-white bg-amber brutal-border rounded-lg px-3 min-h-[36px] hover:bg-amber-hover transition-colors"
                        >
                          <PenLine size={11} strokeWidth={2.5} />
                          Catat
                        </Link>
                        <button
                          onClick={() => { setEditingId(item.id); setPageInput(String(item.current_page ?? 0)); }}
                          className="text-xs text-ink-secondary brutal-border rounded-lg px-3 min-h-[36px] hover:border-amber/70 hover:text-ink transition-colors"
                        >
                          Hal {item.current_page ?? 0}
                        </button>
                        <button
                          onClick={() => markDone(item.id)}
                          title="Tandai selesai"
                          aria-label="Tandai selesai"
                          className="flex items-center gap-1 text-xs text-forest font-semibold brutal-border rounded-lg px-3 min-h-[36px] hover:bg-forest/10 transition-colors ml-auto"
                        >
                          <Check size={13} strokeWidth={2.5} />
                          Selesai
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <Link href="/jelajah" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-border text-sm text-ink-muted hover:border-amber/40 hover:text-amber transition-colors">
            + Tambah buku lain
          </Link>
        </div>
      )}

      {/* ── MAU BACA tab ── */}
      {tab === "want" && filtered.length > 0 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((item) => {
              const book = item.books;
              if (!book) return null;
              const url = bookUrl(book);
              return (
                <div key={item.id} className="flex flex-col">
                  <div className="relative group">
                    <Link href={url}>
                      <BookCover src={book.cover_url} title={book.title} className="w-full h-[120px] rounded-xl" />
                    </Link>
                    <button
                      onClick={() => removeFromShelf(item.id)}
                      className="absolute top-1 right-1 w-7 h-7 bg-ink/60 text-white rounded-full text-xs flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      title="Hapus dari rak"
                      aria-label="Hapus dari rak"
                    >
                      ×
                    </button>
                  </div>
                  <Link href={url} className="hover:text-amber transition-colors">
                    <p className="text-[11px] font-medium text-ink line-clamp-2 leading-snug mt-1.5 mb-1">{book.title}</p>
                  </Link>
                  <button
                    onClick={() => markReading(item.id)}
                    disabled={startingId === item.id}
                    className="mt-auto w-full min-h-[36px] py-1 rounded-lg brutal-border text-[11px] font-semibold text-forest hover:bg-forest/8 hover:border-forest/50 transition-colors disabled:opacity-40"
                  >
                    {startingId === item.id ? "…" : "Mulai Baca"}
                  </button>
                </div>
              );
            })}
          </div>
          <Link href="/jelajah" className="flex items-center justify-center gap-2 w-full mt-4 py-3 rounded-xl border-2 border-dashed border-border text-sm text-ink-muted hover:border-amber/40 hover:text-amber transition-colors">
            + Tambah buku
          </Link>
        </div>
      )}

      {/* ── SELESAI tab ── */}
      {tab === "done" && filtered.length > 0 && (
        <div>
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((item) => {
              const book = item.books;
              if (!book) return null;
              const url = bookUrl(book);
              const review = getReview(item.id);
              const vis = review ? getVisibility(review) : null;
              const visInfo = vis ? VISIBILITY_LABELS[vis] : null;

              return (
                <div key={item.id} className="flex flex-col">
                  <div className="relative">
                    <Link href={url}>
                      <BookCover src={book.cover_url} title={book.title} className="w-full h-[120px] rounded-xl" />
                    </Link>
                    <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-forest rounded-full flex items-center justify-center">
                      <Check size={12} strokeWidth={3} className="text-white" />
                    </div>
                  </div>
                  <Link href={url} className="hover:text-amber transition-colors">
                    <p className="text-[11px] font-medium text-ink line-clamp-2 leading-snug mt-1.5 mb-1">{book.title}</p>
                  </Link>

                  {review && review.slug ? (
                    <div className="flex gap-1 mt-auto">
                      <Link
                        href={`/review/${review.slug}`}
                        className="flex-1 min-h-[36px] rounded-lg bg-forest/10 text-[10px] font-semibold text-forest text-center hover:bg-forest/20 transition-colors flex items-center justify-center gap-1"
                      >
                        <Check size={9} strokeWidth={3} />
                        Review
                      </Link>
                      <button
                        onClick={() => toggleVisibility(review)}
                        disabled={togglingSlug === review.slug}
                        title={`Visibilitas: ${vis} — klik untuk ganti`}
                        className={`flex items-center gap-1 min-h-[36px] px-2 rounded-lg border text-[10px] font-semibold transition-colors disabled:opacity-40 ${
                          vis === "public"
                            ? "border-forest/30 text-forest bg-forest/5 hover:bg-forest/15"
                            : vis === "anonymous"
                            ? "border-amber/30 text-amber bg-amber-soft hover:bg-amber/20"
                            : "border-border text-ink-muted hover:border-ink/30"
                        }`}
                      >
                        {visInfo?.icon}
                        {visInfo?.label}
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={`/review/tulis?shelf=${item.id}`}
                      className="mt-auto w-full min-h-[36px] flex items-center justify-center rounded-lg brutal-border text-[11px] font-semibold text-amber hover:bg-amber-soft hover:border-amber/50 transition-colors text-center"
                    >
                      Tulis Review
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
