"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, BookText, Check, Sparkles } from "lucide-react";

type Book = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number | null;
};

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
  shelf_items: {
    books: { title: string; cover_url: string | null } | null;
  } | null;
};

type Streak = {
  current_streak: number;
  longest_streak: number;
  last_log_date: string | null;
};

export default function LogClient({
  shelf,
  todayLogs: initialLogs,
  streak: initialStreak,
}: {
  shelf: ShelfItem[];
  todayLogs: TodayLog[];
  streak: Streak;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<ShelfItem | null>(null);
  const [pages, setPages] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [todayLogs, setTodayLogs] = useState(initialLogs);
  const [streak, setStreak] = useState(initialStreak);
  const [successMsg, setSuccessMsg] = useState("");

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !pages) return;
    const pagesNum = parseInt(pages);
    if (isNaN(pagesNum) || pagesNum < 1) {
      setError("Jumlah halaman tidak valid");
      return;
    }
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
      setSuccessMsg(`+${pagesNum} hal tercatat!`);
      setPages("");
      setDuration("");
      setNote("");
      setSelected(null);
      router.refresh();

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Date + streak summary */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <p className="text-xs text-ink-muted capitalize">{today}</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">{streak.current_streak}</div>
            <div className="text-[10px] text-ink-muted">hari streak</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">{streak.longest_streak}</div>
            <div className="text-[10px] text-ink-muted">terpanjang</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">
              {todayLogs.reduce((sum, l) => sum + (l.pages_read ?? 0), 0)}
            </div>
            <div className="text-[10px] text-ink-muted">hal hari ini</div>
          </div>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="bg-forest/10 border border-forest/20 rounded-xl px-4 py-3 text-center text-forest font-medium text-sm flex items-center justify-center gap-2">
          <Sparkles size={14} strokeWidth={2} />
          {successMsg}
        </div>
      )}

      {/* Log form */}
      {shelf.length === 0 ? (
        <div className="text-center py-8">
          <div className="flex justify-center text-ink-muted mb-3"><BookOpen size={40} strokeWidth={1.25} /></div>
          <p className="text-ink-secondary text-sm mb-3">Belum ada buku yang sedang dibaca</p>
          <Link href="/rak/tambah" className="text-amber text-sm font-medium hover:text-amber-hover">
            + Tambah buku dulu
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="font-semibold text-ink mb-3">Catat sesi baca</h2>

          {/* Book selector */}
          <div className="space-y-2 mb-4">
            {shelf.map((item) => {
              const book = item.books;
              if (!book) return null;
              const isSelected = selected?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(isSelected ? null : item)}
                  className={`w-full flex gap-3 items-center p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-amber bg-amber-soft"
                      : "border-border bg-surface hover:border-amber/50"
                  }`}
                >
                  <div className="w-10 h-14 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-muted"><BookText size={20} strokeWidth={1.5} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink truncate">{book.title}</p>
                    {book.author && <p className="text-xs text-ink-muted truncate">{book.author}</p>}
                    <p className="text-xs text-ink-muted mt-0.5">
                      Halaman {item.current_page ?? 0}
                      {book.total_pages ? ` / ${book.total_pages}` : ""}
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

          {/* Log form */}
          {selected && (
            <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-amber/30 p-4 space-y-3">
              <p className="text-sm font-medium text-ink">
                Berapa halaman yang kamu baca?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ink-muted mb-1 block">Jumlah halaman *</label>
                  <input
                    type="number"
                    min={1}
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="cth: 25"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs text-ink-muted mb-1 block">Durasi (menit)</label>
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="cth: 30"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Catatan (opsional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Apa yang menarik dari bacaan hari ini?"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-parchment text-ink text-sm focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                />
              </div>
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading || !pages}
                className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40"
              >
                {loading ? "Menyimpan…" : "Catat Bacaan"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Today's logs */}
      {todayLogs.length > 0 && (
        <div>
          <h2 className="font-semibold text-ink mb-3">Log hari ini</h2>
          <div className="space-y-2">
            {todayLogs.map((log) => {
              const book = log.shelf_items?.books;
              return (
                <div key={log.id} className="flex gap-3 items-center bg-surface rounded-xl border border-border p-3">
                  <div className="w-8 h-11 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                    {book?.cover_url ? (
                      <img src={book.cover_url} alt={book.title ?? ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-muted"><BookText size={16} strokeWidth={1.5} /></div>
                    )}
                  </div>
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
        </div>
      )}
    </div>
  );
}
