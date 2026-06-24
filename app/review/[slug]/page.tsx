import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-route";
import AvatarIcon from "@/components/AvatarIcon";
import { BookOpen } from "lucide-react";
import BookCover from "@/components/BookCover";

const STARS = [1, 2, 3, 4, 5];

export default async function PublicReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: review } = await supabase
    .from("reviews")
    .select(`
      *,
      members(name, avatar),
      families(name),
      shelf_items(books(title, author, cover_url, total_pages))
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!review) notFound();

  const book = (review.shelf_items as { books: { title: string; author: string | null; cover_url: string | null; total_pages: number | null } | null } | null)?.books;
  const member = review.members as { name: string; avatar: string } | null;
  const family = review.families as { name: string } | null;

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-display font-bold text-forest">
          mulaibaca
        </Link>
        <Link href="/daftar" className="btn-primary-sm">
          Mulai Gratis →
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Book info */}
        <div className="flex gap-4 mb-6">
          <BookCover src={book?.cover_url ?? null} title={book?.title ?? ""} className="w-20 h-28 rounded-xl shadow-md" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-ink leading-tight">
              {book?.title}
            </h1>
            {book?.author && (
              <p className="text-ink-secondary text-sm mt-1">{book.author}</p>
            )}
            {/* Rating */}
            <div className="flex gap-0.5 mt-2">
              {STARS.map((s) => (
                <span key={s} className={`text-xl ${s <= review.rating ? "text-amber" : "text-border"}`}>★</span>
              ))}
            </div>
          </div>
        </div>

        {/* Reviewer */}
        <div className="flex items-center gap-2 mb-6 bg-surface rounded-xl border border-border px-4 py-3">
          <span className="text-amber"><AvatarIcon avatar={member?.avatar ?? "book"} size={18} /></span>
          <div>
            <p className="text-sm font-medium text-ink">{member?.name}</p>
            <p className="text-xs text-ink-muted">dari {family?.name}</p>
          </div>
        </div>

        {/* Review content */}
        <div className="space-y-4">
          {review.q_about && (
            <div className="bg-surface rounded-2xl border border-border p-5">
              <p className="text-xs font-semibold text-amber uppercase tracking-wide mb-2">
                <span className="flex items-center gap-1.5"><BookOpen size={14} strokeWidth={2} />Tentang buku ini</span>
              </p>
              <p className="text-ink text-sm leading-relaxed">{review.q_about}</p>
            </div>
          )}
          {review.q_memorable && (
            <div className="bg-surface rounded-2xl border border-border p-5">
              <p className="text-xs font-semibold text-amber uppercase tracking-wide mb-2">
                💡 Yang paling berkesan
              </p>
              <p className="text-ink text-sm leading-relaxed">{review.q_memorable}</p>
            </div>
          )}
          {review.q_for_whom && (
            <div className="bg-surface rounded-2xl border border-border p-5">
              <p className="text-xs font-semibold text-amber uppercase tracking-wide mb-2">
                👥 Cocok untuk
              </p>
              <p className="text-ink text-sm leading-relaxed">{review.q_for_whom}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-forest rounded-2xl p-6 text-center">
          <p className="text-white font-display font-bold text-lg mb-1">
            Yuk baca bareng keluarga!
          </p>
          <p className="text-white/70 text-sm mb-4">
            Track progress, tulis review, jaga streak baca harian
          </p>
          <Link href="/daftar" className="btn-primary-lg inline-flex">
            Buat Ruang Keluarga Gratis →
          </Link>
        </div>
      </main>
    </div>
  );
}
