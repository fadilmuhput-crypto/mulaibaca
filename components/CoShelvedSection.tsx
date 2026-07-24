"use client";

import Link from "next/link";
import BookCover from "@/components/BookCover";
import type { CoShelvedBook } from "@/lib/recommendations";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function bookUrl(b: CoShelvedBook): string {
  if (b.slug) return `/buku/${b.slug}`;
  if (b.open_library_id) return `/buku/${toSlug(b.title)}-${b.open_library_id.toLowerCase()}`;
  return `/buku/${toSlug(b.title)}`;
}

export default function CoShelvedSection({ books }: { books: CoShelvedBook[] }) {
  if (books.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-h3 mb-3">Pembaca Lain Juga Baca…</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 scroll-fade-wrap">
        {books.map((b) => (
          <div key={b.id} className="flex-shrink-0 w-28">
            <Link href={bookUrl(b)}>
              <BookCover src={b.cover_url} title={b.title} className="w-full h-[100px] rounded-xl mb-1.5" />
            </Link>
            <Link href={bookUrl(b)} className="hover:text-amber transition-colors">
              <p className="text-[11px] font-medium text-ink line-clamp-2 leading-tight">{b.title}</p>
            </Link>
            <p className="text-[10px] text-ink-muted truncate">{b.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
