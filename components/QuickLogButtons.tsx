"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { useToast } from "@/components/Toast";

const PRESETS = [10, 20, 30];

export default function QuickLogButtons({
  shelfItemId,
}: {
  shelfItemId: string;
}) {
  const router = useRouter();
  const { show: showToast } = useToast();
  const [toast, setToast] = useState<{ pages: number; bookDone: boolean; completedBadges: { badge_icon: string; badge_name: string }[] } | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  const startDismissTimer = useCallback((ms: number) => {
    clearDismissTimer();
    dismissTimer.current = setTimeout(() => { setToast(null); dismissTimer.current = null; }, ms);
  }, [clearDismissTimer]);

  const handleQuickLog = useCallback(async (pages: number) => {
    setLoading(pages);
    try {
      const res = await fetch("/api/log/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shelfItemId, pagesRead: pages }),
      });
      if (!res.ok) {
        showToast("Gagal mencatat. Coba lagi.", "error");
        return;
      }
      const data = await res.json();
      setToast({ pages, bookDone: data.bookDone ?? false, completedBadges: data.completedChallenges ?? [] });
      router.refresh();
      startDismissTimer(2500);
    } catch {
      showToast("Gagal mencatat. Periksa koneksi internet.", "error");
    } finally {
      setLoading(null);
    }
  }, [shelfItemId, router, startDismissTimer, showToast]);

  return (
    <>
      <div className="flex gap-1.5 mt-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickLog(p); }}
            disabled={loading !== null}
            className="flex-1 min-h-[32px] rounded-lg bg-parchment border border-border text-[11px] font-semibold text-ink-secondary hover:bg-amber-soft hover:text-amber hover:border-amber/40 transition-all disabled:opacity-40 active:scale-[0.97]"
          >
            {loading === p ? "..." : `+${p}`}
          </button>
        ))}
      </div>

      {toast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-2 fade-in duration-200 pointer-events-auto flex flex-col items-center gap-1.5"
          onMouseEnter={clearDismissTimer}
          onMouseLeave={() => startDismissTimer(3000)}
        >
          <div className="bg-forest text-white rounded-xl px-5 py-3 shadow-lg flex items-center gap-2.5">
            <Check size={16} strokeWidth={2.5} className="text-white/80" />
            <span className="text-sm font-semibold whitespace-nowrap">
              {toast.bookDone
                ? `Selesai! +${toast.pages} halaman`
                : `+${toast.pages} halaman`}
            </span>
          </div>
          {toast.bookDone && (
            <Link
              href={`/review/tulis?shelf=${shelfItemId}`}
              onClick={() => { clearDismissTimer(); setToast(null); }}
              className="bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/30 transition-all"
            >
              Tulis Review →
            </Link>
          )}
          {toast.completedBadges.map((b) => (
            <div key={b.badge_name} className="bg-forest/90 text-white rounded-xl px-4 py-2 shadow-lg flex items-center gap-1.5">
              <span>{b.badge_icon}</span>
              <span className="text-xs font-semibold whitespace-nowrap">{b.badge_name}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
