"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BookCover from "@/components/BookCover";
import type { AdminBook, LibraryBook } from "./page";
import { Pencil, Trash2, Eye, EyeOff, Users, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { CATEGORY_TREE } from "@/lib/category-tree";

type Tab = "semua" | "terkurasi" | "perpustakaan" | "enrichment";

type FilterTab = {
  key: Tab;
  label: string;
};

const TABS: FilterTab[] = [
  { key: "semua", label: "Semua" },
  { key: "terkurasi", label: "Terkurasi" },
  { key: "perpustakaan", label: "Perpustakaan" },
  { key: "enrichment", label: "Enrichment" },
];

export default function BukuAdminClient({
  initialBooks,
  initialLibrary,
}: {
  initialBooks: AdminBook[];
  initialLibrary: LibraryBook[];
}) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [perpustakaan] = useState(initialLibrary);
  const [tab, setTab] = useState<Tab>("semua");
  const [filterCat, setFilterCat] = useState("semua");
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [enriching, setEnriching] = useState<string | null>(null);

  const curatedCount = books.filter((b) => b.is_curated).length;
  const enrichmentPending = books.filter((b) => b.enrichment_status === "pending" || b.enrichment_status === "failed").length;

  function completeness(b: LibraryBook) {
    const fields = [
      { key: "cover", ok: !!b.cover_url },
      { key: "halaman", ok: !!b.total_pages },
      { key: "pengarang", ok: !!b.author },
      { key: "isbn", ok: !!b.isbn },
      { key: "deskripsi", ok: !!b.description },
      { key: "kategori", ok: (b.categories ?? []).length > 0 },
      { key: "penerbit", ok: !!b.publisher },
    ];
    const filled = fields.filter((f) => f.ok).length;
    return { fields, filled, total: fields.length, complete: filled === fields.length };
  }

  function usageCount(b: LibraryBook) {
    return b.shelf_items?.[0]?.count ?? 0;
  }

  const filteredBooks = (() => {
    if (tab === "perpustakaan") {
      return perpustakaan.filter((b) => {
        const { complete } = completeness(b);
        return !complete;
      });
    }
    if (tab === "enrichment") {
      return books.filter((b) => b.enrichment_status === "pending" || b.enrichment_status === "failed");
    }
    if (tab === "terkurasi") {
      return books.filter((b) => b.is_curated);
    }
    // "semua"
    let list = books;
    if (filterCat !== "semua") {
      const root = CATEGORY_TREE.find((c) => c.key === filterCat);
      if (root) {
        list = list.filter((b) => root.matchTags.some((t) => (b.categories ?? []).includes(t)));
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    return list;
  })();

  const activeCount = books.filter((b) => b.is_active).length;

  function countForCat(key: string) {
    const root = CATEGORY_TREE.find((c) => c.key === key);
    if (!root) return 0;
    return books.filter((b) => root.matchTags.some((t) => (b.categories ?? []).includes(t))).length;
  }

  async function toggleActive(book: AdminBook) {
    setToggling(book.id);
    try {
      const res = await fetch(`/api/admin/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !book.is_active }),
      });
      if (res.ok) {
        setBooks((prev) =>
          prev.map((b) => (b.id === book.id ? { ...b, is_active: !b.is_active } : b))
        );
      }
    } finally {
      setToggling(null);
    }
  }

  async function deleteBook(book: AdminBook) {
    if (!confirm(`Hapus "${book.title}" secara permanen?`)) return;
    setDeleting(book.id);
    try {
      const res = await fetch(`/api/admin/books/${book.id}`, { method: "DELETE" });
      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b.id !== book.id));
        router.refresh();
      }
    } finally {
      setDeleting(null);
    }
  }

  async function enrichBook(bookId: string) {
    setEnriching(bookId);
    try {
      await fetch("/api/books/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, enrichment_status: "enriched" } : b))
      );
    } finally {
      setEnriching(null);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const count = t.key === "enrichment" ? enrichmentPending : t.key === "terkurasi" ? curatedCount : null;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 min-h-[40px] px-4 rounded-xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-ink text-surface"
                  : "bg-surface border border-border text-ink-secondary hover:border-amber/50"
              }`}
            >
              {t.label}
              {count !== null && (
                <span className={`ml-1.5 text-xs ${tab === t.key ? "text-white/70" : "text-ink-muted"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "semua" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total", value: books.length },
              { label: "Aktif", value: activeCount },
              { label: "Tidak aktif", value: books.length - activeCount },
            ].map((s) => (
              <div key={s.label} className="bg-surface rounded-xl border border-border p-3 text-center">
                <div className="text-2xl font-display font-black text-ink">{s.value}</div>
                <div className="text-xs text-ink-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-3">
            <button
              onClick={() => setFilterCat("semua")}
              className={`flex-shrink-0 min-h-[36px] px-3 rounded-xl text-xs font-medium transition-all ${
                filterCat === "semua"
                  ? "bg-ink text-surface"
                  : "bg-surface border border-border text-ink-secondary hover:border-amber/50"
              }`}
            >
              Semua ({books.length})
            </button>
            {CATEGORY_TREE.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setFilterCat(cat.key)}
                className={`flex-shrink-0 min-h-[36px] px-3 rounded-xl text-xs font-medium transition-all ${
                  filterCat === cat.key
                    ? "bg-ink text-surface"
                    : "bg-surface border border-border text-ink-secondary hover:border-amber/50"
                }`}
              >
                {cat.label} ({countForCat(cat.key)})
              </button>
            ))}
          </div>
        </>
      )}

      {/* Search bar (semua, terkurasi, enrichment) */}
      {tab !== "perpustakaan" && (
        <input
          type="search"
          placeholder="Cari judul atau pengarang…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input mb-5"
        />
      )}

      {/* ── Book list ── */}
      <div className="space-y-2">
        {filteredBooks.length === 0 && (
          <div className="text-center py-16 text-ink-muted text-sm">
            {tab === "enrichment" && "Semua buku sudah di-enrich."}
            {tab === "perpustakaan" && "Semua buku sudah lengkap datanya."}
            {tab === "terkurasi" && "Belum ada buku yang dikurasi."}
            {tab === "semua" && (search ? "Tidak ada buku yang cocok." : "Belum ada buku.")}
          </div>
        )}

        {tab === "perpustakaan"
          ? (filteredBooks as LibraryBook[]).map((book) => {
              const { fields, filled, total, complete } = completeness(book);
              const usage = usageCount(book);
              return (
                <div key={book.id} className="bg-surface rounded-2xl border border-border p-4 flex gap-4 items-start">
                  <BookCover src={book.cover_url} title={book.title} className="w-12 h-16 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink text-sm line-clamp-1">{book.title}</p>
                    <p className="text-xs text-ink-muted">{book.author ?? "Pengarang belum diisi"}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                      {fields.map((f) => (
                        <span
                          key={f.key}
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            f.ok
                              ? "border-forest/20 text-forest bg-forest/8"
                              : "border-amber/30 text-amber bg-amber-soft"
                          }`}
                        >
                          {f.ok ? <CheckCircle2 size={9} strokeWidth={2.5} /> : <AlertCircle size={9} strokeWidth={2.5} />}
                          {f.key}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-ink-muted">
                        <Users size={11} strokeWidth={2} /> {usage} pengguna
                      </span>
                      <div className="flex-1 h-1 bg-parchment rounded-full overflow-hidden max-w-[80px]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(filled / total) * 100}%`,
                            backgroundColor: complete ? "var(--color-forest)" : "var(--color-amber)",
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-ink-muted">{filled}/{total}</span>
                    </div>
                  </div>
                  <Link
                    href={`/admin/perpustakaan/${book.id}`}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment hover:text-amber transition-colors flex-shrink-0"
                  >
                    <Pencil size={16} strokeWidth={1.75} />
                  </Link>
                </div>
              );
            })
          : (filteredBooks as AdminBook[]).map((book) => (
              <div
                key={book.id}
                className={`bg-surface rounded-2xl border p-4 flex gap-4 items-start transition-opacity ${
                  book.is_active ? "border-border" : "border-border opacity-50"
                }`}
              >
                <BookCover src={book.cover_url} title={book.title} className="w-12 h-16 rounded-lg flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    {(() => {
                      const matched = CATEGORY_TREE.find((c) => c.matchTags.some((t) => (book.categories ?? []).includes(t)));
                      return matched ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-parchment text-ink-muted">
                          {matched.label}
                        </span>
                      ) : null;
                    })()}
                    {book.is_curated && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-soft text-amber">
                        curated
                      </span>
                    )}
                    {book.enrichment_status === "pending" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-soft text-amber">
                        pending
                      </span>
                    )}
                    {book.enrichment_status === "failed" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-error-soft text-error">
                        failed
                      </span>
                    )}
                    {!book.is_active && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-error-soft text-error">
                        nonaktif
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-ink text-sm mt-1 line-clamp-1">{book.title}</p>
                  <p className="text-xs text-ink-muted">{book.author}</p>
                  {book.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {book.tags.map((tag) => (
                        <span key={tag} className="badge badge-muted">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {tab === "enrichment" && book.enrichment_status !== "enriched" && (
                    <button
                      onClick={() => enrichBook(book.id)}
                      disabled={enriching === book.id}
                      title="Enrich sekarang"
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment hover:text-amber transition-colors disabled:opacity-40"
                    >
                      <RefreshCw size={16} strokeWidth={1.75} className={enriching === book.id ? "animate-spin" : ""} />
                    </button>
                  )}
                  <button
                    onClick={() => toggleActive(book)}
                    disabled={toggling === book.id}
                    title={book.is_active ? "Nonaktifkan" : "Aktifkan"}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment transition-colors disabled:opacity-40"
                  >
                    {book.is_active ? <Eye size={16} strokeWidth={1.75} /> : <EyeOff size={16} strokeWidth={1.75} />}
                  </button>
                  <Link
                    href={`/admin/buku/${book.id}`}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment hover:text-amber transition-colors"
                  >
                    <Pencil size={16} strokeWidth={1.75} />
                  </Link>
                  <button
                    onClick={() => deleteBook(book)}
                    disabled={deleting === book.id}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-error-soft hover:text-error transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
