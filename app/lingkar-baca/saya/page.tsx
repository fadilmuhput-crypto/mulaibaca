import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import AvatarIcon from "@/components/AvatarIcon";
import BookCover from "@/components/BookCover";
import { Flame, BookOpen, UserPlus } from "lucide-react";
import MemberSwitcher from "./MemberSwitcher";
import SetUsernameForm from "./SetUsernameForm";
import OnboardingFlow from "./OnboardingFlow";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lingkar Baca Saya",
  robots: { index: false },
};

type MemberProgress = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  memberType: string;
  age: number | null;
  hasAuth: boolean;
  username: string | null;
  streak: number;
  longestStreak: number;
  reading: { title: string; cover_url: string | null; progress: number } | null;
  pagesThisWeek: number;
};

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

function computeAgeLocal(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
  return age;
}

export default async function LingkarSayaPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = createAdminClient();
  const familyId = session.familyId;

  const { data: members } = await supabase
    .from("members")
    .select("id, name, avatar, role, member_type, birth_date, auth_user_id, username")
    .eq("family_id", familyId)
    .order("created_at", { ascending: true });

  const memberIds = (members ?? []).map((m: { id: string }) => m.id);
  const isAlone = (members?.length ?? 0) <= 1;

  if (isAlone) {
    return (
      <div className="min-h-screen pb-20 sm:pb-0">
        <NavBar session={session} />
        <OnboardingFlow session={session} />
      </div>
    );
  }

  const [{ data: streaks }, { data: readingItems }, { data: allShelfItems }] = await Promise.all([
    supabase.from("streaks").select("member_id, current_streak, longest_streak").in("member_id", memberIds),
    supabase
      .from("shelf_items")
      .select("id, member_id, current_page, books(title, cover_url, total_pages)")
      .in("member_id", memberIds)
      .eq("status", "reading")
      .order("updated_at", { ascending: false }),
    supabase
      .from("shelf_items")
      .select("id, member_id")
      .in("member_id", memberIds),
  ]);

  const shelfMap: Record<string, string> = {};
  for (const s of allShelfItems ?? []) {
    shelfMap[(s as { id: string; member_id: string }).id] = (s as { id: string; member_id: string }).member_id;
  }
  const shelfIds = Object.keys(shelfMap);
  const weekPagesByMember: Record<string, number> = {};

  if (shelfIds.length > 0) {
    const { data: weekLogs } = await supabase
      .from("reading_logs")
      .select("shelf_item_id, pages_read")
      .in("shelf_item_id", shelfIds)
      .gte("created_at", getWeekStart());

    for (const log of weekLogs ?? []) {
      const memberId = shelfMap[(log as { shelf_item_id: string; pages_read: number }).shelf_item_id];
      if (memberId) {
        weekPagesByMember[memberId] = (weekPagesByMember[memberId] ?? 0) + (log as { pages_read: number }).pages_read;
      }
    }
  }

  const readingByMember: Record<string, { title: string; cover_url: string | null; progress: number }> = {};
  for (const item of readingItems ?? []) {
    const m = item as unknown as { member_id: string; current_page: number; books: { title: string; cover_url: string | null; total_pages: number | null } | null };
    if (!readingByMember[m.member_id] && m.books) {
      const progress = m.books.total_pages && m.current_page
        ? Math.min(Math.round((m.current_page / m.books.total_pages) * 100), 100)
        : 0;
      readingByMember[m.member_id] = { title: m.books.title, cover_url: m.books.cover_url, progress };
    }
  }

  const streakByMember: Record<string, { current: number; longest: number }> = {};
  for (const s of streaks ?? []) {
    const st = s as { member_id: string; current_streak: number; longest_streak: number };
    streakByMember[st.member_id] = { current: st.current_streak, longest: st.longest_streak };
  }

  type MemberMeta = { id: string; name: string; avatar: string; role: string; memberType: string; age: number | null; hasAuth: boolean; username: string | null; };
  const membersMeta: MemberMeta[] = (members ?? []).map((m) => ({
    id: m.id as string,
    name: m.name as string,
    avatar: m.avatar as string,
    role: m.role as string,
    memberType: (m.member_type as string) ?? "dewasa",
    age: computeAgeLocal(m.birth_date as string | null),
    hasAuth: !!(m.auth_user_id),
    username: (m.username as string | null) ?? null,
  }));

  const progress: MemberProgress[] = membersMeta
    .map((m) => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      role: m.role,
      memberType: m.memberType,
      age: m.age,
      hasAuth: m.hasAuth,
      username: m.username,
      streak: streakByMember[m.id]?.current ?? 0,
      longestStreak: streakByMember[m.id]?.longest ?? 0,
      reading: readingByMember[m.id] ?? null,
      pagesThisWeek: weekPagesByMember[m.id] ?? 0,
    }))
    .sort((a: MemberProgress, b: MemberProgress) => b.streak - a.streak || b.pagesThisWeek - a.pagesThisWeek);

  const totalStreak = progress.reduce((s, m) => s + m.streak, 0);
  const totalPagesWeek = progress.reduce((s, m) => s + m.pagesThisWeek, 0);
  const activeReaders = progress.filter((m) => m.reading !== null).length;
  const isCircle = session.familyType === "circle";

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-overline mb-1">Progress</p>
            <h1 className="text-h1">{session.familyName}</h1>
          </div>
          {session.memberRole === "admin" && !isCircle && (
            <Link href="/lingkar-baca/saya/tambah" className="btn-secondary flex items-center gap-1.5 text-sm">
              <UserPlus size={14} strokeWidth={2} />
              Tambah
            </Link>
          )}
        </div>

        {/* Acting-as banner — only for child accounts in family type */}
        {session.actingAs && !isCircle && (
          <div className="bg-amber rounded-2xl px-4 py-3 flex items-center justify-between brutal-border">
            <p className="text-sm font-semibold text-white">
              Mengelola sebagai <strong>{session.memberName}</strong>
            </p>
            <MemberSwitcher targetId={null} label="Kembali" variant="exit" />
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface rounded-xl p-3 text-center brutal-border brutal-shadow-xs">
            <div className="font-display text-2xl font-black text-amber">{totalStreak}</div>
            <div className="text-xs text-ink-muted mt-0.5 font-medium">Total streak</div>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center brutal-border brutal-shadow-xs">
            <div className="font-display text-2xl font-black text-ink">{totalPagesWeek}</div>
            <div className="text-xs text-ink-muted mt-0.5 font-medium">Hal minggu ini</div>
          </div>
          <div className="bg-surface rounded-xl p-3 text-center brutal-border brutal-shadow-xs">
            <div className="font-display text-2xl font-black text-forest">{activeReaders}</div>
            <div className="text-xs text-ink-muted mt-0.5 font-medium">Sedang baca</div>
          </div>
        </div>

        {/* Member cards */}
        <section className="space-y-3">
          <h2 className="section-title">Anggota</h2>
          {progress.map((m, i) => (
            <div
              key={m.id}
              className="bg-surface rounded-2xl p-4 brutal-border brutal-shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <span className="text-[10px] font-black text-ink-muted">#{i + 1}</span>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 ${
                    m.id === session.memberId ? "border-amber bg-amber-soft text-amber" : "border-border bg-parchment text-ink-secondary"
                  }`}>
                    <AvatarIcon avatar={m.avatar} size={20} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-semibold text-ink text-sm">{m.name}</p>
                      {m.id === session.memberId && !session.actingAs && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber text-white font-medium">Kamu</span>
                      )}
                      {m.role === "admin" && !isCircle && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-forest/10 text-forest font-medium">Admin</span>
                      )}
                      {!isCircle && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-parchment border border-border text-ink-muted font-medium">
                          {({ ayah: "Ayah", ibu: "Ibu", anak: "Anak", dewasa: "Dewasa" } as Record<string, string>)[m.memberType] ?? "Anggota"}{m.age !== null ? `, ${m.age} th` : ""}
                        </span>
                      )}
                    </div>
                    {/* MemberSwitcher only for child members in family type */}
                    {!isCircle && session.memberRole === "admin" && m.memberType === "anak" && m.id !== (session.adminMemberId ?? session.memberId) && (
                      <MemberSwitcher targetId={m.id} label="Kelola" variant="switch" />
                    )}
                  </div>

                  {(() => {
                    const meta = membersMeta.find((mm) => mm.id === m.id);
                    if (meta?.username) {
                      return (
                        <Link href={`/u/${meta.username}`} className="text-[10px] text-ink-muted hover:text-amber transition-colors mt-0.5 inline-block">
                          @{meta.username}
                        </Link>
                      );
                    }
                    if (!isCircle && session.memberRole === "admin") {
                      return <SetUsernameForm memberId={m.id} />;
                    }
                    return null;
                  })()}

                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-amber font-semibold">
                      <Flame size={12} strokeWidth={2} />
                      {m.streak} hari
                    </span>
                    {m.pagesThisWeek > 0 && (
                      <span className="text-xs text-ink-muted">
                        {m.pagesThisWeek} hal minggu ini
                      </span>
                    )}
                  </div>

                  {m.reading ? (
                    <div className="flex items-center gap-2 mt-2.5 bg-parchment rounded-lg p-2">
                      <BookCover src={m.reading.cover_url} title={m.reading.title} className="w-8 h-11 rounded-md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate">{m.reading.title}</p>
                        <div className="mt-1">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${m.reading.progress}%` }} />
                          </div>
                          <p className="text-[10px] text-ink-muted mt-0.5">{m.reading.progress}%</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-ink-muted">
                      <BookOpen size={12} strokeWidth={1.75} />
                      Sedang memilih buku…
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Invite reminder */}
        {session.memberRole === "admin" && progress.length < 8 && (
          <div className="bg-amber-soft rounded-2xl border border-amber/20 p-4">
            <p className="text-xs text-ink-muted mb-1">{isCircle ? "Undang teman" : "Undang anggota"}</p>
            <p className="font-mono text-xl font-bold text-ink tracking-widest uppercase">{session.inviteCode}</p>
            <p className="text-xs text-ink-muted mt-1">Bagikan kode ini · {progress.length}/8 {isCircle ? "teman" : "anggota"}</p>
          </div>
        )}
      </main>
    </div>
  );
}
