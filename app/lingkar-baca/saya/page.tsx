import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import AvatarIcon from "@/components/AvatarIcon";
import BookCover from "@/components/BookCover";
import { Flame, BookOpen, UserPlus, Target } from "lucide-react";
import CopyButton from "@/components/CopyButton";
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
  reading: Array<{ title: string; cover_url: string | null; progress: number }>;
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

function InviteCard({ inviteCode, memberCount, cap, label }: { inviteCode: string; memberCount: number; cap: number; label: string }) {
  const shareUrl = `https://mulaibaca.id/lingkar-baca/gabung?code=${inviteCode.toUpperCase()}`;
  const shareText = `Ayo gabung ke lingkar baca di mulaibaca! 📚\n\nKlik link ini:\n${shareUrl}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="bg-amber-soft rounded-2xl border border-amber/20 p-4 space-y-3">
      <p className="text-xs text-ink-muted">Undang {label}</p>
      <div className="flex items-center gap-2">
        <p className="font-mono text-xl font-bold text-ink tracking-widest uppercase flex-1">{inviteCode}</p>
        <CopyButton value={inviteCode} />
      </div>
      <p className="text-xs text-ink-muted">{memberCount}/{cap} {label}</p>

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full min-h-[44px] rounded-xl border border-border bg-parchment text-ink font-semibold text-sm hover:bg-cream transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Bagikan ke WhatsApp
      </a>
    </div>
  );
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
  const isFresh = isAlone && session.familyType !== "circle";

  if (isFresh) {
    return (
      <div className="min-h-screen pb-20 sm:pb-0">
        <NavBar session={session} />
        <OnboardingFlow session={session} />
      </div>
    );
  }

  const [{ data: familyData }, { data: streaks }, { data: rawShelfReading }, { data: allShelfItems }] = await Promise.all([
    supabase.from("families").select("weekly_challenge_pages").eq("id", familyId).maybeSingle(),
    supabase.from("streaks").select("member_id, current_streak, longest_streak").in("member_id", memberIds),
    supabase
      .from("shelf_items")
      .select("id, member_id, current_page, books(id, title, cover_url, total_pages)")
      .in("member_id", memberIds)
      .eq("status", "reading")
      .order("created_at", { ascending: false }),
    supabase
      .from("shelf_items")
      .select("id, member_id")
      .in("member_id", memberIds),
  ]);
  const weeklyChallenge = (familyData?.weekly_challenge_pages as number) ?? 0;

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

  const readingByMember: Record<string, Array<{ title: string; cover_url: string | null; progress: number }>> = {};
  for (const raw of rawShelfReading ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = raw as any;
    const book = Array.isArray(r.books) ? r.books?.[0] : r.books;
    if (!book) continue;
    const progress = book.total_pages && r.current_page
      ? Math.min(Math.round((r.current_page / book.total_pages) * 100), 100)
      : 0;
    if (!readingByMember[r.member_id]) readingByMember[r.member_id] = [];
    readingByMember[r.member_id].push({ title: book.title, cover_url: book.cover_url, progress });
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
      reading: readingByMember[m.id] ?? [],
      pagesThisWeek: weekPagesByMember[m.id] ?? 0,
    }))
    .sort((a: MemberProgress, b: MemberProgress) => b.streak - a.streak || b.pagesThisWeek - a.pagesThisWeek);

  const totalStreak = progress.reduce((s, m) => s + m.streak, 0);
  const totalPagesWeek = progress.reduce((s, m) => s + m.pagesThisWeek, 0);
  const totalReadingBooks = progress.reduce((s, m) => s + m.reading.length, 0);
  const isCircle = session.familyType === "circle";

  const typeLabel = isCircle ? "Lingkar Teman" : "Lingkar Keluarga";

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <p className="text-overline mb-1">{typeLabel}</p>
          <h1 className="text-h1">{session.familyName}</h1>
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

        {/* ── Section 1: Progress / Stats ── */}
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
            <div className="font-display text-2xl font-black text-forest">{totalReadingBooks}</div>
            <div className="text-xs text-ink-muted mt-0.5 font-medium">Sedang baca</div>
          </div>
        </div>

        {/* ── Section 2: Tantangan Mingguan ── */}
        <section>
          <h2 className="section-title">Tantangan Mingguan</h2>
          {weeklyChallenge > 0 ? (
            <div className="bg-surface rounded-2xl p-4 brutal-border brutal-shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target size={15} strokeWidth={2} className="text-amber" />
                  <span className="text-xs font-semibold text-ink-muted">{totalPagesWeek}/{weeklyChallenge} hal</span>
                </div>
                <Link href="/edit-profil" className="text-[10px] text-ink-muted hover:text-amber transition-colors">Ubah</Link>
              </div>
              <div className="progress-bar h-3">
                <div className="progress-fill" style={{ width: `${Math.min(Math.round((totalPagesWeek / weeklyChallenge) * 100), 100)}%` }} />
              </div>
              <p className="text-[10px] text-ink-muted mt-1">
                Target {isCircle ? "lingkar" : "keluarga"}: {weeklyChallenge} halaman/minggu
              </p>
            </div>
          ) : (
            <Link
              href="/edit-profil"
              className="block bg-surface rounded-2xl p-4 brutal-border brutal-shadow-sm text-center hover:bg-amber-soft/20 transition-colors"
            >
              <Target size={20} strokeWidth={1.5} className="text-ink-muted mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink-muted">Atur target mingguan</p>
              <p className="text-[10px] text-ink-muted/60 mt-0.5">Buat tantangan baca untuk {isCircle ? "lingkar" : "keluarga"}</p>
            </Link>
          )}
        </section>

        {/* ── Section 3: Activity per Anggota ── */}
        <section>
          <h2 className="section-title">Aktivitas Anggota</h2>
          <div className="space-y-3">
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

                  {/* Per-member weekly challenge progress */}
                  {weeklyChallenge > 0 && (
                    <div className="mt-2">
                      <div className="progress-bar h-2">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(Math.round((m.pagesThisWeek / weeklyChallenge) * 100), 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {m.reading.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {m.reading.slice(0, 3).map((b, i) => (
                        <div key={i} className="flex items-center gap-2 bg-parchment rounded-lg p-2">
                          <BookCover src={b.cover_url} title={b.title} className="w-8 h-11 rounded-md flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-ink truncate">{b.title}</p>
                            <div className="mt-1">
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${b.progress}%` }} />
                              </div>
                              <p className="text-[10px] text-ink-muted mt-0.5">{b.progress}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {m.reading.length > 3 && (
                        <p className="text-[10px] text-ink-muted text-center">+{m.reading.length - 3} buku lainnya</p>
                      )}
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
          </div>
        </section>

        {/* ── Section 4: Tambah Anggota ── */}
        {(() => {
          if (isCircle) {
            const cap = 20;
            if (progress.length >= cap) return null;
            return (
              <section>
                <h2 className="section-title">Undang Teman</h2>
                <InviteCard inviteCode={session.inviteCode} memberCount={progress.length} cap={cap} label="teman" />
              </section>
            );
          }
          if (session.memberRole === "admin" && progress.length < 8) {
            return (
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="section-title mb-0">Undang Anggota</h2>
                  <Link href="/lingkar-baca/saya/tambah" className="btn-secondary flex items-center gap-1.5 text-sm">
                    <UserPlus size={14} strokeWidth={2} />
                    Tambah Anak
                  </Link>
                </div>
                <InviteCard inviteCode={session.inviteCode} memberCount={progress.length} cap={8} label="anggota" />
              </section>
            );
          }
          return null;
        })()}
      </main>
    </div>
  );
}
