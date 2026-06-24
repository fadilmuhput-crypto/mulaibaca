import { notFound } from "next/navigation";
import Link from "next/link";
import { BUKU_ANAK, BUKU_LOKAL } from "@/lib/curated-books";
import AddToShelfButtons from "./AddToShelfButtons";

type OLWork = {
  title?: string;
  description?: string | { value: string };
  subjects?: string[];
  first_publish_date?: string;
  covers?: number[];
};

type OLAuthor = {
  name?: string;
};

type BookData = {
  title: string;
  author: string | null;
  cover_url: string | null;
  open_library_id: string | null;
  total_pages: number | null;
  description: string | null;
  subjects: string[];
  year: string | null;
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function isOLId(id: string) {
  return /^OL\d+[A-Z]+$/.test(id);
}

async function fetchOLBook(olId: string): Promise<BookData | null> {
  try {
    const [workRes, editionsRes] = await Promise.all([
      fetch(`https://openlibrary.org/works/${olId}.json`, { next: { revalidate: 86400 } }),
      fetch(`https://openlibrary.org/works/${olId}/editions.json?limit=1`, { next: { revalidate: 86400 } }),
    ]);
    if (!workRes.ok) return null;
    const work: OLWork = await workRes.json();

    // Get author names (reuse already-fetched work JSON)
    let author: string | null = null;
    try {
      const workData = work as { authors?: { author?: { key?: string } }[] };
      const authorRef = workData.authors?.[0]?.author?.key;
      if (authorRef) {
        const authorRes = await fetch(`https://openlibrary.org${authorRef}.json`, { next: { revalidate: 86400 } });
        if (authorRes.ok) {
          const authorData: OLAuthor = await authorRes.json();
          author = authorData.name ?? null;
        }
      }
    } catch { /* skip author fetch error */ }

    // Get cover
    let cover_url: string | null = null;
    if (work.covers?.[0]) {
      cover_url = `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`;
    }

    // Get page count from editions
    let total_pages: number | null = null;
    if (editionsRes.ok) {
      const editions = await editionsRes.json();
      total_pages = editions.entries?.[0]?.number_of_pages ?? null;
    }

    // Parse description
    let description: string | null = null;
    if (typeof work.description === "string") {
      description = work.description;
    } else if (work.description?.value) {
      description = work.description.value;
    }
    // Trim OL description boilerplate
    if (description) {
      description = description.replace(/\([^)]*Wikipedia[^)]*\)/g, "").trim().slice(0, 600);
    }

    return {
      title: work.title ?? "Tanpa Judul",
      author,
      cover_url,
      open_library_id: olId,
      total_pages,
      description,
      subjects: (work.subjects ?? []).slice(0, 8),
      year: work.first_publish_date ?? null,
    };
  } catch {
    return null;
  }
}

function findCurated(slug: string): BookData | null {
  const all = [...BUKU_ANAK, ...BUKU_LOKAL];
  const book = all.find((b) => toSlug(b.title) === slug || b.open_library_id === slug);
  if (!book) return null;
  return {
    title: book.title,
    author: book.author,
    cover_url: book.cover_url,
    open_library_id: book.open_library_id,
    total_pages: book.total_pages,
    description: book.description,
    subjects: book.tags,
    year: null,
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let book: BookData | null = null;

  if (isOLId(id)) {
    book = await fetchOLBook(id);
  } else {
    book = findCurated(id);
  }

  if (!book) notFound();

  const bookPayload = {
    title: book.title,
    author: book.author,
    cover_url: book.cover_url,
    isbn: null,
    open_library_id: book.open_library_id,
    total_pages: book.total_pages,
  };

  return (
    <div className="min-h-screen bg-parchment pb-10">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link
          href="/rak/tambah"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-secondary hover:text-ink rounded-xl"
          aria-label="Kembali"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-h3 truncate">{book.title}</span>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Book hero */}
        <div className="flex gap-5 mb-6">
          <div className="w-24 h-36 rounded-xl overflow-hidden bg-cream flex-shrink-0 shadow-md">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">📗</div>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="font-display font-bold text-xl text-ink leading-tight">
              {book.title}
            </h1>
            {book.author && (
              <p className="text-ink-secondary text-sm mt-1">{book.author}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-ink-muted">
              {book.total_pages && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                  {book.total_pages} halaman
                </span>
              )}
              {book.year && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {book.year}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <section className="mb-5">
            <h2 className="text-h3 mb-2">Tentang Buku Ini</h2>
            <p className="text-body text-ink-secondary leading-relaxed">{book.description}</p>
          </section>
        )}

        {/* Subjects / tags */}
        {book.subjects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-h3 mb-2">Kategori</h2>
            <div className="flex gap-1.5 flex-wrap">
              {book.subjects.map((s) => (
                <span key={s} className="badge">{s}</span>
              ))}
            </div>
          </section>
        )}

        {/* Add to shelf */}
        <div className="divider mb-5" />
        <h2 className="text-h3 mb-3">Tambah ke Rak</h2>
        <AddToShelfButtons book={bookPayload} />
      </main>
    </div>
  );
}
