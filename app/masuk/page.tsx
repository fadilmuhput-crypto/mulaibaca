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

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">mulaibaca</Link>
          <p className="mt-2 text-ink-secondary text-sm">Masuk ke ruang baca keluargamu</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
          <h1 className="text-xl font-display font-semibold text-ink mb-6">Masuk</h1>
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
