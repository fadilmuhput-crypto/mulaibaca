"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/session";
import AvatarIcon, { AVATAR_OPTIONS } from "@/components/AvatarIcon";
import { Check, AlertTriangle } from "lucide-react";

export default function ProfilClient({ session }: { session: Session }) {
  const router = useRouter();
  const [name, setName] = useState(session.memberName);
  const [avatar, setAvatar] = useState(session.memberAvatar);
  const [familyName, setFamilyName] = useState(session.familyName);
  const [weeklyGoal, setWeeklyGoal] = useState(session.weeklyPagesGoal);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar, familyName, weeklyPagesGoal: weeklyGoal }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(session.inviteCode.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isDirty = name !== session.memberName || avatar !== session.memberAvatar || familyName !== session.familyName || weeklyGoal !== session.weeklyPagesGoal;

  return (
    <div className="space-y-4">
      {/* Member profile card */}
      <div className="card-elevated p-6 space-y-5">
        {/* Current avatar preview */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-soft border-2 border-amber/30 flex items-center justify-center text-amber">
            <AvatarIcon avatar={avatar} size={24} />
          </div>
          <div>
            <p className="font-semibold text-ink">{session.memberName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-ink-muted">{session.email}</p>
              {session.emailVerified
                ? <span className="badge-forest flex items-center gap-1"><Check size={10} strokeWidth={3} />terverifikasi</span>
                : <span className="badge-amber flex items-center gap-1"><AlertTriangle size={10} strokeWidth={2.5} />belum terverifikasi</span>
              }
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
          <input
            id="display-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Family card */}
      <div className="card-elevated p-6 space-y-4">
        <h2 className="text-h3">Keluarga</h2>

        {session.memberRole === "admin" ? (
          <div>
            <label htmlFor="family-name" className="input-label">Nama keluarga</label>
            <input
              id="family-name"
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="input"
            />
          </div>
        ) : (
          <div>
            <p className="text-overline mb-1">Nama keluarga</p>
            <p className="text-ink font-medium">{session.familyName}</p>
          </div>
        )}

        {/* Invite code */}
        {session.inviteCode && (
          <div>
            <p className="text-overline mb-2">Kode undangan</p>
            <div className="flex items-center gap-3 bg-parchment rounded-xl border border-border px-4 py-3">
              <span className="font-mono text-xl font-bold text-ink tracking-[0.2em] uppercase flex-1">
                {session.inviteCode}
              </span>
              <button
                onClick={copyCode}
                className="btn-ghost-ink min-h-[36px] px-3 text-sm"
              >
                {copied ? <span className="flex items-center gap-1"><Check size={12} strokeWidth={2.5} />Disalin</span> : "Salin"}
              </button>
            </div>
            <p className="input-hint">Bagikan kode ini agar anggota keluarga bisa bergabung</p>
          </div>
        )}
      </div>

      {/* Reading goal card */}
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
            type="number"
            min={0}
            max={999}
            value={weeklyGoal || ""}
            onChange={(e) => setWeeklyGoal(Math.max(0, parseInt(e.target.value) || 0))}
            placeholder="Atau ketik sendiri"
            className="input flex-1"
          />
          {weeklyGoal > 0 && (
            <button
              type="button"
              onClick={() => setWeeklyGoal(0)}
              className="btn-ghost-ink px-3 text-sm"
            >
              Hapus
            </button>
          )}
        </div>

        {weeklyGoal > 0 && (
          <p className="text-xs text-forest bg-forest/8 rounded-lg px-3 py-2">
            Target kamu: <span className="font-semibold">{weeklyGoal} halaman per minggu</span> — sekitar {Math.round(weeklyGoal / 7)} halaman per hari
          </p>
        )}
      </div>

      {/* Save */}
      {error && (
        <p role="alert" className="text-error text-sm text-center bg-error-soft rounded-xl px-4 py-3">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-success text-sm text-center bg-success-soft rounded-xl px-4 py-3">
          <span className="flex items-center justify-center gap-1.5"><Check size={14} strokeWidth={2.5} />Perubahan tersimpan</span>
        </p>
      )}
      <button
        onClick={handleSave}
        disabled={saving || !isDirty}
        className="btn-primary-full-lg"
      >
        {saving ? "Menyimpan…" : "Simpan perubahan"}
      </button>
    </div>
  );
}
