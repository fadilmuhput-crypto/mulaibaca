"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Suspense } from "react";
import { Loader2, ChevronLeft } from "lucide-react";

const STEPS = ["Memverifikasi akun…", "Menyiapkan sesi…", "Mengalihkan…"];

function MasukForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(
    errorParam === "auth_callback_failed" ? "Login gagal, coba lagi." : ""
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
      document.body.focus?.();
    }
    setLoading(true);
    try {
      const supabase = createClient();
      setStep(1);
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) throw new Error(authErr.message);
      setStep(1);
      await new Promise((r) => setTimeout(r, 300));
      setStep(2);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email atau password salah");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-ink mb-4" aria-label="Kembali">
          <ChevronLeft size={16} strokeWidth={2} />
          Kembali
        </Link>
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">mulaibaca</Link>
          <p className="mt-2 text-ink-secondary text-sm">Masuk untuk lanjutkan kebiasaan membaca</p>
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
            <h1 className="text-h2 mb-6">Masuk</h1>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="input-label">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  autoFocus
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="input-label mb-0">Password</label>
                  <Link href="/lupa-password" className="text-xs text-amber hover:text-amber-hover font-medium">
                    Lupa password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              {error && (
                <p role="alert" className="text-error text-sm text-center bg-error-soft rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                className="btn-primary-full-lg mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {STEPS[step]}
                  </>
                ) : "Masuk →"}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center text-sm text-ink-muted mt-6 space-y-2">
          <p>
            Belum punya akun?{" "}
            <Link href="/daftar" className="text-amber hover:text-amber-hover font-medium">Daftar</Link>
          </p>
          <p>
            Punya kode undangan?{" "}
            <Link href="/lingkar-baca/gabung" className="text-amber hover:text-amber-hover font-medium">Gabung</Link>
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

export default function MasukPage() {
  return (
    <Suspense fallback={null}>
      <MasukForm />
    </Suspense>
  );
}
