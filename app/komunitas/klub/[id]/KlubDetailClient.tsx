"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Copy, ChevronLeft, Check, Pencil, Trash2, ArrowRight, Camera, Flame, BookOpen, Clock, Trophy } from "lucide-react";
import type { Club, ClubMember } from "@/lib/clubs";
import type { MemberStats } from "@/lib/club-stats";
import ConfirmDialog from "@/components/ConfirmDialog";
import AvatarIcon from "@/components/AvatarIcon";

type Props = {
  club: Club & { member_count: number };
  members: ClubMember[];
  memberId: string;
};

export default function KlubDetailClient({ club, members, memberId }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(club.name);
  const [editDesc, setEditDesc] = useState(club.description);
  const [editVisibility, setEditVisibility] = useState<"public" | "private">(club.visibility);
  const [editJoinType, setEditJoinType] = useState<"auto" | "approval">(club.join_type);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState<string | null>(null);
  const [transferring, setTransferring] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState(club.cover_url);
  const [stats, setStats] = useState<MemberStats[] | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [approving, setApproving] = useState<string | null>(null);

  const isAdmin = members.some((m) => m.member_id === memberId && m.role === "admin");
  const isMember = members.some((m) => m.member_id === memberId);
  const otherMembers = members.filter((m) => m.member_id !== memberId);

  useEffect(() => {
    fetch(`/api/clubs/${club.id}/stats`).then((r) => r.ok && r.json()).then((d) => setStats(d));
  }, [club.id]);

  useEffect(() => {
    if (isAdmin) {
      fetch(`/api/clubs/${club.id}/requests`).then((r) => r.ok && r.json()).then((d) => setRequests(d ?? [])).catch(() => {});
    }
      }, [club.id, isAdmin]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/club-cover", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const newUrl = json.url;
      setCoverUrl(newUrl);
      await fetch(`/api/clubs/${club.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_url: newUrl }),
      });
    } catch {}
    setUploading(false);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(club.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function handleSave() {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/clubs/${club.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDesc, visibility: editVisibility, join_type: editJoinType }),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } catch {}
    setSaving(false);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/clubs/${club.id}`, { method: "DELETE" });
      router.push("/komunitas");
    } catch {}
    setDeleting(false);
    setConfirmDelete(false);
  }

  async function handleTransfer(toMemberId: string) {
    setTransferring(true);
    try {
      await fetch(`/api/clubs/${club.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toMemberId }),
      });
      router.refresh();
    } catch {}
    setTransferring(false);
    setConfirmTransfer(null);
  }

  async function handleLeave() {
    setLeaving(true);
    try {
      await fetch(`/api/clubs/${club.id}/leave`, { method: "POST" });
      router.push("/komunitas");
    } catch {}
    setLeaving(false);
    setConfirmLeave(false);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <Link href="/komunitas" className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 mb-4 transition-colors">
        <ChevronLeft size={14} /> Kembali
      </Link>

      {/* Cover photo */}
      <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-parchment border border-border mb-4">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted">
            <Users size={40} strokeWidth={1} className="opacity-30" />
          </div>
        )}
        {isAdmin && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverUpload}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-parchment transition-colors shadow-sm"
            >
              <Camera size={14} className="text-ink-muted" />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-white bg-black/50 px-3 py-1 rounded-full">Uploading…</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-5 mb-4">
        {editing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input w-full font-semibold"
              maxLength={50}
            />
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="input w-full resize-none text-sm"
              rows={2}
              maxLength={200}
            />
            <div>
              <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Visibilitas</label>
              <div className="flex gap-2 mt-1">
                {(["public", "private"] as const).map((v) => (
                  <button key={v} type="button" onClick={() => setEditVisibility(v)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                      editVisibility === v ? "border-amber bg-amber-soft text-amber" : "border-border bg-parchment text-ink-muted"
                    }`}
                  >
                    {v === "public" ? "Terbuka" : "Privat"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Cara Gabung</label>
              <div className="flex gap-2 mt-1">
                {(["auto", "approval"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setEditJoinType(t)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                      editJoinType === t ? "border-amber bg-amber-soft text-amber" : "border-border bg-parchment text-ink-muted"
                    }`}
                  >
                    {t === "auto" ? "Langsung" : "Persetujuan"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary-sm flex-1">Batal</button>
              <button onClick={handleSave} disabled={saving || !editName.trim()} className="btn-primary-sm flex-1">
                {saving ? "…" : "Simpan"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="font-display text-xl font-bold text-ink mb-1">{club.name}</h1>
                {club.description && <p className="text-sm text-ink-muted">{club.description}</p>}
              </div>
              {isAdmin && (
                <button onClick={() => setEditing(true)} className="text-ink-muted hover:text-ink p-1 transition-colors flex-shrink-0">
                  <Pencil size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4 text-[11px] text-ink-muted">
              <span className="flex items-center gap-1"><Users size={13} /> {club.member_count} anggota</span>
            </div>

            {isAdmin && (
              <div className="mt-4 flex items-center gap-2">
                <button onClick={copyCode} className="btn-secondary-sm flex items-center gap-1.5 text-xs">
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Tersalin!" : `Salin Kode: ${club.invite_code}`}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats dashboard */}
      {stats && (
        <section className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3 flex items-center gap-1.5">
            <Trophy size={12} /> Statistik Anggota
          </h2>
          <div className="space-y-2">
            {stats.map((s) => {
              const me = s.member_id === memberId;
              return (
                <div key={s.member_id} className={`bg-surface rounded-xl border ${me ? "border-amber/30" : "border-border"} p-3`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-parchment border border-border flex items-center justify-center text-amber flex-shrink-0">
                        <AvatarIcon avatar={s.avatar} size={14} />
                      </div>
                      <p className="text-sm font-semibold text-ink truncate">{s.name}{me && " (Kamu)"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="bg-parchment rounded-lg p-2">
                      <Flame size={14} className="mx-auto mb-0.5 text-orange-400" />
                      <span className="font-bold text-ink">{s.current_streak}</span>
                      <span className="text-ink-muted block">Streak</span>
                    </div>
                    <div className="bg-parchment rounded-lg p-2">
                      <BookOpen size={14} className="mx-auto mb-0.5 text-blue-400" />
                      <span className="font-bold text-ink">{s.pages_this_week}</span>
                      <span className="text-ink-muted block">Hlm/mgg</span>
                    </div>
                    <div className="bg-parchment rounded-lg p-2">
                      <Clock size={14} className="mx-auto mb-0.5 text-green-400" />
                      <span className="font-bold text-ink">{s.minutes_this_week}</span>
                      <span className="text-ink-muted block">Mnt/mgg</span>
                    </div>
                  </div>
                  {s.books_finished_this_month > 0 && (
                    <p className="text-[11px] text-ink-muted text-center mt-1.5">
                      {s.books_finished_this_month} buku selesai bulan ini
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pending requests */}
      {isAdmin && requests.length > 0 && (
        <section className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-amber mb-3 flex items-center gap-1.5">
            <Users size={12} /> Permintaan Gabung ({requests.length})
          </h2>
          <div className="space-y-2">
            {requests.map((r: any) => (
              <div key={r.id} className="bg-surface rounded-xl border border-border p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-parchment border border-border flex items-center justify-center text-amber flex-shrink-0">
                  <AvatarIcon avatar={r.members?.avatar ?? "book"} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{r.members?.name}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={async () => {
                      setApproving(r.id);
                      try {
                        const res = await fetch(`/api/clubs/${club.id}/approve`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ requestId: r.id }),
                        });
                        if (res.ok) setRequests((prev) => prev.filter((x: any) => x.id !== r.id));
                      } catch {}
                      setApproving(null);
                    }}
                    disabled={approving === r.id}
                    className="text-[10px] font-semibold text-white bg-forest hover:bg-forest/80 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {approving === r.id ? "…" : "Terima"}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await fetch(`/api/clubs/${club.id}/reject`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ requestId: r.id }),
                        });
                        setRequests((prev) => prev.filter((x: any) => x.id !== r.id));
                      } catch {}
                    }}
                    className="text-[10px] font-semibold text-red-400 border border-border px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Members */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3 flex items-center gap-1.5">
          <Users size={12} /> Anggota
        </h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3">
              <div className="w-9 h-9 rounded-full bg-parchment border border-border flex items-center justify-center text-amber flex-shrink-0">
                <AvatarIcon avatar={m.members?.avatar ?? "book"} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate flex items-center gap-1.5">
                  {m.members?.name ?? "Anggota"}
                  {m.role === "admin" && (
                    <span className="text-[10px] font-bold text-amber uppercase tracking-wider">Admin</span>
                  )}
                </p>
                {m.members?.username && (
                  <p className="text-[11px] text-ink-muted">@{m.members.username}</p>
                )}
              </div>
              {isAdmin && m.member_id !== memberId && (
                <button
                  onClick={() => setConfirmTransfer(m.member_id)}
                  className="text-[10px] text-ink-muted hover:text-amber transition-colors flex-shrink-0"
                  title="Transfer admin"
                >
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmDelete}
        title="Hapus klub"
        message={`Yakin hapus "${club.name}"? Semua data klub akan hilang.`}
        confirmLabel="Ya, Hapus"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={deleting}
      />

      <ConfirmDialog
        open={confirmLeave}
        title="Keluar dari klub"
        message={`Yakin mau keluar dari "${club.name}"?`}
        confirmLabel="Ya, Keluar"
        variant="danger"
        onConfirm={handleLeave}
        onCancel={() => setConfirmLeave(false)}
        loading={leaving}
      />

      <ConfirmDialog
        open={!!confirmTransfer}
        title="Transfer Admin"
        message="Yakin transfer admin ke anggota ini? Kamu akan menjadi anggota biasa."
        confirmLabel="Ya, Transfer"
        variant="default"
        onConfirm={() => confirmTransfer && handleTransfer(confirmTransfer)}
        onCancel={() => setConfirmTransfer(null)}
        loading={transferring}
      />

      {/* Admin actions */}
      {isAdmin && !editing && (
        <div className="mt-8 space-y-3">
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-500 bg-surface border border-border rounded-xl p-3 transition-colors"
          >
            <Trash2 size={14} />
            Hapus klub
          </button>
        </div>
      )}

      {/* Leave button */}
      {isMember && !isAdmin && (
        <div className="mt-8 text-center">
          <button onClick={() => setConfirmLeave(true)} className="text-xs text-red-400 hover:text-red-500 transition-colors">
            Keluar dari klub
          </button>
        </div>
      )}
    </main>
  );
}
