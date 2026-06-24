import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import NavBar from "@/components/NavBar";

const STARS = [1, 2, 3, 4, 5];

export default async function ReviewPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

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
    <div className="min-h-screen bg-parchment pb-20">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <h1 className="text-h1">Review Buku</h1>

        {/* Books waiting for review */}
        {unreviewed.length > 0 && (
          <section>
            <h2 className="font-semibold text-ink mb-3 flex items-center gap-2">
              <span className="text-base">✍️</span> Menunggu review
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
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                      {book?.cover_url ? (
                        <img src={book.cover_url} alt={book?.title ?? ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📗</div>
                      )}
                    </div>
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
              <span className="text-base">⭐</span> Reviewmu
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
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                        {book?.cover_url ? (
                          <img src={book.cover_url} alt={book?.title ?? ""} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">📗</div>
                        )}
                      </div>
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
                        <Link
                          href={`/review/${review.slug}`}
                          className="text-xs text-amber font-medium hover:text-amber-hover"
                        >
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
            <div className="text-5xl mb-3">⭐</div>
            <p className="text-ink-secondary text-sm">Selesaikan membaca buku dulu,</p>
            <p className="text-ink-secondary text-sm">lalu tulis reviewnya di sini.</p>
            <Link href="/rak" className="btn-secondary inline-flex mt-3">
              Ke Rak Buku →
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
