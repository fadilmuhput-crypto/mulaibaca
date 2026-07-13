"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  targetId: string;
  initialFollowers: number;
  initialIsFollowing: boolean;
  viewerMemberId: string | null;
  hideCount?: boolean;
};

export default function FollowButton({
  targetId,
  initialFollowers,
  initialIsFollowing,
  viewerMemberId,
  hideCount,
}: Props) {
  const router = useRouter();
  const [followers, setFollowers] = useState(initialFollowers);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!viewerMemberId || viewerMemberId === targetId) return;
    fetch(`/api/follow?member_id=${targetId}`)
      .then((r) => r.ok && r.json())
      .then((d) => {
        if (d) { setFollowers(d.followers ?? 0); setIsFollowing(d.is_following ?? false); }
      })
      .catch(() => {});
  }, [viewerMemberId, targetId]);

  if (!viewerMemberId) {
    return (
      <a
        href="/masuk"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-amber text-white rounded-xl hover:bg-amber/90 transition-colors"
      >
        + Ikuti
      </a>
    );
  }

  if (viewerMemberId === targetId) return null;

  const handleToggle = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: targetId }),
      });
      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401) {
          router.push("/masuk");
          return;
        }
        throw new Error(err.error ?? "Gagal mengikuti");
      }
      const data = await res.json();
      setIsFollowing(data.is_following);
      setFollowers((prev) => prev + (data.is_following ? 1 : -1));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [targetId, router]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
          isFollowing
            ? "bg-surface text-ink border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            : "bg-amber text-white hover:bg-amber/90"
        }`}
      >
        {loading ? "..." : isFollowing ? "Mengikuti" : "+ Ikuti"}
      </button>
      {!hideCount && (
        <span className="text-xs text-ink-muted">
          <strong className="text-ink font-semibold">{followers}</strong> pengikut
        </span>
      )}
    </div>
  );
}
