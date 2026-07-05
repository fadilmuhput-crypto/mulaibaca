"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, BookCopy, BookOpen, BookCheck, BookMarked,
  Star, Flame, FileText, CalendarDays, Mail, User, Shield,
  ShieldOff, Save, Check, Edit3, Hash,
} from "lucide-react";

/* ── Types ─────────────────────────────────────── */

export type MemberData = {
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
  birth_year: number | null;
  created_at: string;
  has_account: boolean;
  auth_user_id: string | null;
  family_id: string;
  family_name: string | null;
  family_invite_code: string | null;
  stats: {
    total_books: number;
    reading: number;
    done: number;
    want: number;
    reviews: number;
    total_pages: number;
  };
  streak: { current_streak: number; longest_streak: number; last_log_date: string | null } | null;
  recent_logs: Array<{
    id: string;
    created_at: string;
    pages_read: number;
    shelf_items: { books: { id: string; title: string; slug: string; cover_url: string } };
  }>;
  recent_reviews: Array<{
    id: string;
    rating: number;
    q_about: string;
    is_public: boolean;
    is_anonymous: boolean;
    created_at: string;
    shelf_items: { books: { id: string; title: string; slug: string; cover_url: string } };
  }>;
  shelf_items: Array<{
    id: string;
    status: "reading" | "done" | "want";
    current_page: number | null;
    finished_at: string | null;
    created_at: string;
    books: { id: string; title: string; slug: string; cover_url: string } | null;
  }>;
};

const MEMBER_TYPE_LABELS: Record<string, string> = {
  ayah: "Ayah", ibu: "Ibu", anak: "Anak", dewasa: "Dewasa",
};

const MEMBER_TYPE_OPTIONS = ["ayah", "ibu", "anak", "dewasa"];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j`;
  const days = Math.floor(hrs / 24);
  return `${days}h`;
}

/* ── Component ─────────────────────────────────── */

export default function MembersDetailClient({ data }: { data: MemberData }) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"log" | "rak" | "review">("log");

  const m = data;

  async function saveField(field: string, value: unknown) {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: m.id, [field]: value }),
      });
      if (!res.ok) throw new Error("Gagal");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      setEditingField(null);
    }
  }

  const startEdit = (field: string, current: string) => {
    setEditingField(field);
    setEditValue(current);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/members"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-parchment transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-ink">{m.name}</h1>
          <p className="text-sm text-ink-muted">
            {m.email && <span>{m.email}</span>}
            {m.username && <span className="ml-2">@{m.username}</span>}
            {(m.email || m.username) && <span className="mx-2 text-border">·</span>}
            Bergabung {fmtDate(m.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — info card */}
        <div className="space-y-4">
          {/* Profile card */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-amber/10 flex items-center justify-center text-2xl">
                {m.avatar || m.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{m.name}</span>
                  {m.is_cms_admin && (
                    <span className="text-[10px] font-bold bg-amber/10 text-amber px-1.5 py-0.5 rounded-full">CMS</span>
                  )}
                  {m.role === "admin" && (
                    <span className="text-[10px] font-bold bg-forest/10 text-forest px-1.5 py-0.5 rounded-full">Admin</span>
                  )}
                </div>
                {m.username && <p className="text-xs text-ink-muted">@{m.username}</p>}
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-ink-muted shrink-0" strokeWidth={1.5} />
                <span className="text-ink-muted min-w-[80px]">Tipe</span>
                {editingField === "member_type" ? (
                  <div className="flex gap-1">
                    {MEMBER_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => saveField("member_type", opt)}
                        disabled={saving}
                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                          opt === m.member_type ? "bg-ink text-white" : "bg-parchment text-ink-secondary hover:bg-border"
                        }`}
                      >
                        {MEMBER_TYPE_LABELS[opt]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <span className="text-ink font-medium">{MEMBER_TYPE_LABELS[m.member_type] ?? m.member_type}</span>
                    <button onClick={() => startEdit("member_type", m.member_type)} className="text-ink-muted hover:text-ink ml-1">
                      <Edit3 size={12} strokeWidth={1.5} />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Shield size={14} className="text-ink-muted shrink-0" strokeWidth={1.5} />
                <span className="text-ink-muted min-w-[80px]">Role</span>
                <select
                  value={m.role}
                  onChange={(e) => saveField("role", e.target.value)}
                  disabled={saving}
                  className="input text-xs py-1 w-auto"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {m.is_cms_admin ? (
                  <Shield size={14} className="text-amber shrink-0" strokeWidth={1.5} />
                ) : (
                  <ShieldOff size={14} className="text-ink-muted shrink-0" strokeWidth={1.5} />
                )}
                <span className="text-ink-muted min-w-[80px]">CMS Admin</span>
                <button
                  onClick={() => saveField("is_cms_admin", !m.is_cms_admin)}
                  disabled={saving}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    m.is_cms_admin ? "bg-amber/10 text-amber" : "bg-parchment text-ink-secondary hover:bg-border"
                  }`}
                >
                  {m.is_cms_admin ? "Aktif" : "Nonaktif"}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-ink-muted shrink-0" strokeWidth={1.5} />
                <span className="text-ink-muted min-w-[80px]">Lahir</span>
                <span className="text-ink">{m.birth_date ? fmtDate(m.birth_date) : m.birth_year ? `${m.birth_year}` : "—"}</span>
              </div>

              <div className="flex items-center gap-2">
                <User size={14} className="text-ink-muted shrink-0" strokeWidth={1.5} />
                <span className="text-ink-muted min-w-[80px]">Akun</span>
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${m.has_account ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                  {m.has_account ? "Terdaftar" : "Belum daftar"}
                </span>
              </div>

              {m.family_name && (
                <div className="flex items-center gap-2">
                  <span className="text-xs min-w-[80px]">🏠</span>
                  <span className="text-ink font-medium">{m.family_name}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <FileText size={14} className="text-ink-muted shrink-0" strokeWidth={1.5} />
                <span className="text-ink-muted min-w-[80px]">Target</span>
                <span className="text-ink font-medium">{m.weekly_pages_goal} hlm/minggu</span>
              </div>
            </div>

            {saved && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-forest font-semibold">
                <Check size={12} /> Tersimpan
              </div>
            )}
          </div>

          {/* Stats card */}
          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="text-sm font-bold text-ink mb-3">Statistik</h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted flex items-center gap-1.5">
                  <BookCopy size={14} strokeWidth={1.5} /> Total Buku
                </span>
                <span className="text-lg font-black text-ink">{m.stats.total_books}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted flex items-center gap-1.5">
                  <BookOpen size={14} strokeWidth={1.5} className="text-blue-500" /> Dibaca
                </span>
                <span className="text-lg font-black text-blue-600">{m.stats.reading}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted flex items-center gap-1.5">
                  <BookCheck size={14} strokeWidth={1.5} className="text-forest" /> Selesai
                </span>
                <span className="text-lg font-black text-forest">{m.stats.done}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted flex items-center gap-1.5">
                  <BookMarked size={14} strokeWidth={1.5} className="text-amber" /> Ingin Baca
                </span>
                <span className="text-lg font-black text-amber">{m.stats.want}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted flex items-center gap-1.5">
                  <Star size={14} strokeWidth={1.5} className="text-amber" /> Review
                </span>
                <span className="text-lg font-black text-ink">{m.stats.reviews}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-muted flex items-center gap-1.5">
                  <FileText size={14} strokeWidth={1.5} /> Halaman Dibaca
                </span>
                <span className="text-lg font-black text-ink">{m.stats.total_pages.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-ink-muted flex items-center gap-1.5">
                  <Flame size={14} strokeWidth={1.5} className="text-orange-500" /> Streak
                </span>
                <div className="text-right">
                  <span className="text-lg font-black text-orange-500">{m.streak?.current_streak ?? 0}</span>
                  <span className="text-xs text-ink-muted ml-1">/ {m.streak?.longest_streak ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-parchment rounded-xl p-1">
            {[
              { key: "log" as const, icon: FileText, label: "Log Bacaan" },
              { key: "rak" as const, icon: BookCopy, label: "Rak Buku" },
              { key: "review" as const, icon: Star, label: "Review" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  tab === t.key ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                }`}
              >
                <t.icon size={13} strokeWidth={1.5} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Log Bacaan */}
          {tab === "log" && (
            <div className="space-y-1.5">
              {m.recent_logs.length === 0 ? (
                <p className="text-sm text-ink-muted py-8 text-center">Belum ada log bacaan.</p>
              ) : (
                m.recent_logs.map((log) => {
                  const book = log.shelf_items?.books;
                  return (
                    <div key={log.id} className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                      {book?.cover_url ? (
                        <img src={book.cover_url} alt="" className="w-8 h-11 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-11 rounded bg-parchment flex items-center justify-center text-xs text-ink-muted">—</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{book?.title ?? "Unknown"}</p>
                        <p className="text-xs text-ink-muted">
                          {log.pages_read} halaman · {timeAgo(log.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Rak Buku */}
          {tab === "rak" && (
            <div className="space-y-1.5">
              {m.shelf_items.length === 0 ? (
                <p className="text-sm text-ink-muted py-8 text-center">Rak buku masih kosong.</p>
              ) : (
                m.shelf_items.map((si) => {
                  const book = si.books;
                  const statusLabel =
                    si.status === "reading" ? "Dibaca" : si.status === "done" ? "Selesai" : "Ingin Baca";
                  const statusColor =
                    si.status === "reading" ? "text-blue-600 bg-blue-50" :
                    si.status === "done" ? "text-forest bg-green-50" :
                    "text-amber bg-amber/10";
                  return (
                    <div key={si.id} className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                      {book?.cover_url ? (
                        <img src={book.cover_url} alt="" className="w-8 h-11 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-11 rounded bg-parchment flex items-center justify-center text-xs text-ink-muted">—</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{book?.title ?? "Unknown"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColor}`}>
                            {statusLabel}
                          </span>
                          {si.current_page != null && (
                            <span className="text-xs text-ink-muted">hlm {si.current_page}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-ink-muted whitespace-nowrap">
                        {si.status === "done" && si.finished_at ? fmtDate(si.finished_at) : timeAgo(si.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Review */}
          {tab === "review" && (
            <div className="space-y-1.5">
              {m.recent_reviews.length === 0 ? (
                <p className="text-sm text-ink-muted py-8 text-center">Belum ada review.</p>
              ) : (
                m.recent_reviews.map((rv) => {
                  const book = rv.shelf_items?.books;
                  return (
                    <div key={rv.id} className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                      {book?.cover_url ? (
                        <img src={book.cover_url} alt="" className="w-8 h-11 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-11 rounded bg-parchment flex items-center justify-center text-xs text-ink-muted">—</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{book?.title ?? "Unknown"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-amber font-bold">{'★'.repeat(rv.rating)}</span>
                          <span className="text-xs text-ink-muted truncate">{rv.q_about}</span>
                          {!rv.is_public && (
                            <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full">Privat</span>
                          )}
                          {rv.is_anonymous && (
                            <span className="text-[10px] font-semibold text-ink-muted bg-parchment px-1.5 py-0.5 rounded-full">Anonim</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-ink-muted whitespace-nowrap">{timeAgo(rv.created_at)}</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
