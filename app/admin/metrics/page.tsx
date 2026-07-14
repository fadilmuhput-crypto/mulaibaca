"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Users, BookOpen, Library, Flame, Star, Activity,
  TrendingUp, Target, Check, BookMarked, MessageSquare,
  BarChart3,
} from "lucide-react";

type Metrics = {
  snapshot: {
    totalFamilies: number; totalMembers: number; totalRegistered: number;
    totalChildren: number; totalBooks: number;
    activeToday: number; active7d: number; active30d: number;
    todaySesi: number; todayHalaman: number; todayPembaca: number;
    avgPagesPerSession: number; avgDurationPerSession: number;
  };
  growth: { familiesPerDay: Record<string, number>; membersPerDay: Record<string, number> };
  activity: { daily: { date: string; sesi: number; pembaca: number; halaman: number }[] };
  content: { enrichment: Record<string, number>; shelfStatus: Record<string, number> };
  streaks: { distribution: { label: string; jumlah: number }[]; avg: number; max: number };
  reviews: { total: number; avgRating: number; ratingDistribution: Record<string, number>; perDay: Record<string, number> };
  topBooks: { title: string; author: string | null; jumlah: number }[];
  funnel: { langkah: string; jumlah: number }[];
  familySize: Record<string, number>;
  notifications: Record<string, { total: number; read: number }>;
};

function Bar({ value, max, color = "var(--color-amber)" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-border/40 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function MiniBar({ value, max, color = "var(--color-amber)" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-16 bg-border/40 rounded-full h-1.5 overflow-hidden flex-shrink-0">
      <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
    </div>
  );
}

function ReadingChart({ daily }: { daily: { date: string; sesi: number; halaman: number }[] }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function update() { if (chartRef.current) setWidth(chartRef.current.offsetWidth); }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxHalaman = Math.max(...daily.map((d) => d.halaman), 1);
  const maxSesi = Math.max(...daily.map((d) => d.sesi), 1);
  const totalHalaman = daily.reduce((s, d) => s + d.halaman, 0);
  const totalSesi = daily.reduce((s, d) => s + d.sesi, 0);
  const daysRead = daily.filter((d) => d.halaman > 0).length;

  const PAD_L = 32, PAD_R = 8, PAD_T = 16, PAD_B = 4, CHART_H = 160;
  const chartW = Math.max(width - PAD_L - PAD_R, 0);
  const stepX = daily.length > 1 ? chartW / (daily.length - 1) : 0;

  const pointsH = daily.map((d, i) => ({
    x: PAD_L + i * stepX,
    y: PAD_T + (1 - d.halaman / maxHalaman) * (CHART_H - PAD_T - PAD_B),
    ...d,
  }));
  const pointsS = daily.map((d, i) => ({
    x: PAD_L + i * stepX,
    y: PAD_T + (1 - d.sesi / maxSesi) * (CHART_H - PAD_T - PAD_B),
    ...d,
  }));

  const lineH = pointsH.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const lineS = pointsS.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  const selected = selectedIdx !== null ? daily[selectedIdx] : null;

  function fmtDate(iso: string) {
    const d = new Date(iso + "T00:00:00");
    return `${d.getDate()} ${["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][d.getMonth()]}`;
  }

  return (
    <section className="bg-surface rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-ink flex items-center gap-1.5">
          <Activity size={14} strokeWidth={2} className="text-amber" />
          Aktivitas Membaca Harian (30 hari)
        </h3>
        <span className="text-xs text-ink-muted">{daysRead}/{30} hari baca</span>
      </div>

      <div ref={chartRef} className="relative w-full">
        <svg width="100%" height={CHART_H} viewBox={`0 0 ${width || 300} ${CHART_H}`} className="overflow-visible">
          {lineH && <path d={lineH} fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />}
          {lineS && <path d={lineS} fill="none" stroke="#1E4530" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />}

          {pointsH.map((p, i) => (
            <circle key={`h-${p.date}`} cx={p.x} cy={p.y}
              r={selectedIdx === i ? 5 : 3}
              fill={p.halaman > 0 ? (selectedIdx === i ? "#D97706" : "#1E4530") : "none"}
              stroke="#D97706" strokeWidth={selectedIdx === i ? 2.5 : 1.5}
              className="transition-all cursor-pointer"
              onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
            />
          ))}
          {pointsS.map((p, i) => (
            <circle key={`s-${p.date}`} cx={p.x} cy={p.y}
              r={selectedIdx === i ? 5 : 3}
              fill={p.sesi > 0 ? (selectedIdx === i ? "#1E4530" : "#D97706") : "none"}
              stroke="#1E4530" strokeWidth={selectedIdx === i ? 2.5 : 1.5}
              className="transition-all cursor-pointer"
              onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
            />
          ))}
        </svg>

        {selected && (
          <div className="absolute z-10 bg-ink text-white text-xs font-semibold rounded-lg px-3 py-2 shadow-lg whitespace-nowrap pointer-events-none"
            style={{
              left: Math.min(PAD_L + selectedIdx! * stepX, (width || 300) - 130),
              top: Math.max(PAD_T + (1 - selected.halaman / maxHalaman) * (CHART_H - PAD_T - PAD_B) - 36, 4),
              transform: "translateX(-50%)",
            }}
          >
            {fmtDate(selected.date)} · {selected.halaman} hal · {selected.sesi} sesi
          </div>
        )}
      </div>

      <div className="flex justify-between text-[9px] text-ink-muted mt-1">
        {daily.filter((_, i) => i % 5 === 0 || i === daily.length - 1).map((d) => (
          <span key={d.date}>{fmtDate(d.date)}</span>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-3 text-[10px] text-ink-muted">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber inline-block" /> Halaman</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-forest inline-block" /> Sesi</span>
        <span className="ml-auto font-semibold text-ink">{totalHalaman} hal · {totalSesi} sesi</span>
      </div>
    </section>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-4 brutal-shadow-xs">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "20", color }}>
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-ink-muted font-medium">{label}</p>
        <p className="text-xl font-display font-black text-ink mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-border/40 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-border/30 rounded-xl" />
        ))}
      </div>
    </div>
  );

  if (error) return <div className="text-error p-8 text-center">Gagal memuat metrics: {error}</div>;
  if (!data) return null;

  const s = data.snapshot;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">📊 Metrics</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Real-time dashboard — data terkini
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary text-sm flex items-center gap-1.5"
        >
          <BarChart3 size={14} strokeWidth={2} />
          Refresh
        </button>
      </div>

      {/* ── SNAPSHOT ── */}
      <section>
        <h2 className="text-h3 mb-3">Ringkasan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Keluarga" value={s.totalFamilies} icon={Users} color="var(--color-amber)" />
          <StatCard label="Anggota" value={s.totalMembers} icon={Users} color="var(--color-forest)" />
          <StatCard label="Terdaftar" value={s.totalRegistered} icon={BookMarked} color="var(--color-ink)" />
          <StatCard label="Anak (offline)" value={s.totalChildren} icon={Users} color="var(--color-ink-muted)" />
          <StatCard label="Total Buku" value={s.totalBooks} icon={Library} color="var(--color-forest)" />
          <StatCard label="Pembaca Hari Ini" value={s.todayPembaca} icon={Activity} color="var(--color-amber)" />
          <StatCard label="Sesi Hari Ini" value={s.todaySesi} icon={BookOpen} color="var(--color-forest)" />
          <StatCard label="Halaman Hari Ini" value={s.todayHalaman} icon={BookOpen} color="var(--color-amber)" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <StatCard label="Aktif 7 Hari" value={s.active7d} icon={Flame} color="var(--color-amber)" />
          <StatCard label="Aktif 30 Hari" value={s.active30d} icon={Flame} color="var(--color-amber)" />
          <StatCard label="Rata-rata Hal/Sesi" value={s.avgPagesPerSession} icon={TrendingUp} color="var(--color-ink)" />
          <StatCard label="Rata-rata Menit/Sesi" value={s.avgDurationPerSession} icon={TrendingUp} color="var(--color-ink)" />
        </div>
      </section>

      {/* ── GROWTH ── */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-ink mb-4 flex items-center gap-1.5">
            <TrendingUp size={14} strokeWidth={2} className="text-forest" />
            Keluarga Baru per Hari (30 hari)
          </h3>
          <div className="space-y-1">
            {Object.entries(data.growth.familiesPerDay).length === 0 && (
              <p className="text-xs text-ink-muted">Belum ada data</p>
            )}
            {Object.entries(data.growth.familiesPerDay).slice(-14).map(([tgl, jml]) => {
              const all = Object.values(data.growth.familiesPerDay);
              const max = Math.max(...all, 1);
              return (
                <div key={tgl} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-ink-muted flex-shrink-0">{tgl.slice(5)}</span>
                  <MiniBar value={jml} max={max} color="var(--color-forest)" />
                  <span className="font-semibold text-ink w-4 text-right">{jml}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-ink mb-4 flex items-center gap-1.5">
            <TrendingUp size={14} strokeWidth={2} className="text-amber" />
            Anggota Baru per Hari (30 hari)
          </h3>
          <div className="space-y-1">
            {Object.entries(data.growth.membersPerDay).length === 0 && (
              <p className="text-xs text-ink-muted">Belum ada data</p>
            )}
            {Object.entries(data.growth.membersPerDay).slice(-14).map(([tgl, jml]) => {
              const all = Object.values(data.growth.membersPerDay);
              const max = Math.max(...all, 1);
              return (
                <div key={tgl} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-ink-muted flex-shrink-0">{tgl.slice(5)}</span>
                  <MiniBar value={jml} max={max} color="var(--color-amber)" />
                  <span className="font-semibold text-ink w-4 text-right">{jml}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ACTIVITY ── */}
      <ReadingChart daily={data.activity.daily} />

      {/* ── STREAKS + CONTENT ── */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Streak Distribution */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-ink mb-4 flex items-center gap-1.5">
            <Flame size={14} strokeWidth={2} className="text-amber" />
            Distribusi Streak
          </h3>
          <p className="text-xs text-ink-muted mb-3">
            Rata-rata: <strong className="text-ink">{data.streaks.avg}</strong> · Tertinggi: <strong className="text-ink">{data.streaks.max}</strong>
          </p>
          <div className="space-y-2">
            {data.streaks.distribution.map((d) => {
              const max = Math.max(...data.streaks.distribution.map((x) => x.jumlah), 1);
              return (
                <div key={d.label} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-ink-muted flex-shrink-0">{d.label}</span>
                  <Bar value={d.jumlah} max={max} color={d.label === "0" ? "var(--color-border)" : "var(--color-amber)"} />
                  <span className="font-semibold text-ink w-6 text-right">{d.jumlah}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-1.5">
              <Library size={14} strokeWidth={2} className="text-forest" />
              Status Rak Buku
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              {Object.entries(data.content.shelfStatus).map(([k, v]) => {
                const total = Object.values(data.content.shelfStatus).reduce((a, b) => a + b, 0);
                const colors: Record<string, string> = { want: "var(--color-amber)", reading: "var(--color-forest)", done: "var(--color-ink-muted)" };
                return (
                  <div key={k} className="bg-parchment rounded-xl p-3">
                    <div className="font-display text-xl font-black" style={{ color: colors[k] ?? "var(--color-ink)" }}>{v}</div>
                    <div className="text-[10px] text-ink-muted mt-0.5 font-medium uppercase">{k}</div>
                    <div className="text-[9px] text-ink-muted">{total > 0 ? Math.round((v / total) * 100) : 0}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-1.5">
              <Check size={14} strokeWidth={2} className="text-forest" />
              Enrichment Buku
            </h3>
            <div className="space-y-1.5">
              {Object.entries(data.content.enrichment).map(([k, v]) => {
                const total = Object.values(data.content.enrichment).reduce((a, b) => a + b, 0);
                const colors: Record<string, string> = {
                  enriched: "var(--color-forest)", pending: "var(--color-amber)", failed: "var(--color-error)",
                };
                const color = colors[k] ?? "var(--color-ink-muted)";
                return (
                  <div key={k} className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-ink-muted">{k}</span>
                    <Bar value={v} max={total} color={color} />
                    <span className="font-semibold text-ink w-6 text-right">{v}</span>
                    <span className="text-ink-muted w-8">({total > 0 ? Math.round((v / total) * 100) : 0}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-ink mb-4 flex items-center gap-1.5">
            <Star size={14} strokeWidth={2} className="text-amber" />
            Review Buku
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-parchment rounded-xl p-3 text-center">
              <div className="font-display text-2xl font-black text-ink">{data.reviews.total}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">Total Review</div>
            </div>
            <div className="bg-parchment rounded-xl p-3 text-center">
              <div className="font-display text-2xl font-black text-amber">{data.reviews.avgRating}</div>
              <div className="text-[10px] text-ink-muted mt-0.5">Rata-rata Rating</div>
            </div>
          </div>
          <div className="space-y-1">
            {Object.entries(data.reviews.ratingDistribution).sort().reverse().map(([rating, count]) => {
              const max = Math.max(...Object.values(data.reviews.ratingDistribution), 1);
              return (
                <div key={rating} className="flex items-center gap-2 text-xs">
                  <span className="w-8 text-ink-muted">{'★'.repeat(Number(rating))}{'☆'.repeat(5 - Number(rating))}</span>
                  <Bar value={count} max={max} color="var(--color-amber)" />
                  <span className="font-semibold text-ink w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Books */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-ink mb-4 flex items-center gap-1.5">
            <BookOpen size={14} strokeWidth={2} className="text-forest" />
            Buku Paling Banyak di Rak
          </h3>
          <div className="space-y-2">
            {data.topBooks.length === 0 && <p className="text-xs text-ink-muted">Belum ada data</p>}
            {data.topBooks.map((b, i) => {
              const max = Math.max(...data.topBooks.map((x) => x.jumlah), 1);
              return (
                <div key={b.title} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-ink-muted font-mono text-right">{i + 1}.</span>
                  <div className="flex-1 min-w-0 truncate">
                    <span className="font-medium text-ink">{b.title}</span>
                    {b.author && <span className="text-ink-muted ml-1">— {b.author}</span>}
                  </div>
                  <MiniBar value={b.jumlah} max={max} color="var(--color-forest)" />
                  <span className="font-semibold text-ink w-4 text-right">{b.jumlah}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FUNNEL + FAMILY SIZE ── */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Onboarding Funnel */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-bold text-ink mb-4 flex items-center gap-1.5">
            <Target size={14} strokeWidth={2} className="text-amber" />
            Funnel Onboarding
          </h3>
          <div className="space-y-1">
            {data.funnel.map((f, i) => {
              const max = data.funnel[0]?.jumlah ?? 1;
              const pct = max > 0 ? Math.round((f.jumlah / max) * 100) : 0;
              return (
                <div key={f.langkah} className="flex items-center gap-2 text-xs">
                  <span className="w-28 text-ink-muted flex-shrink-0">{f.langkah}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <Bar value={f.jumlah} max={max} color={i === data.funnel.length - 1 ? "var(--color-forest)" : "var(--color-amber)"} />
                  </div>
                  <span className="font-semibold text-ink w-8 text-right">{pct}%</span>
                  <span className="font-semibold text-ink-muted w-6 text-right">{f.jumlah}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Family Size + Notifications */}
        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-1.5">
              <Users size={14} strokeWidth={2} className="text-ink" />
              Ukuran Keluarga
            </h3>
            <div className="space-y-1.5">
              {Object.entries(data.familySize).length === 0 && (
                <p className="text-xs text-ink-muted">Belum ada data</p>
              )}
              {Object.entries(data.familySize).map(([size, count]) => {
                const max = Math.max(...Object.values(data.familySize), 1);
                return (
                  <div key={size} className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-ink-muted">{size} org</span>
                    <Bar value={count} max={max} color="var(--color-ink-secondary)" />
                    <span className="font-semibold text-ink w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-5">
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-1.5">
              <MessageSquare size={14} strokeWidth={2} className="text-ink" />
              Notifikasi
            </h3>
            <div className="space-y-1">
              {Object.entries(data.notifications).length === 0 && (
                <p className="text-xs text-ink-muted">Belum ada notifikasi</p>
              )}
              {Object.entries(data.notifications).map(([type, n]) => (
                <div key={type} className="flex items-center justify-between text-xs">
                  <span className="text-ink-muted">{type}</span>
                  <span className="font-semibold text-ink">{n.total} · {n.read} dibaca</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
