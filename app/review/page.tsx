import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import NavBar from "@/components/NavBar";
import { Star, PenLine } from "lucide-react";
import BookCover from "@/components/BookCover";

export const metadata = {
  title: "Review Buku — Mulaibaca",
  description: "Kumpulan review buku dari keluarga Indonesia. Temukan rekomendasi buku terbaik.",
  alternates: { canonical: "https://mulaibaca.id/review" },
  openGraph: {
    title: "Review Buku — Mulaibaca",
    description: "Kumpulan review buku dari keluarga Indonesia. Temukan rekomendasi buku terbaik.",
    url: "https://mulaibaca.id/review",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Review Buku — Mulaibaca",
    description: "Kumpulan review buku dari keluarga Indonesia. Temukan rekomendasi buku terbaik.",
  },
};

const STARS = [1, 2, 3, 4, 5];

export default async function ReviewPage() {
  const session = await getSession();

  if (session) {
    // Authenticated: show personal reviews + unreviewed books
    const supabase = await createClient();
    const [{ data: reviews }, { data: doneShelf }] = await Promise.all([
      supabase
        .from("reviews")
        .select("*, shelf_items(books(title, author, cover_url))")
        .eq("member_id", session.memberId)
        .order("published_at", { ascending: false }),
      supabase
        .from("shelf_items")
        .select("id, books(title, author, cover_url)")
        .eq("member_id", session.memberId)
        .eq("status", "done"),
    ]);

    const reviewedIds = new Set((reviews ?? []).map((r: { shelf_item_id: string }) => r.shelf_item_id));
    const unreviewed = (doneShelf ?? []).filter((s: { id: string }) => !reviewedIds.has(s.id));

    return (
      <div className="min-h-screen pb-20 sm:pb-6">
        <NavBar session={session} />
        <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-h1">Review Buku</h1>
          </div>

          {/* Books waiting for review */}
          {unreviewed.length > 0 && (
            <section>
              <h2 className="font-semibold text-ink mb-3 flex items-center gap-2">
                <PenLine size={14} strokeWidth={2} className="text-ink-secondary" /> Menunggu review
              </h2>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(unreviewed as any[]).map((item: { id: string; books: { title: string; author: string | null; cover_url: string | null } | null }) => {
                  const book = item.books;
                  return (
                    <Link
                      key={item.id}
                      href={`/review/tulis?shelf=${item.id}`}
                      className="flex gap-3 items-center bg-surface rounded-2xl border border-border p-3 hover:border-amber/50 transition-colors"
                    >
                      <BookCover src={book?.cover_url ?? null} title={book?.title ?? ""} className="w-10 h-14 rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-ink truncate">{book?.title}</p>
                        {book?.author && <p className="text-xs text-ink-muted">{book.author}</p>}
                      </div>
                      <span className="btn-primary-sm flex-shrink-0">Tulis →</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Written reviews */}
          {(reviews ?? []).length > 0 ? (
            <section>
              <h2 className="font-semibold text-ink mb-3 flex items-center gap-2">
                <Star size={14} strokeWidth={2} className="text-amber" /> Reviewmu
              </h2>
              <div className="space-y-3">
                {(reviews ?? []).map((review: {
                  id: string;
                  slug: string | null;
                  rating: number;
                  q_about: string | null;
                  shelf_items: { books: { title: string; author: string | null; cover_url: string | null } | null } | null;
                }) => {
                  const book = review.shelf_items?.books;
                  return (
                    <div key={review.id} className="bg-surface rounded-2xl border border-border p-4">
                      <div className="flex gap-3">
                        <BookCover src={book?.cover_url ?? null} title={book?.title ?? ""} className="w-10 h-14 rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-ink">{book?.title}</p>
                          <div className="flex gap-0.5 mt-1">
                            {STARS.map((s) => (
                              <span key={s} className={`text-sm ${s <= review.rating ? "text-amber" : "text-border"}`}>★</span>
                            ))}
                          </div>
                          {review.q_about && (
                            <p className="text-xs text-ink-secondary mt-1.5 line-clamp-2">{review.q_about}</p>
                          )}
                        </div>
                      </div>
                      {review.slug && (
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-ink-muted">Halaman publik</span>
                          <Link href={`/review/${review.slug}`} className="text-xs text-amber font-medium hover:text-amber-hover">
                            Lihat & Share →
                          </Link>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : unreviewed.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center text-amber mb-3"><Star size={48} strokeWidth={1} /></div>
              <p className="text-ink-secondary text-sm">Selesaikan membaca buku dulu,</p>
              <p className="text-ink-secondary text-sm">lalu tulis reviewnya di sini.</p>
              <Link href="/rak" className="btn-secondary inline-flex mt-3">Ke Rak Buku →</Link>
            </div>
          ) : null}
        </main>
      </div>
    );
  }

  // Public: show all public reviews (no auth required, crawlable by Google)
  const supabase = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: publicReviews } = await supabase
    .from("reviews")
    .select("slug, rating, q_about, published_at, members(name, avatar), shelf_items(books(title, author, cover_url))")
    .eq("is_public", true)
    .order("published_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-parchment">
      {/* Public header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-border/60 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="text-lg font-display font-bold text-forest tracking-tight">mulaibaca</Link>
        <Link href="/masuk" className="btn-primary-sm">Masuk</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-h1 mb-1">Review Buku</h1>
        <p className="text-ink-secondary text-sm mb-6">Ulasan buku dari keluarga Indonesia</p>

        {(publicReviews ?? []).length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center text-amber mb-3"><Star size={48} strokeWidth={1} /></div>
            <p className="text-ink-secondary">Jadilah yang pertama menulis review!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(publicReviews ?? []).map((review: any) => {
              const book = review.shelf_items?.books;
              if (!review.slug) return null;
              return (
                <Link
                  key={review.slug}
                  href={`/review/${review.slug}`}
                  className="bg-surface rounded-2xl border border-border p-4 hover:border-amber/50 hover:shadow-sm transition-all"
                >
                  <div className="flex gap-3 mb-3">
                    <BookCover src={book?.cover_url ?? null} title={book?.title ?? ""} className="w-10 h-14 rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink truncate">{book?.title}</p>
                      {book?.author && <p className="text-xs text-ink-muted truncate">{book.author}</p>}
                      <div className="flex gap-0.5 mt-1">
                        {STARS.map((s) => (
                          <span key={s} className={`text-xs ${s <= review.rating ? "text-amber" : "text-border"}`}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.q_about && (
                    <p className="text-xs text-ink-secondary line-clamp-2 mb-3">{review.q_about}</p>
                  )}
                  <p className="text-xs text-ink-muted">{review.members?.name}</p>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-sm text-ink-secondary mb-3">Mulai catat progres bacaanmu</p>
          <Link href="/daftar" className="btn-primary">Mulai Gratis →</Link>
        </div>
      </main>
    </div>
  );
}
