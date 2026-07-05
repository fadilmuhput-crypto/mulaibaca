"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Search, X, Eye, EyeOff, Trash2, UserCheck, UserX, RefreshCw } from "lucide-react";
import BookCover from "@/components/BookCover";

type ReviewItem = {
  id: string;
  slug: string;
  rating: number;
  q_about: string | null;
  q_memorable: string | null;
  q_for_whom: string | null;
  is_public: boolean;
  is_anonymous: boolean;
  created_at: string;
  published_at: string;
  member: { id: string; name: string; avatar: string; username: string } | null;
  book: { id: string; title: string; slug: string; cover_url: string | null; author: string } | null;
};

const FILTERS = [
  { key: "", label: "Semua" },
  { key: "public", label: "Publik" },
  { key: "anonymous", label: "Anonim" },
  { key: "private", label: "Privat" },
];

export default function ReviewClient() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibility, setVisibility] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (visibility) params.set("visibility", visibility);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/review?${params}`);
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat review");
    } finally {
      setLoading(false);
    }
  }, [visibility, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  async function toggleField(id: string, field: "is_public" | "is_anonymous", value: boolean) {
    setSaving(id);
    try {
      const res = await fetch("/api/admin/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (!res.ok) throw new Error("Gagal mengubah");
      setItems((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Hapus review ini?")) return;
    setSaving(id);
    try {
      const res = await fetch("/api/admin/review", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  }

  const stats = {
    total: items.length,
    public: items.filter((r) => r.is_public && !r.is_anonymous).length,
    anonymous: items.filter((r) => r.is_anonymous).length,
    private: items.filter((r) => !r.is_public).length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">Review Buku</h1>
        <button
          onClick={load}
          disabled={loading}
          className="btn-ghost-ink text-sm flex items-center gap-1.5"
        >
          <RefreshCw size={14} strokeWidth={2} className={loading ? "animate-spin" : ""} />
          {loading ? "Memuat…" : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <div className="text-2xl font-black text-ink">{stats.total}</div>
          <div className="text-xs text-ink-muted">Total</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <div className="text-2xl font-black text-forest">{stats.public}</div>
          <div className="text-xs text-ink-muted">Publik</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <div className="text-2xl font-black text-amber">{stats.anonymous}</div>
          <div className="text-xs text-ink-muted">Anonim</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <div className="text-2xl font-black text-ink-muted">{stats.private}</div>
          <div className="text-xs text-ink-muted">Privat</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setVisibility(f.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                visibility === f.key
                  ? "bg-ink text-white"
                  : "bg-surface text-ink-secondary hover:bg-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Cari anggota atau judul buku…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 pr-8 w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-sm text-ink-muted">Memuat review…</div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="text-center py-12 text-sm text-ink-muted">
          {debouncedSearch ? `Tidak ada review untuk "${debouncedSearch}"` : "Belum ada review."}
        </div>
      )}

      {/* List */}
      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((r) => {
            const isSaving = saving === r.id;
            return (
              <div key={r.id} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex gap-3">
                  {/* Book cover */}
                  {r.book && (
                    <BookCover src={r.book.cover_url} title={r.book.title} className="w-12 h-16 rounded-lg flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Header: member name + book title */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {r.book && (
                          <p className="text-sm font-semibold text-ink truncate">{r.book.title}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-ink-muted">
                            {r.is_anonymous ? "Anonim" : (r.member?.name ?? "—")}
                          </p>
                          <span className="text-[10px] text-ink-muted/50">·</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={`text-[10px] ${s <= r.rating ? "text-amber" : "text-border"}`}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => toggleField(r.id, "is_public", !r.is_public)}
                          disabled={isSaving}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                            r.is_public
                              ? "text-forest hover:bg-forest/10"
                              : "text-ink-muted hover:bg-border"
                          }`}
                          title={r.is_public ? "Publik — klik untuk privasi" : "Privat — klik untuk publikasi"}
                        >
                          {r.is_public ? <Eye size={14} strokeWidth={2} /> : <EyeOff size={14} strokeWidth={2} />}
                        </button>
                        <button
                          onClick={() => toggleField(r.id, "is_anonymous", !r.is_anonymous)}
                          disabled={isSaving}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                            r.is_anonymous
                              ? "text-amber hover:bg-amber/10"
                              : "text-ink-muted hover:bg-border"
                          }`}
                          title={r.is_anonymous ? "Anonim — klik tampilkan nama" : "Teridentifikasi — klik anonimkan"}
                        >
                          {r.is_anonymous ? <UserX size={14} strokeWidth={2} /> : <UserCheck size={14} strokeWidth={2} />}
                        </button>
                        <button
                          onClick={() => deleteReview(r.id)}
                          disabled={isSaving}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-muted hover:text-error hover:bg-error/10 transition-colors"
                          title="Hapus review"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    {/* Review content */}
                    <div className="mt-2 space-y-1">
                      {r.q_about && (
                        <p className="text-xs text-ink-secondary leading-relaxed">
                          <span className="font-medium text-ink">Tentang: </span>{r.q_about}
                        </p>
                      )}
                      {r.q_memorable && (
                        <p className="text-xs text-ink-secondary leading-relaxed">
                          <span className="font-medium text-ink">Berkesan: </span>{r.q_memorable}
                        </p>
                      )}
                      {r.q_for_whom && (
                        <p className="text-xs text-ink-secondary leading-relaxed">
                          <span className="font-medium text-ink">Cocok untuk: </span>{r.q_for_whom}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <p className="text-[10px] text-ink-muted/50 mt-2">
                      {new Date(r.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
