"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChallengeWithStatus, Badge } from "@/lib/challenges";
import { formatDeadline } from "@/lib/challenges";
import { Check, ChevronRight, Trophy, Users, Calendar, Sparkles } from "lucide-react";

type MainTab = "tantangan" | "klub" | "acara";
type ChallengeTab = "active" | "available" | "completed";

type Props = {
  initialActive: ChallengeWithStatus[];
  initialAvailable: ChallengeWithStatus[];
  initialCompleted: ChallengeWithStatus[];
  initialBadges: Badge[];
  memberId: string;
};

const MAIN_TABS: { key: MainTab; label: string; Icon: typeof Trophy }[] = [
  { key: "tantangan", label: "Tantangan", Icon: Trophy },
  { key: "klub",      label: "Klub",      Icon: Users },
  { key: "acara",     label: "Acara",     Icon: Calendar },
];

export default function KomunitasClient({
  initialActive,
  initialAvailable,
  initialCompleted,
  initialBadges,
  memberId,
}: Props) {
  const [mainTab, setMainTab] = useState<MainTab>("tantangan");
  const [challengeTab, setChallengeTab] = useState<ChallengeTab>(
    initialActive.length > 0 ? "active" : "available"
  );
  const [active, setActive] = useState(initialActive);
  const [available, setAvailable] = useState(initialAvailable);
  const [completed, setCompleted] = useState(initialCompleted);
  const [badges] = useState(initialBadges);
  const [joining, setJoining] = useState<string | null>(null);

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

  const challengeTabs: { key: ChallengeTab; label: string; count?: number }[] = [
    { key: "active", label: "Aktif", count: active.length },
    { key: "available", label: "Tersedia", count: available.length },
    { key: "completed", label: "Selesai", count: completed.length },
  ];

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
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col items-center gap-1 flex-shrink-0 p-2.5 rounded-xl bg-parchment border border-border min-w-[72px]"
                  >
                    <span style={{ fontSize: "24px" }}>{b.badge_icon}</span>
                    <span className="text-[9px] font-semibold text-ink text-center leading-tight">{b.badge_name}</span>
                    {b.period_label && (
                      <span className="text-[8px] text-ink-muted">{b.period_label}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Challenge sub-tabs */}
          <div className="flex gap-1 bg-cream rounded-xl p-1 border border-border">
            {challengeTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setChallengeTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  challengeTab === t.key
                    ? "bg-surface text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    challengeTab === t.key
                      ? "bg-amber-soft text-amber"
                      : "bg-surface text-ink-muted"
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Challenge list */}
          <div className="space-y-2.5">
            {(challengeTab === "active" ? active : challengeTab === "available" ? available : completed).length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-8">
                {challengeTab === "active" ? "Belum ada tantangan yang diikuti." : "Tidak ada tantangan tersedia."}
              </p>
            ) : (
              (challengeTab === "active" ? active : challengeTab === "available" ? available : completed).map((c) => {
                const pct = c.progress > 0 ? Math.min(Math.round((c.progress / c.goal_value) * 100), 100) : 0;
                const isActiveChallenge = c.status === "active";
                return (
                  <Link
                    key={c.id}
                    href={`/tantangan/${c.id}`}
                    className={`block bg-surface rounded-xl border border-border p-3.5 hover:border-amber/40 transition-colors ${
                      c.status === "completed" ? "opacity-70" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: `${c.badge_color}20` }}
                      >
                        {c.badge_icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm text-ink truncate">{c.title}</h3>
                          <ChevronRight size={14} strokeWidth={2} className="text-ink-muted flex-shrink-0" />
                        </div>
                        {c.period_label && (
                          <p className="text-[10px] text-ink-muted mt-0.5">{c.period_label}</p>
                        )}

                        {isActiveChallenge && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-ink-muted">Progress</span>
                              <span className="font-semibold text-ink">{pct}%</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-ink-muted">{c.progress}/{c.goal_value}</span>
                              {c.deadline && (
                                <span className="text-amber font-medium">{formatDeadline(c.deadline)}</span>
                              )}
                            </div>
                          </div>
                        )}

                        {c.status === "available" && (
                          <p className="text-xs text-ink-muted mt-1">
                            Target: {c.goal_value} {c.activity_type === "pages" ? "halaman" : c.activity_type === "streak" ? "hari" : "buku"}
                            {c.duration_type !== "unlimited" ? `/${c.duration_type === "weekly" ? "minggu" : "bulan"}` : ""}
                          </p>
                        )}

                        {c.status === "completed" && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Check size={10} strokeWidth={3} className="text-success" />
                            <span className="text-[10px] font-medium text-success">Selesai</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {c.status === "available" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleJoin(c.id);
                        }}
                        disabled={joining === c.id}
                        className="mt-2.5 w-full py-2 bg-amber text-white text-xs font-semibold rounded-xl hover:bg-amber-hover transition-colors disabled:opacity-50"
                      >
                        {joining === c.id ? "..." : "Ikuti Tantangan"}
                      </button>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: KLUB ── */}
      {mainTab === "klub" && (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-parchment border border-border flex items-center justify-center">
            <Users size={28} strokeWidth={1.5} className="text-ink-muted" />
          </div>
          <h2 className="text-h2">Klub Baca</h2>
          <p className="text-sm text-ink-muted max-w-xs">Fitur klub baca sedang dikembangkan. Nantikan update selanjutnya!</p>
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
