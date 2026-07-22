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
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<"anggota" | "aktivitas">("anggota");

  const isAdmin = members.some((m) => m.member_id === memberId && m.role === "admin");
  const isMember = members.some((m) => m.member_id === memberId);

  useEffect(() => {
    fetch(`/api/clubs/${club.id}/stats`).then((r) => r.ok && r.json()).then((d) => setStats(d));
  }, [club.id]);

  useEffect(() => {
    if (isAdmin) {
      fetch(`/api/clubs/${club.id}/requests`).then((r) => r.ok && r.json()).then((d) => setRequests(d ?? [])).catch(() => {});
    }
  }, [club.id, isAdmin]);

  useEffect(() => {
    if (detailTab === "aktivitas") {
      setActivitiesLoading(true);
      fetch(`/api/clubs/${club.id}/activities`).then((r) => r.ok && r.json()).then((d) => setActivities(d ?? [])).catch(() => {}).finally(() => setActivitiesLoading(false));
    }
  }, [detailTab, club.id]);

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
      <Link href="/komunitas" className="text-caption text-ink-muted hover:text-ink flex items-center gap-1 mb-4 transition-colors">
        <ChevronLeft size={14} /> Kembali
      </Link>

      {/* Cover photo */}
      <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-parchment border-1.5 border-ink mb-4">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-muted">
            <Users size={40} strokeWidth={1} className="opacity-30" />
          </div>
        )}
        {isAdmin && (
          <>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-surface brutal-border brutal-shadow-xs flex items-center justify-center hover:bg-parchment transition-colors">
              <Camera size={16} className="text-ink-muted" />
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
      <div className="card-elevated p-5 mb-4">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="input-label">Nama Klub</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input mt-1" maxLength={50} />
            </div>
            <div>
              <label className="input-label">Deskripsi</label>
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="input mt-1 resize-none" rows={2} maxLength={200} />
            </div>
            <div>
              <label className="input-label">Visibilitas</label>
              <div className="flex gap-2 mt-1.5">
                {(["public", "private"] as const).map((v) => (
                  <button key={v} type="button" onClick={() => setEditVisibility(v)}
                    className={`flex-1 py-2.5 brutal-border rounded-md transition-all ${editVisibility === v ? "bg-amber-soft text-amber" : "bg-parchment text-ink-muted hover:bg-cream"}`}>
                    <p className="text-xs font-semibold">{v === "public" ? "Terbuka" : "Privat"}</p>
                  </button>
                ))}
              </div>
              <p className="input-hint mt-2">
                {editVisibility === "public"
                  ? "Klub akan muncul di halaman Jelajahi. Siapa saja bisa menemukan dan melihat info klub ini."
                  : "Klub tidak muncul di Jelajahi. Hanya orang yang punya kode undangan yang bisa bergabung."}
              </p>
            </div>
            <div>
              <label className="input-label">Cara Gabung</label>
              <div className="flex gap-2 mt-1.5">
                {(["auto", "approval"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setEditJoinType(t)}
                    className={`flex-1 py-2.5 brutal-border rounded-md transition-all ${editJoinType === t ? "bg-amber-soft text-amber" : "bg-parchment text-ink-muted hover:bg-cream"}`}>
                    <p className="text-xs font-semibold">{t === "auto" ? "Langsung" : "Persetujuan"}</p>
                  </button>
                ))}
              </div>
              <p className="input-hint mt-2">
                {editJoinType === "auto"
                  ? "Anggota baru langsung masuk ke klub tanpa perlu persetujuan admin."
                  : "Anggota baru harus menunggu admin menyetujui permintaannya sebelum bisa masuk."}
              </p>
            </div>
            <div className="divider-soft" />
            <div>
              <p className="text-caption mb-2">Zona Bahaya</p>
              <button onClick={() => setConfirmDelete(true)} className="btn-danger w-full text-xs">
                <Trash2 size={14} /> Hapus Klub
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1">Batal</button>
              <button onClick={handleSave} disabled={saving || !editName.trim()} className="btn-primary flex-1">
                {saving ? "…" : "Simpan"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-h2 mb-1">{club.name}</h1>
                {club.description && <p className="text-body-sm text-ink-secondary">{club.description}</p>}
              </div>
              {isAdmin && (
                <button onClick={() => setEditing(true)} className="btn-ghost-ink p-2 flex-shrink-0">
                  <Pencil size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4 text-caption text-ink-muted">
              <span className="flex items-center gap-1"><Users size={13} /> {club.member_count} anggota</span>
            </div>

            {isAdmin && (
              <div className="mt-4">
                <button onClick={copyCode} className="btn-secondary text-xs w-full">
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
          <h2 className="section-title mb-3 flex items-center gap-1.5">
            <Trophy size={14} className="text-amber" /> Statistik Anggota
          </h2>
          <div className="space-y-3">
            {stats.map((s) => {
              const me = s.member_id === memberId;
              return (
                <div key={s.member_id} className={`card-elevated p-4 ${me ? "ring-2 ring-amber/30" : ""}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-parchment brutal-border brutal-shadow-xs flex items-center justify-center text-amber flex-shrink-0">
                      <AvatarIcon avatar={s.avatar} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-semibold text-ink truncate">{s.name}{me && " (Kamu)"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-parchment rounded-md p-3 brutal-border brutal-shadow-xs">
                      <Flame size={16} className="mx-auto mb-1 text-amber" />
                      <span className="text-h3 block">{s.current_streak}</span>
                      <span className="text-caption">Streak</span>
                    </div>
                    <div className="bg-parchment rounded-md p-3 brutal-border brutal-shadow-xs">
                      <BookOpen size={16} className="mx-auto mb-1 text-info" />
                      <span className="text-h3 block">{s.pages_this_week}</span>
                      <span className="text-caption">Hlm/mgg</span>
                    </div>
                    <div className="bg-parchment rounded-md p-3 brutal-border brutal-shadow-xs">
                      <Clock size={16} className="mx-auto mb-1 text-success" />
                      <span className="text-h3 block">{s.minutes_this_week}</span>
                      <span className="text-caption">Mnt/mgg</span>
                    </div>
                  </div>
                  {s.books_finished_this_month > 0 && (
                    <p className="text-caption text-center mt-2">
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
          <h2 className="section-title mb-3 flex items-center gap-1.5">
            <Users size={14} className="text-amber" /> Permintaan Gabung ({requests.length})
          </h2>
          <div className="space-y-3">
            {requests.map((r: any) => (
              <div key={r.id} className="card-elevated p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-parchment brutal-border brutal-shadow-xs flex items-center justify-center text-amber flex-shrink-0">
                  <AvatarIcon avatar={r.members?.avatar ?? "book"} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-ink truncate">{r.members?.name}</p>
                </div>
                <div className="flex gap-2">
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
                    className="btn-primary text-xs py-1.5 px-3 min-h-0"
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
                    className="btn-secondary text-xs py-1.5 px-3 min-h-0"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Members + Activity tabs */}
      <div className="flex bg-parchment rounded-md brutal-border brutal-shadow-xs p-1 mb-4">
        <button onClick={() => setDetailTab("anggota")}
          className={`flex-1 py-2.5 text-xs font-semibold rounded transition-all ${detailTab === "anggota" ? "bg-surface text-ink brutal-shadow-xs" : "text-ink-muted hover:text-ink"}`}>
          Anggota ({members.length})
        </button>
        <button onClick={() => setDetailTab("aktivitas")}
          className={`flex-1 py-2.5 text-xs font-semibold rounded transition-all ${detailTab === "aktivitas" ? "bg-surface text-ink brutal-shadow-xs" : "text-ink-muted hover:text-ink"}`}>
          Aktivitas
        </button>
      </div>

      {detailTab === "anggota" && (
        <section>
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="card-elevated p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-parchment brutal-border brutal-shadow-xs flex items-center justify-center text-amber flex-shrink-0">
                  <AvatarIcon avatar={m.members?.avatar ?? "book"} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-semibold text-ink truncate flex items-center gap-1.5">
                    {m.members?.name ?? "Anggota"}
                    {m.role === "admin" && (
                      <span className="badge-amber">Admin</span>
                    )}
                  </p>
                  {m.members?.username && (
                    <p className="text-caption">@{m.members.username}</p>
                  )}
                </div>
                {isAdmin && m.member_id !== memberId && (
                  <button onClick={() => setConfirmTransfer(m.member_id)} className="btn-ghost-ink p-2" title="Transfer admin">
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {detailTab === "aktivitas" && (
        <section>
          {activitiesLoading ? (
            <p className="text-body-sm text-ink-muted text-center py-8">Memuat aktivitas…</p>
          ) : activities.length === 0 ? (
            <div className="card-elevated flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-parchment brutal-border brutal-shadow-xs flex items-center justify-center">
                <BookOpen size={24} strokeWidth={1.5} className="text-ink-muted" />
              </div>
              <p className="text-body-sm text-ink-muted">Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((a, i) => (
                <div key={i} className="card-elevated p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-parchment brutal-border brutal-shadow-xs flex items-center justify-center text-amber flex-shrink-0">
                    <AvatarIcon avatar={a.member_avatar} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm">
                      <span className="font-semibold">{a.member_name}</span>{" "}
                      <span className="text-ink-secondary">{a.detail}</span>
                    </p>
                    <p className="text-caption mt-1">
                      {new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog open={confirmDelete} title="Hapus klub" message={`Yakin hapus "${club.name}"? Semua data klub akan hilang.`}
        confirmLabel="Ya, Hapus" variant="danger" onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)} loading={deleting} />

      <ConfirmDialog open={confirmLeave} title="Keluar dari klub" message={`Yakin mau keluar dari "${club.name}"?`}
        confirmLabel="Ya, Keluar" variant="danger" onConfirm={handleLeave} onCancel={() => setConfirmLeave(false)} loading={leaving} />

      <ConfirmDialog open={!!confirmTransfer} title="Transfer Admin" message="Yakin transfer admin ke anggota ini? Kamu akan menjadi anggota biasa."
        confirmLabel="Ya, Transfer" variant="default" onConfirm={() => confirmTransfer && handleTransfer(confirmTransfer)} onCancel={() => setConfirmTransfer(null)} loading={transferring} />

      {/* Leave button */}
      {isMember && !isAdmin && (
        <div className="mt-8 text-center">
          <button onClick={() => setConfirmLeave(true)} className="text-caption text-error hover:text-error/80 transition-colors">
            Keluar dari klub
          </button>
        </div>
      )}
    </main>
  );
}
