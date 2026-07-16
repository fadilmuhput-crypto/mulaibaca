import { getRecommendations } from "@/lib/recommendations";
import BookCover from "@/components/BookCover";
import Link from "next/link";

export default function RecommendedBooks({ existingTitles }: { existingTitles: string[] }) {
  const books = getRecommendations(existingTitles, 6);
  if (books.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-xs font-black uppercase tracking-widest text-ink-muted">Rekomendasi</h2>
        <Link href="/jelajah" className="text-xs font-semibold text-ink-muted hover:text-amber transition-colors">Jelajah →</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {books.map((book) => {
          const slug = book.open_library_id
            ? `/buku/${book.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-")}-${book.open_library_id.toLowerCase()}`
            : `/jelajah`;
          return (
            <Link
              key={book.title}
              href={slug}
              className="flex-shrink-0 w-32 bg-surface rounded-xl border border-border p-2.5 hover:border-amber/40 transition-colors"
            >
              <BookCover src={book.cover_url} title={book.title} className="w-full aspect-[3/4] rounded-lg mb-2" />
              <p className="font-medium text-ink text-xs truncate">{book.title}</p>
              {book.author && (
                <p className="text-[10px] text-ink-muted truncate mt-0.5">{book.author}</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
