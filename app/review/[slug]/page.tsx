import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";
import AvatarIcon from "@/components/AvatarIcon";
import { BookOpen } from "lucide-react";
import BookCover from "@/components/BookCover";
import ReviewSettings from "@/components/ReviewSettings";
import ShareButton from "@/components/ShareButton";

const STARS = [1, 2, 3, 4, 5];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: review } = await supabase
    .from("reviews")
    .select(`
      rating, q_about, is_anonymous,
      shelf_items(books(title, author)),
      members(name)
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!review) return { title: "Review Buku — Mulaibaca" };

  const shelfItems = review.shelf_items as any[];
  const book = shelfItems?.[0]?.books ?? null;
  const membersList = review.members as any[];
  const member = membersList?.[0] ?? null;
  const reviewer = review.is_anonymous ? "Anonim" : (member?.name ?? "Pembaca");
  const title = book?.title ?? "Buku";
  const stars = "⭐".repeat(review.rating ?? 0);
  const description = review.q_about
    ? `"${review.q_about.slice(0, 200)}" — ${stars} oleh ${reviewer}`
    : `Review buku ${title} oleh ${reviewer} di Mulaibaca.`;
  const url = `https://mulaibaca.id/review/${slug}`;

  return {
    title: `Review ${title} oleh ${reviewer} — Mulaibaca`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `Review ${title} oleh ${reviewer} — Mulaibaca`,
      description,
      url,
      type: "article",
      images: [`https://mulaibaca.id/api/og/review/${slug}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `Review ${title} oleh ${reviewer} — Mulaibaca`,
      description,
      images: [`https://mulaibaca.id/api/og/review/${slug}`],
    },
  };
}

export default async function PublicReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  const supabase = createAdminClient();

  const { data: review } = await supabase
    .from("reviews")
    .select(`
      *,
      members(name, avatar),
      shelf_items(books(title, author, cover_url, total_pages))
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!review) notFound();

  const book = (review.shelf_items as { books: { title: string; author: string | null; cover_url: string | null; total_pages: number | null } | null } | null)?.books;
  const member = review.members as { name: string; avatar: string } | null;

  const reviewerName = review.is_anonymous ? "Anonim" : (member?.name ?? "Pembaca");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Book",
      name: book?.title ?? "Buku",
      author: book?.author ? { "@type": "Person", name: book.author } : undefined,
    },
    author: { "@type": "Person", name: reviewerName },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
    },
    description: review.q_about ?? undefined,
    url: `https://mulaibaca.id/review/${slug}`,
  };

  return (
    <div className="min-h-screen pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-display font-bold text-forest">
          mulaibaca
        </Link>
        <div className="flex items-center gap-3">
          <ShareButton
            url={`https://mulaibaca.id/review/${slug}`}
            title={`Review ${book?.title ?? "Buku"} oleh ${reviewerName} — Mulaibaca`}
            text={`Review "${book?.title}" oleh ${reviewerName} ⭐${"⭐".repeat(review.rating)} — baca selengkapnya di mulaibaca 📚`}
          />
          {!session && (
            <Link href="/daftar" className="btn-primary-sm">Mulai Gratis →</Link>
          )}
        </div>
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
          <span className="text-amber"><AvatarIcon avatar={review.is_anonymous ? "book" : (member?.avatar ?? "book")} size={18} /></span>
          <div>
            <p className="text-sm font-medium text-ink">{review.is_anonymous ? "Anonim" : member?.name}</p>
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

        {/* Settings */}
        {session && session.memberId === review.member_id && (
          <div className="mt-6">
            <ReviewSettings slug={review.slug} initialPublic={review.is_public} initialAnonymous={review.is_anonymous} />
          </div>
        )}

      </main>

      {/* Sticky bottom bar — CTA */}
      {session ? (
        <div className="fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-ink z-10 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Link href="/dashboard" className="flex-1 btn-primary-lg text-center text-sm">
              ← Dashboard
            </Link>
            <Link href="/rak" className="flex-1 btn-ghost-ink text-center text-sm">
              Rak Buku
            </Link>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-forest z-10 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <p className="text-white font-display font-bold text-sm">Mulai baca & review</p>
              <p className="text-white/60 text-xs mt-0.5">Gratis, tanpa ribet</p>
            </div>
            <Link href="/daftar" className="bg-white text-forest text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-parchment transition-colors whitespace-nowrap">
              Mulai Gratis →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
