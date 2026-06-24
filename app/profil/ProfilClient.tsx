"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/session";

const AVATARS = ["📖", "🌱", "🦋", "🌟", "🎯", "🦉", "🐻", "🌈", "🎨", "🌊", "🦁", "🐬"];

export default function ProfilClient({ session }: { session: Session }) {
  const router = useRouter();
  const [name, setName] = useState(session.memberName);
  const [avatar, setAvatar] = useState(session.memberAvatar);
  const [familyName, setFamilyName] = useState(session.familyName);
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
        body: JSON.stringify({ name, avatar, familyName }),
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

  const isDirty = name !== session.memberName || avatar !== session.memberAvatar || familyName !== session.familyName;

  return (
    <div className="space-y-4">
      {/* Member profile card */}
      <div className="card-elevated p-6 space-y-5">
        {/* Current avatar preview */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-soft border-2 border-amber/30 flex items-center justify-center text-3xl">
            {avatar}
          </div>
          <div>
            <p className="font-semibold text-ink">{session.memberName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs text-ink-muted">{session.email}</p>
              {session.emailVerified
                ? <span className="badge-forest">✓ terverifikasi</span>
                : <span className="badge-amber">⚠ belum terverifikasi</span>
              }
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Avatar picker */}
        <div>
          <label className="text-overline mb-3 block">Pilih avatar</label>
          <div className="flex gap-2 flex-wrap">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`w-11 h-11 text-2xl rounded-xl border-2 transition-all ${
                  avatar === a
                    ? "border-amber bg-amber-soft scale-110"
                    : "border-border bg-parchment hover:border-amber/40"
                }`}
                aria-label={`Avatar ${a}`}
                aria-pressed={avatar === a}
              >
                {a}
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
                {copied ? "✓ Disalin" : "Salin"}
              </button>
            </div>
            <p className="input-hint">Bagikan kode ini agar anggota keluarga bisa bergabung</p>
          </div>
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
          ✓ Perubahan tersimpan
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
