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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode,
          username,
          accessToken: authData.session.access_token,
        }),
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
    <div className="min-h-dvh bg-parchment flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">mulaibaca</Link>
          <p className="mt-2 text-ink-secondary text-sm">Bergabung ke ruang baca keluarga</p>
        </div>

        <div className="card-elevated p-8">
          {/* Step progress */}
          <div className="flex gap-2 mb-8">
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? "bg-amber" : "bg-border"}`} />
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? "bg-amber" : "bg-border"}`} />
          </div>

          {step === 1 && (
            <div>
              <h1 className="text-h2 mb-1">Masukkan kode undangan</h1>
              <p className="text-ink-muted text-sm mb-6">Minta kode dari admin keluargamu</p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="KODE8KAR"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="input font-mono text-center text-lg tracking-[0.3em] uppercase"
                  maxLength={8}
                  autoFocus
                />
                <button
                  onClick={() => inviteCode.length >= 6 && setStep(2)}
                  disabled={inviteCode.length < 6}
                  className="btn-primary-full-lg"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h1 className="text-h2 mb-1">Buat akun</h1>
              <p className="text-ink-muted text-sm mb-6">Daftarkan dirimu untuk bergabung</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="input-label">Nama tampilan</label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Nama kamu di keluarga"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input"
                    autoFocus
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="input-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="input-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <p role="alert" className="text-error text-sm text-center bg-error-soft rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !username.trim() || !email || password.length < 8}
                  className="btn-primary-full-lg"
                >
                  {loading ? "Bergabung…" : "Bergabung →"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-ghost-ink w-full"
                >
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
