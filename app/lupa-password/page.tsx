"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { CheckCircle } from "lucide-react";

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });
      if (err) throw new Error(err.message);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">mulaibaca</Link>
          <p className="mt-2 text-ink-secondary text-sm">Reset password akunmu</p>
        </div>

        <div className="card-elevated overflow-hidden">
          <div className="p-8">
            {sent ? (
              <div className="text-center py-4">
                <div className="flex justify-center text-forest mb-4">
                  <CheckCircle size={48} strokeWidth={1.25} />
                </div>
                <h1 className="text-h2 mb-2">Email terkirim!</h1>
                <p className="text-sm text-ink-secondary mb-6">
                  Kami telah mengirim link reset password ke <strong>{email}</strong>. Cek inbox atau folder spam kamu.
                </p>
                <Link href="/masuk" className="btn-secondary">
                  ← Kembali ke halaman masuk
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-h2 mb-2">Lupa password?</h1>
                <p className="text-sm text-ink-secondary mb-6">
                  Masukkan email akunmu dan kami akan mengirimkan link untuk reset password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
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

                  {error && (
                    <p role="alert" className="text-error text-sm text-center bg-error-soft rounded-xl px-4 py-3">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="btn-primary-full-lg mt-2"
                  >
                    {loading ? "Mengirim…" : "Kirim Link Reset →"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-ink-muted mt-6">
          Ingat password?{" "}
          <Link href="/masuk" className="text-amber hover:text-amber-hover font-medium">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
