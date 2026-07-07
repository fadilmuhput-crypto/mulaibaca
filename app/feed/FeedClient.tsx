"use client";

import { useState } from "react";
import Link from "next/link";
import type { FeedItem } from "@/app/api/feed/route";
import { BookOpen, Star, CheckCircle, RefreshCw, ChevronLeft } from "lucide-react";
import BookCover from "@/components/BookCover";

const ACTIVITY_LABELS: Record<FeedItem["type"], { verb: string; color: string }> = {
  log:     { verb: "lagi baca", color: "text-amber" },
  review:  { verb: "nulis review", color: "text-blue-500" },
  finish:  { verb: "selesai baca", color: "text-lime" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}h`;
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function FeedList({ items }: { items: FeedItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const label = ACTIVITY_LABELS[item.type];
        const bookSlug = item.book_slug || `/buku/${item.book_title.toLowerCase().replace(/\s+/g, "-")}`;
        return (
          <div
            key={item.id}
            className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-amber/30 transition-colors"
          >
            {/* Header: avatar + name + timestamp + action */}
            <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
              <Link href={`/u/${item.member_username}`} className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center text-base font-bold text-amber overflow-hidden">
                  {item.member_avatar ? (
                    <img src={item.member_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    item.member_name.charAt(0)
                  )}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/u/${item.member_username}`}
                    className="text-sm font-bold text-ink hover:text-amber transition-colors truncate"
                  >
                    {item.member_name}
                  </Link>
                  <span className="text-xs text-ink-muted/50">·</span>
                  <span className="text-[11px] text-ink-muted/60">{timeAgo(item.timestamp)}</span>
                </div>
                <span className={`text-xs font-medium ${label.color}`}>{label.verb}</span>
              </div>
            </div>

            {/* Main content: book cover + details */}
            <Link href={bookSlug} className="block px-4 pb-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <BookCover src={item.book_cover} title={item.book_title} className="w-16 h-22 rounded-lg shadow-sm" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-semibold text-ink leading-snug line-clamp-2">{item.book_title}</p>

                  {item.type === "log" && item.detail.pages_read && (
                    <p className="text-xs text-ink-muted mt-1.5">
                      <span className="font-semibold text-amber">+{item.detail.pages_read}</span> halaman
                    </p>
                  )}

                  {item.type === "review" && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-xs ${s <= (item.detail.rating ?? 0) ? "text-amber" : "text-border"}`}>★</span>
                        ))}
                      </div>
                      {item.detail.excerpt && (
                        <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">"{item.detail.excerpt}"</p>
                      )}
                    </div>
                  )}

                  {item.type === "finish" && (
                    <p className="text-xs font-semibold text-lime mt-1.5 flex items-center gap-1">
                      <CheckCircle size={12} /> Selesai dibaca
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default function FeedClient({ initial, compact }: { initial: FeedItem[]; compact?: boolean }) {
  const [items, setItems] = useState<FeedItem[]>(initial);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/feed");
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }

  if (compact) {
    const display = items.slice(0, 5);
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Timeline</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="text-xs font-semibold text-amber hover:text-amber-dark transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              {loading ? "Memuat…" : "Muat ulang"}
            </button>
            {items.length > 5 && (
              <Link href="/feed" className="text-xs font-semibold text-ink-muted hover:text-amber transition-colors">
                Lihat semua
              </Link>
            )}
          </div>
        </div>
        {display.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center">
            <p className="text-sm text-ink-muted">
              Belum ada aktivitas. Ikuti pengguna lain untuk melihat aktivitas mereka.
            </p>
          </div>
        ) : (
          <FeedList items={display} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-surface border-b-2 border-ink sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-ink-secondary hover:bg-parchment transition-colors flex-shrink-0"
            aria-label="Kembali"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </Link>
          <h1 className="text-h3 flex-1">Timeline</h1>
          <button
            onClick={refresh}
            disabled={loading}
            className="text-xs font-semibold text-amber hover:text-amber-dark transition-colors disabled:opacity-40"
          >
            {loading ? "Memuat…" : "Refresh"}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <p className="font-semibold text-ink text-sm mb-1">Belum ada aktivitas</p>
            <p className="text-xs text-ink-muted mb-5">
              Ikuti pengguna lain untuk melihat aktivitas membaca mereka di sini.
            </p>
            <Link href="/jelajah" className="btn-primary inline-flex">
              Jelajahi Pengguna
            </Link>
          </div>
        ) : (
          <FeedList items={items} />
        )}
      </main>
    </div>
  );
}
