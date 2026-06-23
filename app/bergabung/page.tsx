"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function BergabungPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });

      if (authErr) {
        if (authErr.message.toLowerCase().includes("already registered") ||
            authErr.message.toLowerCase().includes("already exists")) {
          throw new Error("Email ini sudah terdaftar. Coba masuk atau gunakan email lain.");
        }
        throw new Error(authErr.message);
      }
      if (!authData.user) throw new Error("Gagal membuat akun");
      if (!authData.session) throw new Error("Cek emailmu untuk verifikasi sebelum melanjutkan.");

      const res = await fetch("/api/bergabung", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData.session.access_token}`,
        },
        body: JSON.stringify({ inviteCode, username }),
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

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">mulaibaca</Link>
          <p className="mt-2 text-ink-secondary text-sm">Bergabung ke ruang baca keluarga</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-amber" : "bg-border"}`} />
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-amber" : "bg-border"}`} />
          </div>

          {step === 1 && (
            <div>
              <h1 className="text-xl font-display font-semibold text-ink mb-1">Masukkan kode undangan</h1>
              <p className="text-ink-muted text-sm mb-6">Minta kode dari admin keluargamu</p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Kode undangan (8 karakter)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber font-mono text-center tracking-widest uppercase"
                  maxLength={8}
                  autoFocus
                />
                <button
                  onClick={() => inviteCode.length >= 6 && setStep(2)}
                  disabled={inviteCode.length < 6}
                  className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h1 className="text-xl font-display font-semibold text-ink mb-1">Buat akun</h1>
              <p className="text-ink-muted text-sm mb-6">Daftarkan dirimu untuk bergabung</p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Username (nama tampilan)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                  autoFocus
                  autoComplete="username"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                  autoComplete="email"
                />
                <input
                  type="password"
                  placeholder="Password (min. 8 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                  autoComplete="new-password"
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !username.trim() || !email || password.length < 8}
                  className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40"
                >
                  {loading ? "Bergabung…" : "Bergabung →"}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-sm text-ink-muted hover:text-ink">
                  ← Kembali
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-ink-muted mt-6">
          Belum punya kode undangan?{" "}
          <Link href="/daftar" className="text-amber hover:text-amber-hover font-medium">Buat keluarga baru</Link>
        </p>
      </div>
    </div>
  );
}
