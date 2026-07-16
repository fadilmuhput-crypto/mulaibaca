"use client";

import { useState } from "react";
import Link from "next/link";
import { BookText, Star, BookCheck, UserPlus, History } from "lucide-react";

type Activity = {
  id: string;
  type: string;
  book_title?: string;
  book_slug?: string;
  book_cover?: string | null;
  detail: Record<string, unknown>;
  timestamp: string;
};

export default function AktivitasTab({
  activities,
}: {
  activities: Activity[];
  memberName: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? activities : activities.slice(0, 20);

  if (activities.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 text-center">
        <History size={32} strokeWidth={1.5} className="text-ink-muted mx-auto mb-3" />
        <p className="text-sm text-ink-secondary">Belum ada aktivitas</p>
        <p className="text-xs text-ink-muted mt-1">Mulai catat log bacaan atau tulis review</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayed.map((a) => (
        <ActivityCard key={a.id} activity={a} />
      ))}
      {activities.length > 20 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-full text-center text-sm font-semibold text-ink-muted hover:text-ink py-3 transition-colors"
        >
          Lihat {activities.length - 20} aktivitas lainnya →
        </button>
      )}
    </div>
  );
}

function ActivityCard({ activity }: { activity: Activity }) {
  const date = new Date(activity.timestamp);
  const timeStr = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  switch (activity.type) {
    case "log":
      const logPages = activity.detail.pages_read as number | undefined;
      return (
        <div className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
            <BookText size={14} strokeWidth={1.75} className="text-forest" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink">
              Membaca <span className="font-semibold">{activity.book_title}</span>
              {logPages ? <> — {logPages} halaman</> : null}
            </p>
            <p className="text-[10px] text-ink-muted mt-0.5">{timeStr}</p>
          </div>
        </div>
      );
    case "review":
      const rating = activity.detail.rating as number | undefined;
      const reviewSlug = activity.detail.review_slug as string | undefined;
      return (
        <div className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center flex-shrink-0">
            <Star size={14} strokeWidth={1.75} className="text-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink">
              Review <span className="font-semibold">{activity.book_title}</span>
              {rating ? <> ⭐{rating}</> : null}
            </p>
            <p className="text-[10px] text-ink-muted mt-0.5">{timeStr}</p>
          </div>
          {reviewSlug ? (
            <Link href={`/review/${reviewSlug}`} className="text-xs font-semibold text-amber hover:text-amber-hover flex-shrink-0">
              Lihat →
            </Link>
          ) : null}
        </div>
      );
    case "finish":
      return (
        <div className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-success-soft flex items-center justify-center flex-shrink-0">
            <BookCheck size={14} strokeWidth={1.75} className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink">
              Selesai membaca <span className="font-semibold">{activity.book_title}</span> 🎉
            </p>
            <p className="text-[10px] text-ink-muted mt-0.5">{timeStr}</p>
          </div>
        </div>
      );
    case "shelf_add":
      return (
        <div className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center flex-shrink-0 border border-border">
            <BookText size={14} strokeWidth={1.75} className="text-ink-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink">
              Menambahkan <span className="font-semibold">{activity.book_title}</span> ke rak
            </p>
            <p className="text-[10px] text-ink-muted mt-0.5">{timeStr}</p>
          </div>
        </div>
      );
    case "shelf_status":
      return (
        <div className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center flex-shrink-0 border border-border">
            <BookText size={14} strokeWidth={1.75} className="text-ink-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink">
              Memindahkan <span className="font-semibold">{activity.book_title}</span> ke rak baru
            </p>
            <p className="text-[10px] text-ink-muted mt-0.5">{timeStr}</p>
          </div>
        </div>
      );
    case "follow":
      return (
        <div className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center flex-shrink-0">
            <UserPlus size={14} strokeWidth={1.75} className="text-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-ink">
              Mulai mengikuti <span className="font-semibold">{activity.detail.following_name as string}</span>
            </p>
            <p className="text-[10px] text-ink-muted mt-0.5">{timeStr}</p>
          </div>
        </div>
      );
    default:
      return null;
  }
}
