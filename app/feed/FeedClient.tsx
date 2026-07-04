"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { FeedItem } from "@/app/api/feed/route";
import { BookOpen, Star, CheckCircle, ChevronLeft, Bookmark } from "lucide-react";
import BookCover from "@/components/BookCover";

const ACTIVITY_LABELS: Record<FeedItem["type"], { verb: string; icon: React.ReactNode }> = {
  log: {
    verb: "membaca",
    icon: <BookOpen size={12} strokeWidth={2.5} />,
  },
  review: {
    verb: "menulis review",
    icon: <Star size={12} strokeWidth={2.5} />,
  },
  finish: {
    verb: "selesai membaca",
    icon: <CheckCircle size={12} strokeWidth={2.5} />,
  },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}h lalu`;
  return new Date(date).toLocaleDateString("id-ID");
}

export default function FeedClient({ initial }: { initial: FeedItem[] }) {
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
          <h1 className="text-h3 flex-1">Aktivitas</h1>
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
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold text-ink text-sm mb-1">Belum ada aktivitas</p>
            <p className="text-xs text-ink-muted mb-5">
              Ikuti pengguna lain untuk melihat aktivitas membaca mereka di sini.
            </p>
            <Link href="/jelajah" className="btn-primary inline-flex">
              Jelajahi Pengguna
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const label = ACTIVITY_LABELS[item.type];
              const bookSlug = item.book_slug || `/buku/${item.book_title.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <div
                  key={item.id}
                  className="bg-surface rounded-2xl border border-border p-4 hover:border-amber/30 transition-colors"
                >
                  <div className="flex gap-3">
                    <Link href={`/u/${item.member_username}`} className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-amber/10 flex items-center justify-center text-sm font-bold text-amber">
                        {item.member_avatar || item.member_name.charAt(0)}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink leading-snug">
                        <Link href={`/u/${item.member_username}`} className="font-semibold hover:text-amber transition-colors">
                          {item.member_name}
                        </Link>{" "}
                        <span className="text-ink-muted">{label.verb}</span>
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Link href={bookSlug}>
                          <BookCover src={item.book_cover} title={item.book_title} className="w-10 h-14 rounded-lg" />
                        </Link>
                        <div className="flex-1">
                          <Link href={bookSlug} className="hover:text-amber transition-colors">
                            <p className="text-sm font-medium text-ink leading-snug line-clamp-1">{item.book_title}</p>
                          </Link>
                          {item.type === "log" && item.detail.pages_read && (
                            <p className="text-xs text-ink-muted mt-0.5">+{item.detail.pages_read} halaman</p>
                          )}
                          {item.type === "review" && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <span key={s} className={`text-[10px] ${s <= (item.detail.rating ?? 0) ? "text-amber" : "text-border"}`}>
                                    ★
                                  </span>
                                ))}
                              </div>
                              {item.detail.excerpt && (
                                <p className="text-xs text-ink-muted mt-1 line-clamp-2 leading-relaxed">
                                  "{item.detail.excerpt}"
                                </p>
                              )}
                            </div>
                          )}
                          {item.type === "finish" && (
                            <p className="text-xs text-lime font-semibold mt-0.5">✓ Selesai</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-ink-muted/60">{timeAgo(item.timestamp)}</span>
                            <div className="flex items-center gap-1 text-ink-muted/40">
                              {label.icon}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
