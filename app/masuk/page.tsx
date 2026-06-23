"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Suspense } from "react";

function MasukForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState(
    errorParam === "auth_callback_failed" ? "Login gagal, coba lagi." : ""
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw new Error(authErr.message);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email atau password salah");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoadingGoogle(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">mulaibaca</Link>
          <p className="mt-2 text-ink-secondary text-sm">Masuk ke ruang baca keluargamu</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm space-y-4">
          <h1 className="text-xl font-display font-semibold text-ink">Masuk</h1>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogle}
            disabled={loadingGoogle}
            className="w-full py-3 rounded-xl border-2 border-border bg-surface text-ink font-medium hover:border-amber/50 hover:bg-parchment transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loadingGoogle ? "Mengarahkan…" : "Masuk dengan Google"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-muted">atau</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
              autoFocus
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40"
            >
              {loading ? "Masuk…" : "Masuk →"}
            </button>
          </form>
        </div>

        <div className="text-center text-sm text-ink-muted mt-6 space-y-2">
          <p>
            Belum punya akun?{" "}
            <Link href="/daftar" className="text-amber hover:text-amber-hover font-medium">Daftar</Link>
          </p>
          <p>
            Punya kode undangan?{" "}
            <Link href="/bergabung" className="text-amber hover:text-amber-hover font-medium">Bergabung</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense fallback={null}>
      <MasukForm />
    </Suspense>
  );
}
