"use client";

import { Share2 } from "lucide-react";

export default function ShareButton({ url, title, text, className }: { url: string; title: string; text: string; className?: string }) {
  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${className ?? "text-ink-muted hover:text-amber"}`}
      aria-label="Bagikan"
    >
      <Share2 size={14} />
      <span>Bagikan</span>
    </button>
  );
}
