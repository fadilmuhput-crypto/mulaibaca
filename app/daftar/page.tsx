"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

const STEPS = ["Membuat akun…", "Menyiapkan profil…", "Mengalihkan…"];

export default function DaftarPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    setLoading(true);
    setStep(0);
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
      if (!authData.session) {
        throw new Error("Cek emailmu untuk verifikasi sebelum melanjutkan.");
      }

      setStep(1);
      const res = await fetch("/api/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, accessToken: authData.session.access_token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep(2);
      window.location.href = "/onboarding/buku";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-parchment flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">mulaibaca</Link>
          <p className="mt-2 text-ink-secondary text-sm">Buat akun untuk mulai membaca</p>
        </div>

        <div className="card-elevated overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-border">
            <div
              className="h-full bg-amber transition-all duration-500 ease-out"
              style={{ width: loading ? `${((step + 1) / STEPS.length) * 100}%` : "0%" }}
            />
          </div>

          <div className="p-8">
            <h1 className="text-h2 mb-6">Daftar Akun</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="input-label">Nama tampilan</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Nama kamu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  autoFocus
                  autoComplete="username"
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
                <p className="input-hint">Password minimal 8 karakter</p>
              </div>

              {error && (
                <p role="alert" className="text-error text-sm text-center bg-error-soft rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !username.trim() || !email || password.length < 8}
                className="btn-primary-full-lg mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {STEPS[step]}
                  </>
                ) : "Buat Akun →"}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center text-sm text-ink-muted mt-6 space-y-2">
          <p>
            Sudah punya akun?{" "}
            <Link href="/masuk" className="text-amber hover:text-amber-hover font-medium">Masuk</Link>
          </p>
          <p>
            Punya kode undangan?{" "}
            <Link href="/bergabung" className="text-amber hover:text-amber-hover font-medium">            Gabung dengan kode</Link>
          </p>
          <div className="flex items-center justify-center gap-3 pt-3 text-xs">
            <Link href="/bantuan" className="hover:text-ink transition-colors">Bantuan</Link>
            <span className="text-border">|</span>
            <Link href="/panduan" className="hover:text-ink transition-colors">Panduan</Link>
            <span className="text-border">|</span>
            <Link href="/faq" className="hover:text-ink transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
