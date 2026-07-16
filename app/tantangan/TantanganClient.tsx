"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChallengeWithStatus, Badge } from "@/lib/challenges";
import { formatDeadline } from "@/lib/challenges";
import { Check, ChevronRight } from "lucide-react";

type Tab = "active" | "available" | "completed";

type Props = {
  initialActive: ChallengeWithStatus[];
  initialAvailable: ChallengeWithStatus[];
  initialCompleted: ChallengeWithStatus[];
  initialBadges: Badge[];
  memberId: string;
};

export default function TantanganClient({
  initialActive,
  initialAvailable,
  initialCompleted,
  initialBadges,
  memberId,
}: Props) {
  const [tab, setTab] = useState<Tab>(initialActive.length > 0 ? "active" : "available");
  const [active, setActive] = useState(initialActive);
  const [available, setAvailable] = useState(initialAvailable);
  const [completed, setCompleted] = useState(initialCompleted);
  const [badges, setBadges] = useState(initialBadges);
  const [joining, setJoining] = useState<string | null>(null);
  const [showBadges, setShowBadges] = useState(false);

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

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "active", label: "Aktif", count: active.length },
    { key: "available", label: "Tersedia", count: available.length },
    { key: "completed", label: "Selesai", count: completed.length },
  ];

  const current = tab === "active" ? active : tab === "available" ? available : completed;

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-h1">Tantangan</h1>
          {badges.length > 0 && (
            <button
              onClick={() => setShowBadges(!showBadges)}
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors min-h-[44px] px-2"
            >
              🏅 {badges.length}
            </button>
          )}
        </div>

        {/* Badge gallery */}
        {showBadges && badges.length > 0 && (
          <section className="bg-surface rounded-2xl border border-border p-4 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-ink-muted">Badge Saya</h2>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-parchment border border-border"
                >
                  <span style={{ fontSize: "28px" }}>{b.badge_icon}</span>
                  <span className="text-[10px] font-semibold text-ink text-center leading-tight">{b.badge_name}</span>
                  {b.period_label && (
                    <span className="text-[9px] text-ink-muted">{b.period_label}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-cream rounded-xl p-1 border border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold rounded-lg transition-colors min-h-[44px] ${
                tab === t.key
                  ? "bg-surface text-ink brutal-shadow-xs"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
              {(t.count ?? 0) > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? "bg-amber text-white" : "bg-border text-ink-muted"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Challenge list */}
        <div className="space-y-3">
          {current.length === 0 && (
            <div className="text-center py-12">
              <p className="text-ink-muted text-sm">
                {tab === "active"
                  ? "Belum ada tantangan aktif. Ikuti tantangan yang tersedia!"
                  : tab === "completed"
                  ? "Belum ada tantangan yang diselesaikan"
                  : "Semua tantangan sudah diikuti 🎉"}
              </p>
            </div>
          )}

          {current.map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              onJoin={handleJoin}
              joining={joining}
              memberId={memberId}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function ChallengeCard({
  challenge,
  onJoin,
  joining,
}: {
  challenge: ChallengeWithStatus;
  onJoin: (id: string) => void;
  joining: string | null;
  memberId: string;
}) {
  const isActive = challenge.status === "active";
  const isCompleted = challenge.status === "completed";
  const pct = Math.min(Math.round((challenge.progress / challenge.goal_value) * 100), 100);

  return (
    <div className={`bg-surface rounded-2xl border-2 p-4 space-y-3 ${
      isCompleted ? "border-forest/40" : isActive ? "border-amber/40" : "border-border"
    }`}>
      {/* Badge + title row */}
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
            isCompleted ? "bg-success-soft" : isActive ? "bg-amber-soft" : "bg-cream"
          }`}
        >
          {isCompleted ? "🏅" : challenge.badge_icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-ink text-base truncate">{challenge.title}</h3>
            {isCompleted && (
              <span className="badge badge-forest flex-shrink-0">Selesai</span>
            )}
          </div>
          {challenge.description && (
            <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{challenge.description}</p>
          )}
          {challenge.period_label && (
            <p className="text-[10px] text-ink-muted mt-0.5">{challenge.period_label}</p>
          )}
        </div>
      </div>

      {/* Progress bar (for active or available) */}
      {!isCompleted && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink-secondary">
              {challenge.progress >= challenge.goal_value ? "Tercapai!" : `${challenge.progress}/${challenge.goal_value}`}
              {challenge.activity_type === "pages" ? " halaman" : challenge.activity_type === "days" ? " hari" : challenge.activity_type === "count" ? " buku" : ""}
            </span>
            <span className="text-ink-muted">{pct}%</span>
          </div>
          <div className="progress-bar h-2">
            <div
              className={`progress-fill ${pct >= 100 ? "bg-forest" : ""}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Deadline + action */}
      <div className="flex items-center justify-between">
        {challenge.deadline && !isCompleted && (
          <span className="text-[10px] font-semibold text-error">
            {formatDeadline(challenge.deadline)}
          </span>
        )}
        {!isCompleted && !isActive && (
          <button
            onClick={() => onJoin(challenge.id)}
            disabled={joining === challenge.id}
            className="btn-primary-sm ml-auto"
          >
            {joining === challenge.id ? "..." : "Ikuti"}
          </button>
        )}
        {isActive && (
          <Link
            href={`/tantangan/${challenge.id}`}
            className="text-xs font-semibold text-amber hover:text-amber-hover transition-colors flex items-center gap-1 ml-auto min-h-[44px] px-2"
          >
            Detail <ChevronRight size={14} />
          </Link>
        )}
        {isCompleted && (
          <span className="flex items-center gap-1 text-xs font-semibold text-success">
            <Check size={14} /> Selesai
          </span>
        )}
      </div>
    </div>
  );
}
