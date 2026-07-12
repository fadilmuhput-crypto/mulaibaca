"use client";

import { useState } from "react";
import Link from "next/link";
import type { Session } from "@/lib/session";
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

export default function ProfilClient({
  session,
  dailyReadings,
  currentStreak,
  longestStreak,
  totalPagesRead,
  booksFinished,
  activities,
}: {
  session: Session;
  dailyReadings: DailyReading[];
  currentStreak: number;
  longestStreak: number;
  totalPagesRead: number;
  booksFinished: number;
  activities: Activity[];
}) {
  const [tab, setTab] = useState<"progres" | "aktivitas">("progres");

  return (
    <div className="space-y-4">
      {/* Header: avatar, name, username, & settings */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-soft border-2 border-amber/30 flex items-center justify-center text-amber flex-shrink-0">
              <AvatarIcon avatar={session.memberAvatar} size={24} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-ink">{session.memberName}</h1>
              {session.memberUsername ? (
                <p className="text-xs text-ink-muted">@{session.memberUsername}</p>
              ) : (
                <p className="text-xs text-ink-muted">{session.email}</p>
              )}
            </div>
          </div>
          <Link
            href="/profil/settings"
            className="w-9 h-9 rounded-xl bg-parchment border border-border flex items-center justify-center text-ink-muted hover:text-ink hover:border-amber/40 transition-all"
            aria-label="Pengaturan"
          >
            <Settings size={16} strokeWidth={1.75} />
          </Link>
        </div>

        {/* Family badge */}
        {session.familyName && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-ink-muted">{session.familyName}</p>
          </div>
        )}
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
        />
      )}
      {tab === "aktivitas" && (
        <AktivitasTab activities={activities} memberName={session.memberName} />
      )}
    </div>
  );
}
