"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({
  slug,
  initialLiked,
  initialCount,
}: {
  slug: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (saving) return;
    setSaving(true);
    setLiked((p) => !p);
    setCount((c) => (liked ? c - 1 : c + 1));
    try {
      const res = await fetch(`/api/review/${slug}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.likes_count);
    } catch {
      setLiked((p) => !p);
      setCount((c) => (liked ? c + 1 : c - 1));
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
        liked ? "text-red-500" : "text-ink-muted hover:text-red-400"
      }`}
    >
      <Heart size={16} strokeWidth={liked ? 2.5 : 1.75} fill={liked ? "currentColor" : "none"} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
