import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import NavBar from "@/components/NavBar";
import EmailVerifyBanner from "@/components/EmailVerifyBanner";
import BookCover from "@/components/BookCover";
import InviteCodeCard from "@/components/InviteCodeCard";
import AvatarIcon from "@/components/AvatarIcon";
import { Flame, BookOpen, PenLine, Plus, Target, Library, BookMarked, LayoutDashboard, LayoutGrid } from "lucide-react";

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

  const [{ data: shelf }, { data: familyMembers }, { data: streaks }, { data: weeklyShelf }] = await Promise.all([
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

  return (
    <div className="min-h-screen bg-parchment pb-20 sm:pb-0">
      <NavBar session={session} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Greeting + streak */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-h1">Halo, {session.memberName}!</h1>
            <p className="text-ink-secondary text-sm mt-0.5">{session.familyName}</p>
          </div>
          <div className="text-center bg-surface rounded-xl px-4 py-2 brutal-border brutal-shadow-sm">
            <div className="flex justify-center text-amber mb-0.5"><Flame size={22} strokeWidth={1.75} /></div>
            <div className="font-display text-2xl font-black text-ink leading-none">{currentStreak}</div>
            <div className="text-xs text-ink-muted mt-0.5 font-semibold">hari</div>
          </div>
        </div>

        {/* Quick actions — prominent, always above fold */}
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

        {/* Weekly goal progress */}
        {session.weeklyPagesGoal > 0 ? (
          <section>
            {(() => {
              const goal = session.weeklyPagesGoal;
              const pct = Math.min(Math.round((weeklyPagesRead / goal) * 100), 100);
              const met = weeklyPagesRead >= goal;
              return (
                <Link href="/profil" className="block bg-surface rounded-2xl p-4 brutal-border brutal-shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target size={16} strokeWidth={1.75} className={met ? "text-forest" : "text-amber"} />
                      <span className="text-overline">{met ? "Target tercapai!" : "Target minggu ini"}</span>
                    </div>
                    <span className="text-xs font-semibold text-ink-secondary">{weeklyPagesRead} / {goal} hal</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill transition-all"
                      style={{ width: `${pct}%`, backgroundColor: met ? "var(--color-forest)" : "var(--color-amber)" }}
                    />
                  </div>
                  {!met && (
                    <p className="text-xs text-ink-muted mt-1.5">{goal - weeklyPagesRead} halaman lagi untuk mencapai target</p>
                  )}
                </Link>
              );
            })()}
          </section>
        ) : (
          <Link
            href="/profil"
            className="flex items-center justify-between bg-amber-soft rounded-2xl px-4 py-3 border border-amber/20"
          >
            <div className="flex items-center gap-2">
              <Target size={16} strokeWidth={1.75} className="text-amber" />
              <span className="text-sm text-ink-secondary">Tetapkan target membaca mingguanmu</span>
            </div>
            <span className="text-amber text-sm font-semibold">→</span>
          </Link>
        )}

        {/* Currently reading */}
        <section>
          <div className="section-header">
            <h2 className="section-title">Sedang dibaca</h2>
            <Link href="/rak" className="section-link">Lihat semua →</Link>
          </div>

          {readingNow.length === 0 ? (
            <Link
              href="/jelajah"
              className="block border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-amber transition-colors"
            >
              <div className="flex justify-center text-ink-muted mb-2"><BookOpen size={32} strokeWidth={1.5} /></div>
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
                    href="/rak"
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

        {/* Family members */}
        {familyMembers && familyMembers.length >= 1 && (
          <section>
            <div className="section-header">
              <h2 className="section-title">Anggota keluarga</h2>
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

        {/* Admin CMS — only for isCmsAdmin */}
        {session.isCmsAdmin && (
          <section>
            <div className="section-header mb-3">
              <div className="flex items-center gap-1.5">
                <LayoutDashboard size={14} strokeWidth={2} className="text-ink-muted" />
                <h2 className="section-title">Admin CMS</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/buku"
                className="bg-surface rounded-xl brutal-border brutal-shadow-xs p-4 flex flex-col gap-2 hover:border-forest/40 hover:bg-forest/5 transition-all"
              >
                <BookMarked size={20} strokeWidth={1.75} className="text-forest" />
                <div>
                  <p className="font-semibold text-sm text-ink">Kurasi Buku</p>
                  <p className="text-xs text-ink-muted mt-0.5">Kelola buku pilihan editorial</p>
                </div>
              </Link>
              <Link
                href="/admin/perpustakaan"
                className="bg-surface rounded-xl brutal-border brutal-shadow-xs p-4 flex flex-col gap-2 hover:border-amber/40 hover:bg-amber-soft/40 transition-all"
              >
                <Library size={20} strokeWidth={1.75} className="text-amber" />
                <div>
                  <p className="font-semibold text-sm text-ink">Perpustakaan</p>
                  <p className="text-xs text-ink-muted mt-0.5">Lengkapi data buku pengguna</p>
                </div>
              </Link>
              <Link
                href="/admin/jelajah"
                className="bg-surface rounded-xl brutal-border brutal-shadow-xs p-4 flex flex-col gap-2 hover:border-[#2D4D7A]/40 hover:bg-[#EBF0F8]/40 transition-all col-span-2"
              >
                <LayoutGrid size={20} strokeWidth={1.75} className="text-[#2D4D7A]" />
                <div>
                  <p className="font-semibold text-sm text-ink">Halaman Jelajah</p>
                  <p className="text-xs text-ink-muted mt-0.5">Atur section, urutan, dan konten halaman /jelajah</p>
                </div>
              </Link>
            </div>
          </section>
        )}

        {/* Email verification */}
        {!session.emailVerified && (
          <EmailVerifyBanner email={session.email} />
        )}

        {/* Invite card — full when alone, compact when family has members */}
        {session.inviteCode && (
          memberCount <= 1
            ? <InviteCodeCard inviteCode={session.inviteCode} familyName={session.familyName} />
            : (
              <section className="bg-amber-soft rounded-2xl border border-amber/20 p-4">
                <p className="text-overline mb-2">Kode undangan keluarga</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl font-bold text-ink tracking-widest uppercase">
                    {session.inviteCode}
                  </span>
                  <Link href="/profil" className="section-link text-xs">
                    Bagikan →
                  </Link>
                </div>
              </section>
            )
        )}
      </main>
    </div>
  );
}
