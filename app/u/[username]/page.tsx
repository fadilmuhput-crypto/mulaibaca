import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";
import AvatarIcon from "@/components/AvatarIcon";
import BookCover from "@/components/BookCover";
import FollowButton from "@/components/FollowButton";
import ShareButton from "@/components/ShareButton";
import BackButton from "@/components/BackButton";
import { BookCheck, BookText, Flame, Star, BookOpen, Bookmark } from "lucide-react";

export const dynamic = "force-dynamic";

const STARS = [1, 2, 3, 4, 5];

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function bookUrl(book: { title: string; open_library_id: string | null }): string {
  if (book.open_library_id) {
    return `/buku/${toSlug(book.title)}-${book.open_library_id.toLowerCase()}`;
  }
  return `/buku/${toSlug(book.title)}`;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const supabase = createAdminClient();
  const { data: member } = await supabase
    .from("members")
    .select("name")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  const displayName = member?.name ?? `@${username}`;
  const url = `https://mulaibaca.id/u/${username}`;
  return {
    title: `${displayName} (@${username}) — mulaibaca`,
    description: `Profil pembaca ${displayName} di Mulaibaca. Lihat buku yang sedang dibaca, sudah selesai, dan review buku.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${displayName} (@${username}) — mulaibaca`,
      description: `Profil pembaca ${displayName} di Mulaibaca.`,
      url,
      images: [`https://mulaibaca.id/api/og/profile/${username}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} (@${username}) — mulaibaca`,
      description: `Profil pembaca ${displayName} di Mulaibaca.`,
      images: [`https://mulaibaca.id/api/og/profile/${username}`],
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = createAdminClient();

  const { data: member } = await supabase
    .from("members")
    .select("id, name, avatar")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (!member) notFound();

  const memberId = member.id as string;

  const [
    { data: logs },
    { data: streak },
    { data: reviews },
    { data: readingShelf },
    { data: doneShelf },
    { data: wantShelf },
  ] = await Promise.all([
    supabase.from("reading_logs").select("pages_read").eq("member_id", memberId),
    supabase.from("streaks").select("longest_streak").eq("member_id", memberId).maybeSingle(),
    supabase
      .from("reviews")
      .select("slug, rating, q_about, published_at, is_anonymous, shelf_items(books(title, author, cover_url))")
      .eq("member_id", memberId)
      .eq("is_public", true)
      .order("published_at", { ascending: false }),
    supabase
      .from("shelf_items")
      .select("id, books(title, cover_url, open_library_id)")
      .eq("member_id", memberId)
      .eq("status", "reading")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("shelf_items")
      .select("id, books(title, cover_url, open_library_id)")
      .eq("member_id", memberId)
      .eq("status", "done")
      .order("finished_at", { ascending: false })
      .limit(12),
    supabase
      .from("shelf_items")
      .select("id, books(title, cover_url, open_library_id)")
      .eq("member_id", memberId)
      .eq("status", "want")
      .order("created_at", { ascending: false })
      .limit(9),
  ]);

  const session = await getSession();
  const viewerMemberId = session?.memberId ?? null;

  const supabaseAdmin = createAdminClient();
  const [
    { count: followerCount },
    { count: followingCount },
  ] = await Promise.all([
    supabaseAdmin.from("follows").select("*", { count: "exact", head: true }).eq("following_id", memberId),
    supabaseAdmin.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", memberId),
  ]);

  let initialIsFollowing = false;
  if (viewerMemberId && viewerMemberId !== memberId) {
    const { data: existing } = await supabaseAdmin
      .from("follows")
      .select("id")
      .eq("follower_id", viewerMemberId)
      .eq("following_id", memberId)
      .maybeSingle();
    initialIsFollowing = !!existing;
  }

  const booksFinished = doneShelf?.length ?? 0;
  const totalPages = (logs ?? []).reduce((s, l) => s + ((l as { pages_read: number }).pages_read), 0);
  const longestStreak = (streak?.longest_streak as number) ?? 0;

  type ShelfBook = { title: string; cover_url: string | null; open_library_id: string | null };

  function getBook(item: unknown): ShelfBook | null {
    const b = (item as { books: ShelfBook | null })?.books;
    return b ?? null;
  }

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="bg-surface border-b-2 border-ink px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-1">
          <BackButton />
          <Link href="/" className="font-display font-black text-ink tracking-tight" style={{ fontSize: "1.1875rem", letterSpacing: "-0.03em" }}>
            mulaibaca
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ShareButton
            url={`https://mulaibaca.id/u/${username}`}
            title={`${member.name} (@${username}) — mulaibaca`}
            text={`Lihat profil ${member.name} di mulaibaca 📚 mulaibaca.id/u/${username}`}
            className="text-ink-muted hover:text-amber"
          />
          {!viewerMemberId && (
            <Link href="/daftar" className="btn-primary-sm">Daftar</Link>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Profile hero */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-soft border-2 border-amber/30 flex items-center justify-center text-amber flex-shrink-0">
            <AvatarIcon avatar={member.avatar as string} size={28} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-ink">{member.name as string}</h1>
            <p className="text-xs text-ink-muted mt-0.5">@{username}</p>
          </div>
        </div>

        {/* Follow stats + button */}
        <div className="flex items-center gap-4 text-sm">
          {viewerMemberId ? (
            <Link href="/progress/pengikut" className="text-ink-muted hover:text-ink transition-colors">
              <strong className="text-ink font-semibold">{followerCount ?? 0}</strong> pengikut
            </Link>
          ) : (
            <span className="text-ink-muted">
              <strong className="text-ink font-semibold">{followerCount ?? 0}</strong> pengikut
            </span>
          )}
          {viewerMemberId ? (
            <Link href="/progress/mengikuti" className="text-ink-muted hover:text-ink transition-colors">
              <strong className="text-ink font-semibold">{followingCount ?? 0}</strong> mengikuti
            </Link>
          ) : (
            <span className="text-ink-muted">
              <strong className="text-ink font-semibold">{followingCount ?? 0}</strong> mengikuti
            </span>
          )}
          <div className="ml-auto">
            {viewerMemberId === memberId ? (
              <Link
                href="/edit-profil"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-parchment text-ink border border-border rounded-xl hover:bg-amber-soft/40 transition-colors"
              >
                Edit Profil
              </Link>
            ) : (
              <FollowButton
                targetId={memberId}
                initialFollowers={followerCount ?? 0}
                initialIsFollowing={initialIsFollowing}
                viewerMemberId={viewerMemberId}
                hideCount
                prefetched
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface rounded-xl p-3 text-center brutal-border brutal-shadow-xs">
            <BookCheck size={15} strokeWidth={1.75} className="text-forest mx-auto mb-1" />
            <div className="font-display text-xl font-black text-ink">{booksFinished}</div>
            <div className="text-[10px] text-ink-muted font-medium">Selesai</div>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center brutal-border brutal-shadow-xs">
            <BookText size={15} strokeWidth={1.75} className="text-amber mx-auto mb-1" />
            <div className="font-display text-xl font-black text-ink">
              {totalPages >= 1000 ? `${(totalPages / 1000).toFixed(1)}k` : totalPages}
            </div>
            <div className="text-[10px] text-ink-muted font-medium">Halaman</div>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center brutal-border brutal-shadow-xs">
            <Flame size={15} strokeWidth={1.75} className="text-amber mx-auto mb-1" />
            <div className="font-display text-xl font-black text-ink">{longestStreak}</div>
            <div className="text-[10px] text-ink-muted font-medium">Streak</div>
          </div>
        </div>

        {/* Sedang dibaca */}
        {(readingShelf ?? []).length > 0 && (
          <section>
            <h2 className="text-overline mb-3 flex items-center gap-1.5">
              <BookOpen size={12} strokeWidth={2.5} className="text-amber" />
              Sedang dibaca
            </h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {(readingShelf ?? []).map((item) => {
                const book = getBook(item);
                if (!book) return null;
                return (
                  <Link key={(item as { id: string }).id} href={bookUrl(book)} className="flex-shrink-0 w-[72px]">
                    <BookCover src={book.cover_url} title={book.title} className="w-[72px] h-[100px] rounded-xl" />
                    <p className="text-[10px] text-ink line-clamp-2 leading-snug mt-1.5">{book.title}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Selesai dibaca */}
        {(doneShelf ?? []).length > 0 && (
          <section>
            <h2 className="text-overline mb-3 flex items-center gap-1.5">
              <BookCheck size={12} strokeWidth={2.5} className="text-forest" />
              Sudah selesai ({booksFinished})
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {(doneShelf ?? []).map((item) => {
                const book = getBook(item);
                if (!book) return null;
                return (
                  <Link key={(item as { id: string }).id} href={bookUrl(book)}>
                    <BookCover src={book.cover_url} title={book.title} className="w-full h-[90px] rounded-xl" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Mau dibaca */}
        {(wantShelf ?? []).length > 0 && (
          <section>
            <h2 className="text-overline mb-3 flex items-center gap-1.5">
              <Bookmark size={12} strokeWidth={2.5} className="text-ink-muted" />
              Ingin dibaca
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {(wantShelf ?? []).map((item) => {
                const book = getBook(item);
                if (!book) return null;
                return (
                  <Link key={(item as { id: string }).id} href={bookUrl(book)}>
                    <BookCover src={book.cover_url} title={book.title} className="w-full h-[90px] rounded-xl opacity-80" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Reviews */}
        {(reviews ?? []).length > 0 ? (
          <section>
            <h2 className="text-overline mb-3">
              Review buku ({reviews?.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(reviews ?? []).map((review: any) => {
                const raw = review.shelf_items;
                const book = Array.isArray(raw) ? raw[0]?.books : raw?.books;
                if (!review.slug) return null;
                const displayName = review.is_anonymous ? "Anonim" : (member.name as string);
                return (
                  <Link
                    key={review.slug}
                    href={`/review/${review.slug}`}
                    className="bg-surface rounded-2xl border border-border p-3 hover:border-amber/50 transition-colors"
                  >
                    <div className="flex gap-2 mb-2">
                      <BookCover src={book?.cover_url ?? null} title={book?.title ?? ""} className="w-9 h-12 rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-ink line-clamp-2 leading-snug">{book?.title}</p>
                        <div className="flex gap-0.5 mt-1">
                          {STARS.map((s) => (
                            <Star
                              key={s}
                              size={9}
                              strokeWidth={0}
                              fill={s <= review.rating ? "var(--color-amber)" : "var(--color-border)"}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-ink-muted mt-0.5">{displayName}</p>
                      </div>
                    </div>
                    {review.q_about && (
                      <p className="text-[11px] text-ink-secondary line-clamp-2 leading-relaxed">{review.q_about}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center mb-3 text-ink-muted">
              <Star size={32} strokeWidth={1.25} />
            </div>
            <p className="text-sm text-ink-muted">Belum ada review publik.</p>
          </div>
        )}

        {/* CTA — only for non-logged-in visitors */}
        {!viewerMemberId && (
          <div className="bg-forest rounded-2xl p-6 text-center brutal-border brutal-shadow-sm">
            <p className="text-white font-display font-bold text-lg mb-1">Mulai bangun kebiasaan membaca</p>
            <p className="text-white/70 text-sm mb-4">Catat progres, tulis review, jaga streak baca harian</p>
            <Link href="/daftar" className="bg-white text-forest text-sm font-bold px-6 py-2.5 rounded-lg inline-flex hover:bg-parchment transition-colors">
              Mulai Gratis →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
