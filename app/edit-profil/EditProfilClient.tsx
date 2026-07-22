"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/session";
import type { ProfilStats, ActingAsInfo, FamilyMember } from "./page";
import AvatarIcon, { AVATAR_OPTIONS } from "@/components/AvatarIcon";
import { Check, AtSign, Lock, ExternalLink, Users, Target, Trophy, Baby, Smile, Heart, User, LogIn, Palette, Bell, BellOff, Camera } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const MEMBER_TYPES = [
  { key: "ayah",   label: "Ayah",   icon: User,  desc: "Ayah dari keluarga" },
  { key: "ibu",    label: "Ibu",    icon: Heart, desc: "Ibu dari keluarga" },
  { key: "anak",   label: "Anak",   icon: Baby,  desc: "Anak dalam keluarga" },
  { key: "dewasa", label: "Dewasa", icon: Smile, desc: "Anggota dewasa lainnya" },
] as const;

export default function ProfilClient({
  session,
  stats,
  actingAsInfo,
  familyMembers,
  familyWeeklyChallenge: initialWeeklyChallenge,
}: {
  session: Session;
  stats: ProfilStats;
  actingAsInfo: ActingAsInfo;
  familyMembers: FamilyMember[];
  familyWeeklyChallenge: number;
}) {
  const router = useRouter();
  const [name, setName] = useState(session.memberName);
  const [avatar, setAvatar] = useState(session.memberAvatar);
  const [familyName, setFamilyName] = useState(session.familyName);
  const [weeklyGoal, setWeeklyGoal] = useState(session.weeklyPagesGoal);
  const [weeklyChallenge, setWeeklyChallenge] = useState(initialWeeklyChallenge);
  const [memberType, setMemberType] = useState(session.memberType);
  const [birthDate, setBirthDate] = useState(session.memberBirthDate ?? "");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("19:00");
  const [username, setUsername] = useState(session.memberUsername ?? "");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [usernameError, setUsernameError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [setupEmail, setSetupEmail] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bio, setBio] = useState(session.memberBio ?? "");
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const checkRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkSeq = useRef(0);
  const usernameAlreadySet = !!session.memberUsername;

  const isDirty =
    name !== session.memberName ||
    avatar !== session.memberAvatar ||
    bio !== (session.memberBio ?? "") ||
    familyName !== session.familyName ||
    weeklyGoal !== session.weeklyPagesGoal ||
    weeklyChallenge !== initialWeeklyChallenge ||
    memberType !== session.memberType ||
    birthDate !== (session.memberBirthDate ?? "") ||
    (!usernameAlreadySet && username.trim() && usernameStatus === "available");

  useEffect(() => {
    if (usernameAlreadySet || !username.trim()) {
      setUsernameStatus("idle");
      setUsernameError("");
      return;
    }
    if (checkRef.current) clearTimeout(checkRef.current);
    setUsernameStatus("checking");
    const seq = ++checkSeq.current;
    checkRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profil/username-check?u=${encodeURIComponent(username)}`);
        if (seq !== checkSeq.current) return;
        const data = await res.json();
        if (data.error) { setUsernameStatus("invalid"); setUsernameError(data.error); }
        else if (data.available) { setUsernameStatus("available"); setUsernameError(""); }
        else { setUsernameStatus("taken"); setUsernameError("Username sudah digunakan"); }
      } catch { setUsernameStatus("idle"); }
    }, 500);
    return () => { if (checkRef.current) clearTimeout(checkRef.current); };
  }, [username, usernameAlreadySet]);

  async function handleSave() {
    if (!name.trim()) { setError("Nama tampilan tidak boleh kosong"); return; }
    setSaving(true); setSaved(false); setError("");
    try {
      const body: Record<string, unknown> = {
        name, avatar, bio, birthDate, familyName,
        weeklyPagesGoal: weeklyGoal, memberType,
        familyWeeklyChallenge: weeklyChallenge,
        reminderEnabled, reminderTime,
      };
      if (!usernameAlreadySet && username.trim() && usernameStatus === "available") {
        body.username = username.trim();
      }
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { let msg = "Gagal menyimpan"; try { const d = await res.json(); msg = d.error || msg; } catch {} throw new Error(msg); }
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

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    setJoinError("");
    setJoinSuccess("");
    try {
      const res = await fetch("/api/lingkar-baca/gabung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: joinCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJoinSuccess(`Berhasil bergabung ke keluarga ${data.familyName}!`);
      setTimeout(() => router.refresh(), 1200);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : "Gagal bergabung");
    } finally { setJoinLoading(false); }
  }

  async function handleSetup() {
    setSetupLoading(true);
    setSetupError("");
    setSetupSuccess(false);
    try {
      const res = await fetch("/api/auth/setup-akun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: setupEmail.trim(), password: setupPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSetupSuccess(true);
      setTimeout(() => router.refresh(), 1200);
    } catch (err) {
      setSetupError(err instanceof Error ? err.message : "Gagal setup akun");
    } finally { setSetupLoading(false); }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setAvatar(json.url);
    } catch (err) {
      // Silently fail - user can retry
    }
    setAvatarUploading(false);
    if (avatarFileRef.current) avatarFileRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {/* Edit profile card */}
      <div className="card-elevated p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-amber-soft border-2 border-amber/30 flex items-center justify-center text-amber overflow-hidden">
              <AvatarIcon avatar={avatar} size={24} />
            </div>
            <button
              type="button"
              onClick={() => avatarFileRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface brutal-border flex items-center justify-center hover:bg-parchment transition-colors"
              title="Upload foto profil"
            >
              <Camera size={10} className="text-ink-muted" />
            </button>
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="font-semibold text-ink">{session.memberName}</p>
            <p className="text-xs text-ink-muted">{session.email}</p>
          </div>
        </div>

        <div className="divider" />

        <div>
          <label className="text-overline mb-3 block">Pilih avatar</label>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_OPTIONS.map(({ key, label, Icon }) => (
              <button
                key={key} type="button" onClick={() => setAvatar(key)} title={label}
                className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                  avatar === key
                    ? "border-amber bg-amber-soft text-amber scale-110"
                    : "border-border bg-parchment text-ink-secondary hover:border-amber/40 hover:text-amber"
                }`}
                aria-label={label} aria-pressed={avatar === key}
              >
                <Icon size={18} strokeWidth={1.75} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="display-name" className="input-label">Nama tampilan</label>
          <input id="display-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" />
        </div>

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
            <AtSign size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              id="username" type="text"
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
            <p className="input-hint">{usernameError || "Huruf kecil, angka, underscore. Tidak bisa diubah setelah disimpan."}</p>
          )}
          {usernameAlreadySet && (
            <Link href={`/u/${session.memberUsername}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-amber mt-1 hover:text-amber-hover">
              <ExternalLink size={11} strokeWidth={2} />
              mulaibaca.id/u/{session.memberUsername}
            </Link>
          )}
        </div>

        <div>
          <label htmlFor="birth-date" className="input-label">Tanggal lahir</label>
          <input id="birth-date" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input mt-1" max={new Date().toISOString().split("T")[0]} />
          {session.memberAge !== null && <p className="input-hint">{session.memberAge} tahun</p>}
        </div>

        <div>
          <label htmlFor="bio" className="input-label">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            rows={2}
            placeholder="Ceritakan sedikit tentang dirimu…"
            className="input mt-1 resize-none"
          />
          <p className="input-hint">{bio.length}/200</p>
        </div>

        <div className="divider" />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target size={15} strokeWidth={2} className="text-amber" />
            <h3 className="font-semibold text-ink text-sm">Target membaca mingguan</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[25, 50, 100, 150].map((preset) => (
              <button key={preset} type="button" onClick={() => setWeeklyGoal(preset)}
                className={`min-h-[40px] px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                  weeklyGoal === preset ? "border-amber bg-amber text-white" : "border-border bg-parchment text-ink-secondary hover:border-amber/50"
                }`}
              >{preset} hal</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input type="number" min={0} max={999} value={weeklyGoal || ""} onChange={(e) => setWeeklyGoal(Math.max(0, parseInt(e.target.value) || 0))} placeholder="Atau ketik sendiri" className="input flex-1" />
            {weeklyGoal > 0 && <button type="button" onClick={() => setWeeklyGoal(0)} className="btn-ghost-ink px-3 text-sm">Hapus</button>}
          </div>
        </div>
      </div>

      {/* Setup akun for dummy */}
      {actingAsInfo?.isDummy && !setupSuccess && (
        <div className="card-elevated p-6 space-y-4">
          <div>
            <h2 className="text-h3">Setup Akun</h2>
            <p className="text-xs text-ink-muted mt-1">Atur email dan password agar bisa login mandiri.</p>
          </div>
          <div>
            <label htmlFor="setup-email" className="input-label">Email</label>
            <input id="setup-email" type="email" placeholder="nama@email.com" value={setupEmail} onChange={(e) => setSetupEmail(e.target.value)} className="input mt-1" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="setup-password" className="input-label">Password</label>
            <input id="setup-password" type="password" placeholder="Minimal 6 karakter" value={setupPassword} onChange={(e) => setSetupPassword(e.target.value)} className="input mt-1" autoComplete="new-password" />
          </div>
          {setupError && <p role="alert" className="text-error text-sm text-center bg-error-soft rounded-xl px-4 py-3">{setupError}</p>}
          <button onClick={handleSetup} disabled={setupLoading || !setupEmail.trim() || setupPassword.length < 6} className="btn-primary-full-lg">
            {setupLoading ? "Menyimpan…" : "Simpan Email & Password →"}
          </button>
        </div>
      )}

      {/* Lingkar Baca */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 flex items-center gap-1.5">
            <Users size={16} strokeWidth={2} className="text-amber" />
            Lingkar Baca
          </h2>
          <Link href="/lingkar-baca/saya" className="flex items-center gap-1.5 text-xs font-semibold text-amber hover:text-amber/80 transition-colors">
            <Users size={13} strokeWidth={2} /> Kelola
          </Link>
        </div>
        <p className="text-xs text-ink-muted">
          <span className="font-semibold text-ink">{session.familyName}</span> · {session.memberRole === "admin" ? "Admin" : "Anggota"}
        </p>
        <Link href="/lingkar-baca/saya" className="btn-secondary w-full text-sm flex items-center justify-center gap-1.5">
          Buka Dashboard Lingkar
        </Link>
      </div>

      {/* Join link */}
      {stats.familyMemberCount === 1 && (
        <div className="card-elevated p-6 space-y-4">
          <h2 className="text-h3 flex items-center gap-2">
            <LogIn size={16} strokeWidth={2} className="text-ink-muted" />
            Gabung ke Lingkar Baca
          </h2>
          <p className="text-xs text-ink-muted">Masukkan kode undangan dari admin lingkar bacamu.</p>
          <form onSubmit={handleJoin} className="flex gap-2">
            <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Kode undangan" maxLength={10} className="input flex-1 font-mono uppercase tracking-widest" />
            <button type="submit" disabled={joinLoading || !joinCode.trim()} className="btn-primary px-4 text-sm disabled:opacity-40">
              {joinLoading ? "…" : "Gabung"}
            </button>
          </form>
          {joinError && <p className="text-error text-sm">{joinError}</p>}
          {joinSuccess && <p className="text-forest text-sm flex items-center gap-1.5"><Check size={14} strokeWidth={2.5} />{joinSuccess}</p>}
        </div>
      )}

      {/* Pengingat baca */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {reminderEnabled ? <Bell size={15} strokeWidth={2} className="text-amber" /> : <BellOff size={15} strokeWidth={2} className="text-ink-muted" />}
            <h2 className="text-h3">Pengingat Baca</h2>
          </div>
          <button
            type="button"
            onClick={async () => {
              const next = !reminderEnabled;
              setReminderEnabled(next);
              if (next && "Notification" in window && Notification.permission === "default") {
                await Notification.requestPermission();
              }
              if (next && "serviceWorker" in navigator && "PushManager" in window) {
                try {
                  const reg = await navigator.serviceWorker.ready;
                  const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(
                      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""
                    ),
                  });
                  await fetch("/api/notifications/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(sub.toJSON()),
                  });
                } catch {}
              }
              if (!next && "serviceWorker" in navigator) {
                try {
                  const reg = await navigator.serviceWorker.ready;
                  const sub = await reg.pushManager.getSubscription();
                  if (sub) {
                    await fetch("/api/notifications/unsubscribe", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ endpoint: sub.endpoint }),
                    });
                    await sub.unsubscribe();
                  }
                } catch {}
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${reminderEnabled ? "bg-amber" : "bg-border"}`}
            role="switch"
            aria-checked={reminderEnabled}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${reminderEnabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        <p className="text-xs text-ink-muted">Dapatkan notifikasi untuk mengingatkan membacamu setiap hari.</p>
        <div>
          <label htmlFor="reminder-time" className="input-label">Jam pengingat</label>
          <input
            id="reminder-time"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="input mt-1"
          />
        </div>
      </div>

      {/* Tampilan */}
      <div className="card-elevated p-6 space-y-4">
        <h2 className="text-h3">Tampilan</h2>
        <p className="text-xs text-ink-muted">Pilih tema tampilan.</p>
        <ThemeToggle />
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

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
