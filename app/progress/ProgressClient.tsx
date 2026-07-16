"use client";

import { useState } from "react";
import Link from "next/link";
import type { Session } from "@/lib/session";
import type { ChallengeWithStatus, Badge } from "@/lib/challenges";
import AvatarIcon from "@/components/AvatarIcon";
import { Settings, ChartNoAxesColumn, History } from "lucide-react";
import ProgresTab from "./ProgresTab";
import AktivitasTab from "./AktivitasTab";

type DailyReading = {
  date: string;
  pages: number;
};

type Activity = {
  id: string;
  type: string;
  book_title?: string;
  book_slug?: string;
  book_cover?: string | null;
  detail: Record<string, unknown>;
  timestamp: string;
};

const TABS = [
  { key: "progres", label: "Progres", Icon: ChartNoAxesColumn },
  { key: "aktivitas", label: "Aktivitas", Icon: History },
] as const;

export default function ProgressClient({
  session,
  dailyReadings,
  currentStreak,
  longestStreak,
  totalPagesRead,
  booksFinished,
  activities,
  followerCount,
  followingCount,
  completed,
  badges,
}: {
  session: Session;
  dailyReadings: DailyReading[];
  currentStreak: number;
  longestStreak: number;
  totalPagesRead: number;
  booksFinished: number;
  activities: Activity[];
  followerCount: number;
  followingCount: number;
  completed: ChallengeWithStatus[];
  badges: Badge[];
}) {
  const [tab, setTab] = useState<"progres" | "aktivitas">("progres");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {session.memberUsername ? (
            <Link href={`/u/${session.memberUsername}`} className="w-14 h-14 rounded-full bg-amber-soft border-2 border-amber/30 flex items-center justify-center text-amber flex-shrink-0 hover:border-amber transition-colors">
              <AvatarIcon avatar={session.memberAvatar} size={24} />
            </Link>
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-soft border-2 border-amber/30 flex items-center justify-center text-amber flex-shrink-0">
              <AvatarIcon avatar={session.memberAvatar} size={24} />
            </div>
          )}
            <div>
              <h1 className="font-display font-bold text-xl text-ink">{session.memberName}</h1>
              {session.memberUsername ? (
                <p className="text-xs text-ink-muted">@{session.memberUsername}</p>
              ) : (
                <p className="text-xs text-ink-muted">{session.email}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs">
                <Link href="/progress/pengikut" className="text-ink-muted hover:text-ink transition-colors">
                  <strong className="text-ink font-semibold">{followerCount}</strong> pengikut
                </Link>
                <Link href="/progress/mengikuti" className="text-ink-muted hover:text-ink transition-colors">
                  <strong className="text-ink font-semibold">{followingCount}</strong> mengikuti
                </Link>
              </div>
            </div>
          </div>
          <Link
            href="/edit-profil"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-parchment border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:border-amber/40 transition-all"
            aria-label="Pengaturan"
          >
            <Settings size={18} strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex bg-surface rounded-xl border border-border p-1">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                active
                  ? "bg-amber text-white shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              <t.Icon size={15} strokeWidth={active ? 2.5 : 1.75} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === "progres" && (
        <ProgresTab
          dailyReadings={dailyReadings}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          totalPagesRead={totalPagesRead}
          booksFinished={booksFinished}
          completed={completed}
          badges={badges}
        />
      )}
      {tab === "aktivitas" && (
        <AktivitasTab activities={activities} memberName={session.memberName} />
      )}
    </div>
  );
}
