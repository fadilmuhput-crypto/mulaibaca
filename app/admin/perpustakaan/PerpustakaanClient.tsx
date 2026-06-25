"use client";

import { useState } from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import { Pencil, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import type { LibraryBook } from "./page";

type Filter = "semua" | "belum-lengkap" | "lengkap";

function completeness(b: LibraryBook) {
  const fields = [
    { key: "cover", ok: !!b.cover_url },
    { key: "halaman", ok: !!b.total_pages },
    { key: "pengarang", ok: !!b.author },
    { key: "isbn", ok: !!b.isbn },
  ];
  const filled = fields.filter((f) => f.ok).length;
  return { fields, filled, total: fields.length, complete: filled === fields.length };
}

function usageCount(b: LibraryBook) {
  return b.shelf_items?.[0]?.count ?? 0;
}

export default function PerpustakaanClient({ initialBooks }: { initialBooks: LibraryBook[] }) {
  const [books] = useState(initialBooks);
  const [filter, setFilter] = useState<Filter>("semua");
  const [search, setSearch] = useState("");

  const filtered = books.filter((b) => {
    const matchSearch =
      !search.trim() ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author ?? "").toLowerCase().includes(search.toLowerCase());

    const { complete } = completeness(b);
    const matchFilter =
      filter === "semua" ||
      (filter === "belum-lengkap" && !complete) ||
      (filter === "lengkap" && complete);

    return matchSearch && matchFilter;
  });

  const lengkapCount = books.filter((b) => completeness(b).complete).length;
  const belumCount = books.length - lengkapCount;
  const totalUsage = books.reduce((sum, b) => sum + usageCount(b), 0);

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total buku", value: books.length },
          { label: "Data lengkap", value: lengkapCount },
          { label: "Total di rak", value: totalUsage },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-display font-black text-ink">{s.value}</div>
            <div className="text-xs text-ink-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-2">
          {(
            [
              { key: "semua", label: `Semua (${books.length})` },
              { key: "belum-lengkap", label: `Belum lengkap (${belumCount})` },
              { key: "lengkap", label: `Lengkap (${lengkapCount})` },
            ] as { key: Filter; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`min-h-[40px] px-4 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                filter === t.key
                  ? "bg-ink text-surface"
                  : "bg-surface border border-border text-ink-secondary hover:border-amber/50"
              }`}
            >
              {t.label}
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
        {filtered.map((book) => {
          const { fields, filled, total, complete } = completeness(book);
          const usage = usageCount(book);

          return (
            <div
              key={book.id}
              className="bg-surface rounded-2xl border border-border p-4 flex gap-4 items-start"
            >
              {/* Cover */}
              <BookCover
                src={book.cover_url}
                title={book.title}
                className="w-12 h-16 rounded-lg flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm line-clamp-1">{book.title}</p>
                <p className="text-xs text-ink-muted">{book.author ?? "Pengarang belum diisi"}</p>

                {/* Completeness chips */}
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
                      {f.ok
                        ? <CheckCircle2 size={9} strokeWidth={2.5} />
                        : <AlertCircle size={9} strokeWidth={2.5} />}
                      {f.key}
                    </span>
                  ))}
                </div>

                {/* Usage + completeness bar */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-ink-muted">
                    <Users size={11} strokeWidth={2} />
                    {usage} pengguna
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

              {/* Edit action */}
              <Link
                href={`/admin/perpustakaan/${book.id}`}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment hover:text-amber transition-colors flex-shrink-0"
              >
                <Pencil size={16} strokeWidth={1.75} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
