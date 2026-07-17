"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FeedItem } from "@/lib/feed";
import type { FeedComment } from "@/app/api/feed/[id]/comments/route";
import { BookOpen, Star, CheckCircle, RefreshCw, ChevronLeft, Share2, BookmarkPlus, ArrowRightLeft, UserPlus, Trash2, Heart, MessageCircle, Send, Award } from "lucide-react";
import BookCover from "@/components/BookCover";
import AvatarIcon from "@/components/AvatarIcon";
import ConfirmDialog from "@/components/ConfirmDialog";
import ImageLightbox from "@/components/ImageLightbox";
import BadgePing from "@/components/BadgePing";

const ACTIVITY_LABELS: Record<FeedItem["type"], { verb: string; color: string; icon: React.ReactNode }> = {
  log:          { verb: "lagi baca", color: "text-amber", icon: <BookOpen size={14} /> },
  review:       { verb: "nulis review", color: "text-blue-500", icon: <Star size={14} /> },
  finish:       { verb: "selesai baca", color: "text-lime", icon: <CheckCircle size={14} /> },
  shelf_add:    { verb: "mulai baca", color: "text-amber", icon: <BookmarkPlus size={14} /> },
  shelf_status: { verb: "ubah status", color: "text-purple-500", icon: <ArrowRightLeft size={14} /> },
  follow:       { verb: "ikuti", color: "text-sky-500", icon: <UserPlus size={14} /> },
  challenge_earn: { verb: "dapat lencana", color: "text-orange-500", icon: <Award size={14} /> },
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

/* ── Like state — supports both batched and per-card fetch ── */
type LikeState = { count: number; liked: boolean };
function useLikeState(
  feedId: string,
  currentMemberId: string | undefined,
  initial?: LikeState | null
) {
  const [count, setCount] = useState(initial?.count ?? 0);
  const [liked, setLiked] = useState(initial?.liked ?? false);

  useEffect(() => {
    if (initial) return; // data already prefetched
    fetch(`/api/feed/${feedId}/like`).then((r) => r.ok && r.json()).then((d) => {
      if (d) { setCount(d.count); setLiked(d.liked_by_me); }
    });
  }, [feedId, initial]);

  async function toggle() {
    if (!currentMemberId) { window.location.href = "/masuk"; return; }
    if (liked) {
      setLiked(false); setCount((c) => Math.max(c - 1, 0));
      await fetch(`/api/feed/${feedId}/like`, { method: "DELETE" });
    } else {
      setLiked(true); setCount((c) => c + 1);
      await fetch(`/api/feed/${feedId}/like`, { method: "POST" });
    }
  }

  return { count, liked, toggle };
}

function useCommentsState(feedId: string) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/feed/${feedId}/comments`);
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }, [feedId]);

  const toggleOpen = useCallback(() => {
    if (!open && comments.length === 0) fetchComments();
    setOpen((v) => !v);
  }, [open, comments.length, fetchComments]);

  async function addComment(content: string) {
    const res = await fetch(`/api/feed/${feedId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) return false;
    await fetchComments();
    return true;
  }

  async function deleteComment(commentId: string) {
    if (!confirm("Hapus komentar ini?")) return false;
    const res = await fetch(`/api/feed/${feedId}/comments?comment_id=${commentId}`, {
      method: "DELETE",
    });
    if (!res.ok) return false;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    return true;
  }

  return { comments, open, loading, toggleOpen, addComment, deleteComment, fetchComments };
}

function FeedCard({ item, currentMemberId, onDelete, initialLike }: { item: FeedItem; currentMemberId?: string; onDelete?: (id: string) => void; initialLike?: LikeState | null }) {
  const [deleting, setDeleting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);
  const { count: likeCount, liked, toggle: toggleLike } = useLikeState(item.id, currentMemberId, initialLike);
  const { comments, open: commentsOpen, toggleOpen: toggleComments, addComment, deleteComment } = useCommentsState(item.id);
  const label = ACTIVITY_LABELS[item.type];

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    if (!currentMemberId) { window.location.href = "/masuk"; return; }
    const ok = await addComment(text);
    if (ok) setCommentText("");
  }

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-amber/30 transition-colors">
      {/* Header */}
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

      {/* Main content — all types link to feed detail page */}
      <Link href={`/feed/${item.id}`} className="block px-4 pb-4">
        {(item.type === "follow") ? (
          <div className="flex items-center gap-3 bg-parchment rounded-xl p-3">
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
          </div>
        ) : (item.type === "challenge_earn") ? (
          <div className="flex items-center gap-3 bg-gradient-to-br from-amber-soft to-orange-soft rounded-xl p-3 border border-amber/20">
            <BadgePing icon={item.detail.badge_icon} color={item.detail.badge_color} size={44} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">{item.detail.badge_name}</p>
              <p className="text-xs text-ink-muted">{item.detail.challenge_title}</p>
              {item.detail.period_label && (
                <p className="text-[11px] text-ink-muted/60 mt-0.5">{item.detail.period_label}</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex gap-4">
              {item.book_cover && (
                <div className="flex-shrink-0">
                  <BookCover src={item.book_cover} title={item.book_title ?? ""} className="w-16 h-22 rounded-lg shadow-sm" />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-semibold text-ink leading-snug line-clamp-2">{item.book_title}</p>
                {item.type === "log" && item.detail.pages_read && (
                  <div className="mt-1.5 space-y-1">
                    <p className="text-xs text-ink-muted">
                      <span className="font-semibold text-amber">+{item.detail.pages_read}</span> halaman
                    </p>
                    {(item.detail.from_page != null || item.detail.to_page != null) && (
                      <p className="text-[11px] text-ink-muted/60">
                        Hal {item.detail.from_page ?? "—"} → {item.detail.to_page ?? "—"}
                      </p>
                    )}
                    {item.detail.duration_minutes != null && item.detail.duration_minutes > 0 && (
                      <p className="text-[11px] text-ink-muted/60">{item.detail.duration_minutes} menit</p>
                    )}
                    {item.detail.note && (
                      <p className="text-xs text-ink-secondary italic leading-relaxed line-clamp-2 pt-1 border-t border-border/50">
                        "{item.detail.note.length > 120 ? item.detail.note.slice(0, 120) + "…" : item.detail.note}"
                      </p>
                    )}
                  </div>
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
                  <div className="mt-1.5 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`text-sm ${s <= (item.detail.rating ?? 0) ? "text-amber" : "text-border"}`}>★</span>
                      ))}
                    </div>
                    {item.detail.excerpt && (
                      <p className="text-xs text-ink-muted leading-relaxed line-clamp-3 italic">"{item.detail.excerpt}"</p>
                    )}
                  </div>
                )}
                {item.type === "finish" && (
                  <div className="mt-1.5 space-y-1">
                    <p className="text-xs font-semibold text-lime flex items-center gap-1">
                      <CheckCircle size={12} /> Selesai dibaca
                    </p>
                    {item.book_total_pages && (
                      <p className="text-[11px] text-ink-muted/60">{item.book_total_pages} halaman · 100%</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            {item.detail.images && item.detail.images.length > 0 && (
              <div className="mt-2 mb-1 overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                  {item.detail.images.map((url: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLightboxUrl(url); }}
                      className="flex-shrink-0"
                    >
                      <img src={url} alt="" className="h-24 w-auto rounded-lg object-cover border border-border cursor-pointer" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Link>

      {/* Action bar */}
      <div className="flex items-center px-4 pb-2 min-h-[44px]">
        <button
          onClick={(e) => { e.preventDefault(); toggleLike(); }}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors min-h-[44px] px-2 ${
            liked ? "text-error" : "text-ink-muted hover:text-error"
          }`}
        >
          <Heart size={14} fill={liked ? "currentColor" : "none"} />
          <span>{likeCount > 0 ? likeCount : ""}</span>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); toggleComments(); }}
          className={`flex items-center gap-1.5 text-xs font-medium ml-2 transition-colors min-h-[44px] px-2 ${
            commentsOpen ? "text-amber" : "text-ink-muted hover:text-amber"
          }`}
        >
          <MessageCircle size={14} fill={commentsOpen ? "currentColor" : "none"} />
          <span>{comments.length > 0 ? comments.length : ""}</span>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); shareItem(item); }}
          className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-amber transition-colors ml-2 min-h-[44px] px-2"
        >
          <Share2 size={13} /> Bagikan
        </button>
        {currentMemberId && item.member_id === currentMemberId && (
          <button
            onClick={(e) => { e.preventDefault(); setDeleting(true); }}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-error transition-colors ml-auto min-h-[44px] px-2"
          >
            <Trash2 size={13} /> Hapus
          </button>
        )}
      </div>

      {/* Comment section */}
      {commentsOpen && (
        <div className="border-t border-border bg-parchment/40 px-4 py-3 space-y-3">
          {comments.length === 0 ? (
            <p className="text-xs text-ink-muted/60 text-center">Belum ada komentar</p>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2 group">
                  <Link href={`/u/${c.member_username}`} className="flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center text-amber overflow-hidden">
                      {c.member_avatar ? (
                        <AvatarIcon avatar={c.member_avatar} size={10} />
                      ) : (
                        <span className="text-[9px] font-bold">{c.member_name?.charAt(0) ?? "?"}</span>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <Link href={`/u/${c.member_username}`} className="text-xs font-semibold text-ink hover:text-amber truncate">
                        {c.member_name ?? "?"}
                      </Link>
                      <span className="text-[10px] text-ink-muted/50">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-xs text-ink-secondary mt-0.5">{c.content}</p>
                  </div>
                  {currentMemberId && c.member_id === currentMemberId && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-ink-muted/40 hover:text-error transition-all mt-1"
                      aria-label="Hapus komentar"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleAddComment} className="flex items-center gap-2">
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Tulis komentar..."
              className="flex-1 bg-surface rounded-xl border border-border px-3 py-2 text-xs text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-amber/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex-shrink-0 min-h-[44px] min-w-[44px] rounded-full bg-amber text-white flex items-center justify-center disabled:opacity-40 hover:bg-amber-dark transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {deleting && (
        <ConfirmDialog
          open={deleting}
          title="Hapus aktivitas"
          message={`Aktivitas "${item.book_title || item.detail.following_name || "ini"}" akan dihapus dari timeline.`}
          confirmLabel="Hapus"
          cancelLabel="Batal"
          destructive
          onConfirm={() => {
            fetch(`/api/feed/${item.id}`, { method: "DELETE" }).then(() => {
              onDelete?.(item.id);
              setDeleting(false);
            });
          }}
          onCancel={() => setDeleting(false)}
        />
      )}

      {lightboxUrl && <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </div>
  );
}

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
    case "challenge_earn": {
      const badge = item.detail.badge_name;
      const challenge = item.detail.challenge_title;
      return `${badge} — ${challenge}! Selesaikan tantangan bacamu juga di mulaibaca 📚 mulaibaca.id/komunitas`;
    }
    default:
      return base;
  }
}

async function shareItem(item: FeedItem) {
  const url = `https://www.mulaibaca.id/feed/${item.id}`;
  const text = shareText(item);
  if (navigator.share) {
    try {
      await navigator.share({ title: "mulaibaca", text, url });
    } catch {}
    return;
  }
  await navigator.clipboard.writeText(url);
}

function FeedList({ items, currentMemberId, onDelete, likesMap }: { items: FeedItem[]; currentMemberId?: string; onDelete?: (id: string) => void; likesMap?: Record<string, LikeState> }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} currentMemberId={currentMemberId} onDelete={onDelete} initialLike={likesMap?.[item.id]} />
      ))}
    </div>
  );
}

export default function FeedClient({ initial, compact, currentMemberId }: { initial: FeedItem[]; compact?: boolean; currentMemberId?: string }) {
  const [items, setItems] = useState<FeedItem[]>(initial);
  const [loading, setLoading] = useState(false);
  const [likesMap, setLikesMap] = useState<Record<string, LikeState> | null>(null);
  const [fetchedIdStr, setFetchedIdStr] = useState("");

  const idStr = items.map((i) => i.id).join(",");
  useEffect(() => {
    if (!idStr || idStr === fetchedIdStr) return;
    setFetchedIdStr(idStr);
    fetch(`/api/feed/likes?ids=${idStr}`)
      .then((r) => r.ok && r.json())
      .then((data) => { if (data) setLikesMap(data); })
      .catch(() => {});
  }, [idStr, fetchedIdStr]);

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/feed");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
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
          <FeedList items={display} currentMemberId={currentMemberId} onDelete={handleDelete} likesMap={likesMap ?? undefined} />
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
          <FeedList items={items} currentMemberId={currentMemberId} onDelete={handleDelete} likesMap={likesMap ?? undefined} />
        )}
      </main>
    </div>
  );
}
