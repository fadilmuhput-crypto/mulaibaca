"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AVATAR_OPTIONS } from "@/components/AvatarIcon";
import { Home, Link as LinkIcon } from "lucide-react";

export default function SetupProfilPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"new" | "join" | null>(null);
  const [memberName, setMemberName] = useState("");
  const [avatar, setAvatar] = useState("book");
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "new" ? "/api/daftar" : "/api/bergabung";
      const body = mode === "new"
        ? { familyName, memberName, memberAvatar: avatar }
        : { inviteCode, memberName, memberAvatar: avatar };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const dest = mode === "join" ? "/dashboard" : "/onboarding/buku";
      window.location.href = dest;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (!mode) {
    return (
      <div className="min-h-dvh bg-parchment flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="font-display font-black text-h1 text-forest">mulaibaca</Link>
            <p className="mt-2 text-ink-secondary text-sm">Satu langkah lagi untuk mulai</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setMode("new")}
              className="btn-primary-full-lg flex items-center justify-center gap-2"
            >
              <Home size={18} strokeWidth={2} /> Buat ruang keluarga baru
            </button>
            <button
              onClick={() => setMode("join")}
              className="btn-secondary-full flex items-center justify-center gap-2"
            >
              <LinkIcon size={18} strokeWidth={2} /> Punya kode undangan? Bergabung
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-parchment flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="font-display font-black text-h1 text-forest">mulaibaca</Link>
        </div>
        <div className="card-elevated p-8">
          <h1 className="text-h2 mb-6">
            {mode === "new" ? "Buat ruang keluarga" : "Bergabung ke keluarga"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Avatar</label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {AVATAR_OPTIONS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAvatar(key)}
                    title={label}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
                      avatar === key
                        ? "bg-amber-soft text-amber brutal-border scale-105"
                        : "border border-border bg-parchment text-ink-secondary hover:border-amber/50 hover:text-amber"
                    }`}
                    aria-label={label}
                    aria-pressed={avatar === key}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="memberName" className="input-label">Nama kamu <span className="text-error">*</span></label>
              <input
                id="memberName"
                type="text"
                placeholder="cth: Ayah Budi"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                autoFocus
                className="input mt-1"
              />
            </div>

            {mode === "new" ? (
              <div>
                <label htmlFor="familyName" className="input-label">Nama keluarga <span className="text-error">*</span></label>
                <input
                  id="familyName"
                  type="text"
                  placeholder="cth: Keluarga Budi"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="input mt-1"
                />
              </div>
            ) : (
              <div>
                <label htmlFor="inviteCode" className="input-label">Kode undangan <span className="text-error">*</span></label>
                <input
                  id="inviteCode"
                  type="text"
                  placeholder="Masukkan kode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
                  maxLength={8}
                  className="input mt-1 font-mono text-center tracking-[0.3em] uppercase"
                />
              </div>
            )}

            {error && <p className="input-error-msg text-center bg-error-soft rounded-xl px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading || !memberName.trim()}
              className="btn-primary-full-lg"
            >
              {loading ? "Menyimpan…" : "Selesai →"}
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="btn-ghost-ink w-full text-sm"
            >
              ← Kembali
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
