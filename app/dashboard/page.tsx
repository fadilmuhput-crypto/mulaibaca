import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import BookCover from "@/components/BookCover";
import InviteCodeCard from "@/components/InviteCodeCard";
import FeedClient from "@/app/feed/FeedClient";
import type { FeedItem } from "@/app/api/feed/route";
import AvatarIcon from "@/components/AvatarIcon";
import KeluargaTooltip from "@/components/KeluargaTooltip";
import { Flame, BookOpen, PenLine, Plus, Target, Check, Users, LibraryBig } from "lucide-react";

export default async function DashboardPage() {
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

  const [{ data: shelf }, { data: familyMembers }, { data: streaks }, { data: weekLogs }, { count: logCount }] = await Promise.all([
    supabase
      .from("shelf_items")
      .select("*, books(*)")
      .eq("member_id", session.memberId)
      .eq("status", "reading")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("members")
      .select("id, name, avatar")
      .eq("family_id", session.familyId),
    supabase
      .from("streaks")
      .select("*")
      .eq("member_id", session.memberId)
      .maybeSingle(),
    supabase
      .from("reading_logs")
      .select("pages_read")
      .eq("member_id", session.memberId)
      .gte("created_at", weekStart),
    supabase
      .from("reading_logs")
      .select("id", { count: "exact", head: true })
      .eq("member_id", session.memberId),
  ]);

  const weeklyPagesRead = (weekLogs ?? []).reduce((sum: number, l: { pages_read: number }) => sum + (l.pages_read ?? 0), 0);
  const currentStreak = streaks?.current_streak ?? 0;
  const readingNow = shelf ?? [];
  const memberCount = familyMembers?.length ?? 1;
  const hasFirstBook = readingNow.length > 0 || (logCount ?? 0) > 0;
  const hasFirstLog = (logCount ?? 0) > 0;
  const hasWeeklyGoal = (session.weeklyPagesGoal ?? 0) > 0;
  const goalMet = hasWeeklyGoal && weeklyPagesRead >= session.weeklyPagesGoal;
  const shouldShowGoal = hasWeeklyGoal && !goalMet;
  const hasFamilyMember = memberCount > 1;
  const showFamily = hasFirstLog || hasFamilyMember;
  const checklistStepsDone = [hasFirstBook, hasFirstLog, hasWeeklyGoal];
  const allOnboardingDone = checklistStepsDone.every(Boolean);

  // Feed data — query activity_feed
  const admin = createAdminClient();
  const { data: follows } = await admin
    .from("follows")
    .select("following_id")
    .eq("follower_id", session.memberId);
  const followingIds = (follows ?? []).map((f: { following_id: string }) => f.following_id);
  const memberIds = [...new Set([...followingIds, session.memberId])];
  let feedItems: FeedItem[] = [];
  if (memberIds.length > 0) {
    const { data: rows } = await admin
      .from("activity_feed")
      .select(`
        id, activity_type, data, created_at,
        member_id, members!inner(name, avatar, username)
      `)
      .in("member_id", memberIds)
      .order("created_at", { ascending: false })
      .limit(20);
    feedItems = (rows ?? []).map((r: Record<string, unknown>) => {
      const d = (r.data ?? {}) as Record<string, unknown>;
      const m = (r.members ?? {}) as { name: string; avatar: string; username: string | null };
      const base = { id: r.id as string, type: r.activity_type as FeedItem["type"], member_id: r.member_id as string, member_name: m.name, member_avatar: m.avatar, member_username: m.username, timestamp: r.created_at as string };
      switch (r.activity_type as string) {
        case "shelf_add": return { ...base, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { status: d.status as string } };
        case "shelf_status": return { ...base, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { from_status: d.from_status as string, to_status: d.to_status as string } };
        case "log": return { ...base, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { pages_read: d.pages_read as number } };
        case "review": return { ...base, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { rating: d.rating as number, excerpt: d.excerpt as string | undefined, review_slug: d.review_slug as string } };
        case "finish": return { ...base, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: {} };
        case "follow": return { ...base, detail: { following_id: d.following_id as string, following_name: d.following_name as string, following_avatar: d.following_avatar as string | undefined, following_username: d.following_username as string | undefined } };
        default: return { ...base, detail: {} };
      }
    });
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* ── HEADER: Greeting + Streak ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1">Halo, {session.memberName}!</h1>
            {currentStreak > 0 && (
              <p className="text-xs text-ink-muted mt-0.5">
                🔥 {currentStreak} hari berturut-turut
              </p>
            )}
          </div>
          <Link
            href="/log"
            className="flex items-center gap-2 bg-surface rounded-xl px-3.5 py-2.5 brutal-border brutal-shadow-sm hover:border-amber/40 transition-colors"
          >
            <Flame size={18} strokeWidth={1.75} className="text-amber" />
            <span className="font-display text-xl font-black text-ink">{currentStreak}</span>
          </Link>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <section className="grid grid-cols-3 gap-2">
          <Link
            href="/log"
            className="bg-amber text-white rounded-xl p-3 flex flex-col items-center gap-1.5 brutal-border brutal-shadow-sm text-center"
          >
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <PenLine size={18} strokeWidth={1.75} />
            </div>
            <span className="font-semibold text-[11px] leading-tight">Catat Bacaan</span>
          </Link>
          <Link
            href="/jelajah"
            className="bg-forest text-white rounded-xl p-3 flex flex-col items-center gap-1.5 brutal-border brutal-shadow-sm text-center"
          >
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Plus size={18} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-[11px] leading-tight">Tambah Buku</span>
          </Link>
          <Link
            href="/rak"
            className="bg-surface text-ink rounded-xl p-3 flex flex-col items-center gap-1.5 brutal-border brutal-shadow-sm text-center border border-border"
          >
            <div className="w-9 h-9 rounded-full bg-parchment flex items-center justify-center text-ink-muted">
              <LibraryBig size={18} strokeWidth={1.75} />
            </div>
            <span className="font-semibold text-[11px] leading-tight">Rak Buku</span>
          </Link>
        </section>

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
            <Link
              href="/profil"
              className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
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
            </Link>
          </section>
        )}

        {/* ── WEEKLY GOAL ── (hidden jika sudah achieved) */}
        {shouldShowGoal && (
          <Link
            href="/profil"
            className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3 hover:border-amber/40 transition-colors"
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
          </Link>
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
                  <Link
                    key={item.id}
                    href={`/log?bookId=${book.id}`}
                    className="flex-shrink-0 w-32 bg-surface rounded-xl border border-border p-2.5 hover:border-amber/40 transition-colors"
                  >
                    <BookCover src={book.cover_url} title={book.title} className="w-full aspect-[3/4] rounded-lg mb-2" />
                    <p className="font-medium text-ink text-xs truncate">{book.title}</p>
                    <div className="mt-1.5">
                      <div className="progress-bar h-1.5">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[10px] text-ink-muted mt-1">
                        {progress > 0 ? `${item.current_page}/${book.total_pages} · ${progress}%` : "Belum mulai"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── TIMELINE ── (main content) */}
        <section>
          <FeedClient initial={feedItems} compact currentMemberId={session.memberId} />
        </section>

        {/* ── CARI TEMAN ── */}
        <Link
          href="/cari-teman"
          className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3 hover:border-amber/40 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-soft flex items-center justify-center text-amber flex-shrink-0">
            <Users size={15} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">Cari teman baru</p>
            <p className="text-xs text-ink-muted">Temukan dan ikuti pengguna lain</p>
          </div>
          <span className="text-xs font-semibold text-amber flex-shrink-0">Cari →</span>
        </Link>

        {/* ── EMPTY STATE: ajak tambah buku (hanya jika belum punya buku & belum selesai onboarding) */}
        {readingNow.length === 0 && hasFirstLog && (
          <Link
            href="/jelajah"
            className="block border-2 border-dashed border-border rounded-2xl p-5 text-center hover:border-amber transition-colors"
          >
            <div className="flex justify-center text-ink-muted mb-2"><BookOpen size={24} strokeWidth={1.5} /></div>
            <p className="text-ink-secondary text-sm">Belum ada buku yang sedang dibaca</p>
            <p className="text-amber text-sm font-medium mt-1">Cari buku →</p>
          </Link>
        )}

        {/* ── KELUARGA ── (compact, di bottom) */}
        {showFamily && familyMembers && familyMembers.length >= 1 && (
          <section className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title flex items-center gap-1.5">
                <Users size={14} strokeWidth={1.75} className="text-ink-muted" />
                Anggota keluarga
                <KeluargaTooltip />
              </h2>
              <Link href="/keluarga" className="text-xs font-semibold text-ink-muted hover:text-amber transition-colors">
                {session.memberRole === "admin" ? "Kelola" : "Lihat"} →
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {familyMembers.map((m: { id: string; name: string; avatar: string }) => (
                <Link key={m.id} href="/keluarga" className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    m.id === session.memberId ? "border-amber bg-amber-soft text-amber" : "border-border bg-surface text-ink-secondary hover:border-amber/50"
                  }`}>
                    <AvatarIcon avatar={m.avatar} size={18} />
                  </div>
                  <span className="text-[10px] text-ink-secondary max-w-[40px] truncate text-center leading-tight">{m.name}</span>
                </Link>
              ))}
              {session.memberRole === "admin" && (
                <Link href="/keluarga/tambah-anak" className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed border-border bg-surface text-ink-muted hover:border-amber/50 hover:text-amber transition-colors">
                    <span className="text-lg leading-none">+</span>
                  </div>
                  <span className="text-[10px] text-ink-muted max-w-[40px] text-center leading-tight">Tambah</span>
                </Link>
              )}
            </div>
            {session.inviteCode && memberCount <= 1 && (
              <InviteCodeCard inviteCode={session.inviteCode} familyName={session.familyName} />
            )}
            {session.inviteCode && memberCount > 1 && (
              <div className="mt-3 flex items-center justify-between bg-amber-soft rounded-xl px-3.5 py-2.5 border border-amber/20">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-ink-muted uppercase">Kode undangan</span>
                  <span className="font-mono text-sm font-bold text-ink tracking-widest uppercase">{session.inviteCode}</span>
                </div>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Ayo gabung ke "${session.familyName}" di mulaibaca! 📚\n\nKlik link ini langsung:\nhttps://mulaibaca.id/bergabung?code=${session.inviteCode.toUpperCase()}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-ink-muted hover:text-ink transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Bagikan
                </a>
              </div>
            )}
          </section>
        )}

        {/* ── AJAK KELUARGA (jika sendiri dan onboarding selesai) ── */}
        {allOnboardingDone && !hasFamilyMember && !session.inviteCode && (
          <Link
            href="/keluarga"
            className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3 hover:border-amber/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-soft flex items-center justify-center text-amber flex-shrink-0">
              <Users size={15} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">Ajak keluarga baca bareng</p>
              <p className="text-xs text-ink-muted">Pantau progres membaca bersama</p>
            </div>
            <span className="text-xs font-semibold text-amber flex-shrink-0">Lihat →</span>
          </Link>
        )}
      </main>
    </div>
  );
}
