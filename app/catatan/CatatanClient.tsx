"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import BookCover from "@/components/BookCover";
import ImageLightbox from "@/components/ImageLightbox";
import { BookOpen, ChevronRight } from "lucide-react";
import type { NoteLog } from "./page";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function bookUrl(book: { title: string; open_library_id: string | null; slug?: string | null }): string {
  if (book.slug) return `/buku/${book.slug}`;
  if (book.open_library_id) return `/buku/${toSlug(book.title)}-${book.open_library_id.toLowerCase()}`;
  return `/buku/${toSlug(book.title)}`;
}

function formatDate(dateStr: string | null, fallback: string): string {
  const d = new Date(dateStr ?? fallback);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

type BookGroup = {
  bookId: string;
  title: string;
  cover_url: string | null;
  open_library_id: string | null;
  slug: string | null;
  author: string | null;
  notes: NoteLog[];
  totalPages: number;
};

export default function CatatanClient({ notes }: { notes: NoteLog[] }) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, BookGroup>();
    for (const note of notes) {
      const book = note.shelf_items!.books!;
      const key = book.id;
      if (!map.has(key)) {
        map.set(key, {
          bookId: book.id,
          title: book.title,
          cover_url: book.cover_url,
          open_library_id: book.open_library_id,
          slug: (book as any).slug ?? null,
          author: book.author,
          notes: [],
          totalPages: 0,
        });
      }
      const group = map.get(key)!;
      group.notes.push(note);
      group.totalPages += note.pages_read;
    }
    return Array.from(map.values());
  }, [notes]);

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center text-ink-muted mb-3">
          <BookOpen size={40} strokeWidth={1.5} />
        </div>
        <p className="text-ink-secondary font-medium">Belum ada catatan</p>
        <p className="text-sm text-ink-muted mt-1 mb-4">
          Tambahkan catatan saat kamu mengisi log bacaan harian
        </p>
        <Link href="/log" className="btn-primary px-5 py-2 text-sm">
          Catat bacaan sekarang →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1">Catatan Bacaan</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {notes.length} catatan dari {groups.length} buku
          </p>
        </div>
        <Link href="/log" className="btn-ghost-ink px-3 py-2 text-sm">
          + Tulis log
        </Link>
      </div>

      <div className="space-y-4">
        {groups.map((group) => {
          const isExpanded = expandedBook === group.bookId || expandedBook === null;
          const displayNotes = isExpanded ? group.notes : group.notes.slice(0, 2);
          const hasMore = group.notes.length > 2 && !isExpanded;

          return (
            <div key={group.bookId} className="bg-surface rounded-2xl border border-border overflow-hidden">
              {/* Book header */}
              <Link
                href={bookUrl(group)}
                className="flex items-center gap-3 p-4 hover:bg-parchment/50 transition-colors"
              >
                <BookCover
                  src={group.cover_url}
                  title={group.title}
                  className="w-10 h-14 rounded-xl flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink truncate">{group.title}</p>
                  {group.author && (
                    <p className="text-xs text-ink-muted truncate">{group.author}</p>
                  )}
                  <p className="text-xs text-ink-muted mt-0.5">
                    {group.notes.length} catatan · {group.totalPages} halaman
                  </p>
                </div>
                <ChevronRight size={16} strokeWidth={2} className="text-ink-muted flex-shrink-0" />
              </Link>

              {/* Notes */}
              <div className="border-t border-border/60 divide-y divide-border/40">
                {displayNotes.map((log) => {
                  const dateLabel = formatDate(log.log_date, log.created_at);
                  const hasPageRange = log.from_page != null && log.to_page != null;
                  return (
                    <div key={log.id} className="px-4 py-3 space-y-2">
                      {/* Page range badge */}
                      {hasPageRange && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded-md">
                            Hal {log.from_page} → {log.to_page}
                          </span>
                          <span className="text-[10px] text-ink-muted font-medium">
                            +{log.pages_read} hal
                          </span>
                        </div>
                      )}

                      {/* Note text */}
                      <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                        {log.note}
                      </p>

                      {/* Images */}
                      {(() => {
                        const imgs = log.images ?? [];
                        if (imgs.length === 0) return null;
                        return (
                          <div className="flex gap-1.5 flex-wrap">
                            {imgs.map((url, i) => (
                              <button key={i} type="button" onClick={() => setLightboxImage(url)}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        );
                      })()}

                      {/* Date */}
                      <p className="text-[10px] text-ink-muted">{dateLabel}</p>
                    </div>
                  );
                })}

                {/* Expand/collapse */}
                {group.notes.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setExpandedBook(isExpanded ? null : group.bookId)}
                    className="w-full text-xs font-medium text-amber hover:text-amber-hover transition-colors py-2.5 text-center"
                  >
                    {isExpanded ? "— Sembunyikan" : `+${group.notes.length - 2} catatan lainnya`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </>
  );
}
