"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, BookOpen, Star, CheckCircle, Share2, Heart, MessageCircle, Send, Trash2, Award, BookmarkPlus, ArrowRightLeft, UserPlus, Sparkles } from "lucide-react";
import type { FeedItem } from "@/lib/feed";
import type { FeedComment } from "@/app/api/feed/[id]/comments/route";
import BookCover from "@/components/BookCover";
import AvatarIcon from "@/components/AvatarIcon";
import ConfirmDialog from "@/components/ConfirmDialog";
import ImageLightbox from "@/components/ImageLightbox";
import BadgePing from "@/components/BadgePing";

type LikeState = { count: number; liked: boolean };

function useLikeState(feedId: string, initial?: LikeState | null) {
  const [count, setCount] = useState(initial?.count ?? 0);
  const [liked, setLiked] = useState(initial?.liked ?? false);

  useEffect(() => {
    if (initial) return;
    fetch(`/api/feed/${feedId}/like`).then((r) => r.ok && r.json()).then((d) => {
      if (d) { setCount(d.count); setLiked(d.liked_by_me); }
    });
  }, [feedId, initial]);

  async function toggle() {
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
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/feed/${feedId}/comments`);
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }, [feedId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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
    const res = await fetch(`/api/feed/${feedId}/comments?comment_id=${commentId}`, {
      method: "DELETE",
    });
    if (!res.ok) return false;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    return true;
  }

  return { comments, loading, addComment, deleteComment };
}

const ACTIVITY_LABELS: Record<FeedItem["type"], { verb: string; color: string }> = {
  log:          { verb: "lagi baca", color: "text-amber" },
  review:       { verb: "nulis review", color: "text-blue-500" },
  finish:       { verb: "selesai baca", color: "text-lime" },
  shelf_add:    { verb: "mulai baca", color: "text-amber" },
  shelf_status: { verb: "ubah status", color: "text-purple-500" },
  follow:       { verb: "ikuti", color: "text-sky-500" },
  challenge_earn: { verb: "dapat lencana", color: "text-orange-500" },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function FeedDetail({ item, currentMemberId }: { item: FeedItem; currentMemberId: string }) {
  const [deleting, setDeleting] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);
  const { count: likeCount, liked, toggle: toggleLike } = useLikeState(item.id);
  const { comments, loading: commentsLoading, addComment, deleteComment } = useCommentsState(item.id);
  const label = ACTIVITY_LABELS[item.type];

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    const ok = await addComment(text);
    if (ok) setCommentText("");
  }

  function shareTextFallback(): string {
    const base = "mulaibaca — baca, catat, review, semua di satu tempat\n\nmulaibaca.id";
    switch (item.type) {
      case "log":
        return `Lagi baca "${item.book_title}" — +${item.detail.pages_read} halaman${item.detail.duration_minutes ? ` dalam ${item.detail.duration_minutes} menit` : ""}! Catat progres bacamu juga di mulaibaca 📚\nmulaibaca.id`;
      case "review":
        return `Review "${item.book_title}" ${item.detail.rating ? "⭐".repeat(item.detail.rating) : ""} — "${item.detail.excerpt?.slice(0, 100)}"\n\nBaca review lengkapnya di mulaibaca 📚\nmulaibaca.id/review/${item.detail.review_slug}`;
      case "finish":
        return `Selesai baca "${item.book_title}"! 🎉 Pantau progres dan temukan buku baru di mulaibaca 📚\nmulaibaca.id`;
      case "shelf_add":
        return `Mulai baca "${item.book_title}" 📖 Catat perjalanan bacamu biar makin semangat di mulaibaca 📚\nmulaibaca.id`;
      case "shelf_status":
        return `Update status bacaan "${item.book_title}" → ${item.detail.to_status} di mulaibaca. Atur rak dan catat progres bacaanmu! 📚\nmulaibaca.id`;
      case "follow":
        return `Ikutin ${item.detail.following_name} di mulaibaca — lihat aktivitas dan rekomendasi buku dari teman! 📚\nmulaibaca.id/u/${item.detail.following_username}`;
      case "challenge_earn":
        return `${item.detail.badge_name} — ${item.detail.challenge_title}! Selesaikan tantangan bacamu juga di mulaibaca 📚\nmulaibaca.id/komunitas`;
      default:
        return base;
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "mulaibaca", text: shareTextFallback() });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(shareTextFallback());
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link
            href="/feed"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-secondary hover:text-ink rounded-xl"
            aria-label="Kembali"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </Link>
          <h1 className="text-h3 flex-1">Detail Aktivitas</h1>
          {currentMemberId === item.member_id && (
            <button
              onClick={() => setDeleting(true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-muted hover:text-error rounded-xl transition-colors"
              aria-label="Hapus"
            >
              <Trash2 size={18} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Member Header */}
        <div className="flex items-center gap-3">
          <Link href={`/u/${item.member_username}`} className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center text-amber overflow-hidden">
              {item.member_avatar ? (
                <AvatarIcon avatar={item.member_avatar} size={22} />
              ) : (
                <span className="text-xl font-bold">{item.member_name.charAt(0)}</span>
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/u/${item.member_username}`} className="text-base font-bold text-ink hover:text-amber transition-colors truncate">
                {item.member_name}
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-semibold ${label.color}`}>{label.verb}</span>
              <span className="text-xs text-ink-muted/50">·</span>
              <span className="text-xs text-ink-muted/60">{timeAgo(item.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Type-specific content */}
        {item.type === "log" && (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="flex gap-4 p-4">
              {item.book_cover && (
                <div className="flex-shrink-0">
                  <BookCover src={item.book_cover} title={item.book_title ?? ""} className="w-20 h-28 rounded-lg shadow-sm" />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <Link href={`/log?bookId=${item.book_id}`} className="text-base font-bold text-ink hover:text-amber transition-colors line-clamp-2">
                  {item.book_title}
                </Link>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-amber">+{item.detail.pages_read}</span>
                    <span className="text-ink-muted">halaman</span>
                  </div>
                  {(item.detail.from_page != null || item.detail.to_page != null) && (
                    <p className="text-xs text-ink-muted">
                      Halaman {item.detail.from_page ?? "—"} → {item.detail.to_page ?? "—"}
                    </p>
                  )}
                  {item.detail.duration_minutes != null && item.detail.duration_minutes > 0 && (
                    <p className="text-xs text-ink-muted">{item.detail.duration_minutes} menit membaca</p>
                  )}
                </div>
                {item.detail.note && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-wrap">{item.detail.note}</p>
                  </div>
                )}
              </div>
            </div>
            {item.detail.images && item.detail.images.length > 0 && (
              <div className="px-4 pb-4 overflow-x-auto no-scrollbar">
                <div className="flex gap-2">
                  {item.detail.images.map((url: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLightboxUrl(url)}
                      className="flex-shrink-0"
                    >
                      <img src={url} alt="" className="h-32 w-auto rounded-lg object-cover border border-border cursor-pointer" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {item.type === "review" && (
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
            <div className="flex gap-4">
              {item.book_cover && (
                <div className="flex-shrink-0">
                  <BookCover src={item.book_cover} title={item.book_title ?? ""} className="w-16 h-22 rounded-lg shadow-sm" />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <Link href={`/log?bookId=${item.book_id}`} className="text-base font-bold text-ink hover:text-amber transition-colors line-clamp-2">
                  {item.book_title}
                </Link>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-lg ${s <= (item.detail.rating ?? 0) ? "text-amber" : "text-border"}`}>★</span>
                  ))}
                </div>
              </div>
            </div>
            {item.detail.excerpt && (
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-ink-secondary leading-relaxed italic">&ldquo;{item.detail.excerpt}&rdquo;</p>
              </div>
            )}
            {item.detail.review_slug && (
              <Link
                href={`/review/${item.detail.review_slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber hover:text-amber-dark transition-colors"
              >
                Baca review lengkap →
              </Link>
            )}
          </div>
        )}

        {item.type === "finish" && (
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
            <div className="flex gap-4">
              {item.book_cover && (
                <div className="flex-shrink-0">
                  <BookCover src={item.book_cover} title={item.book_title ?? ""} className="w-20 h-28 rounded-lg shadow-sm" />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-2">
                <p className="text-base font-bold text-ink">{item.book_title}</p>
                <div className="flex items-center gap-1.5 mt-2 text-lime">
                  <CheckCircle size={16} />
                  <span className="text-sm font-semibold">Selesai dibaca</span>
                </div>
                {item.book_total_pages && (
                  <p className="text-xs text-ink-muted mt-1">{item.book_total_pages} halaman · 100%</p>
                )}
              </div>
            </div>
          </div>
        )}

        {item.type === "shelf_add" && (
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
            <div className="flex gap-4">
              {item.book_cover && (
                <div className="flex-shrink-0">
                  <BookCover src={item.book_cover} title={item.book_title ?? ""} className="w-16 h-22 rounded-lg shadow-sm" />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-base font-bold text-ink">{item.book_title}</p>
                <p className="text-xs text-ink-muted mt-2">
                  {item.detail.status === "want" ? "Masuk daftar ingin baca" : "Menambahkan ke rak baca"}
                </p>
              </div>
            </div>
          </div>
        )}

        {item.type === "shelf_status" && (
          <div className="bg-surface rounded-2xl border border-border p-4 space-y-3">
            <div className="flex gap-4">
              {item.book_cover && (
                <div className="flex-shrink-0">
                  <BookCover src={item.book_cover} title={item.book_title ?? ""} className="w-16 h-22 rounded-lg shadow-sm" />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-base font-bold text-ink">{item.book_title}</p>
                <p className="text-xs text-ink-muted mt-2">
                  Status: <span className="font-semibold text-ink">{item.detail.from_status}</span> → <span className="font-semibold text-amber">{item.detail.to_status}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {item.type === "follow" && (
          <div className="bg-surface rounded-2xl border border-border p-4">
            <Link href={`/u/${item.detail.following_username}`} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center text-amber overflow-hidden flex-shrink-0">
                {item.detail.following_avatar ? (
                  <AvatarIcon avatar={item.detail.following_avatar} size={24} />
                ) : (
                  <span className="text-xl font-bold">{item.detail.following_name?.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-ink truncate">{item.detail.following_name}</p>
                {item.detail.following_username && (
                  <p className="text-xs text-ink-muted truncate">@{item.detail.following_username}</p>
                )}
              </div>
            </Link>
          </div>
        )}

        {item.type === "challenge_earn" && (
          <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <BadgePing
                icon={item.detail.badge_icon}
                color={item.detail.badge_color}
                size={72}
              />
              <div>
                <h2 className="font-display font-bold text-xl text-ink">{item.detail.badge_name}</h2>
                <p className="text-sm text-ink-muted mt-1">{item.detail.challenge_title}</p>
                {item.detail.period_label && (
                  <p className="text-xs text-ink-muted/60 mt-1">{item.detail.period_label}</p>
                )}
              </div>
            </div>
            <Link
              href={`/komunitas/tantangan/${item.detail.challenge_id}`}
              className="block w-full text-center py-2.5 bg-amber text-white text-sm font-semibold rounded-xl hover:bg-amber-dark transition-colors"
            >
              Lihat Tantangan
            </Link>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center border-b border-border pb-4">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-1.5 text-sm font-semibold min-h-[44px] px-3 transition-colors ${
              liked ? "text-error" : "text-ink-muted hover:text-error"
            }`}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            {likeCount > 0 && <span>{likeCount}</span>}
            <span className="hidden sm:inline">{liked ? "Suka" : "Suka"}</span>
          </button>
          <button
            onClick={() => commentInputRef.current?.focus()}
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-amber min-h-[44px] px-3 transition-colors"
          >
            <MessageCircle size={16} />
            {comments.length > 0 && <span>{comments.length}</span>}
            <span className="hidden sm:inline">Komentar</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-amber min-h-[44px] px-3 transition-colors ml-auto"
          >
            <Share2 size={15} /> <span className="hidden sm:inline">Bagikan</span>
          </button>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-ink-muted flex items-center gap-2">
            <MessageCircle size={13} />
            Komentar ({comments.length})
          </h3>

          {commentsLoading ? (
            <p className="text-xs text-ink-muted/60 text-center py-4">Memuat komentar…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-ink-muted/60 text-center py-4">Belum ada komentar</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 group">
                  <Link href={`/u/${c.member_username}`} className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center text-amber overflow-hidden">
                      {c.member_avatar ? (
                        <AvatarIcon avatar={c.member_avatar} size={14} />
                      ) : (
                        <span className="text-xs font-bold">{c.member_name?.charAt(0) ?? "?"}</span>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <Link href={`/u/${c.member_username}`} className="text-sm font-semibold text-ink hover:text-amber truncate">
                        {c.member_name ?? "?"}
                      </Link>
                      <span className="text-[10px] text-ink-muted/50">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-ink-secondary mt-0.5 leading-relaxed">{c.content}</p>
                  </div>
                  {currentMemberId === c.member_id && (
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
              className="flex-1 bg-surface rounded-xl border border-border px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:border-amber/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex-shrink-0 min-h-[44px] min-w-[44px] rounded-full bg-amber text-white flex items-center justify-center disabled:opacity-40 hover:bg-amber-dark transition-colors"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </main>

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
              window.location.href = "/feed";
            });
          }}
          onCancel={() => setDeleting(false)}
        />
      )}

      {lightboxUrl && <ImageLightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </div>
  );
}
