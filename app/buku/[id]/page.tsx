import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { BUKU_ANAK, BUKU_LOKAL } from "@/lib/curated-books";
import AddToShelfButtons from "./AddToShelfButtons";
import BookCover from "@/components/BookCover";
import { createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";
import LikeButton from "@/components/LikeButton";

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
  isbn: string | null;
  publisher: string | null;
  published_year: number | null;
  language: string;
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function isOLId(id: string) {
  return /^OL\d+[A-Z]+$/.test(id);
}

// Extracts OL ID from slugs like "atomic-habits-ol26745w" → "OL26745W"
function extractOLIdFromSlug(id: string): string | null {
  const match = id.match(/-(ol\d+[a-z]+)$/i);
  return match ? match[1].toUpperCase() : null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Extracts UUID from slugs like "atomic-habits-uuid" → UUID
function extractUUIDFromSlug(id: string): string | null {
  const match = id.match(/-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  return match ? match[1].toLowerCase() : null;
}

async function fetchOLBook(olId: string): Promise<BookData | null> {
  try {
    const [workRes, editionsRes] = await Promise.all([
      fetch(`https://openlibrary.org/works/${olId}.json`, { next: { revalidate: 86400 } }),
      fetch(`https://openlibrary.org/works/${olId}/editions.json?limit=1`, { next: { revalidate: 86400 } }),
    ]);
    if (!workRes.ok) return null;
    const work: OLWork = await workRes.json();

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
    } catch { /* skip */ }

    let cover_url: string | null = null;
    if (work.covers?.[0]) {
      cover_url = `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`;
    }

    let total_pages: number | null = null;
    if (editionsRes.ok) {
      const editions = await editionsRes.json();
      total_pages = editions.entries?.[0]?.number_of_pages ?? null;
    }

    let description: string | null = null;
    if (typeof work.description === "string") {
      description = work.description;
    } else if (work.description?.value) {
      description = work.description.value;
    }
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
      isbn: null,
      publisher: null,
      published_year: null,
      language: "id",
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
    isbn: "isbn" in book ? (book as Record<string, string | null>).isbn : null,
    publisher: "publisher" in book ? (book as Record<string, string | null>).publisher : null,
    published_year: "published_year" in book ? (book as Record<string, number | null>).published_year : null,
    language: "language" in book ? (book as Record<string, string>).language || "id" : "id",
  };
}

type ReviewRow = {
  id: string;
  slug: string;
  rating: number;
  q_about: string | null;
  published_at: string;
  members: { name: string; avatar: string } | null;
};

type LikeState = Record<string, { liked: boolean; count: number }>;

async function fetchBookReviews(olId: string | null, title: string): Promise<ReviewRow[]> {
  const supabase = createAdminClient();
  try {
    // Find book IDs by OL ID or exact title
    const bookQuery = supabase.from("books").select("id");
    const { data: books } = olId
      ? await bookQuery.eq("open_library_id", olId)
      : await bookQuery.ilike("title", title);

    if (!books?.length) return [];

    const bookIds = books.map((b: { id: string }) => b.id);
    const { data: shelfItems } = await supabase
      .from("shelf_items").select("id").in("book_id", bookIds);

    if (!shelfItems?.length) return [];

    const shelfIds = shelfItems.map((s: { id: string }) => s.id);
    const { data: reviews } = await supabase
      .from("reviews")
      .select("id, slug, rating, q_about, published_at, members(name, avatar)")
      .in("shelf_item_id", shelfIds)
      .eq("is_public", true)
      .order("published_at", { ascending: false })
      .limit(10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (reviews ?? []) as unknown as ReviewRow[];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const curated = findCurated(id);
  const title = curated?.title ?? id.replace(/-ol\w+$/i, "").replace(/-/g, " ");
  const description = curated?.description ?? `Detail buku ${title} di Mulaibaca — baca, track progres, dan tulis review.`;
  const url = `https://mulaibaca.id/buku/${id}`;
  return {
    title: `${title} — Mulaibaca`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — Mulaibaca`,
      description,
      url,
      type: "book",
    },
    twitter: {
      card: "summary",
      title: `${title} — Mulaibaca`,
      description,
    },
  };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Bare OL ID (e.g. OL26745W) → fetch title → redirect to SEO slug
  if (isOLId(id)) {
    const book = await fetchOLBook(id);
    if (!book) notFound();
    const seoSlug = `${toSlug(book.title)}-${id.toLowerCase()}`;
    permanentRedirect(`/buku/${seoSlug}`);
  }

  let book: BookData | null = null;
  const supabase = createAdminClient();
  const FIELDS = "title, author, cover_url, open_library_id, total_pages, isbn, publisher, published_year, language, description";

  // Try UUID direct lookup (bare UUID or slug-uuid format)
  const uuid = UUID_RE.test(id) ? id : extractUUIDFromSlug(id);
  if (uuid) {
    const { data: byId } = await supabase
      .from("books").select(FIELDS).eq("id", uuid).maybeSingle();
    if (byId) {
      book = {
        title: byId.title,
        author: byId.author,
        cover_url: byId.cover_url,
        open_library_id: byId.open_library_id,
        total_pages: byId.total_pages,
        description: byId.description,
        subjects: [],
        year: null,
        isbn: byId.isbn,
        publisher: byId.publisher,
        published_year: byId.published_year,
        language: (byId.language as string) ?? "id",
      };
    }
  }

  // Try curated first (pure title slug match)
  if (!book) book = findCurated(id);

  // Try "title-slug-ol26745w" format
  if (!book) {
    const olId = extractOLIdFromSlug(id);
    if (olId) {
      book = await fetchOLBook(olId);
    }
  }

  // Try Supabase database (manual / locally-added books)
  if (!book) {
    const approxTitle = id.replace(/-/g, " ");
    const words = approxTitle.split(" ").filter((w) => w.length > 1);

    function mapBook(matched: Record<string, unknown>): BookData {
      return {
        title: matched.title as string,
        author: matched.author as string | null,
        cover_url: matched.cover_url as string | null,
        open_library_id: matched.open_library_id as string | null,
        total_pages: matched.total_pages as number | null,
        description: matched.description as string | null,
        subjects: [],
        year: null,
        isbn: matched.isbn as string | null,
        publisher: matched.publisher as string | null,
        published_year: matched.published_year as number | null,
        language: (matched.language as string) ?? "id",
      };
    }

    // Strategy 1: word-by-word pattern — handles punctuation in titles (e.g. "Mikir!")
    const chainPattern = words.slice(0, 6).map((w) => `%${w}`).join("") + "%";
    const { data: byChain } = await supabase.from("books").select(FIELDS).ilike("title", chainPattern).limit(30);
    const matchedChain = (byChain ?? []).find((b: { title: string }) => toSlug(b.title) === id);
    if (matchedChain) { book = mapBook(matchedChain as Record<string, unknown>); }

    // Strategy 2 fallback: longest word anchor — catches edge cases where word order differs
    if (!book) {
      const anchor = words.reduce((a, b) => (b.length > a.length ? b : a), words[0] ?? "");
      if (anchor.length > 2) {
        const { data: byAnchor } = await supabase.from("books").select(FIELDS).ilike("title", `%${anchor}%`).limit(50);
        const matchedAnchor = (byAnchor ?? []).find((b: { title: string }) => toSlug(b.title) === id);
        if (matchedAnchor) { book = mapBook(matchedAnchor as Record<string, unknown>); }
      }
    }
  }

  if (!book) notFound();

  const session = await getSession();
  const [reviews] = await Promise.all([
    fetchBookReviews(book.open_library_id, book.title),
  ]);

  // Fetch likes for all reviews (2 queries total, no N+1)
  const supabase2 = createAdminClient();
  const reviewIds = reviews.map((r) => r.id);
  const likeData: LikeState = {};
  if (reviewIds.length > 0) {
    const [allLikesRes, myLikesRes] = await Promise.all([
      supabase2.from("review_likes").select("review_id").in("review_id", reviewIds),
      session?.memberId
        ? supabase2.from("review_likes").select("review_id").in("review_id", reviewIds).eq("member_id", session.memberId)
        : Promise.resolve({ data: [] }),
    ]);
    const allLikes = allLikesRes.data ?? [];
    const myLikes = myLikesRes.data ?? [];
    const countMap: Record<string, number> = {};
    allLikes.forEach((l: { review_id: string }) => { countMap[l.review_id] = (countMap[l.review_id] ?? 0) + 1; });
    const myLikeSet = new Set(myLikes.map((l: { review_id: string }) => l.review_id));
    reviewIds.forEach((id) => {
      likeData[id] = { liked: myLikeSet.has(id), count: countMap[id] ?? 0 };
    });
  }

  const bookPayload = {
    title: book.title,
    author: book.author,
    cover_url: book.cover_url,
    isbn: null,
    open_library_id: book.open_library_id,
    total_pages: book.total_pages,
  };

  const STARS = [1, 2, 3, 4, 5];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: book.author ? { "@type": "Person", name: book.author } : undefined,
    numberOfPages: book.total_pages ?? undefined,
    description: book.description ?? undefined,
    url: `https://mulaibaca.id/buku/${id}`,
    image: book.cover_url ?? undefined,
    inLanguage: book.language === "en" ? "en" : "id",
    isbn: book.isbn ?? undefined,
  };

  return (
    <div className="min-h-screen pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link
          href="/jelajah"
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
          <BookCover src={book.cover_url} title={book.title} className="w-24 h-36 rounded-xl shadow-md" />
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="font-display font-bold text-xl text-ink leading-tight">{book.title}</h1>
            {book.author && <p className="text-ink-secondary text-sm mt-1">{book.author}</p>}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-ink-muted">
              {book.total_pages && (
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                  {book.total_pages} halaman
                </span>
              )}
              {book.isbn && <span>ISBN: {book.isbn}</span>}
              {book.publisher && <span>{book.publisher}</span>}
              {(book.published_year || book.year) && <span>{book.published_year || book.year}</span>}
              {book.language && book.language !== "id" && <span>{book.language === "en" ? "Inggris" : book.language === "ar" ? "Arab" : book.language}</span>}
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

        {/* Subjects */}
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

        {/* Reviews section */}
        {reviews.length > 0 && (
          <>
            <div className="divider my-6" />
            <section>
              <h2 className="text-h3 mb-4">Review dari Pembaca</h2>
              <div className="space-y-3">
                {reviews.map((review) => {
                  const like = likeData[review.id];
                  return (
                    <div
                      key={review.slug}
                      className="bg-surface rounded-2xl border border-border p-4 hover:border-amber/50 transition-colors"
                    >
                      <Link href={`/review/${review.slug}`} className="block">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-sm text-ink">{review.members?.name}</p>
                          <div className="flex gap-0.5 flex-shrink-0">
                            {STARS.map((s) => (
                              <span key={s} className={`text-sm ${s <= review.rating ? "text-amber" : "text-border"}`}>★</span>
                            ))}
                          </div>
                        </div>
                        {review.q_about && (
                          <p className="text-xs text-ink-secondary line-clamp-3">{review.q_about}</p>
                        )}
                        <p className="text-xs text-amber font-medium mt-2">Baca review lengkap →</p>
                      </Link>
                      {like && (
                        <div className="mt-2 pt-2 border-t border-border/60">
                          <LikeButton slug={review.slug} initialLiked={like.liked} initialCount={like.count} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
