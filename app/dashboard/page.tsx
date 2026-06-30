import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import NavBar from "@/components/NavBar";
import BookCover from "@/components/BookCover";
import InviteCodeCard from "@/components/InviteCodeCard";
import AvatarIcon from "@/components/AvatarIcon";
import KeluargaTooltip from "@/components/KeluargaTooltip";
import { Flame, BookOpen, PenLine, Plus, Target, Check, Users } from "lucide-react";

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

  const [{ data: shelf }, { data: familyMembers }, { data: streaks }, { data: weeklyShelf }, { count: logCount }] = await Promise.all([
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
      .from("shelf_items")
      .select("id")
      .eq("member_id", session.memberId),
    supabase
      .from("reading_logs")
      .select("id", { count: "exact", head: true })
      .eq("member_id", session.memberId),
  ]);

  const weeklyShelfIds = (weeklyShelf ?? []).map((s: { id: string }) => s.id);
  let weeklyPagesRead = 0;
  if (weeklyShelfIds.length > 0) {
    const { data: weekLogs } = await supabase
      .from("reading_logs")
      .select("pages_read")
      .in("shelf_item_id", weeklyShelfIds)
      .gte("created_at", weekStart);
    weeklyPagesRead = (weekLogs ?? []).reduce((sum: number, l: { pages_read: number }) => sum + l.pages_read, 0);
  }

  const currentStreak = streaks?.current_streak ?? 0;
  const readingNow = shelf ?? [];
  const memberCount = familyMembers?.length ?? 1;
  const hasFirstBook = (weeklyShelf ?? []).length > 0;
  const hasFirstLog = (logCount ?? 0) > 0;
  const hasWeeklyGoal = (session.weeklyPagesGoal ?? 0) > 0;
  const hasFamilyMember = memberCount > 1;
  const showFamily = hasFirstLog || hasFamilyMember;
  const checklistStepsDone = [hasFirstBook, hasFirstLog, hasWeeklyGoal];
  const allOnboardingDone = checklistStepsDone.every(Boolean);

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Greeting + streak */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-h1">Halo, {session.memberName}!</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-center bg-surface rounded-xl px-4 py-2 brutal-border brutal-shadow-sm relative">
              <div className="flex justify-center text-amber mb-0.5"><Flame size={22} strokeWidth={1.75} /></div>
              <div className="font-display text-2xl font-black text-ink leading-none">{currentStreak}</div>
              <div className="text-xs text-ink-muted mt-0.5 font-semibold">hari</div>
            </div>
            {currentStreak > 0 && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Aku sudah baca ${currentStreak} hari berturut-turut di mulaibaca! 📚\n\nmulaibaca.id`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 rounded-xl text-ink-muted hover:text-amber hover:bg-amber-soft transition-colors -my-1.5"
                title="Bagikan streak"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Onboarding checklist — hide when all steps done */}
        {!allOnboardingDone && (
          <section className="bg-surface rounded-2xl brutal-border p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-ink-muted">Mulai dari sini</span>
              <span className="text-xs font-bold text-amber bg-amber-soft px-2 py-0.5 rounded-full">
                {checklistStepsDone.filter(Boolean).length}/3 selesai
              </span>
            </div>

            {/* Step 1 */}
            <Link
              href={hasFirstBook ? "/rak" : "/onboarding/buku"}
              className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                hasFirstBook ? "opacity-60" : "bg-parchment hover:bg-amber-soft/40"
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                hasFirstBook ? "bg-forest border-forest text-white" : "border-amber text-amber"
              }`}>
                {hasFirstBook
                  ? <Check size={13} strokeWidth={3} />
                  : <span className="text-xs font-bold">1</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${hasFirstBook ? "line-through text-ink-muted" : "text-ink"}`}>
                  Tambah buku pertama
                </p>
                <p className="text-xs text-ink-muted">Cari buku yang sedang kamu baca</p>
              </div>
              {!hasFirstBook && <span className="text-amber text-xs font-bold flex-shrink-0">Mulai →</span>}
            </Link>

            {/* Step 2 */}
            <Link
              href="/log"
              className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                hasFirstLog ? "opacity-60" : hasFirstBook ? "bg-parchment hover:bg-amber-soft/40" : "opacity-40 pointer-events-none"
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                hasFirstLog ? "bg-forest border-forest text-white" : "border-border text-ink-muted"
              }`}>
                {hasFirstLog
                  ? <Check size={13} strokeWidth={3} />
                  : <span className="text-xs font-bold">2</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${hasFirstLog ? "line-through text-ink-muted" : "text-ink"}`}>
                  Catat log bacaan pertama
                </p>
                <p className="text-xs text-ink-muted">Berapa halaman sudah dibaca hari ini?</p>
              </div>
              {hasFirstBook && !hasFirstLog && <span className="text-amber text-xs font-bold flex-shrink-0">Catat →</span>}
            </Link>

            {/* Step 3 */}
            <Link
              href="/profil"
              className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                hasWeeklyGoal ? "opacity-60" : hasFirstLog ? "bg-parchment hover:bg-amber-soft/40" : "opacity-40 pointer-events-none"
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                hasWeeklyGoal ? "bg-forest border-forest text-white" : "border-border text-ink-muted"
              }`}>
                {hasWeeklyGoal
                  ? <Check size={13} strokeWidth={3} />
                  : <Target size={12} strokeWidth={2} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${hasWeeklyGoal ? "line-through text-ink-muted" : "text-ink"}`}>
                  Atur target mingguan
                </p>
                <p className="text-xs text-ink-muted">Tetapkan target halaman baca per minggu</p>
              </div>
              {hasFirstLog && !hasWeeklyGoal && <span className="text-amber text-xs font-bold flex-shrink-0">Atur →</span>}
            </Link>

          </section>
        )}

        {/* Optional: invite family — shown after checklist is complete or if user has first log */}
        {allOnboardingDone && !hasFamilyMember && memberCount <= 1 && (
          <Link
            href="/keluarga"
            className="flex items-center gap-3 bg-surface rounded-2xl border border-border p-4 hover:border-amber/40 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-soft flex items-center justify-center text-amber flex-shrink-0">
              <Users size={16} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink">Ajak keluarga baca bareng</p>
              <p className="text-xs text-ink-muted">Opsional — pantau progres membaca bersama</p>
            </div>
            <span className="text-xs font-semibold text-amber flex-shrink-0">Lihat →</span>
          </Link>
        )}

        {/* Weekly goal — prominent: show progress if set, or CTA if first log done but no goal yet */}
        {session.weeklyPagesGoal > 0 ? (
          <Link href="/profil" className="block bg-surface rounded-2xl p-4 brutal-border brutal-shadow-xs">
            {(() => {
              const goal = session.weeklyPagesGoal;
              const pct = Math.min(Math.round((weeklyPagesRead / goal) * 100), 100);
              const met = weeklyPagesRead >= goal;
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target size={16} strokeWidth={1.75} className={met ? "text-forest" : "text-amber"} />
                      <span className="text-overline">{met ? "Target tercapai!" : "Target minggu ini"}</span>
                    </div>
                    <span className="text-xs font-semibold text-ink-secondary">{weeklyPagesRead} / {goal} hal</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill transition-all" style={{ width: `${pct}%`, backgroundColor: met ? "var(--color-forest)" : "var(--color-amber)" }} />
                  </div>
                  {!met && (
                    <p className="text-xs text-ink-muted mt-1.5">{goal - weeklyPagesRead} halaman lagi untuk mencapai target</p>
                  )}
                </>
              );
            })()}
          </Link>
        ) : hasFirstLog ? (
          <Link
            href="/profil"
            className="flex items-center justify-between bg-amber-soft rounded-2xl px-4 py-3.5 border border-amber/20"
          >
            <div className="flex items-center gap-2">
              <Target size={18} strokeWidth={1.75} className="text-amber" />
              <span className="text-sm font-semibold text-ink-secondary">Tetapkan target membaca mingguanmu</span>
            </div>
            <span className="text-amber text-sm font-semibold">Atur →</span>
          </Link>
        ) : null}

        {/* Quick actions */}
        <section className="grid grid-cols-2 gap-3">
          <Link
            href="/jelajah"
            className="bg-forest text-white rounded-xl p-4 flex flex-col gap-2 quick-action-card brutal-border brutal-shadow-sm"
          >
            <Plus size={22} strokeWidth={2} />
            <span className="font-semibold text-sm">Tambah Buku</span>
          </Link>
          <Link
            href="/log"
            className="bg-amber text-white rounded-xl p-4 flex flex-col gap-2 quick-action-card brutal-border brutal-shadow-sm"
          >
            <PenLine size={22} strokeWidth={1.75} />
            <span className="font-semibold text-sm">Catat Bacaan</span>
          </Link>
        </section>

        {/* Currently reading */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Sedang dibaca</h2>
            <Link href="/rak" className="section-link">Lihat semua →</Link>
          </div>

          {readingNow.length === 0 ? (
            <Link
              href="/jelajah"
              className="group block border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-amber transition-colors"
            >
              <div className="flex justify-center text-ink-muted mb-2 group-hover:text-amber transition-colors"><BookOpen size={32} strokeWidth={1.5} /></div>
              <p className="text-ink-secondary text-sm">Mau mulai baca apa hari ini?</p>
              <p className="text-amber text-sm font-medium mt-1">+ Tambah buku pertamamu</p>
            </Link>
          ) : (
            <div className="space-y-3">
              {readingNow.map((item: {
                id: string;
                current_page: number;
                books: { title: string; author: string | null; cover_url: string | null; total_pages: number | null } | null;
              }) => {
                const book = item.books;
                if (!book) return null;
                const progress =
                  book.total_pages && item.current_page
                    ? Math.min(Math.round((item.current_page / book.total_pages) * 100), 100)
                    : 0;
                return (
                  <Link
                    key={item.id}
                    href="/rak?tab=reading"
                    className="card-interactive flex gap-3 p-3"
                  >
                    <BookCover src={book.cover_url} title={book.title} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink text-sm truncate">{book.title}</p>
                      {book.author && (
                        <p className="text-xs text-ink-muted truncate">{book.author}</p>
                      )}
                      <div className="mt-2">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-xs text-ink-muted mt-1">
                          {progress > 0
                            ? `${item.current_page} / ${book.total_pages} hal · ${progress}%`
                            : "Belum mulai"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Family members — only after first log, or if family already has multiple members */}
        {showFamily && familyMembers && familyMembers.length >= 1 && (
          <section>
            <div className="section-header">
              <h2 className="section-title flex items-center gap-1.5">
                Anggota keluarga
                <KeluargaTooltip />
              </h2>
              <Link href="/keluarga" className="section-link">
                {session.memberRole === "admin" ? "Kelola →" : "Lihat progress →"}
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {familyMembers.map((m: { id: string; name: string; avatar: string }) => (
                <Link key={m.id} href="/keluarga" className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                    m.id === session.memberId ? "border-amber bg-amber-soft text-amber" : "border-border bg-surface text-ink-secondary hover:border-amber/50"
                  }`}>
                    <AvatarIcon avatar={m.avatar} size={22} />
                  </div>
                  <span className="text-xs text-ink-secondary max-w-[48px] truncate text-center leading-tight">{m.name}</span>
                </Link>
              ))}
              {session.memberRole === "admin" && (
                <Link href="/keluarga/tambah-anak" className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-dashed border-border bg-surface text-ink-muted hover:border-amber/50 hover:text-amber transition-colors">
                    <span className="text-xl leading-none">+</span>
                  </div>
                  <span className="text-xs text-ink-muted max-w-[48px] text-center leading-tight">Tambah</span>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Invite card — only after first log */}
        {showFamily && session.inviteCode && (
          memberCount <= 1
            ? <InviteCodeCard inviteCode={session.inviteCode} familyName={session.familyName} />
            : (
              <section className="bg-amber-soft rounded-2xl border border-amber/20 p-4">
                <p className="text-overline mb-2">Kode undangan</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xl font-bold text-ink tracking-widest uppercase">
                    {session.inviteCode}
                  </span>
                  <Link href="/profil" className="section-link text-xs">
                    Kelola →
                  </Link>
                </div>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Ayo gabung ke "${session.familyName}" di mulaibaca! 📚\n\nKlik link ini langsung:\nhttps://mulaibaca.id/bergabung?code=${session.inviteCode.toUpperCase()}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full text-xs text-ink-muted hover:text-ink transition-colors py-2 border-t border-amber/20 mt-2 pt-2"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Bagikan lewat WhatsApp
                </a>
              </section>
            )
        )}
      </main>
    </div>
  );
}
