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
      <div className="bg-surface rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-soft border border-amber/20 flex items-center justify-center text-2xl">
            {avatar}
          </div>
          <div>
            <p className="font-semibold text-ink">{session.memberName}</p>
            <p className="text-xs text-ink-muted">{session.email}
              {session.emailVerified
                ? <span className="ml-1.5 text-forest">✓ terverifikasi</span>
                : <span className="ml-1.5 text-amber">⚠ belum terverifikasi</span>}
            </p>
          </div>
        </div>

        {/* Avatar picker */}
        <div>
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2 block">Avatar</label>
          <div className="flex gap-2 flex-wrap">
            {AVATARS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAvatar(a)}
                className={`w-11 h-11 text-2xl rounded-xl border-2 transition-all ${
                  avatar === a
                    ? "border-amber bg-amber-soft scale-110 shadow-sm"
                    : "border-border bg-parchment hover:border-amber/40"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2 block">Nama tampilan</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
          />
        </div>
      </div>

      {/* Family card */}
      <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-semibold text-ink flex items-center gap-2">🏠 Keluarga</h2>

        {session.memberRole === "admin" ? (
          <div>
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2 block">Nama keluarga</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
            />
          </div>
        ) : (
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-1">Nama keluarga</p>
            <p className="text-ink font-medium">{session.familyName}</p>
          </div>
        )}

        {/* Invite code */}
        {session.inviteCode && (
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Kode undangan</p>
            <div className="flex items-center gap-3 bg-parchment rounded-xl border border-border px-4 py-3">
              <span className="font-mono text-xl font-bold text-ink tracking-[0.2em] uppercase flex-1">
                {session.inviteCode}
              </span>
              <button
                onClick={copyCode}
                className="text-sm text-amber hover:text-amber-hover font-medium transition-colors"
              >
                {copied ? "✓ Disalin" : "Salin"}
              </button>
            </div>
            <p className="text-xs text-ink-muted mt-1.5">
              Bagikan kode ini agar anggota keluarga bisa bergabung
            </p>
          </div>
        )}
      </div>

      {/* Save button */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {saved && <p className="text-forest text-sm text-center">✓ Tersimpan</p>}
      <button
        onClick={handleSave}
        disabled={saving || !isDirty}
        className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40"
      >
        {saving ? "Menyimpan…" : "Simpan perubahan"}
      </button>
    </div>
  );
}
