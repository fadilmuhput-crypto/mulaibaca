"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@/lib/session";
import type { ProfilStats, ActingAsInfo, FamilyMember } from "./page";
import AvatarIcon, { AVATAR_OPTIONS } from "@/components/AvatarIcon";
import { Check, AtSign, Lock, ExternalLink, Users, Target, Trophy, Baby, Smile, Heart, User, LogIn } from "lucide-react";
import Link from "next/link";
import KeluargaTooltip from "@/components/KeluargaTooltip";

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
  const checkRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkSeq = useRef(0);
  const usernameAlreadySet = !!session.memberUsername;

  const isDirty =
    name !== session.memberName ||
    avatar !== session.memberAvatar ||
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
        name, avatar, birthDate, familyName,
        weeklyPagesGoal: weeklyGoal, memberType,
        familyWeeklyChallenge: weeklyChallenge,
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
      const res = await fetch("/api/keluarga/gabung", {
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

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl p-3 text-center border border-border">
          <div className="font-display text-2xl font-black text-ink leading-none">{stats.booksFinished}</div>
          <div className="text-[10px] text-ink-muted mt-1 font-medium">Buku Selesai</div>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center border border-border">
          <div className="font-display text-2xl font-black text-ink leading-none">
            {stats.totalPagesRead >= 1000 ? `${(stats.totalPagesRead / 1000).toFixed(1)}k` : stats.totalPagesRead}
          </div>
          <div className="text-[10px] text-ink-muted mt-1 font-medium">Total Halaman</div>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center border border-border">
          <div className="font-display text-2xl font-black text-ink leading-none">{stats.longestStreak}</div>
          <div className="text-[10px] text-ink-muted mt-1 font-medium">Streak Terpanjang</div>
        </div>
      </div>

      {/* Edit profile card */}
      <div className="card-elevated p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-soft border-2 border-amber/30 flex items-center justify-center text-amber">
            <AvatarIcon avatar={avatar} size={24} />
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

      {/* Family */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h3 flex items-center gap-1.5">
            Keluarga
            <KeluargaTooltip />
          </h2>
          {session.memberRole === "admin" && (
            <Link href="/keluarga" className="flex items-center gap-1.5 text-xs font-semibold text-amber hover:text-amber/80 transition-colors">
              <Users size={13} strokeWidth={2} /> Kelola anggota
            </Link>
          )}
        </div>

        {familyMembers.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {familyMembers.map((m) => (
              <div key={m.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  m.id === session.memberId ? "border-amber bg-amber-soft text-amber" : "border-border bg-surface text-ink-secondary"
                }`}>
                  <AvatarIcon avatar={m.avatar} size={18} />
                </div>
                <span className="text-[10px] text-ink-muted max-w-[40px] truncate text-center leading-tight">{m.name}</span>
              </div>
            ))}
            {session.memberRole === "admin" && (
              <Link href="/keluarga/tambah-anak" className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed border-border bg-surface text-ink-muted hover:border-amber/50 hover:text-amber transition-colors">
                  <span className="text-lg leading-none">+</span>
                </div>
                <span className="text-[10px] text-ink-muted">Tambah</span>
              </Link>
            )}
          </div>
        )}

        <div>
          <label className="input-label mb-2 block">Kamu adalah</label>
          <div className="space-y-2">
            {MEMBER_TYPES.map((t) => {
              const Icon = t.icon;
              const selected = memberType === t.key;
              return (
                <button key={t.key} type="button" onClick={() => setMemberType(t.key)}
                  className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                    selected ? "border-amber bg-amber text-white" : "border-border bg-parchment text-ink-secondary hover:border-amber/40"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected ? "bg-white/20" : "bg-surface"}`}>
                    <Icon size={16} strokeWidth={1.75} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{t.label}</p>
                    <p className={`text-xs ${selected ? "text-white/70" : "text-ink-muted"}`}>{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {session.memberRole === "admin" ? (
          <>
            <div>
              <label htmlFor="family-name" className="input-label">Nama keluarga</label>
              <input id="family-name" type="text" value={familyName} onChange={(e) => setFamilyName(e.target.value)} className="input mt-1" />
            </div>
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy size={14} strokeWidth={2} className="text-amber" />
                <label className="input-label">Challenge keluarga per minggu</label>
              </div>
              <p className="text-xs text-ink-muted -mt-1">Target halaman bersama seluruh anggota keluarga</p>
              <div className="flex gap-2 flex-wrap">
                {[100, 200, 300, 500].map((preset) => (
                  <button key={preset} type="button" onClick={() => setWeeklyChallenge(preset)}
                    className={`min-h-[36px] px-3 rounded-xl text-xs font-medium border-2 transition-all ${
                      weeklyChallenge === preset ? "border-amber bg-amber text-white" : "border-border bg-parchment text-ink-secondary hover:border-amber/50"
                    }`}
                  >{preset} hal</button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input type="number" min={0} max={9999} value={weeklyChallenge || ""} onChange={(e) => setWeeklyChallenge(Math.max(0, parseInt(e.target.value) || 0))} placeholder="Atau ketik sendiri" className="input flex-1" />
                {weeklyChallenge > 0 && <button type="button" onClick={() => setWeeklyChallenge(0)} className="btn-ghost-ink px-3 text-sm">Hapus</button>}
              </div>
              {weeklyChallenge > 0 && (
                <p className="text-xs text-amber bg-amber-soft rounded-lg px-3 py-2">
                  Challenge: <span className="font-semibold">{weeklyChallenge} halaman/minggu</span> bersama keluarga
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <p className="text-overline">Nama keluarga</p>
            <p className="text-ink font-medium">{session.familyName}</p>
          </div>
        )}
      </div>

      {/* Join another family */}
      {stats.familyMemberCount === 1 && (
        <div className="card-elevated p-6 space-y-4">
          <h2 className="text-h3 flex items-center gap-2">
            <LogIn size={16} strokeWidth={2} className="text-ink-muted" />
            Gabung ke keluarga
          </h2>
          <p className="text-xs text-ink-muted">Masukkan kode undangan dari anggota keluargamu.</p>
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
