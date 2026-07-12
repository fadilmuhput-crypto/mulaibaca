"use client";

import { BookCheck, BookText, Flame, CalendarDays } from "lucide-react";

type DailyReading = {
  date: string;
  pages: number;
};

export default function ProgresTab({
  dailyReadings,
  currentStreak,
  longestStreak,
  totalPagesRead,
  booksFinished,
}: {
  dailyReadings: DailyReading[];
  currentStreak: number;
  longestStreak: number;
  totalPagesRead: number;
  booksFinished: number;
}) {
  // Last 30 days
  const now = new Date();
  const dayStrings: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayStrings.push(d.toISOString().split("T")[0]);
  }

  const readingByDate = new Map(dailyReadings.map((r) => [r.date, r.pages]));
  const chartData = dayStrings.map((d) => ({ date: d, pages: readingByDate.get(d) ?? 0 }));
  const maxPages = Math.max(...chartData.map((d) => d.pages), 1);

  // Stats
  const pagesThisWeek = chartData.slice(-7).reduce((s, d) => s + d.pages, 0);
  const pagesThisMonth = chartData.reduce((s, d) => s + d.pages, 0);
  const daysReadThisMonth = chartData.filter((d) => d.pages > 0).length;

  // Week labels
  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  return (
    <div className="space-y-5">
      {/* Streak row */}
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
          <BookCheck size={18} strokeWidth={1.75} className="text-blue-500 mx-auto mb-1" />
          <div className="font-display text-2xl font-black text-ink">{booksFinished}</div>
          <div className="text-[10px] text-ink-muted font-medium mt-0.5">Selesai</div>
        </div>
      </div>

      {/* Bar chart — 30 hari terakhir */}
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

        <div className="flex items-end gap-[3px] h-24">
          {chartData.map((d, i) => {
            const height = d.pages > 0 ? Math.max(4, (d.pages / maxPages) * 100) : 2;
            const isToday = i === chartData.length - 1;
            return (
              <div
                key={d.date}
                title={`${d.date}: ${d.pages} halaman`}
                className={`flex-1 rounded-sm transition-all ${
                  d.pages > 0
                    ? isToday ? "bg-amber" : "bg-forest/60"
                    : "bg-border/40"
                }`}
                style={{ height: `${height}%`, minHeight: "2px" }}
              />
            );
          })}
        </div>

        {/* Day labels */}
        <div className="flex justify-between text-[9px] text-ink-muted">
          {chartData.filter((_, i) => i % 5 === 0 || i === chartData.length - 1).map((d) => {
            const date = new Date(d.date + "T00:00:00");
            return (
              <span key={d.date}>
                {date.getDate()}/{date.getMonth() + 1}
              </span>
            );
          })}
        </div>
      </div>

      {/* Summary cards */}
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
          <p className="font-display text-2xl font-black text-ink mt-1">{pagesThisMonth} hal</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-[10px] text-ink-muted font-medium uppercase tracking-wider">Rata-rata/hari</p>
          <p className="font-display text-2xl font-black text-ink mt-1">
            {daysReadThisMonth > 0 ? Math.round(pagesThisMonth / daysReadThisMonth) : 0}
          </p>
        </div>
      </div>
    </div>
  );
}
