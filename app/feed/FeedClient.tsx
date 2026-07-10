"use client";

import { useState } from "react";
import Link from "next/link";
import type { FeedItem } from "@/app/api/feed/route";
import { BookOpen, Star, CheckCircle, RefreshCw, ChevronLeft, Share2, BookmarkPlus, ArrowRightLeft, UserPlus, Trash2 } from "lucide-react";
import BookCover from "@/components/BookCover";
import AvatarIcon from "@/components/AvatarIcon";
import ConfirmDialog from "@/components/ConfirmDialog";

const ACTIVITY_LABELS: Record<FeedItem["type"], { verb: string; color: string; icon: React.ReactNode }> = {
  log:          { verb: "lagi baca", color: "text-amber", icon: <BookOpen size={14} /> },
  review:       { verb: "nulis review", color: "text-blue-500", icon: <Star size={14} /> },
  finish:       { verb: "selesai baca", color: "text-lime", icon: <CheckCircle size={14} /> },
  shelf_add:    { verb: "mulai baca", color: "text-amber", icon: <BookmarkPlus size={14} /> },
  shelf_status: { verb: "ubah status", color: "text-purple-500", icon: <ArrowRightLeft size={14} /> },
  follow:       { verb: "ikuti", color: "text-sky-500", icon: <UserPlus size={14} /> },
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

function FeedList({ items, currentMemberId, onDelete }: { items: FeedItem[]; currentMemberId?: string; onDelete?: (id: string) => void }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletingItem = items.find((i) => i.id === deletingId);
  function shareText(item: FeedItem): string {
    const base = "mulaibaca — baca, catat, review, semua di satu tempat 📚\n\nmulaibaca.id";
    switch (item.type) {
      case "log": {
        let t = `Lagi baca "${item.book_title}" — `;
        if (item.detail.pages_read) {
          t += `selesai +${item.detail.pages_read} halaman`;
          if (item.detail.duration_minutes) t += ` dalam ${item.detail.duration_minutes} menit`;
          t += "! ";
        }
        t += `Catat progres bacamu juga di mulaibaca 📚`;
        const profile = item.member_username ? `\nmulaibaca.id/u/${item.member_username}` : "";
        return `${t}${profile ? `\n${profile}` : ""}`;
      }
      case "review": {
        const slug = item.detail.review_slug;
        const stars = item.detail.rating ? "⭐".repeat(item.detail.rating) : "";
        let t = `Review "${item.book_title}" ${stars}`;
        if (item.detail.excerpt) t += ` — "${item.detail.excerpt.slice(0, 100)}"`;
        t += `\n\nBaca review lengkapnya di mulaibaca 📚`;
        const link = slug ? `\nmulaibaca.id/review/${slug}` : "";
        return `${t}${link}`;
      }
      case "finish": {
        let t = `Selesai baca "${item.book_title}"! 🎉 Pantau progres dan temukan buku baru di mulaibaca 📚`;
        const profile = item.member_username ? `\nmulaibaca.id/u/${item.member_username}` : "";
        return `${t}${profile}`;
      }
      case "shelf_add": {
        let t = `Mulai baca "${item.book_title}" 📖 Catat perjalanan bacamu biar makin semangat di mulaibaca 📚`;
        const profile = item.member_username ? `\nmulaibaca.id/u/${item.member_username}` : "";
        return `${t}${profile}`;
      }
      case "shelf_status": {
        let t = `Update status bacaan "${item.book_title}" → ${item.detail.to_status} di mulaibaca. Atur rak dan catat progres bacaanmu! 📚`;
        const profile = item.member_username ? `\nmulaibaca.id/u/${item.member_username}` : "";
        return `${t}${profile}`;
      }
      case "follow": {
        const name = item.detail.following_name;
        const username = item.detail.following_username;
        let t = `Ikutin ${name} di mulaibaca — lihat aktivitas dan rekomendasi buku dari teman! 📚`;
        const link = username ? `\nmulaibaca.id/u/${username}` : "";
        return `${t}${link}`;
      }
      default:
        return base;
    }
  }

  async function shareItem(item: FeedItem) {
    if (navigator.share) {
      try {
        await navigator.share({ title: "mulaibaca", text: shareText(item) });
      } catch {}
    }
  }

  return (
    <div className="space-y-4">
      {      items.map((item) => {
        const label = ACTIVITY_LABELS[item.type];
        return (
          <div
            key={item.id}
            className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-amber/30 transition-colors"
          >
            {/* Header: avatar + name + timestamp + action */}
            <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2">
              <Link href={`/u/${item.member_username}`} className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center text-amber overflow-hidden">
                  {item.member_avatar ? (
                    <AvatarIcon avatar={item.member_avatar} size={18} />
                  ) : (
                    <span className="text-base font-bold">{item.member_name.charAt(0)}</span>
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
                <span className={`text-xs font-medium ${label.color} flex items-center gap-1`}>
                  {label.icon} {label.verb}
                </span>
              </div>
            </div>

            {/* Main content */}
            {(item.type === "follow") ? (
              /* Follow activity — show followed person */
              <div className="px-4 pb-4">
                <Link href={`/u/${item.detail.following_username}`} className="flex items-center gap-3 bg-parchment rounded-xl p-3 hover:bg-amber-soft/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center text-amber overflow-hidden flex-shrink-0">
                    {item.detail.following_avatar ? (
                      <AvatarIcon avatar={item.detail.following_avatar} size={18} />
                    ) : (
                      <span className="text-base font-bold">{item.detail.following_name?.charAt(0)}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{item.detail.following_name}</p>
                    {item.detail.following_username && (
                      <p className="text-xs text-ink-muted truncate">@{item.detail.following_username}</p>
                    )}
                  </div>
                </Link>
              </div>
            ) : (
              /* Book-related activity */
              <Link href={(() => {
                if (!item.book_id) return "#";
                switch (item.type) {
                  case "log": return `/log?bookId=${item.book_id}`;
                  case "review": return item.detail.review_slug ? `/review/${item.detail.review_slug}` : "#";
                  case "finish": return "/rak";
                  case "shelf_add": return "/rak";
                  case "shelf_status": return "/rak";
                  default: return "#";
                }
              })()} className="block px-4 pb-4">
                <div className="flex gap-4">
                  {item.book_cover && (
                    <div className="flex-shrink-0">
                      <BookCover src={item.book_cover} title={item.book_title ?? ""} className="w-16 h-22 rounded-lg shadow-sm" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm font-semibold text-ink leading-snug line-clamp-2">{item.book_title}</p>

                    {item.type === "log" && item.detail.pages_read && (
                      <p className="text-xs text-ink-muted mt-1.5">
                        <span className="font-semibold text-amber">+{item.detail.pages_read}</span> halaman
                      </p>
                    )}

                    {item.type === "shelf_add" && (
                      <p className="text-xs font-medium text-ink-muted mt-1.5">
                        {item.detail.status === "want" ? "Masuk daftar ingin baca" : "Menambahkan ke rak baca"}
                      </p>
                    )}

                    {item.type === "shelf_status" && (
                      <p className="text-xs font-medium text-ink-muted mt-1.5">
                        {item.detail.from_status} → {item.detail.to_status}
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
            )}

            <div className="flex items-center gap-1 px-4 pb-3">
              <button
                onClick={(e) => { e.preventDefault(); shareItem(item); }}
                className="flex items-center gap-1 text-[11px] text-ink-muted/50 hover:text-amber transition-colors"
              >
                <Share2 size={12} /> Bagikan
              </button>
              {currentMemberId && item.member_id === currentMemberId && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setDeletingId(item.id);
                  }}
                  className="flex items-center gap-1 text-[11px] text-ink-muted/30 hover:text-error transition-colors ml-auto"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              )}
            </div>
          </div>
        );
      })}

      {deletingItem && (
        <ConfirmDialog
          open={!!deletingId}
          title="Hapus aktivitas"
          message={`Aktivitas "${deletingItem.book_title || deletingItem.detail.following_name || "ini"}" akan dihapus dari timeline.`}
          confirmLabel="Hapus"
          cancelLabel="Batal"
          destructive
          onConfirm={() => {
            fetch(`/api/feed/${deletingItem.id}`, { method: "DELETE" }).then(() => {
              onDelete?.(deletingItem.id);
              setDeletingId(null);
            });
          }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}

export default function FeedClient({ initial, compact, currentMemberId }: { initial: FeedItem[]; compact?: boolean; currentMemberId?: string }) {
  const [items, setItems] = useState<FeedItem[]>(initial);
  const [loading, setLoading] = useState(false);

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

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
          <FeedList items={display} currentMemberId={currentMemberId} onDelete={handleDelete} />
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
          <FeedList items={items} currentMemberId={currentMemberId} onDelete={handleDelete} />
        )}
      </main>
    </div>
  );
}
