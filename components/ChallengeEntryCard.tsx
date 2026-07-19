"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Flame, BookOpen, Library, ChevronRight } from "lucide-react";
import BadgePing from "./BadgePing";

type ActiveChallenge = {
  id: string;
  title: string;
  activity_type: string;
  goal_value: number;
  progress: number;
  percentage: number;
  icon: string;
  color: string;
  deadline: string | null;
};

type Badge = {
  id: string;
  badge_name: string;
  badge_icon: string;
  badge_color: string;
};

const ACTIVITY_ICON: Record<string, typeof Flame> = {
  streak: Flame,
  pages: BookOpen,
  books: Library,
};

function getIcon(activityType: string) {
  return ACTIVITY_ICON[activityType] ?? Flame;
}

export default function ChallengeEntryCard() {
  const [active, setActive] = useState<ActiveChallenge[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/challenges/active")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setActive(d.active ?? []);
          setBadges(d.badges ?? []);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) return null;
  if (active.length === 0 && badges.length === 0) return null;

  return (
    <Link
      href="/komunitas"
      className="block bg-surface rounded-xl border border-border p-3 hover:border-amber/40 transition-colors"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-amber-soft flex items-center justify-center flex-shrink-0">
          <Award size={16} strokeWidth={1.75} className="text-amber" />
        </div>
        <p className="text-sm font-semibold text-ink">Tantangan Membaca</p>
        <ChevronRight size={16} className="text-ink-muted ml-auto flex-shrink-0" />
      </div>

      {active.length > 0 && (
        <div className="space-y-2 mb-2">
          {active.map((c) => {
            const Icon = getIcon(c.activity_type);
            return (
              <div key={c.id} className="flex items-center gap-2.5">
                <Icon size={14} strokeWidth={1.75} className="text-ink-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs text-ink-secondary truncate">{c.title}</span>
                    <span className="text-[11px] font-bold text-ink flex-shrink-0 ml-2">
                      {c.progress}/{c.goal_value}
                    </span>
                  </div>
                  <div className="progress-bar h-1.5">
                    <div
                      className="progress-fill"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {badges.length > 0 && active.length > 0 && (
        <hr className="border-border my-2" />
      )}

      {badges.length > 0 && (
        <div className="flex items-center gap-1.5">
          {badges.slice(0, 3).map((b) => (
            <BadgePing
              key={b.id}
              icon={b.badge_icon}
              color={b.badge_color}
              size={22}
            />
          ))}
          {badges.length > 3 && (
            <span className="text-[10px] text-ink-muted font-semibold">
              +{badges.length - 3}
            </span>
          )}
          <span className="text-[10px] text-ink-muted ml-auto">Lencana</span>
        </div>
      )}
    </Link>
  );
}
