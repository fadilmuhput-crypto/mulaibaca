"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const PRESETS = [10, 20, 30];

export default function QuickLogButtons({
  shelfItemId,
}: {
  shelfItemId: string;
}) {
  const router = useRouter();
  const [toast, setToast] = useState<{ pages: number; bookDone: boolean } | null>(null);
  const [loading, setLoading] = useState<number | null>(null);

  const handleQuickLog = useCallback(async (pages: number) => {
    setLoading(pages);
    try {
      const res = await fetch("/api/log/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shelfItemId, pagesRead: pages }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setToast({ pages, bookDone: data.bookDone ?? false });
      router.refresh();
      setTimeout(() => setToast(null), 2500);
    } finally {
      setLoading(null);
    }
  }, [shelfItemId, router]);

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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-2 fade-in duration-200 pointer-events-none">
          <div className="bg-forest text-white rounded-xl px-5 py-3 shadow-lg flex items-center gap-2.5">
            <Check size={16} strokeWidth={2.5} className="text-white/80" />
            <span className="text-sm font-semibold whitespace-nowrap">
              {toast.bookDone
                ? `Selesai! +${toast.pages} halaman`
                : `+${toast.pages} halaman`}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
