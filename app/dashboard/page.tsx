import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import BookCover from "@/components/BookCover";
import FeedClient from "@/app/feed/FeedClient";
import ChallengeEntryCard from "@/components/ChallengeEntryCard";
import { rowToFeedItem, type FeedItem } from "@/lib/feed";
import { Flame, Target, Check, Users } from "lucide-react";
import GoalTrigger from "@/components/GoalTrigger";
import QuickLogButtons from "@/components/QuickLogButtons";
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  try {
    const session = await getSession();
    if (!session) redirect("/masuk");

  const supabase = await createClient();

  const weekStart = (() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  })();

  let shelf: { id: string; current_page: number; books: { id: string; title: string; author: string | null; cover_url: string | null; total_pages: number | null } | null }[] | null = null;
  let allShelf: { books: { title: string }[] }[] | null = null;
  let streaks: { current_streak: number } | null = null;
  let weekLogs: { pages_read: number }[] | null = null;
  let logCount: number | null = null;
  try {
    const results = await Promise.all([
      supabase.from("shelf_items").select("*, books(*)").eq("member_id", session.memberId).eq("status", "reading").order("created_at", { ascending: false }).limit(3),
      supabase.from("streaks").select("*").eq("member_id", session.memberId).maybeSingle(),
      supabase.from("reading_logs").select("pages_read").eq("member_id", session.memberId).gte("created_at", weekStart),
      supabase.from("reading_logs").select("id", { count: "exact", head: true }).eq("member_id", session.memberId),
      supabase.from("shelf_items").select("books(title)").eq("member_id", session.memberId),
    ]);
    shelf = results[0].data;
    streaks = results[1].data;
    weekLogs = results[2].data;
    logCount = results[3].count;
    allShelf = results[4].data;
  } catch (e) { console.error("[dashboard] shelf/streak/logs query error", e); }

  const bookTitles: string[] = [];

  const weeklyPagesRead = ((weekLogs ?? []) as { pages_read: number }[]).reduce((sum: number, l: { pages_read: number }) => sum + (l.pages_read ?? 0), 0);
  const currentStreak = (streaks as { current_streak?: number } | null)?.current_streak ?? 0;
  const readingNow = (shelf ?? []) as { id: string; current_page: number; books: { id: string; title: string; author: string | null; cover_url: string | null; total_pages: number | null } | null }[];
  const hasFirstBook = readingNow.length > 0 || (logCount ?? 0) > 0;
  const hasFirstLog = (logCount ?? 0) > 0;
  const hasWeeklyGoal = (session.weeklyPagesGoal ?? 0) > 0;
  const goalMet = hasWeeklyGoal && weeklyPagesRead >= session.weeklyPagesGoal;
  const shouldShowGoal = hasWeeklyGoal && !goalMet;
  const checklistStepsDone = [hasFirstBook, hasFirstLog, hasWeeklyGoal];
  const allOnboardingDone = checklistStepsDone.every(Boolean);

  // Feed data — query activity_feed
  let feedItems: FeedItem[] = [];
  let clubCount = 0;
  try {
    const admin = createAdminClient();
    const { data: follows } = await admin
      .from("follows")
      .select("following_id")
      .eq("follower_id", session.memberId);
    const followingIds = (follows ?? []).map((f: { following_id: string }) => f.following_id);
    const memberIds = [...new Set([...followingIds, session.memberId])];
    if (memberIds.length > 0) {
      const { data: rows } = await admin
        .from("activity_feed")
        .select("id, activity_type, data, created_at, member_id, members!inner(name, avatar, username)")
        .in("member_id", memberIds)
        .order("created_at", { ascending: false })
        .limit(20);
      feedItems = (rows ?? []).map((r: unknown) => rowToFeedItem(r as Parameters<typeof rowToFeedItem>[0]));
    }

    // Club count for community entry
    const { count } = await admin
      .from("club_members")
      .select("id", { count: "exact", head: true })
      .eq("member_id", session.memberId);
    clubCount = count ?? 0;
  } catch { /* graceful degradation */ }

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* ── HEADER: Greeting + Streak ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1">Halo, {session.memberName}!</h1>
            {currentStreak > 0 ? (
              <p className="text-xs text-ink-muted mt-0.5">
                🔥 {currentStreak} hari berturut-turut
              </p>
            ) : (
              <p className="text-xs text-ink-muted mt-0.5">
                Mulai streak bacamu hari ini!
              </p>
            )}
          </div>
          <Link
            href="/log"
            className="flex items-center gap-2 bg-surface rounded-xl px-3.5 py-2.5 brutal-border brutal-shadow-sm hover:border-amber/40 transition-colors"
          >
            <Flame size={18} strokeWidth={1.75} className="text-amber" />
            {currentStreak > 0 ? (
              <span className="font-display text-xl font-black text-ink">{currentStreak}</span>
            ) : (
              <span className="font-display text-sm font-black text-ink">Mulai!</span>
            )}
          </Link>
        </div>

        {/* ── CHALLENGE ENTRY (after onboarding) ── */}
        {allOnboardingDone && <ChallengeEntryCard />}

        {/* ── ONBOARDING: banner tipis (jika belum selesai) ── */}
        {!allOnboardingDone && (
          <section className="bg-surface rounded-2xl border-2 border-amber/30 p-4 space-y-2.5">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-black uppercase tracking-widest text-ink-muted">Mulai dari sini</span>
              <span className="text-xs font-bold text-white bg-amber px-2 py-0.5 rounded-full">
                {checklistStepsDone.filter(Boolean).length}/3
              </span>
            </div>
            <Link
              href={hasFirstBook ? "/rak" : "/onboarding/buku"}
              className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                hasFirstBook ? "opacity-60" : "bg-parchment hover:bg-amber-soft/40"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                hasFirstBook ? "bg-forest border-forest text-white" : "border-amber text-amber"
              }`}>
                {hasFirstBook ? <Check size={11} strokeWidth={3} /> : <span className="text-[10px] font-bold">1</span>}
              </div>
              <p className={`flex-1 text-sm ${hasFirstBook ? "line-through text-ink-muted" : "font-semibold text-ink"}`}>
                Tambah buku pertama
              </p>
              {!hasFirstBook && <span className="text-amber text-xs font-bold">Mulai →</span>}
            </Link>
            <Link
              href="/log"
              className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                hasFirstLog ? "opacity-60" : hasFirstBook ? "bg-parchment hover:bg-amber-soft/40" : "opacity-40 pointer-events-none"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                hasFirstLog ? "bg-forest border-forest text-white" : "border-border text-ink-muted"
              }`}>
                {hasFirstLog ? <Check size={11} strokeWidth={3} /> : <span className="text-[10px] font-bold">2</span>}
              </div>
              <p className={`flex-1 text-sm ${hasFirstLog ? "line-through text-ink-muted" : "font-semibold text-ink"}`}>
                Catat log bacaan pertama
              </p>
              {hasFirstBook && !hasFirstLog && <span className="text-amber text-xs font-bold">Catat →</span>}
            </Link>
            <GoalTrigger
              currentGoal={session.weeklyPagesGoal}
              className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors w-full text-left ${
                hasWeeklyGoal ? "opacity-60" : hasFirstLog ? "bg-parchment hover:bg-amber-soft/40" : "opacity-40 pointer-events-none"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                hasWeeklyGoal ? "bg-forest border-forest text-white" : "border-border text-ink-muted"
              }`}>
                {hasWeeklyGoal ? <Check size={11} strokeWidth={3} /> : <Target size={10} strokeWidth={2} />}
              </div>
              <p className={`flex-1 text-sm ${hasWeeklyGoal ? "line-through text-ink-muted" : "font-semibold text-ink"}`}>
                Atur target mingguan
              </p>
              {hasFirstLog && !hasWeeklyGoal && <span className="text-amber text-xs font-bold">Atur →</span>}
            </GoalTrigger>
          </section>
        )}

        {/* ── WEEKLY GOAL ── (hidden jika sudah achieved) */}
        {shouldShowGoal && (
          <GoalTrigger
            currentGoal={session.weeklyPagesGoal}
            className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3 hover:border-amber/40 transition-colors w-full text-left"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-soft">
              <Target size={15} strokeWidth={1.75} className="text-amber" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-ink-secondary">Target minggu ini</span>
                <span className="text-xs font-bold text-ink">{weeklyPagesRead}/{session.weeklyPagesGoal}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill transition-all" style={{ width: `${Math.min(Math.round((weeklyPagesRead / session.weeklyPagesGoal) * 100), 100)}%` }} />
              </div>
            </div>
          </GoalTrigger>
        )}

        {/* ── SEDANG DI BACA ── (compact horizontal scroll, langsung di atas timeline) */}
        {readingNow.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-black uppercase tracking-widest text-ink-muted">Lanjut baca</h2>
              <Link href="/rak" className="text-xs font-semibold text-ink-muted hover:text-amber transition-colors">Lihat semua →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {readingNow.map((item: {
                id: string;
                current_page: number;
                books: { id: string; title: string; author: string | null; cover_url: string | null; total_pages: number | null } | null;
              }) => {
                const book = item.books;
                if (!book) return null;
                const progress = book.total_pages && item.current_page
                  ? Math.min(Math.round((item.current_page / book.total_pages) * 100), 100)
                  : 0;
                return (
                  <div
                    key={item.id}
                    className="flex-shrink-0 w-32 bg-surface rounded-xl border border-border p-2.5 hover:border-amber/40 transition-colors"
                  >
                    <Link href={`/log?bookId=${book.id}`} className="block">
                      <BookCover src={book.cover_url} title={book.title} className="w-full aspect-[3/4] rounded-lg mb-2" />
                      <p className="font-medium text-ink text-xs truncate">{book.title}</p>
                    </Link>
                    <div className="mt-1.5">
                      <div className="progress-bar h-1.5">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[10px] text-ink-muted mt-1">
                        {progress > 0 ? `${item.current_page}/${book.total_pages} · ${progress}%` : "Belum mulai"}
                      </p>
                    </div>
                    <QuickLogButtons shelfItemId={item.id} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── KOMUNITAS ── */}
        <Link
          href={clubCount > 0 ? "/komunitas" : "/komunitas?tab=Jelajahi"}
          className="flex items-center gap-3 bg-surface rounded-2xl border border-border p-3.5 hover:border-amber/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0">
            <Users size={18} strokeWidth={1.75} className="text-forest" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">Komunitas</p>
            <p className="text-xs text-ink-muted mt-0.5">
              {clubCount > 0
                ? `${clubCount} klub yang kamu ikuti`
                : "Temukan klub baca dan bergabung"}
            </p>
          </div>
          <span className="text-xs font-bold text-ink-muted">→</span>
        </Link>

        {/* ── TIMELINE ── (main content) */}
        <section>
          <FeedClient initial={feedItems} compact currentMemberId={session.memberId} />
        </section>
      </main>
    </div>
  );
  } catch (e) {
    console.error("[dashboard] FATAL", e, e instanceof Error ? { msg: e.message, stack: e.stack, digest: (e as any).digest } : e);
    throw e;
  }
}
