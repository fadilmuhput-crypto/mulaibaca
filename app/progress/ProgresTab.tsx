"use client";

import { useMemo, useState, useRef, useEffect, type ElementType } from "react";
import { BookCheck, BookText, Flame, CalendarDays, Award, BookOpen, Library } from "lucide-react";
import type { ChallengeWithStatus, Badge } from "@/lib/challenges";
import BadgePing from "@/components/BadgePing";

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
  completed,
  badges,
}: {
  dailyReadings: DailyReading[];
  currentStreak: number;
  longestStreak: number;
  totalPagesRead: number;
  booksFinished: number;
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

  const PAD_LEFT = 28;
  const PAD_RIGHT = 8;
  const PAD_TOP = 16;
  const PAD_BOTTOM = 4;
  const CHART_H = 160;
  const chartW = Math.max(width - PAD_LEFT - PAD_RIGHT, 0);
  const stepX = chartData.length > 1 ? chartW / (chartData.length - 1) : 0;

  const points = chartData.map((d, i) => ({
    x: PAD_LEFT + i * stepX,
    y: PAD_TOP + (1 - (maxPages > 0 ? d.pages / maxPages : 0)) * (CHART_H - PAD_TOP - PAD_BOTTOM),
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  const selectedPoint = selectedIdx !== null ? points[selectedIdx] : null;

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

        <div ref={chartRef} className="relative w-full">
          <svg
            width="100%"
            height={CHART_H}
            viewBox={`0 0 ${width || 300} ${CHART_H}`}
            className="overflow-visible"
          >
            {linePath && (
              <path d={linePath} fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}

            {points.map((p, i) => (
              <circle
                key={p.date}
                cx={p.x}
                cy={p.y}
                r={selectedIdx === i ? 5 : 3}
                fill="none"
                stroke={p.pages > 0 ? "#D97706" : "#35302A"}
                strokeWidth={selectedIdx === i ? 2.5 : 1.5}
                className={`transition-all cursor-pointer ${p.pages > 0 ? "chart-dot-filled" : "chart-dot-empty"}`}
                onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
              />
            ))}
          </svg>

          {selectedPoint && (
            <div
              className="absolute z-10 bg-ink-card text-white text-xs font-semibold rounded-lg px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none"
              style={{
                left: Math.min(selectedPoint.x, (width || 300) - 120),
                top: Math.max(selectedPoint.y - 36, 4),
                transform: "translateX(-50%)",
              }}
            >
              {formatDate(selectedPoint.date)} · {selectedPoint.pages} halaman
            </div>
          )}
        </div>

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
