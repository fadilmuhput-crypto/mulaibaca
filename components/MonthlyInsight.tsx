"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";

type InsightData = {
  current: { pages: number; books: number };
  previous: { pages: number; books: number };
  pagesDelta: number | null;
  booksDelta: number | null;
};

export default function MonthlyInsight() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights/monthly")
      .then((r) => r.ok && r.json())
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data || data.current.pages === 0) return null;

  function DeltaBadge({ value }: { value: number | null }) {
    if (value === null) return null;
    const up = value >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? "text-forest" : "text-error"}`}>
        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {Math.abs(value)}%
      </span>
    );
  }

  return (
    <Link
      href="/progress"
      className="block bg-surface rounded-xl border border-border p-3 hover:border-amber/40 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted">Bulan Ini</h3>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-1.5">
          <BookOpen size={13} strokeWidth={1.75} className="text-amber" />
          <span className="text-sm font-bold text-ink">{data.current.pages}</span>
          <span className="text-xs text-ink-muted">hal</span>
          <DeltaBadge value={data.pagesDelta} />
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle size={13} strokeWidth={1.75} className="text-lime" />
          <span className="text-sm font-bold text-ink">{data.current.books}</span>
          <span className="text-xs text-ink-muted">buku</span>
          <DeltaBadge value={data.booksDelta} />
        </div>
      </div>
    </Link>
  );
}
