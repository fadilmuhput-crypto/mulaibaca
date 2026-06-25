import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-route";
import AvatarIcon from "@/components/AvatarIcon";
import BookCover from "@/components/BookCover";
import { BookCheck, BookText, Flame, Star } from "lucide-react";

const STARS = [1, 2, 3, 4, 5];

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return {
    title: `@${username} — mulaibaca`,
    description: `Profil pembaca @${username} di mulaibaca`,
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
    .select("id, name, avatar, member_type, families(name)")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (!member) notFound();

  const memberId = member.id as string;
  const familyName = (member.families as unknown as { name: string } | null)?.name ?? "";

  const [{ data: doneShelf }, { data: logs }, { data: streak }, { data: reviews }] =
    await Promise.all([
      supabase.from("shelf_items").select("id").eq("member_id", memberId).eq("status", "done"),
      supabase.from("reading_logs").select("pages_read").eq("member_id", memberId),
      supabase.from("streaks").select("longest_streak").eq("member_id", memberId).maybeSingle(),
      supabase
        .from("reviews")
        .select("slug, rating, q_about, published_at, shelf_items(books(title, author, cover_url))")
        .eq("member_id", memberId)
        .eq("is_public", true)
        .order("published_at", { ascending: false }),
    ]);

  const booksFinished = doneShelf?.length ?? 0;
  const totalPages = (logs ?? []).reduce((s, l) => s + ((l as { pages_read: number }).pages_read), 0);
  const longestStreak = (streak?.longest_streak as number) ?? 0;

  const memberTypeLabel: Record<string, string> = {
    ayah: "Ayah", ibu: "Ibu", anak: "Anak", dewasa: "Pembaca",
  };

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="bg-surface border-b-2 border-ink px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="font-display font-black text-ink tracking-tight" style={{ fontSize: "1.1875rem", letterSpacing: "-0.03em" }}>
          mulaibaca
        </Link>
        <Link href="/masuk" className="btn-primary-sm">Masuk</Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Profile hero */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-soft border-2 border-amber/30 flex items-center justify-center text-amber flex-shrink-0">
            <AvatarIcon avatar={member.avatar as string} size={28} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-ink">{member.name as string}</h1>
            <p className="text-sm text-ink-muted">
              {memberTypeLabel[member.member_type as string] ?? "Pembaca"} · {familyName}
            </p>
            <p className="text-xs text-ink-muted mt-0.5">@{username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface rounded-xl p-3 text-center border border-border">
            <BookCheck size={15} strokeWidth={1.75} className="text-forest mx-auto mb-1" />
            <div className="font-display text-xl font-black text-ink">{booksFinished}</div>
            <div className="text-[10px] text-ink-muted font-medium">Selesai</div>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center border border-border">
            <BookText size={15} strokeWidth={1.75} className="text-amber mx-auto mb-1" />
            <div className="font-display text-xl font-black text-ink">
              {totalPages >= 1000 ? `${(totalPages / 1000).toFixed(1)}k` : totalPages}
            </div>
            <div className="text-[10px] text-ink-muted font-medium">Halaman</div>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center border border-border">
            <Flame size={15} strokeWidth={1.75} className="text-amber mx-auto mb-1" />
            <div className="font-display text-xl font-black text-ink">{longestStreak}</div>
            <div className="text-[10px] text-ink-muted font-medium">Streak</div>
          </div>
        </div>

        {/* Reviews */}
        {(reviews ?? []).length > 0 ? (
          <section>
            <h2 className="text-[11px] font-black text-ink-muted uppercase tracking-[0.12em] mb-3">
              Review buku ({reviews?.length})
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(reviews ?? []).map((review: any) => {
                const book = review.shelf_items?.books;
                if (!review.slug) return null;
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
            <p className="text-sm text-ink-muted">Belum ada review publik.</p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-forest rounded-2xl p-6 text-center" style={{ border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal-sm)" }}>
          <p className="text-white font-display font-bold text-lg mb-1">Yuk baca bareng keluarga!</p>
          <p className="text-white/70 text-sm mb-4">Track progress, tulis review, jaga streak baca harian</p>
          <Link href="/daftar" className="bg-white text-forest text-sm font-bold px-6 py-2.5 rounded-lg inline-flex hover:bg-parchment transition-colors">
            Buat Ruang Keluarga Gratis →
          </Link>
        </div>
      </main>
    </div>
  );
}
