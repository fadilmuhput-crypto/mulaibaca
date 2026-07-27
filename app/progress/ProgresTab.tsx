"use client";

import { useMemo, useState, useRef, useEffect, type ElementType } from "react";
import Link from "next/link";
import { BookCheck, BookText, Flame, CalendarDays, Award, BookOpen, Library } from "lucide-react";
import type { ChallengeWithStatus, Badge } from "@/lib/challenges";
import BadgePing from "@/components/BadgePing";
import MonthDelta from "@/components/MonthDelta";

type DailyReading = {
  date: string;
  pages: number;
};

const ACTIVITY_ICONS: Record<string, ElementType> = {
  streak: Flame,
  pages: BookOpen,
  books: Library,
};

export default function ProgresTab({
  dailyReadings,
  currentStreak,
  longestStreak,
  totalPagesRead,
  booksFinished,
  active,
  completed,
  badges,
}: {
  dailyReadings: DailyReading[];
  currentStreak: number;
  longestStreak: number;
  totalPagesRead: number;
  booksFinished: number;
  active: ChallengeWithStatus[];
  completed: ChallengeWithStatus[];
  badges: Badge[];
}) {
  const { chartData, maxPages, pagesThisWeek, pagesThisMonth, daysReadThisMonth } = useMemo(() => {
    const now = new Date();
    const dayStrings: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dayStrings.push(d.toISOString().split("T")[0]);
    }

    const readingByDate = new Map(dailyReadings.map((r) => [r.date, r.pages]));
    const data = dayStrings.map((d) => ({ date: d, pages: readingByDate.get(d) ?? 0 }));
    const max = Math.max(...data.map((d) => d.pages), 1);
    const week = data.slice(-7).reduce((s, d) => s + d.pages, 0);
    const month = data.reduce((s, d) => s + d.pages, 0);
    const days = data.filter((d) => d.pages > 0).length;
    return { chartData: data, maxPages: max, pagesThisWeek: week, pagesThisMonth: month, daysReadThisMonth: days };
  }, [dailyReadings]);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function update() {
      if (chartRef.current) setWidth(chartRef.current.offsetWidth);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // GitHub-style contribution grid (5 weeks × 7 days)
  const gridData = useMemo(() => {
    const now = new Date();
    const readingByDate = new Map(dailyReadings.map((r) => [r.date, r.pages]));
    const weeks: { date: string; pages: number; label: string; isToday: boolean }[][] = [];
    // Start from 34 days ago, aligned to Sunday start of week
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 34);
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());
    for (let w = 0; w < 5; w++) {
      const week: { date: string; pages: number; label: string; isToday: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + w * 7 + d);
        const dateStr = date.toISOString().split("T")[0];
        const isToday = dateStr === now.toISOString().split("T")[0];
        const isFuture = date > now;
        week.push({
          date: dateStr,
          pages: isFuture ? 0 : (readingByDate.get(dateStr) ?? 0),
          label: date.getDate().toString(),
          isToday,
        });
      }
      weeks.push(week);
    }
    return weeks;
  }, [dailyReadings]);

  function getGridColor(pages: number, isToday: boolean): string {
    if (isToday) return "ring-2 ring-amber ring-offset-1 ring-offset-surface";
    if (pages === 0) return "bg-border/30";
    if (pages <= 10) return "bg-amber/20";
    if (pages <= 30) return "bg-amber/40";
    if (pages <= 50) return "bg-amber/60";
    return "bg-amber";
  }

  const [selectedCell, setSelectedCell] = useState<{ date: string; pages: number; x: number; y: number } | null>(null);

  function formatDate(iso: string) {
    const d = new Date(iso + "T00:00:00");
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    return `${dayNames[d.getDay()]}, ${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"][d.getMonth()]}`;
  }

  return (
    <div className="space-y-5">
      {totalPagesRead === 0 ? (
        <div className="text-center py-8">
          <div className="flex justify-center text-ink-muted mb-3">
            <BookCheck size={40} strokeWidth={1.25} />
          </div>
          <p className="text-sm font-semibold text-ink">Belum ada progres bacaan</p>
          <p className="text-xs text-ink-muted mt-1">Mulai catat sesi bacamu dari halaman Log</p>
        </div>
      ) : (<>
      <div className="flex gap-3">
        <div className="flex-1 bg-surface rounded-xl border border-border p-4 text-center">
          <Flame size={18} strokeWidth={1.75} className="text-amber mx-auto mb-1" />
          <div className="font-display text-2xl font-black text-ink">{currentStreak}</div>
          <div className="text-[10px] text-ink-muted font-medium mt-0.5">Streak</div>
        </div>
        <div className="flex-1 bg-surface rounded-xl border border-border p-4 text-center">
          <BookText size={18} strokeWidth={1.75} className="text-forest mx-auto mb-1" />
          <div className="font-display text-2xl font-black text-ink">{pagesThisWeek}</div>
          <div className="text-[10px] text-ink-muted font-medium mt-0.5">Minggu Ini</div>
        </div>
        <div className="flex-1 bg-surface rounded-xl border border-border p-4 text-center">
          <BookCheck size={18} strokeWidth={1.75} className="text-forest mx-auto mb-1" />
          <div className="font-display text-2xl font-black text-ink">{booksFinished}</div>
          <div className="text-[10px] text-ink-muted font-medium mt-0.5">Selesai</div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} strokeWidth={1.75} className="text-ink-muted" />
            <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted">30 Hari Terakhir</h3>
          </div>
          <span className="text-xs font-semibold text-ink-muted">
            {daysReadThisMonth}/{30} hari baca
          </span>
        </div>

        {/* Contribution grid */}
        <div className="relative" ref={chartRef}>
          <div className="grid grid-cols-5 gap-1">
            {gridData.map((week, wi) => (
              <div key={wi} className="grid grid-rows-7 gap-1">
                {week.map((cell) => (
                  <button
                    key={cell.date}
                    onClick={() => {
                      if (cell.pages > 0) {
                        setSelectedCell(selectedCell?.date === cell.date ? null : {
                          date: cell.date,
                          pages: cell.pages,
                          x: 0,
                          y: 0,
                        });
                      }
                    }}
                    className={`w-full aspect-square rounded-sm transition-all ${getGridColor(cell.pages, cell.isToday)} ${
                      cell.pages > 0 ? "cursor-pointer hover:scale-110" : "cursor-default"
                    }`}
                    title={`${cell.label} — ${cell.pages} halaman`}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Day labels */}
          <div className="absolute -left-0 top-0 h-full flex flex-col justify-between pointer-events-none py-0.5">
            {["Min", "", "Sel", "", "Kam", "", "Sab"].map((label, i) => (
              <span key={i} className="text-[8px] text-ink-muted leading-none">{label}</span>
            ))}
          </div>
          {selectedCell && (
            <div className="mt-2 text-center">
              <span className="text-xs text-ink-secondary">
                {new Date(selectedCell.date + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" })} — {selectedCell.pages} halaman
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-[9px] text-ink-muted">Sedikit</span>
          <div className="w-3 h-3 rounded-sm bg-border/30" />
          <div className="w-3 h-3 rounded-sm bg-amber/20" />
          <div className="w-3 h-3 rounded-sm bg-amber/40" />
          <div className="w-3 h-3 rounded-sm bg-amber/60" />
          <div className="w-3 h-3 rounded-sm bg-amber" />
          <span className="text-[9px] text-ink-muted">Banyak</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] text-ink-muted font-medium uppercase tracking-wider">Total Halaman</p>
          <p className="font-display text-2xl font-black text-ink mt-1">
            {totalPagesRead >= 1000 ? `${(totalPagesRead / 1000).toFixed(1)}k` : totalPagesRead}
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] text-ink-muted font-medium uppercase tracking-wider">Streak Terpanjang</p>
          <p className="font-display text-2xl font-black text-ink mt-1">{longestStreak} hari</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] text-ink-muted font-medium uppercase tracking-wider">Bulan Ini</p>
          <p className="font-display text-2xl font-black text-ink mt-1 flex items-center">
            {pagesThisMonth} hal
            <MonthDelta />
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] text-ink-muted font-medium uppercase tracking-wider">Rata-rata/hari</p>
          <p className="font-display text-2xl font-black text-ink mt-1">
            {daysReadThisMonth > 0 ? Math.round(pagesThisMonth / daysReadThisMonth) : 0}
          </p>
        </div>
      </div>

      {/* Active challenges */}
      {active.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Flame size={14} strokeWidth={1.75} className="text-amber" />
            <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted">Tantangan Aktif</h3>
          </div>
          <div className="space-y-3">
            {active.map((c) => {
              const Icon = ACTIVITY_ICONS[c.activity_type] ?? Flame;
              const pct = c.progress > 0 ? Math.min(Math.round((c.progress / c.goal_value) * 100), 100) : 0;
              return (
                <Link
                  key={c.id}
                  href={`/komunitas/tantangan/${c.id}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <Icon size={14} strokeWidth={1.75} className="text-amber flex-shrink-0" />
                    <span className="text-sm font-medium text-ink truncate">{c.title}</span>
                    <span className="text-xs font-bold text-ink ml-auto flex-shrink-0">
                      {c.progress}/{c.goal_value}
                    </span>
                  </div>
                  <div className="progress-bar ml-7">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Badge gallery */}
      {badges.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Award size={14} strokeWidth={1.75} className="text-amber" />
            <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted">Lencana</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2 bg-ink-card text-white text-xs font-semibold rounded-lg px-3 py-1.5"
                title={b.badge_name}
              >
                <BadgePing icon={b.badge_icon} color={b.badge_color} size={24} />
                <span>{b.badge_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed challenges */}
      {completed.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BookCheck size={14} strokeWidth={1.75} className="text-forest" />
            <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted">Tantangan Terselesaikan</h3>
          </div>
          <div className="space-y-2">
            {completed.map((c) => {
              const Icon = ACTIVITY_ICONS[c.activity_type] ?? Flame;
              return (
                <div key={c.id} className="flex items-center gap-3 text-sm">
                  <Icon size={16} strokeWidth={1.75} className="text-amber" />
                  <span className="text-ink font-medium">{c.title}</span>
                  {c.period_label && (
                    <span className="text-xs text-ink-muted ml-auto">{c.period_label}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
