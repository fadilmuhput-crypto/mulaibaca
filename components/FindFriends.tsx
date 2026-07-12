"use client";

import { useState, useRef, useCallback } from "react";
import { Search, UserPlus, X } from "lucide-react";
import FollowButton from "./FollowButton";
import AvatarIcon from "./AvatarIcon";
import Link from "next/link";

type SearchResult = {
  id: string;
  name: string;
  avatar: string | null;
  username: string | null;
};

export default function FindFriends({ memberId }: { memberId: string }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (query: string) => {
    if (query.length < 2 && query.length > 0) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const res = await fetch(`/api/profil/search?${params}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(value: string) {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(value), 300);
  }

  return (
    <section className="bg-surface rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <UserPlus size={14} strokeWidth={1.75} className="text-ink-muted" />
        <h2 className="text-xs font-black uppercase tracking-widest text-ink-muted">
          Cari Teman
        </h2>
      </div>

      <div className="relative">
        <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          value={q}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Cari nama atau username…"
          className="input input-icon-lr text-sm"
        />
        {q && (
          <button
            type="button"
            onClick={() => { setQ(""); setResults([]); setHasSearched(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink"
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {loading && (
        <p className="text-xs text-ink-muted text-center py-2">Mencari…</p>
      )}

      {!loading && hasSearched && results.length === 0 && (
        <p className="text-xs text-ink-muted text-center py-2">
          {q ? `Tidak ditemukan untuk "${q}"` : "Belum ada anggota lain yang bisa diikuti"}
        </p>
      )}

      {results.length > 0 && (
        <div className="divide-y divide-border/60">
          {results.map((r) => (
            <div key={r.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              {r.username ? (
                <Link href={`/u/${r.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-soft flex items-center justify-center text-amber flex-shrink-0">
                    <AvatarIcon avatar={r.avatar ?? ""} size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-ink truncate">{r.name}</p>
                    {r.username && (
                      <p className="text-[10px] text-ink-muted truncate">@{r.username}</p>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-soft flex items-center justify-center text-amber flex-shrink-0">
                    <AvatarIcon avatar={r.avatar ?? ""} size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-ink truncate">{r.name}</p>
                  </div>
                </div>
              )}
              <FollowButton
                targetId={r.id}
                initialFollowers={0}
                initialIsFollowing={false}
                viewerMemberId={memberId}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
