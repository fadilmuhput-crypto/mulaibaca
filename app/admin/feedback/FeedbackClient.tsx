"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare, AlertTriangle, HelpCircle, Lightbulb,
  Bug, Mail, Check, X, ChevronDown, ChevronUp,
  Send, Search, Filter, Clock,
} from "lucide-react";

type FeedbackItem = {
  id: string;
  member_id: string | null;
  name: string | null;
  email: string | null;
  category: string | null;
  subject: string | null;
  message: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  members: { name: string; avatar: string } | null;
};

const CATEGORIES = [
  { key: "", label: "Semua" },
  { key: "komplain", label: "Komplain", icon: AlertTriangle },
  { key: "inquiry", label: "Pertanyaan", icon: HelpCircle },
  { key: "saran", label: "Saran", icon: Lightbulb },
  { key: "bug", label: "Bug", icon: Bug },
  { key: "konten", label: "Konten", icon: MessageSquare },
  { key: "lainnya", label: "Lainnya", icon: Mail },
];

const STATUSES = [
  { key: "", label: "Semua" },
  { key: "baru", label: "Baru", color: "var(--color-amber)" },
  { key: "dibaca", label: "Dibaca", color: "var(--color-ink-secondary)" },
  { key: "diproses", label: "Diproses", color: "var(--color-forest)" },
  { key: "selesai", label: "Selesai", color: "var(--color-ink-muted)" },
  { key: "ditutup", label: "Ditutup", color: "var(--color-error)" },
];

const STATUS_OPTIONS = ["baru", "dibaca", "diproses", "selesai", "ditutup"];

export default function FeedbackClient() {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      const res = await fetch(`/api/admin/feedback?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter, categoryFilter]);

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    try {
      await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch {
      /* ignore */
    } finally {
      setSaving(null);
    }
  }

  async function submitReply(id: string) {
    if (!replyText.trim()) return;
    setSaving(id);
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, admin_reply: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, admin_reply: data.admin_reply, status: data.status, replied_at: data.replied_at } : i
        )
      );
      setReplyText("");
      setExpandedId(null);
    } catch {
      /* ignore */
    } finally {
      setSaving(null);
    }
  }

  const counts = {
    all: items.length,
    baru: items.filter((i) => i.status === "baru").length,
    diproses: items.filter((i) => i.status === "diproses").length,
    selesai: items.filter((i) => i.status === "selesai").length,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-h1 flex items-center gap-2">
          <MessageSquare size={24} strokeWidth={1.75} />
          Feedback & Komplain
        </h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Pantau dan tanggapi masukan dari pengguna
        </p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Semua", value: counts.all, color: "var(--color-ink)" },
          { label: "Baru", value: counts.baru, color: "var(--color-amber)" },
          { label: "Diproses", value: counts.diproses, color: "var(--color-forest)" },
          { label: "Selesai", value: counts.selesai, color: "var(--color-ink-muted)" },
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => setStatusFilter(c.label === "Semua" ? "" : c.label.toLowerCase())}
            className={`bg-surface rounded-xl border p-3 text-center transition-all ${
              (statusFilter === "" && c.label === "Semua") || statusFilter === c.label.toLowerCase()
                ? "border-amber ring-1 ring-amber"
                : "border-border hover:border-amber/40"
            }`}
          >
            <div className="font-display text-xl font-black" style={{ color: c.color }}>{c.value}</div>
            <div className="text-[10px] text-ink-muted mt-0.5 font-medium uppercase">{c.label}</div>
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-ink-muted">
          <Filter size={12} strokeWidth={2} /> Kategori:
        </div>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategoryFilter(c.key)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
              categoryFilter === c.key
                ? "border-amber bg-amber-soft text-amber"
                : "border-border text-ink-secondary hover:border-amber/40"
            }`}
          >
            {c.icon && <c.icon size={11} strokeWidth={2} />}
            {c.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error-soft border border-error/20 rounded-xl px-4 py-3 text-sm text-error">
          {error}
          <button onClick={load} className="ml-2 underline">Coba lagi</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-border/30 rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="text-center py-12">
          <Mail size={32} strokeWidth={1.25} className="mx-auto text-ink-muted mb-3" />
          <p className="text-ink-secondary text-sm">Belum ada feedback</p>
        </div>
      )}

      {/* Daftar Feedback */}
      {!loading && items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => {
            const cat = CATEGORIES.find((c) => c.key === item.category);
            const CatIcon = cat?.icon ?? Mail;
            const expanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-surface rounded-xl border border-border overflow-hidden transition-all"
              >
                {/* Baris ringkas */}
                <button
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-parchment/50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.status === "baru" ? "bg-amber-soft text-amber" : "bg-parchment text-ink-muted"
                  }`}>
                    <CatIcon size={14} strokeWidth={2} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-ink truncate">
                        {item.subject || item.message.slice(0, 60)}
                      </span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        item.status === "baru" ? "bg-amber-soft text-amber" :
                        item.status === "diproses" ? "bg-forest/10 text-forest" :
                        item.status === "selesai" ? "bg-ink-muted/10 text-ink-muted" :
                        "bg-error-soft text-error"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-ink-muted">
                      <span>{item.name || item.members?.name || "Anonim"}</span>
                      <span>·</span>
                      <span>{new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      {item.category && (
                        <>
                          <span>·</span>
                          <span>{cat?.label ?? item.category}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {expanded ? <ChevronUp size={14} strokeWidth={2} className="text-ink-muted" /> : <ChevronDown size={14} strokeWidth={2} className="text-ink-muted" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {expanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
                    {/* Pesan asli */}
                    <div>
                      <p className="text-[10px] font-semibold text-ink-muted uppercase mb-1">Pesan</p>
                      <p className="text-sm text-ink-secondary whitespace-pre-wrap">{item.message}</p>
                    </div>

                    {item.email && (
                      <p className="text-xs text-ink-muted">
                        Email: <a href={`mailto:${item.email}`} className="text-amber hover:underline">{item.email}</a>
                      </p>
                    )}

                    {/* Balasan admin sebelumnya */}
                    {item.admin_reply && (
                      <div className="bg-forest/5 rounded-xl p-3 border border-forest/20">
                        <p className="text-[10px] font-semibold text-forest uppercase mb-1">Balasan admin</p>
                        <p className="text-sm text-ink-secondary whitespace-pre-wrap">{item.admin_reply}</p>
                        {item.replied_at && (
                          <p className="text-[10px] text-ink-muted mt-1">
                            {new Date(item.replied_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold text-ink-muted uppercase mr-1">Status:</span>
                      {STATUS_OPTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(item.id, s)}
                          disabled={saving === item.id}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                            item.status === s
                              ? "border-ink bg-ink text-white"
                              : "border-border text-ink-secondary hover:border-ink/40"
                          }`}
                        >
                          {saving === item.id ? "…" : s}
                        </button>
                      ))}
                    </div>

                    {/* Reply box */}
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tulis balasan…"
                        rows={3}
                        className="input resize-none w-full text-sm"
                      />
                      <button
                        onClick={() => submitReply(item.id)}
                        disabled={saving === item.id || !replyText.trim()}
                        className="btn-primary text-sm flex items-center gap-1.5"
                      >
                        <Send size={12} strokeWidth={2.5} />
                        {saving === item.id ? "Menyimpan…" : "Kirim Balasan"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
