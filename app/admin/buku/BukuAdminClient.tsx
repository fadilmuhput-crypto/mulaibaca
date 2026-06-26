"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BookCover from "@/components/BookCover";
import type { AdminBook } from "./page";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { CATEGORY_TREE } from "@/lib/category-tree";

export default function BukuAdminClient({ initialBooks }: { initialBooks: AdminBook[] }) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [filterCat, setFilterCat] = useState("semua");
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = books.filter((b) => {
    let matchCat = true;
    if (filterCat !== "semua") {
      const root = CATEGORY_TREE.find((c) => c.key === filterCat);
      if (root) {
        const tagsWithCategory = b.category === "anak" ? [...b.tags, "anak"] : b.tags;
        matchCat = root.matchTags.some((t) => tagsWithCategory.includes(t));
      }
    }
    const matchSearch =
      !search.trim() ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const activeCount = books.filter((b) => b.is_active).length;

  function countForCat(key: string) {
    const root = CATEGORY_TREE.find((c) => c.key === key);
    if (!root) return 0;
    return books.filter((b) => {
      const tags = b.category === "anak" ? [...b.tags, "anak"] : b.tags;
      return root.matchTags.some((t) => tags.includes(t));
    }).length;
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

  return (
    <div>
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

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
        <input
          type="search"
          placeholder="Cari judul atau pengarang…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1"
        />
      </div>

      {/* Book list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-ink-muted text-sm">
            {search ? "Tidak ada buku yang cocok." : "Belum ada buku di kategori ini."}
          </div>
        )}
        {filtered.map((book) => (
          <div
            key={book.id}
            className={`bg-surface rounded-2xl border p-4 flex gap-4 items-start transition-opacity ${
              book.is_active ? "border-border" : "border-border opacity-50"
            }`}
          >
            {/* Cover */}
            <BookCover
              src={book.cover_url}
              title={book.title}
              className="w-12 h-16 rounded-lg flex-shrink-0"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                {(() => {
                  const tagsWithCat = book.category === "anak" ? [...book.tags, "anak"] : book.tags;
                  const matched = CATEGORY_TREE.find((c) => c.matchTags.some((t) => tagsWithCat.includes(t)));
                  return matched ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-parchment text-ink-muted">
                      {matched.label}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-border text-ink-muted">
                      {book.category}
                    </span>
                  );
                })()}
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

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => toggleActive(book)}
                disabled={toggling === book.id}
                title={book.is_active ? "Nonaktifkan" : "Aktifkan"}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment transition-colors disabled:opacity-40"
              >
                {book.is_active
                  ? <Eye size={16} strokeWidth={1.75} />
                  : <EyeOff size={16} strokeWidth={1.75} />}
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
