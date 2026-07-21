"use client";

import { useState, useEffect, type ElementType } from "react";
import Link from "next/link";
import type { ChallengeWithStatus, Badge } from "@/lib/challenges";
import { formatDeadline } from "@/lib/challenges";
import { Flame, BookOpen, Award, Library, Users, Calendar, Sparkles, Check, ChevronRight, Plus, LogIn, Copy, Search } from "lucide-react";
import BadgePing from "@/components/BadgePing";

type Club = {
  id: string;
  name: string;
  description: string;
  cover_url: string | null;
  invite_code: string;
  member_count: number;
  created_at: string;
};

type MainTab = "tantangan" | "klub" | "acara";

type Props = {
  initialActive: ChallengeWithStatus[];
  initialAvailable: ChallengeWithStatus[];
  initialCompleted: ChallengeWithStatus[];
  initialBadges: Badge[];
  memberId: string;
};

const MAIN_TABS: { key: MainTab; label: string; Icon: typeof Users }[] = [
  { key: "tantangan", label: "Tantangan", Icon: Flame },
  { key: "klub",      label: "Klub",      Icon: Users },
  { key: "acara",     label: "Acara",     Icon: Calendar },
];

const ACTIVITY_ICONS: Record<string, ElementType> = {
  streak: Flame,
  pages: BookOpen,
  books: Library,
};

const CATEGORY_COLORS: Record<string, string> = {
  streak: "#DC2626",
  pages: "#C26E2A",
  books: "#2D4D7A",
};

export default function KomunitasClient({
  initialActive,
  initialAvailable,
  initialCompleted,
  initialBadges,
  memberId,
}: Props) {
  const [mainTab, setMainTab] = useState<MainTab>("tantangan");
  const [badges] = useState(initialBadges);
  const [active, setActive] = useState(initialActive);
  const [available, setAvailable] = useState(initialAvailable);
  const [completed] = useState(initialCompleted);
  const [joining, setJoining] = useState<string | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubsLoading, setClubsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joiningClub, setJoiningClub] = useState(false);
  const [clubError, setClubError] = useState("");
  const [klubTab, setKlubTab] = useState<"my" | "explore">("my");
  const [exploreClubs, setExploreClubs] = useState<Club[]>([]);
  const [exploreJoined, setExploreJoined] = useState<string[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (mainTab === "klub") {
      setClubsLoading(true);
      fetch("/api/clubs")
        .then((r) => r.json())
        .then((json) => setClubs(json.data ?? []))
        .catch(() => {})
        .finally(() => setClubsLoading(false));

      setExploreLoading(true);
      fetch("/api/clubs/explore")
        .then((r) => r.json())
        .then((json) => {
          setExploreClubs(json.data ?? []);
          setExploreJoined(json.joinedIds ?? []);
        })
        .catch(() => {})
        .finally(() => setExploreLoading(false));
    }
  }, [mainTab]);

  const allChallenges = [...active, ...available, ...completed];
  const challengeTypeMap = new Map(allChallenges.map((c) => [c.id, c.activity_type]));

  async function handleJoin(challengeId: string) {
    setJoining(challengeId);
    try {
      const res = await fetch("/api/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, memberId }),
      });
      if (res.ok) {
        const moved = available.find((c) => c.id === challengeId);
        if (moved) {
          setAvailable((prev) => prev.filter((c) => c.id !== challengeId));
          setActive((prev) => [...prev, { ...moved, status: "active" }]);
        }
      }
    } catch {}
    setJoining(null);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      {/* Main tabs */}
      <div className="flex bg-surface rounded-xl border border-border p-1 mb-5">
        {MAIN_TABS.map((t) => {
          const activeTab = mainTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setMainTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab
                  ? "bg-amber text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <t.Icon size={15} strokeWidth={activeTab ? 2.5 : 1.75} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: TANTANGAN ── */}
      {mainTab === "tantangan" && (
        <div className="space-y-5">
          {/* Badge gallery */}
          {badges.length > 0 && (
            <section className="bg-surface rounded-2xl border border-border p-4 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-widest text-ink-muted flex items-center gap-1.5">
                <Sparkles size={12} strokeWidth={2} />
                {badges.length} Lencana Terkumpul
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {badges.map((b) => {
                  return (
                    <div
                      key={b.id}
                      className="flex flex-col items-center gap-1 flex-shrink-0 p-2.5 rounded-xl bg-parchment border border-border min-w-[72px]"
                    >
                      <BadgePing icon={b.badge_icon} color={b.badge_color} size={32} />
                      <span className="text-[9px] font-semibold text-ink text-center leading-tight">{b.badge_name}</span>
                      {b.period_label && (
                        <span className="text-[8px] text-ink-muted">{b.period_label}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Challenge grid */}
          {active.length === 0 && available.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-8">Belum ada tantangan tersedia.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Active challenges */}
              {active.map((c) => {
                const Icon = ACTIVITY_ICONS[c.activity_type] ?? Flame;
                const pct = c.progress > 0 ? Math.min(Math.round((c.progress / c.goal_value) * 100), 100) : 0;
                return (
                  <Link
                    key={c.id}
                    href={`/komunitas/tantangan/${c.id}`}
                    className="flex flex-col bg-surface rounded-xl border border-border p-3.5 hover:border-amber/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${CATEGORY_COLORS[c.activity_type] ?? "#C26E2A"}18` }}>
                        <Icon size={16} strokeWidth={1.5} style={{ color: CATEGORY_COLORS[c.activity_type] ?? "#C26E2A" }} />
                      </div>
                      <div className="text-[9px] font-bold text-success uppercase tracking-wider bg-success-soft px-1.5 py-0.5 rounded">Aktif</div>
                    </div>
                    <h3 className="font-semibold text-sm text-ink leading-tight mb-0.5">{c.title}</h3>
                    <p className="text-[10px] text-ink-muted leading-snug mb-2 line-clamp-2">{c.description}</p>
                    <div className="mt-auto space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-ink-muted">Progress</span>
                        <span className="font-bold text-ink">{pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-ink-muted">{c.progress}/{c.goal_value}</span>
                        {c.deadline && <span className="text-amber font-medium">{formatDeadline(c.deadline)}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Available challenges */}
              {available.map((c) => {
                const Icon = ACTIVITY_ICONS[c.activity_type] ?? Flame;
                return (
                  <div
                    key={c.id}
                    className="flex flex-col bg-surface rounded-xl border border-border p-3.5 hover:border-amber/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${CATEGORY_COLORS[c.activity_type] ?? "#C26E2A"}18` }}>
                        <Icon size={16} strokeWidth={1.5} style={{ color: CATEGORY_COLORS[c.activity_type] ?? "#C26E2A" }} />
                      </div>
                      <div className="text-[9px] font-bold text-ink-muted uppercase tracking-wider bg-parchment px-1.5 py-0.5 rounded">Tersedia</div>
                    </div>
                    <h3 className="font-semibold text-sm text-ink leading-tight mb-0.5">{c.title}</h3>
                    <p className="text-[10px] text-ink-muted leading-snug mb-2 line-clamp-2">{c.description}</p>
                    <div className="mt-auto">
                      <p className="text-[10px] text-ink-muted mb-2">
                        Target: {c.goal_value} {c.activity_type === "pages" ? "halaman" : c.activity_type === "streak" ? "hari" : "buku"}
                        {c.duration_type !== "unlimited" ? `/${c.duration_type === "weekly" ? "minggu" : "bulan"}` : ""}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleJoin(c.id)}
                        disabled={joining === c.id}
                        className="w-full py-2 bg-amber text-white text-xs font-semibold rounded-xl hover:bg-amber-hover transition-colors disabled:opacity-50"
                      >
                        {joining === c.id ? "..." : "Ikuti"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: KLUB ── */}
      {mainTab === "klub" && (
        <div className="space-y-4">
          {/* Sub tabs */}
          <div className="flex bg-parchment rounded-lg border border-border p-0.5">
            <button
              onClick={() => setKlubTab("my")}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                klubTab === "my" ? "bg-surface text-ink shadow-sm border border-border" : "text-ink-muted hover:text-ink"
              }`}
            >
              Klubku
            </button>
            <button
              onClick={() => setKlubTab("explore")}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                klubTab === "explore" ? "bg-surface text-ink shadow-sm border border-border" : "text-ink-muted hover:text-ink"
              }`}
            >
              Jelajahi
            </button>
          </div>

          {klubTab === "my" && (
            <>
              {/* Action buttons */}
              <div className="flex gap-2">
                <button onClick={() => { setShowCreate(true); setClubError(""); }} className="btn-primary-sm flex items-center gap-1.5 flex-1 justify-center">
                  <Plus size={14} /> Buat Klub
                </button>
                <button onClick={() => { setShowJoin(true); setClubError(""); }} className="btn-secondary-sm flex items-center gap-1.5 flex-1 justify-center">
                  <LogIn size={14} /> Gabung
                </button>
              </div>

              {/* Create club form */}
              {showCreate && (
                <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Nama klub"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="input w-full"
                    maxLength={50}
                  />
                  <textarea
                    placeholder="Deskripsi (opsional)"
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    className="input w-full resize-none"
                    rows={2}
                    maxLength={200}
                  />
                  {clubError && <p className="text-xs text-red-500">{clubError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => setShowCreate(false)} className="btn-secondary-sm flex-1">Batal</button>
                    <button
                      onClick={async () => {
                        if (!createName.trim()) return;
                        setCreating(true);
                        setClubError("");
                        try {
                          const res = await fetch("/api/clubs", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ name: createName, description: createDesc }),
                          });
                          const json = await res.json();
                          if (!res.ok) { setClubError(json.error); return; }
                          setClubs((prev) => [...prev, { ...json.data, member_count: 1 }]);
                          setShowCreate(false);
                          setCreateName("");
                          setCreateDesc("");
                        } catch { setClubError("Gagal membuat klub"); }
                        finally { setCreating(false); }
                      }}
                      disabled={creating || !createName.trim()}
                      className="btn-primary-sm flex-1"
                    >
                      {creating ? "…" : "Simpan"}
                    </button>
                  </div>
                </div>
              )}

              {/* Join club form */}
              {showJoin && (
                <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Masukkan kode undangan"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="input w-full uppercase"
                    maxLength={6}
                  />
                  {clubError && <p className="text-xs text-red-500">{clubError}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => setShowJoin(false)} className="btn-secondary-sm flex-1">Batal</button>
                    <button
                      onClick={async () => {
                        if (!joinCode.trim()) return;
                        setJoiningClub(true);
                        setClubError("");
                        try {
                          const res = await fetch("/api/clubs/join", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ inviteCode: joinCode }),
                          });
                          const json = await res.json();
                          if (!res.ok) { setClubError(json.error); return; }
                          const r = await fetch("/api/clubs");
                          const j = await r.json();
                          setClubs(j.data ?? []);
                          setShowJoin(false);
                          setJoinCode("");
                        } catch { setClubError("Gagal bergabung"); }
                        finally { setJoiningClub(false); }
                      }}
                      disabled={joiningClub || !joinCode.trim()}
                      className="btn-primary-sm flex-1"
                    >
                      {joiningClub ? "…" : "Gabung"}
                    </button>
                  </div>
                </div>
              )}

              {/* My clubs list */}
              {clubsLoading ? (
                <p className="text-sm text-ink-muted text-center py-8">Memuat klub…</p>
              ) : clubs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-parchment border border-border flex items-center justify-center">
                    <Users size={28} strokeWidth={1.5} className="text-ink-muted" />
                  </div>
                  <h2 className="text-h2">Belum ada klub</h2>
                  <p className="text-sm text-ink-muted max-w-xs">Buat klub baca atau gabung dengan kode undangan</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clubs.map((club) => (
                    <div key={club.id} className="bg-surface rounded-2xl border border-border overflow-hidden">
                      {club.cover_url && (
                        <div className="h-24 overflow-hidden">
                          <img src={club.cover_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <Link href={`/komunitas/klub/${club.id}`} className="hover:text-amber transition-colors">
                          <h3 className="font-semibold text-ink text-sm">{club.name}</h3>
                        </Link>
                        {club.description && (
                          <p className="text-xs text-ink-muted mt-1 line-clamp-2">{club.description}</p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-[11px] text-ink-muted">
                          <span className="flex items-center gap-1"><Users size={12} />{club.member_count}</span>
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(club.invite_code);
                              } catch {}
                            }}
                            className="flex items-center gap-1 hover:text-ink transition-colors"
                          >
                            <Copy size={12} /> {club.invite_code}
                          </button>
                        </div>
                        <Link
                          href={`/komunitas/klub/${club.id}`}
                          className="text-[11px] font-semibold text-amber hover:text-amber-hover transition-colors"
                        >
                          Detail
                        </Link>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── EXPLORE ── */}
          {klubTab === "explore" && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Cari klub…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input w-full pl-9"
                />
              </div>
              {exploreLoading ? (
                <p className="text-sm text-ink-muted text-center py-8">Memuat klub…</p>
              ) : exploreClubs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-parchment border border-border flex items-center justify-center">
                    <Search size={28} strokeWidth={1.5} className="text-ink-muted" />
                  </div>
                  <h2 className="text-h2">Tidak ditemukan</h2>
                  <p className="text-sm text-ink-muted max-w-xs">Coba kata kunci lain</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exploreClubs
                    .filter((c) => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((club) => {
                      const joined = exploreJoined.includes(club.id);
                      return (
                        <div key={club.id} className="bg-surface rounded-2xl border border-border overflow-hidden">
                          {club.cover_url && (
                            <div className="h-24 overflow-hidden">
                              <img src={club.cover_url} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="p-4">
                            <Link href={`/komunitas/klub/${club.id}`} className="hover:text-amber transition-colors">
                              <h3 className="font-semibold text-ink text-sm">{club.name}</h3>
                            </Link>
                            {club.description && (
                              <p className="text-xs text-ink-muted mt-1 line-clamp-2">{club.description}</p>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-[11px] text-ink-muted flex items-center gap-1"><Users size={12} />{club.member_count}</span>
                              {joined ? (
                                <Link href={`/komunitas/klub/${club.id}`} className="text-[11px] font-semibold text-amber hover:text-amber-hover transition-colors">
                                  Buka
                                </Link>
                              ) : (
                                club.invite_code && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch("/api/clubs/join", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ inviteCode: club.invite_code }),
                                        });
                                        if (res.ok) {
                                          setExploreJoined((prev) => [...prev, club.id]);
                                          // also update my clubs
                                          const r = await fetch("/api/clubs");
                                          const j = await r.json();
                                          setClubs(j.data ?? []);
                                        }
                                      } catch {}
                                    }}
                                    className="text-[11px] font-semibold text-white bg-amber hover:bg-amber-hover px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    Gabung
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ACARA ── */}
      {mainTab === "acara" && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-parchment border border-border flex items-center justify-center">
            <Calendar size={28} strokeWidth={1.5} className="text-ink-muted" />
          </div>
          <h2 className="text-h2">Acara</h2>
          <p className="text-sm text-ink-muted max-w-xs">Fitur acara baca akan segera hadir. Pantau terus!</p>
        </div>
      )}
    </main>
  );
}
