"use client";

import { useState, useMemo, type ElementType } from "react";
import Link from "next/link";
import type { Challenge, Badge } from "@/lib/challenges";
import { formatDeadline } from "@/lib/challenges";
import { Check, Award, Flame, BookOpen, Library } from "lucide-react";

const ACTIVITY_ICONS: Record<string, ElementType> = {
  streak: Flame,
  pages: BookOpen,
  books: Library,
};

const CONFETTI_COLORS = ["#F59E0B", "#10B981", "#3B82F6", "#EF4444", "#8B5CF6", "#EC4899"];

function Confetti() {
  const particles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${0.8 + Math.random() * 0.6}s`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 360,
    })),
  []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
        }
        @keyframes badge-pop {
          0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
      <div className="absolute inset-0 flex items-center justify-center" style={{ animation: "badge-pop 0.6s ease-out forwards" }}>
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: p.left,
              top: 0,
              width: p.size,
              height: p.size,
              background: p.color,
              animation: `confetti-fall ${p.duration} ease-out ${p.delay} forwards`,
              transform: `rotate(${p.rotation}deg)`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </div>
    </div>
  );
}

type Props = {
  challenge: Challenge;
  progress: number;
  isActive: boolean;
  isCompleted: boolean;
  badge: Badge | null;
  periodLabel: string | null;
  deadline: string | null;
  memberId: string;
};

export default function TantanganDetailClient({
  challenge,
  progress,
  isActive: initialActive,
  isCompleted,
  badge,
  periodLabel,
  deadline,
  memberId,
}: Props) {
  const [joining, setJoining] = useState(false);
  const [isActive, setIsActive] = useState(initialActive);

  const goalLabel = challenge.activity_type === "pages" ? "halaman" : challenge.activity_type === "streak" ? "hari" : "buku";
  const pct = Math.min(Math.round((progress / challenge.goal_value) * 100), 100);
  const BadgeIcon = ACTIVITY_ICONS[challenge.activity_type] ?? Award;

  async function handleJoin() {
    setJoining(true);
    try {
      const res = await fetch("/api/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id, memberId }),
      });
      if (res.ok) setIsActive(true);
    } catch {}
    setJoining(false);
  }

  return (
    <div className="space-y-6">
      {/* Hero badge */}
      <div className="flex flex-col items-center text-center py-4">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 ${
          isCompleted ? "bg-success-soft" : isActive ? "bg-amber-soft" : "bg-cream"
        }`}>
          {isCompleted ? <Award size={36} strokeWidth={1.25} className="text-amber" /> : <BadgeIcon size={36} strokeWidth={1.25} className="text-ink" />}
        </div>
        <h1 className="text-h1">{challenge.title}</h1>
        {challenge.description && (
          <p className="text-sm text-ink-muted mt-1 max-w-xs">{challenge.description}</p>
        )}
        {periodLabel && (
          <p className="text-xs text-ink-muted mt-2 font-semibold">{periodLabel}</p>
        )}
      </div>

      {/* Status card */}
      <div className="bg-surface rounded-2xl border-2 border-border p-5 space-y-4">
        {isCompleted ? (
          <div className="text-center py-4 space-y-3 relative">
            <Confetti />
            <Award size={48} strokeWidth={1.25} className="text-amber mx-auto" />
            <h2 className="font-display font-bold text-ink text-xl">{badge?.badge_name ?? challenge.badge_name}</h2>
            <p className="text-sm text-ink-muted">Tantangan selesai!</p>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink-secondary">Progress</span>
                <span className="text-sm font-bold text-ink">{progress}/{challenge.goal_value} {goalLabel}</span>
              </div>
              <div className="progress-bar h-3">
                <div
                  className={`progress-fill ${pct >= 100 ? "bg-forest" : ""}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-ink-muted text-right">{pct}%</p>
            </div>

            {/* Deadline */}
            {deadline && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-muted">Batas waktu</span>
                <span className="font-semibold text-error">{formatDeadline(deadline)}</span>
              </div>
            )}

            {/* Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Target</span>
              <span className="font-semibold text-ink">{challenge.goal_value} {goalLabel}</span>
            </div>
          </>
        )}
      </div>

      {/* Action */}
      {!isCompleted && !isActive && (
        <button
          onClick={handleJoin}
          disabled={joining}
          className="btn-primary-full-lg"
        >
          {joining ? "..." : "Ikuti Tantangan Ini"}
        </button>
      )}

      {isActive && !isCompleted && (
        <div className="bg-amber-soft rounded-xl p-4 border border-amber/30">
          <p className="text-sm font-semibold text-ink text-center">
            {progress >= challenge.goal_value
              ? "🎉 Selamat! Kamu sudah mencapai target!"
              : `Kamu masih perlu ${challenge.goal_value - progress} ${goalLabel} lagi!`
            }
          </p>
        </div>
      )}

      {isCompleted && (
        <div className="text-center">
          <Link
            href="/komunitas"
            className="btn-secondary"
          >
            Lihat Tantangan Lain
          </Link>
        </div>
      )}
    </div>
  );
}
