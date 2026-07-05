"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, X, Shield, ShieldOff, RefreshCw, Mail, User, Calendar } from "lucide-react";

type MemberItem = {
  id: string;
  name: string;
  email: string | null;
  username: string | null;
  avatar: string;
  member_type: string;
  role: string;
  is_cms_admin: boolean;
  weekly_pages_goal: number;
  birth_date: string | null;
  created_at: string;
  has_account: boolean;
  family_id: string;
  family_name: string | null;
};

const TYPE_FILTERS = [
  { key: "", label: "Semua" },
  { key: "ayah", label: "Ayah" },
  { key: "ibu", label: "Ibu" },
  { key: "anak", label: "Anak" },
  { key: "dewasa", label: "Dewasa" },
];

const MEMBER_TYPE_LABELS: Record<string, string> = {
  ayah: "Ayah", ibu: "Ibu", anak: "Anak", dewasa: "Dewasa",
};

export default function MembersClient() {
  const [items, setItems] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [memberType, setMemberType] = useState("");
  const [role, setRole] = useState("");
  const [hasAccount, setHasAccount] = useState("");
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
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (memberType) params.set("member_type", memberType);
      if (role) params.set("role", role);
      if (hasAccount) params.set("has_account", hasAccount);
      const res = await fetch(`/api/admin/members?${params}`);
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat anggota");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, memberType, role, hasAccount]);

  useEffect(() => { load(); }, [load]);

  async function saveField(id: string, field: string, value: unknown) {
    setSaving(id);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      setItems((prev) => prev.map((m) => m.id === id ? { ...m, [field]: value } : m));
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(null);
    }
  }

  const stats = {
    total: items.length,
    registered: items.filter((m) => m.has_account).length,
    children: items.filter((m) => m.member_type === "anak").length,
    admins: items.filter((m) => m.is_cms_admin).length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-ink">Anggota</h1>
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
          <div className="text-2xl font-black text-forest">{stats.registered}</div>
          <div className="text-xs text-ink-muted">Terdaftar</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <div className="text-2xl font-black text-amber">{stats.children}</div>
          <div className="text-xs text-ink-muted">Anak</div>
        </div>
        <div className="bg-surface border border-border rounded-xl px-4 py-3">
          <div className="text-2xl font-black text-ink-muted">{stats.admins}</div>
          <div className="text-xs text-ink-muted">Admin CMS</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setMemberType(f.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                memberType === f.key ? "bg-ink text-white" : "bg-surface text-ink-secondary hover:bg-border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input text-xs py-1.5 w-auto"
        >
          <option value="">Semua Role</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
        <select
          value={hasAccount}
          onChange={(e) => setHasAccount(e.target.value)}
          className="input text-xs py-1.5 w-auto"
        >
          <option value="">Semua Akun</option>
          <option value="yes">Terdaftar</option>
          <option value="no">Belum daftar</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama, email, atau username…"
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">{error}</div>
      )}

      {loading && (
        <div className="text-center py-12 text-sm text-ink-muted">Memuat anggota…</div>
      )}

      {!loading && items.length === 0 && (
        <div className="text-center py-12 text-sm text-ink-muted">
          {debouncedSearch ? `Tidak ada anggota untuk "${debouncedSearch}"` : "Belum ada anggota."}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((m) => {
            const isSaving = saving === m.id;
            return (
              <div key={m.id} className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-amber/10 flex items-center justify-center text-sm flex-shrink-0">
                  {m.avatar || m.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/members/${m.id}`} className="text-sm font-semibold text-ink truncate hover:text-amber transition-colors">{m.name}</Link>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      m.member_type === "anak" ? "bg-orange-100 text-orange-700" :
                      m.member_type === "ayah" || m.member_type === "ibu" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {MEMBER_TYPE_LABELS[m.member_type] ?? m.member_type}
                    </span>
                    {m.is_cms_admin && (
                      <span className="text-[10px] font-semibold bg-amber/10 text-amber px-1.5 py-0.5 rounded-full">CMS</span>
                    )}
                    {m.role === "admin" && (
                      <span className="text-[10px] font-semibold bg-forest/10 text-forest px-1.5 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-ink-muted">
                    {m.email && <span className="flex items-center gap-1"><Mail size={10} /><span className="truncate max-w-[160px]">{m.email}</span></span>}
                    {m.username && <span>@{m.username}</span>}
                    {m.family_name && <span>🏠 {m.family_name}</span>}
                    {!m.has_account && <span className="text-orange-500 font-medium">Belum daftar</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <select
                    value={m.member_type}
                    onChange={(e) => saveField(m.id, "member_type", e.target.value)}
                    disabled={isSaving}
                    className="input text-[10px] py-1 w-auto"
                  >
                    <option value="ayah">Ayah</option>
                    <option value="ibu">Ibu</option>
                    <option value="anak">Anak</option>
                    <option value="dewasa">Dewasa</option>
                  </select>
                  <button
                    onClick={() => saveField(m.id, "is_cms_admin", !m.is_cms_admin)}
                    disabled={isSaving}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                      m.is_cms_admin ? "text-amber hover:bg-amber/10" : "text-ink-muted hover:bg-border"
                    }`}
                    title={m.is_cms_admin ? "CMS Admin — klik nonaktifkan" : "Jadikan CMS Admin"}
                  >
                    {m.is_cms_admin ? <Shield size={14} strokeWidth={2} /> : <ShieldOff size={14} strokeWidth={2} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
