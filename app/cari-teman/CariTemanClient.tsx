"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import AvatarIcon from "@/components/AvatarIcon";
import { Search, UserPlus, UserCheck, Loader2 } from "lucide-react";

type UserResult = {
  id: string;
  name: string;
  username: string | null;
  avatar: string;
  member_type: string;
  is_following: boolean;
};

export default function CariTemanClient({ viewerMemberId }: { viewerMemberId: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (query: string) => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/cari-pengguna?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Gagal mencari");
      const data = await res.json();
      setResults(data.results);
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, []);

  const handleInput = useCallback((val: string) => {
    setQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  }, [search]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleFollow = useCallback(async (targetId: string) => {
    setFollowLoading((prev) => ({ ...prev, [targetId]: true }));
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following_id: targetId }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setResults((prev) =>
        prev.map((r) => (r.id === targetId ? { ...r, is_following: data.is_following ?? !r.is_following } : r))
      );
    } catch {}
    finally { setFollowLoading((prev) => ({ ...prev, [targetId]: false })) }
  }, []);

  const memberTypeLabel: Record<string, string> = {
    ayah: "Ayah", ibu: "Ibu", anak: "Anak", dewasa: "Pembaca",
  };

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" strokeWidth={1.75} />
        <input
          type="text"
          value={q}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Cari nama atau username…"
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-surface placeholder:text-ink-muted text-ink focus:outline-none focus:border-amber transition-colors"
          autoFocus
        />
        {loading && (
          <Loader2 size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted animate-spin" strokeWidth={2} />
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3"
            >
              <Link href={`/u/${user.username ?? user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-soft flex items-center justify-center text-amber flex-shrink-0">
                  <AvatarIcon avatar={user.avatar} size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{user.name}</p>
                  <p className="text-xs text-ink-muted truncate">
                    @{user.username ?? "—"}
                    <span className="ml-1.5 text-[10px] bg-surface border border-border rounded-full px-1.5 py-0.5">
                      {memberTypeLabel[user.member_type] ?? "Pembaca"}
                    </span>
                  </p>
                </div>
              </Link>
              <button
                onClick={() => handleFollow(user.id)}
                disabled={followLoading[user.id]}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  user.is_following
                    ? "bg-surface text-ink border border-border hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    : "bg-amber text-white hover:bg-amber/90"
                }`}
              >
                {followLoading[user.id] ? (
                  <Loader2 size={12} className="animate-spin" strokeWidth={2.5} />
                ) : user.is_following ? (
                  <><UserCheck size={12} strokeWidth={2.5} /> Mengikuti</>
                ) : (
                  <><UserPlus size={12} strokeWidth={2.5} /> Ikuti</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty — query but no results */}
      {q.length >= 2 && !loading && results.length === 0 && (
        <div className="text-center py-12">
          <Search size={32} className="mx-auto text-ink-muted mb-3" strokeWidth={1.5} />
          <p className="text-sm text-ink-secondary">Tidak ditemukan</p>
          <p className="text-xs text-ink-muted mt-1">Coba dengan nama atau username lain</p>
        </div>
      )}

      {/* Hint — no query yet */}
      {q.length < 2 && (
        <div className="text-center py-12">
          <UserPlus size={32} className="mx-auto text-ink-muted mb-3" strokeWidth={1.5} />
          <p className="text-sm text-ink-secondary">Ketik nama atau username untuk mencari</p>
        </div>
      )}
    </div>
  );
}
