"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Check, Flame, Target, AlertTriangle, Minus, Plus } from "lucide-react";
import BookCover from "@/components/BookCover";

type Book = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number | null;
  open_library_id: string | null;
};

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function bookUrl(book: Book): string {
  if (book.open_library_id) {
    return `/buku/${toSlug(book.title)}-${book.open_library_id.toLowerCase()}`;
  }
  return `/buku/${toSlug(book.title)}`;
}

type ShelfItem = {
  id: string;
  current_page: number;
  books: Book | null;
};

type TodayLog = {
  id: string;
  pages_read: number;
  duration_minutes: number | null;
  note: string | null;
  shelf_items: { books: { title: string; cover_url: string | null } | null } | null;
};

type Streak = {
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
};

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function buildWeekDays(today: string): { date: string; label: string }[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({ date: dateStr, label: DAY_LABELS[d.getDay()] });
  }
  return days;
}

export default function LogClient({
  shelf,
  todayLogs: initialLogs,
  streak: initialStreak,
  pagesPerDay,
  weeklyPagesGoal,
  today,
}: {
  shelf: ShelfItem[];
  todayLogs: TodayLog[];
  streak: Streak;
  pagesPerDay: Record<string, number>;
  weeklyPagesGoal: number;
  today: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ShelfItem | null>(
    shelf.length === 1 ? shelf[0] : null
  );
  const [pages, setPages] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [todayLogs, setTodayLogs] = useState(initialLogs);
  const [streak, setStreak] = useState(initialStreak);
  const [celebrated, setCelebrated] = useState(false);
  const [lastPages, setLastPages] = useState(0);

  const weekDays = buildWeekDays(today);
  const todayPages = todayLogs.reduce((s, l) => s + l.pages_read, 0);
  const dailyGoal = weeklyPagesGoal > 0 ? Math.ceil(weeklyPagesGoal / 7) : 0;
  const dailyPct = dailyGoal > 0 ? Math.min((todayPages / dailyGoal) * 100, 100) : 0;
  const dailyMet = dailyGoal > 0 && todayPages >= dailyGoal;
  const streakAtRisk = streak.current_streak > 0 && todayLogs.length === 0;

  function adjustPages(delta: number) {
    const cur = parseInt(pages) || 0;
    const next = Math.max(1, cur + delta);
    setPages(String(next));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !pages) return;
    const pagesNum = parseInt(pages);
    if (isNaN(pagesNum) || pagesNum < 1) { setError("Jumlah halaman tidak valid"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shelfItemId: selected.id,
          pagesRead: pagesNum,
          durationMinutes: duration ? parseInt(duration) : null,
          note: note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.streak) setStreak(data.streak);
      setLastPages(pagesNum);
      setCelebrated(true);
      setPages("");
      setDuration("");
      setNote("");
      setSelected(shelf.length === 1 ? shelf[0] : null);
      router.refresh();
      setTimeout(() => setCelebrated(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">

      {/* ── STREAK HERO ── */}
      <section
        className="rounded-2xl p-5"
        style={{ background: "var(--color-ink)", border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal-sm)" }}
      >
        {/* Streak + stats row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber flex items-center justify-center" style={{ boxShadow: "var(--shadow-brutal-xs)" }}>
              <Flame size={26} strokeWidth={1.75} className="text-white" />
            </div>
            <div>
              <div className="font-display text-4xl font-black text-white leading-none">
                {streak.current_streak}
              </div>
              <div className="text-xs text-white/60 mt-0.5">hari berturut-turut</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40 mb-0.5">terpanjang</div>
            <div className="font-display text-2xl font-bold text-white/70">
              {streak.longest_streak}
            </div>
          </div>
        </div>

        {/* 7-day dots */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(({ date, label }) => {
            const pages = pagesPerDay[date] ?? 0;
            const isToday = date === today;
            const hasRead = pages > 0;

            return (
              <div key={date} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                    hasRead
                      ? isToday
                        ? "bg-amber"
                        : "bg-white/20"
                      : isToday
                      ? "bg-white/10 border border-dashed border-white/30"
                      : "bg-white/5"
                  }`}
                >
                  {hasRead ? (
                    <Check
                      size={14}
                      strokeWidth={3}
                      className={isToday ? "text-white" : "text-white/60"}
                    />
                  ) : isToday ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  ) : null}
                </div>
                <span className={`text-[9px] font-semibold ${isToday ? "text-amber" : "text-white/40"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── STREAK AT RISK ── */}
      {streakAtRisk && (
        <div className="flex items-center gap-3 bg-amber-soft border border-amber/30 rounded-2xl px-4 py-3">
          <AlertTriangle size={18} strokeWidth={1.75} className="text-amber flex-shrink-0" />
          <p className="text-sm text-ink-secondary flex-1">
            Streak <span className="font-semibold text-ink">{streak.current_streak} hari</span> kamu belum aman — catat bacaan hari ini!
          </p>
        </div>
      )}

      {/* ── CELEBRATION ── */}
      {celebrated && (
        <div
          className="rounded-2xl p-4 text-center"
          style={{ background: "var(--color-forest)", border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal-sm)" }}
        >
          <div className="text-3xl font-display font-black text-white mb-0.5">
            +{lastPages} halaman!
          </div>
          <p className="text-white/80 text-sm">
            {streak.current_streak > 1
              ? `🔥 Streak ${streak.current_streak} hari! Terus pertahankan!`
              : "Bacaan hari ini tercatat. Keep going!"}
          </p>
        </div>
      )}

      {/* ── DAILY GOAL PROGRESS ── */}
      {dailyGoal > 0 && !celebrated && (
        <Link
          href="/profil"
          className="flex items-center gap-3 bg-surface rounded-2xl border border-border px-4 py-3"
          style={{ boxShadow: "var(--shadow-brutal-xs)" }}
        >
          <Target size={18} strokeWidth={1.75} className={dailyMet ? "text-forest flex-shrink-0" : "text-amber flex-shrink-0"} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-ink-secondary">
                {dailyMet ? "Target hari ini tercapai!" : "Target hari ini"}
              </span>
              <span className="text-xs font-bold text-ink">{todayPages} / {dailyGoal} hal</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill transition-all"
                style={{ width: `${dailyPct}%`, backgroundColor: dailyMet ? "var(--color-forest)" : "var(--color-amber)" }}
              />
            </div>
          </div>
        </Link>
      )}

      {/* ── LOG FORM ── */}
      {shelf.length === 0 ? (
        <div className="text-center py-10">
          <div className="flex justify-center text-ink-muted mb-3">
            <BookOpen size={40} strokeWidth={1.25} />
          </div>
          <p className="text-ink-secondary text-sm mb-3">Tambah buku ke rak dulu, baru bisa catat ya!</p>
          <Link href="/jelajah" className="text-amber text-sm font-medium hover:text-amber-hover">
            + Tambah buku
          </Link>
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="font-display font-bold text-ink text-lg">Catat sesi baca</h2>

          {/* Book selector — skip if only 1 book */}
          {shelf.length > 1 && (
            <div className="space-y-2">
              {shelf.map((item) => {
                const book = item.books;
                if (!book) return null;
                const isSelected = selected?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(isSelected ? null : item)}
                    className={`w-full flex gap-3 items-center p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected ? "border-amber bg-amber-soft" : "border-border bg-surface hover:border-amber/50"
                    }`}
                  >
                    <BookCover src={book.cover_url} title={book.title} className="w-10 h-14 rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-ink truncate">{book.title}</p>
                      {book.author && <p className="text-xs text-ink-muted truncate">{book.author}</p>}
                      <p className="text-xs text-ink-muted mt-0.5">
                        Hal {item.current_page ?? 0}{book.total_pages ? ` / ${book.total_pages}` : ""}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                      isSelected ? "border-amber bg-amber" : "border-border"
                    }`}>
                      {isSelected && <Check size={10} strokeWidth={3} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Single book — show context card */}
          {shelf.length === 1 && shelf[0].books && (
            <div className="flex gap-3 items-center bg-surface rounded-xl border border-border p-3">
              <Link href={bookUrl(shelf[0].books)} className="flex-shrink-0">
                <BookCover src={shelf[0].books.cover_url} title={shelf[0].books.title} className="w-10 h-14 rounded-lg" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={bookUrl(shelf[0].books)} className="hover:text-amber transition-colors">
                  <p className="font-medium text-sm text-ink truncate">{shelf[0].books.title}</p>
                </Link>
                {shelf[0].books.author && <p className="text-xs text-ink-muted">{shelf[0].books.author}</p>}
                <p className="text-xs text-ink-muted mt-0.5">
                  Hal {shelf[0].current_page ?? 0}{shelf[0].books.total_pages ? ` / ${shelf[0].books.total_pages}` : ""}
                </p>
              </div>
            </div>
          )}

          {/* Input form */}
          {selected && (
            <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-4 space-y-4" style={{ boxShadow: "var(--shadow-brutal-xs)" }}>

              {/* Pages — prominent with +/- */}
              <div>
                <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-2">
                  Berapa halaman yang kamu baca? *
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustPages(-5)}
                    className="w-11 h-11 rounded-xl border border-border flex items-center justify-center text-ink-secondary hover:border-amber/60 hover:text-amber transition-colors"
                  >
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="0"
                    className="flex-1 text-center text-3xl font-display font-black text-ink bg-parchment border border-border rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                    autoFocus={shelf.length === 1}
                  />
                  <button
                    type="button"
                    onClick={() => adjustPages(5)}
                    className="w-11 h-11 rounded-xl border border-border flex items-center justify-center text-ink-secondary hover:border-amber/60 hover:text-amber transition-colors"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
                {/* Quick amounts */}
                <div className="flex gap-2 mt-2">
                  {[10, 20, 30, 50].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPages(String(n))}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        pages === String(n)
                          ? "bg-amber text-white border-amber"
                          : "border-border text-ink-secondary hover:border-amber/50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration + note in a compact row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ink-muted mb-1 block">Durasi (menit)</label>
                  <input
                    type="number" min={1} value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="cth: 30"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-muted mb-1 block">Catatan</label>
                  <input
                    type="text" value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Kesan hari ini…"
                    className="input text-sm"
                  />
                </div>
              </div>

              {error && <p className="text-error text-xs text-center bg-error-soft rounded-xl px-3 py-2">{error}</p>}

              <button
                type="submit"
                disabled={loading || !pages}
                className="btn-primary-full-lg"
              >
                {loading ? "Menyimpan…" : "Catat Bacaan"}
              </button>
            </form>
          )}
        </section>
      )}

      {/* ── TODAY'S LOGS ── */}
      {todayLogs.length > 0 && (
        <section>
          <h2 className="font-semibold text-ink mb-3">
            Log hari ini
            <span className="ml-2 text-amber font-display font-black text-base">
              +{todayPages} hal
            </span>
          </h2>
          <div className="space-y-2">
            {todayLogs.map((log) => {
              const book = log.shelf_items?.books;
              return (
                <div key={log.id} className="flex gap-3 items-center bg-surface rounded-xl border border-border p-3">
                  <BookCover src={book?.cover_url ?? null} title={book?.title ?? ""} className="w-8 h-11 rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{book?.title ?? "Buku"}</p>
                    {log.note && <p className="text-xs text-ink-muted truncate">{log.note}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-amber">+{log.pages_read} hal</p>
                    {log.duration_minutes && (
                      <p className="text-xs text-ink-muted">{log.duration_minutes} mnt</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
