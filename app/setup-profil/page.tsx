"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AVATARS = ["📖", "🌱", "🦋", "🌟", "🎯", "🦉", "🐻", "🌈"];

export default function SetupProfilPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"new" | "join" | null>(null);
  const [memberName, setMemberName] = useState("");
  const [avatar, setAvatar] = useState("📖");
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
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">mulaibaca</Link>
          <p className="mt-2 text-ink-secondary text-sm mb-8">Satu langkah lagi untuk mulai</p>
          <div className="space-y-3">
            <button
              onClick={() => setMode("new")}
              className="w-full py-4 rounded-2xl bg-forest text-white font-medium hover:bg-forest-dark transition-colors"
            >
              🏠 Buat ruang keluarga baru
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-4 rounded-2xl border-2 border-border bg-surface text-ink font-medium hover:border-amber/50 transition-all"
            >
              🔗 Bergabung ke keluarga (punya kode undangan)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">mulaibaca</Link>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
          <h1 className="text-xl font-display font-semibold text-ink mb-1">
            {mode === "new" ? "Buat ruang keluarga" : "Bergabung ke keluarga"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="text-sm font-medium text-ink-secondary mb-2 block">Avatar</label>
              <div className="flex gap-2 flex-wrap">
                {AVATARS.map((a) => (
                  <button key={a} type="button" onClick={() => setAvatar(a)}
                    className={`w-11 h-11 text-2xl rounded-xl border-2 transition-all ${avatar === a ? "border-amber bg-amber-soft scale-110" : "border-border bg-parchment"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <input type="text" placeholder="Nama kamu" value={memberName}
              onChange={(e) => setMemberName(e.target.value)} autoFocus
              className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber" />
            {mode === "new" ? (
              <input type="text" placeholder="Nama keluarga" value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber" />
            ) : (
              <input type="text" placeholder="Kode undangan" value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toLowerCase())} maxLength={8}
                className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber font-mono text-center tracking-widest uppercase" />
            )}
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" disabled={loading || !memberName.trim()}
              className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40">
              {loading ? "Menyimpan…" : "Selesai →"}
            </button>
            <button type="button" onClick={() => setMode(null)} className="w-full py-2 text-sm text-ink-muted hover:text-ink">← Kembali</button>
          </form>
        </div>
      </div>
    </div>
  );
}
