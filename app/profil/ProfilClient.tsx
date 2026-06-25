"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/session";
import type { ProfilStats } from "./page";
import AvatarIcon, { AVATAR_OPTIONS } from "@/components/AvatarIcon";
import { Check, AlertTriangle, BookCheck, BookText, Flame, AtSign, Lock, ExternalLink } from "lucide-react";
import Link from "next/link";

const MEMBER_TYPES = [
  { key: "ayah",   label: "Ayah" },
  { key: "ibu",    label: "Ibu" },
  { key: "anak",   label: "Anak" },
  { key: "dewasa", label: "Lainnya" },
] as const;

export default function ProfilClient({
  session,
  stats,
}: {
  session: Session;
  stats: ProfilStats;
}) {
  const router = useRouter();
  const [name, setName] = useState(session.memberName);
  const [avatar, setAvatar] = useState(session.memberAvatar);
  const [familyName, setFamilyName] = useState(session.familyName);
  const [weeklyGoal, setWeeklyGoal] = useState(session.weeklyPagesGoal);
  const [memberType, setMemberType] = useState(session.memberType);
  const [username, setUsername] = useState(session.memberUsername ?? "");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [usernameError, setUsernameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const checkRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameAlreadySet = !!session.memberUsername;

  const isDirty =
    name !== session.memberName ||
    avatar !== session.memberAvatar ||
    familyName !== session.familyName ||
    weeklyGoal !== session.weeklyPagesGoal ||
    memberType !== session.memberType ||
    (!usernameAlreadySet && username.trim() && usernameStatus === "available");

  useEffect(() => {
    if (usernameAlreadySet || !username.trim()) {
      setUsernameStatus("idle");
      setUsernameError("");
      return;
    }
    if (checkRef.current) clearTimeout(checkRef.current);
    setUsernameStatus("checking");
    checkRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profil/username-check?u=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (data.error) { setUsernameStatus("invalid"); setUsernameError(data.error); }
        else if (data.available) { setUsernameStatus("available"); setUsernameError(""); }
        else { setUsernameStatus("taken"); setUsernameError("Username sudah digunakan"); }
      } catch { setUsernameStatus("idle"); }
    }, 500);
    return () => { if (checkRef.current) clearTimeout(checkRef.current); };
  }, [username, usernameAlreadySet]);

  async function handleSave() {
    setSaving(true); setSaved(false); setError("");
    try {
      const body: Record<string, unknown> = { name, avatar, familyName, weeklyPagesGoal: weeklyGoal, memberType };
      if (!usernameAlreadySet && username.trim() && usernameStatus === "available") {
        body.username = username.trim();
      }
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally { setSaving(false); }
  }

  function copyCode() {
    navigator.clipboard.writeText(session.inviteCode.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl p-3 text-center" style={{ border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal-xs)" }}>
          <BookCheck size={16} strokeWidth={1.75} className="text-forest mx-auto mb-1" />
          <div className="font-display text-2xl font-black text-ink leading-none">{stats.booksFinished}</div>
          <div className="text-[10px] text-ink-muted mt-1 font-medium">Buku Selesai</div>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center" style={{ border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal-xs)" }}>
          <BookText size={16} strokeWidth={1.75} className="text-amber mx-auto mb-1" />
          <div className="font-display text-2xl font-black text-ink leading-none">
            {stats.totalPagesRead >= 1000
              ? `${(stats.totalPagesRead / 1000).toFixed(1)}k`
              : stats.totalPagesRead}
          </div>
          <div className="text-[10px] text-ink-muted mt-1 font-medium">Total Halaman</div>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center" style={{ border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal-xs)" }}>
          <Flame size={16} strokeWidth={1.75} className="text-amber mx-auto mb-1" />
          <div className="font-display text-2xl font-black text-ink leading-none">{stats.longestStreak}</div>
          <div className="text-[10px] text-ink-muted mt-1 font-medium">Streak Terpanjang</div>
        </div>
      </div>

      {/* ── Profile card ── */}
      <div className="card-elevated p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-soft border-2 border-amber/30 flex items-center justify-center text-amber">
            <AvatarIcon avatar={avatar} size={24} />
          </div>
          <div>
            <p className="font-semibold text-ink">{session.memberName}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <p className="text-xs text-ink-muted">{session.email}</p>
              {session.emailVerified
                ? <span className="badge-forest flex items-center gap-1"><Check size={10} strokeWidth={3} />terverifikasi</span>
                : <span className="badge-amber flex items-center gap-1"><AlertTriangle size={10} strokeWidth={2.5} />belum terverifikasi</span>}
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Avatar picker */}
        <div>
          <label className="text-overline mb-3 block">Pilih avatar</label>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setAvatar(key)}
                title={label}
                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                  avatar === key
                    ? "border-amber bg-amber-soft text-amber scale-110"
                    : "border-border bg-parchment text-ink-secondary hover:border-amber/40 hover:text-amber"
                }`}
                aria-label={label}
                aria-pressed={avatar === key}
              >
                <Icon size={18} strokeWidth={1.75} />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="display-name" className="input-label">Nama tampilan</label>
          <input id="display-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="input-label">
            Username{" "}
            {usernameAlreadySet && (
              <span className="text-[10px] font-normal text-ink-muted ml-1 inline-flex items-center gap-0.5">
                <Lock size={9} strokeWidth={2} />tidak bisa diubah
              </span>
            )}
          </label>
          <div className="relative mt-1">
            <AtSign size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => !usernameAlreadySet && setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              readOnly={usernameAlreadySet}
              placeholder="contoh: fadilmuhput"
              className={`input input-icon-lr ${usernameAlreadySet ? "bg-parchment text-ink-secondary cursor-default" : ""}`}
            />
            {!usernameAlreadySet && username && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                {usernameStatus === "checking" && <span className="text-ink-muted">…</span>}
                {usernameStatus === "available" && <Check size={14} strokeWidth={2.5} className="text-forest" />}
                {(usernameStatus === "taken" || usernameStatus === "invalid") && <span className="text-error">✕</span>}
              </span>
            )}
          </div>
          {!usernameAlreadySet && (
            <p className="input-hint">
              {usernameError || "Huruf kecil, angka, underscore. Tidak bisa diubah setelah disimpan."}
            </p>
          )}
          {usernameAlreadySet && (
            <Link
              href={`/u/${session.memberUsername}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-amber mt-1 hover:text-amber-hover"
            >
              <ExternalLink size={11} strokeWidth={2} />
              mulaibaca.my.id/u/{session.memberUsername}
            </Link>
          )}
        </div>

        {/* Member type */}
        <div>
          <label className="input-label mb-2 block">Kamu adalah</label>
          <div className="flex gap-2">
            {MEMBER_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setMemberType(t.key)}
                className={`flex-1 min-h-[40px] rounded-xl border-2 text-sm font-medium transition-all ${
                  memberType === t.key
                    ? "border-amber bg-amber text-white"
                    : "border-border bg-parchment text-ink-secondary hover:border-amber/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Family card ── */}
      <div className="card-elevated p-6 space-y-4">
        <h2 className="text-h3">Keluarga</h2>
        {session.memberRole === "admin" ? (
          <div>
            <label htmlFor="family-name" className="input-label">Nama keluarga</label>
            <input id="family-name" type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} className="input mt-1" />
          </div>
        ) : (
          <div>
            <p className="text-overline mb-1">Nama keluarga</p>
            <p className="text-ink font-medium">{session.familyName}</p>
          </div>
        )}
        {session.inviteCode && (
          <div>
            <p className="text-overline mb-2">Kode undangan</p>
            <div className="flex items-center gap-3 bg-parchment rounded-xl border border-border px-4 py-3">
              <span className="font-mono text-xl font-bold text-ink tracking-[0.2em] uppercase flex-1">{session.inviteCode}</span>
              <button onClick={copyCode} className="btn-ghost-ink min-h-[36px] px-3 text-sm">
                {copied ? <span className="flex items-center gap-1"><Check size={12} strokeWidth={2.5} />Disalin</span> : "Salin"}
              </button>
            </div>
            <p className="input-hint">Bagikan kode ini agar anggota keluarga bisa bergabung</p>
          </div>
        )}
      </div>

      {/* ── Reading goal ── */}
      <div className="card-elevated p-6 space-y-4">
        <div>
          <h2 className="text-h3">Target membaca</h2>
          <p className="text-xs text-ink-muted mt-0.5">Halaman yang ingin kamu baca setiap minggu</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[25, 50, 100, 150].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setWeeklyGoal(preset)}
              className={`min-h-[44px] px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                weeklyGoal === preset
                  ? "border-amber bg-amber text-white"
                  : "border-border bg-parchment text-ink-secondary hover:border-amber/50"
              }`}
            >
              {preset} hal
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number" min={0} max={999}
            value={weeklyGoal || ""}
            onChange={(e) => setWeeklyGoal(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="Atau ketik sendiri"
            className="input flex-1"
          />
          {weeklyGoal > 0 && (
            <button type="button" onClick={() => setWeeklyGoal(0)} className="btn-ghost-ink px-3 text-sm">Hapus</button>
          )}
        </div>
        {weeklyGoal > 0 && (
          <p className="text-xs text-forest bg-forest/8 rounded-lg px-3 py-2">
            Target kamu: <span className="font-semibold">{weeklyGoal} halaman per minggu</span> — sekitar {Math.round(weeklyGoal / 7)} halaman per hari
          </p>
        )}
      </div>

      {error && <p role="alert" className="text-error text-sm text-center bg-error-soft rounded-xl px-4 py-3">{error}</p>}
      {saved && (
        <p className="text-success text-sm text-center bg-success-soft rounded-xl px-4 py-3">
          <span className="flex items-center justify-center gap-1.5"><Check size={14} strokeWidth={2.5} />Perubahan tersimpan</span>
        </p>
      )}
      <button onClick={handleSave} disabled={saving || !isDirty} className="btn-primary-full-lg">
        {saving ? "Menyimpan…" : "Simpan perubahan"}
      </button>
    </div>
  );
}
