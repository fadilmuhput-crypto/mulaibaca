"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Check, Flame, Target, AlertTriangle, X, ImagePlus } from "lucide-react";
import BookCover from "@/components/BookCover";
import { trackEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase";

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
  images: string[] | null;
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
  const [fromPage, setFromPage] = useState(
    shelf.length === 1 ? String(shelf[0].current_page ?? 0) : ""
  );
  const [toPage, setToPage] = useState("");
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [todayLogs, setTodayLogs] = useState(initialLogs);
  const [streak, setStreak] = useState(initialStreak);
  const [celebrated, setCelebrated] = useState(false);
  const [lastPages, setLastPages] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const weekDays = buildWeekDays(today);
  const todayPages = todayLogs.reduce((s, l) => s + l.pages_read, 0);
  const dailyGoal = weeklyPagesGoal > 0 ? Math.ceil(weeklyPagesGoal / 7) : 0;
  const dailyPct = dailyGoal > 0 ? Math.min((todayPages / dailyGoal) * 100, 100) : 0;
  const dailyMet = dailyGoal > 0 && todayPages >= dailyGoal;
  const streakAtRisk = streak.current_streak > 0 && todayLogs.length === 0;

  const fromNum = parseInt(fromPage) || 0;
  const toNum = parseInt(toPage) || 0;
  const pagesRead = toNum > fromNum ? toNum - fromNum : 0;
  const isValid = selected && toNum > fromNum;

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length || !selected) return;
    setUploading(true);
    const supabase = createClient();
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const filePath = `notes/${selected.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage
        .from("note-images")
        .upload(filePath, file, { cacheControl: "3600", upsert: false });
      if (error) { console.error("Upload error:", error); continue; }
      const { data: { publicUrl } } = supabase.storage
        .from("note-images")
        .getPublicUrl(data.path);
      newUrls.push(publicUrl);
    }
    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
    e.target.value = "";
  }

  function selectBook(item: ShelfItem) {
    setSelected(item);
    setFromPage(String(item.current_page ?? 0));
    setToPage("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    if (pagesRead < 1) { setError("Halaman akhir harus lebih besar dari halaman awal"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shelfItemId: selected!.id,
          pagesRead,
          endPage: toNum,
          durationMinutes: duration ? parseInt(duration) : null,
          note: note.trim() || null,
          images: images.length > 0 ? images : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.streak) {
        setStreak(data.streak);
        if (data.is_first_log) trackEvent("first_log", { method: "regular" });
        if (data.streak.current_streak === 2) trackEvent("streak_started", { streak: 2 });
        if ([7, 14, 21, 30, 60, 100].includes(data.streak.current_streak)) {
          trackEvent("streak_milestone", { streak: data.streak.current_streak });
        }
      }
      setLastPages(pagesRead);
      setCelebrated(true);
      setFromPage(String(toNum));
      setToPage("");
      setDuration("");
      setNote("");
      setImages([]);
      if (shelf.length > 1) setSelected(null);
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
      <section className="rounded-2xl p-5 bg-ink brutal-border brutal-shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber flex items-center justify-center brutal-shadow-xs">
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
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                  hasRead
                    ? isToday ? "bg-amber" : "bg-white/20"
                    : isToday ? "bg-white/10 border border-dashed border-white/30" : "bg-white/5"
                }`}>
                  {hasRead ? (
                    <Check size={14} strokeWidth={3} className={isToday ? "text-white" : "text-white/60"} />
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
        <div className="rounded-2xl p-4 text-center bg-forest brutal-border brutal-shadow-sm">
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
          className="flex items-center gap-3 bg-surface rounded-2xl brutal-border brutal-shadow-xs px-4 py-3"
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
          <h2 className="text-h3">Catat sesi baca</h2>

          {/* ── BOOK SELECTOR ── */}
          {shelf.length > 1 && (
            selected ? (
              /* Compact selected-book strip */
              <div className="flex gap-3 items-center p-3 bg-amber-soft rounded-xl border-[1.5px] border-amber">
                <BookCover
                  src={selected.books?.cover_url ?? null}
                  title={selected.books?.title ?? ""}
                  className="w-10 h-14 rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink truncate">{selected.books?.title}</p>
                  {selected.books?.author && (
                    <p className="text-xs text-ink-muted truncate">{selected.books.author}</p>
                  )}
                  <p className="text-xs text-ink-muted mt-0.5">
                    Hal {selected.current_page ?? 0}
                    {selected.books?.total_pages ? ` / ${selected.books.total_pages}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setFromPage(""); setToPage(""); }}
                  className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors min-h-[36px] px-2 flex-shrink-0"
                >
                  <X size={13} strokeWidth={2} />
                  Ganti
                </button>
              </div>
            ) : (
              /* Full book list */
              <div className="space-y-2">
                {shelf.map((item) => {
                  const book = item.books;
                  if (!book) return null;
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectBook(item)}
                      className="w-full flex gap-3 items-center p-3 rounded-xl border-[1.5px] border-border bg-surface hover:border-amber/50 transition-all text-left"
                    >
                      <BookCover src={book.cover_url} title={book.title} className="w-10 h-14 rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-ink truncate">{book.title}</p>
                        {book.author && <p className="text-xs text-ink-muted truncate">{book.author}</p>}
                        <p className="text-xs text-ink-muted mt-0.5">
                          Hal {item.current_page ?? 0}{book.total_pages ? ` / ${book.total_pages}` : ""}
                        </p>
                      </div>
                      <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )
          )}

          {/* Single book — show context card */}
          {shelf.length === 1 && shelf[0].books && (
            <div className="flex gap-3 items-center bg-surface rounded-xl brutal-border p-3">
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

          {/* Input form — shown when a book is selected (or single book) */}
          {selected && (
            <form onSubmit={handleSubmit} className="bg-surface rounded-2xl brutal-border brutal-shadow-xs p-4 space-y-4">

              {/* Page range input */}
              <div>
                <label className="input-label mb-3 block">
                  Sampai halaman berapa? <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-3">
                  {/* From page */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-ink-muted mb-1 text-center">Dari hal</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={fromPage}
                      onChange={(e) => setFromPage(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full text-center text-xl font-display font-black text-ink-muted bg-parchment brutal-border rounded-xl py-3 focus:outline-none focus:border-ink"
                    />
                  </div>

                  {/* Pages read badge */}
                  <div className="flex flex-col items-center flex-shrink-0 px-1">
                    <div className={`text-lg font-display font-black transition-colors ${pagesRead > 0 ? "text-amber" : "text-border"}`}>
                      +{pagesRead}
                    </div>
                    <div className="text-[9px] text-ink-muted">hal</div>
                  </div>

                  {/* To page */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-ink-muted mb-1 text-center">Sampai hal</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={toPage}
                      onChange={(e) => setToPage(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder={selected.books?.total_pages ? String(selected.books.total_pages) : "—"}
                      className="w-full text-center text-xl font-display font-black text-ink bg-parchment brutal-border rounded-xl py-3 focus:outline-none focus:border-ink focus:shadow-[1px_1px_0_var(--color-ink)]"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Validation hint */}
                {toPage && toNum <= fromNum && (
                  <p className="text-xs text-error mt-2 text-center">Halaman akhir harus lebih besar dari halaman awal</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="input-label mb-1 block">Durasi membaca <span className="text-ink-muted font-normal">(opsional)</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="Berapa menit?"
                  className="input text-sm"
                />
              </div>

              {/* Notes — proper textarea */}
              <div>
                <label className="input-label mb-1 block">Catatan <span className="text-ink-muted font-normal">(opsional)</span></label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Kutipan favorit, poin penting, atau kesan hari ini…"
                  rows={3}
                  className="input text-sm resize-none"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="input-label mb-1 block">
                  Gambar <span className="text-ink-muted font-normal">(opsional)</span>
                </label>
                {images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mb-2">
                    {images.map((url) => (
                      <div key={url} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Hapus gambar"
                        >
                          <X size={10} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-border text-sm cursor-pointer transition-colors ${uploading ? "opacity-50 pointer-events-none" : "hover:border-amber/40 hover:text-amber"}`}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading || !selected}
                    className="sr-only"
                  />
                  <ImagePlus size={16} strokeWidth={1.75} />
                  {uploading ? "Mengupload…" : "Tambah gambar"}
                </label>
              </div>

              {error && <p className="text-error text-xs text-center bg-error-soft rounded-xl px-3 py-2">{error}</p>}

              <button
                type="submit"
                disabled={loading || !isValid}
                className="btn-primary-full-lg"
              >
                {loading ? "Menyimpan…" : `Catat ${pagesRead > 0 ? `+${pagesRead} halaman` : "Bacaan"}`}
              </button>
            </form>
          )}
        </section>
      )}

      {/* ── SEMUA CATATAN LINK ── */}
      <a
        href="/catatan"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl brutal-border text-sm font-semibold text-ink-secondary hover:text-amber hover:border-amber/40 transition-colors"
      >
        <BookOpen size={14} strokeWidth={2} />
        Semua catatan bacaan →
      </a>

      {/* ── TODAY'S LOGS ── */}
      {todayLogs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink">
              Log hari ini
              <span className="ml-2 text-amber font-display font-black text-base">
                +{todayPages} hal
              </span>
            </h2>
          </div>
          <div className="space-y-2">
            {todayLogs.map((log) => {
              const book = log.shelf_items?.books;
              return (
                <div key={log.id} className="flex gap-3 items-start bg-surface rounded-xl brutal-border p-3">
                  <BookCover src={book?.cover_url ?? null} title={book?.title ?? ""} className="w-8 h-11 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{book?.title ?? "Buku"}</p>
                    {log.note && (
                      <p className="text-xs text-ink-secondary mt-1 leading-relaxed">{log.note}</p>
                    )}
                    {(() => {
                      const imgs = log.images ?? [];
                      if (imgs.length === 0) return null;
                      return (
                        <div className="flex gap-1.5 mt-1.5">
                          {imgs.slice(0, 3).map((url, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-border" />
                          ))}
                          {imgs.length > 3 && (
                            <span className="w-10 h-10 rounded-lg bg-parchment border border-border flex items-center justify-center text-[10px] font-semibold text-ink-muted">
                              +{imgs.length - 3}
                            </span>
                          )}
                        </div>
                      );
                    })()}
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
