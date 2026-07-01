"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";

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
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);
    try {
      const res = await fetch(`/api/review/${slug}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.likes_count);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
        liked ? "text-forest" : "text-ink-muted hover:text-forest"
      }`}
    >
      <ThumbsUp size={13} strokeWidth={liked ? 2.5 : 1.75} fill={liked ? "currentColor" : "none"} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
