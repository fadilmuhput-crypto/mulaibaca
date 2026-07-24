"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BookCover from "@/components/BookCover";
import type { AdminBook } from "./page";
import { Pencil, Trash2, Eye, EyeOff, AlertCircle, CheckCircle2, RefreshCw, Sparkles, Filter, Search } from "lucide-react";
import { CATEGORY_TREE } from "@/lib/category-tree";

type StatusFilter = "all" | "active" | "inactive";
type SourceFilter = "all" | "user_manual" | "admin_manual" | "import" | "cron";
type CompletenessFilter = "all" | "incomplete" | "complete";

const SOURCE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  user_manual: { label: "User Input", color: "text-red-600", bg: "bg-red-50 border-red-200" },
  admin_manual: { label: "Admin", color: "text-ink-muted", bg: "bg-parchment border-border" },
  import: { label: "Import", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  cron: { label: "Auto", color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
};

function completeness(b: AdminBook) {
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

export default function BukuAdminClient({
  initialBooks,
}: {
  initialBooks: AdminBook[];
}) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [completenessFilter, setCompletenessFilter] = useState<CompletenessFilter>("all");
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [enriching, setEnriching] = useState<string | null>(null);
  const [aiEnriching, setAiEnriching] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    let list = books;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }

    if (statusFilter === "active") {
      list = list.filter((b) => b.is_active);
    } else if (statusFilter === "inactive") {
      list = list.filter((b) => !b.is_active);
    }

    if (sourceFilter !== "all") {
      list = list.filter((b) => b.source === sourceFilter);
    }

    if (completenessFilter === "incomplete") {
      list = list.filter((b) => !completeness(b).complete);
    } else if (completenessFilter === "complete") {
      list = list.filter((b) => completeness(b).complete);
    }

    list = [...list].sort((a, bA) => {
      const aUser = a.source === "user_manual" ? 0 : 1;
      const bUser = bA.source === "user_manual" ? 0 : 1;
      if (aUser !== bUser) return aUser - bUser;

      const aComplete = completeness(a).complete ? 1 : 0;
      const bComplete = completeness(bA).complete ? 1 : 0;
      if (aComplete !== bComplete) return aComplete - bComplete;

      return a.title.localeCompare(bA.title);
    });

    return list;
  }, [books, search, statusFilter, sourceFilter, completenessFilter]);

  const stats = useMemo(() => {
    const total = books.length;
    const active = books.filter((b) => b.is_active).length;
    const incomplete = books.filter((b) => !completeness(b).complete).length;
    const userManual = books.filter((b) => b.source === "user_manual").length;
    return { total, active, inactive: total - active, incomplete, userManual };
  }, [books]);

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

  async function aiEnrichBook(bookId: string) {
    setAiEnriching(bookId);
    try {
      const res = await fetch("/api/books/ai-enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`AI Enrich gagal: ${data.error}`);
        return;
      }
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, enrichment_status: "enriched" } : b))
      );
      if (data.updated?.length > 0) {
        router.refresh();
      }
    } catch {
      alert("Gagal terhubung ke AI enrichment");
    } finally {
      setAiEnriching(null);
    }
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="search"
          placeholder="Cari judul atau pengarang…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-ink-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="text-xs font-medium px-3 py-2 rounded-xl border border-border bg-surface text-ink-secondary"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
          className="text-xs font-medium px-3 py-2 rounded-xl border border-border bg-surface text-ink-secondary"
        >
          <option value="all">Semua Sumber</option>
          <option value="user_manual">User Input</option>
          <option value="admin_manual">Admin</option>
          <option value="import">Import</option>
          <option value="cron">Auto (Cron)</option>
        </select>

        <select
          value={completenessFilter}
          onChange={(e) => setCompletenessFilter(e.target.value as CompletenessFilter)}
          className="text-xs font-medium px-3 py-2 rounded-xl border border-border bg-surface text-ink-secondary"
        >
          <option value="all">Semua Kelengkapan</option>
          <option value="incomplete">Incomplete</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total },
          { label: "Aktif", value: stats.active },
          { label: "Incomplete", value: stats.incomplete, highlight: stats.incomplete > 0 },
          { label: "User Input", value: stats.userManual, highlight: stats.userManual > 0 },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-xl border border-border p-3 text-center">
            <div className={`text-2xl font-display font-black ${s.highlight ? "text-amber" : "text-ink"}`}>{s.value}</div>
            <div className="text-xs text-ink-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Book list */}
      <div className="space-y-2">
        {filteredBooks.length === 0 && (
          <div className="text-center py-16 text-ink-muted text-sm">
            {search ? "Tidak ada buku yang cocok." : "Belum ada buku."}
          </div>
        )}

        {filteredBooks.map((book) => {
          const { fields, filled, total, complete } = completeness(book);
          const sourceCfg = SOURCE_CONFIG[book.source ?? "admin_manual"];

          return (
            <div
              key={book.id}
              className={`bg-surface rounded-2xl border p-4 flex gap-4 items-start transition-opacity ${
                book.is_active ? "border-border" : "border-border opacity-50"
              }`}
            >
              <BookCover src={book.cover_url} title={book.title} className="w-12 h-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sourceCfg.bg} ${sourceCfg.color}`}>
                    {sourceCfg.label}
                  </span>
                  {(() => {
                    const matched = CATEGORY_TREE.find((c) => c.matchTags.some((t) => (book.categories ?? []).includes(t)));
                    return matched ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-parchment text-ink-muted border border-border">
                        {matched.label}
                      </span>
                    ) : null;
                  })()}
                  {book.enrichment_status === "pending" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-soft text-amber border border-amber/20">
                      pending
                    </span>
                  )}
                  {book.enrichment_status === "failed" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-error-soft text-error border border-error/20">
                      failed
                    </span>
                  )}
                  {!book.is_active && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-error-soft text-error border border-error/20">
                      nonaktif
                    </span>
                  )}
                </div>

                {/* Title + Author */}
                <p className="font-semibold text-ink text-sm mt-1 line-clamp-1">{book.title}</p>
                <p className="text-xs text-ink-muted">{book.author}</p>

                {/* Completeness indicator */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1">
                    {fields.slice(0, 4).map((f) => (
                      <span
                        key={f.key}
                        className={`inline-flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded ${
                          f.ok
                            ? "text-forest bg-forest/8"
                            : "text-amber bg-amber-soft"
                        }`}
                      >
                        {f.ok ? <CheckCircle2 size={8} /> : <AlertCircle size={8} />}
                        {f.key}
                      </span>
                    ))}
                    {fields.length > 4 && (
                      <span className="text-[9px] text-ink-muted">+{fields.length - 4}</span>
                    )}
                  </div>
                  <div className="flex-1 h-1 bg-parchment rounded-full overflow-hidden max-w-[60px]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(filled / total) * 100}%`,
                        backgroundColor: complete ? "var(--color-forest)" : "var(--color-amber)",
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-ink-muted">{filled}/{total}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {book.enrichment_status !== "enriched" && (
                  <>
                    <button
                      onClick={() => enrichBook(book.id)}
                      disabled={enriching === book.id}
                      title="Enrich dari OpenLibrary"
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment hover:text-forest transition-colors disabled:opacity-40"
                    >
                      <RefreshCw size={16} strokeWidth={1.75} className={enriching === book.id ? "animate-spin" : ""} />
                    </button>
                    <button
                      onClick={() => aiEnrichBook(book.id)}
                      disabled={aiEnriching === book.id}
                      title="Enrich pakai AI"
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment hover:text-purple-600 transition-colors disabled:opacity-40"
                    >
                      <Sparkles size={16} strokeWidth={1.75} className={aiEnriching === book.id ? "animate-pulse" : ""} />
                    </button>
                  </>
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
          );
        })}
      </div>
    </div>
  );
}
