"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Password tidak cocok");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw new Error(err.message);
      router.push("/dashboard");
      router.refresh();
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
          <p className="mt-2 text-ink-secondary text-sm">Buat password baru</p>
        </div>

        <div className="card-elevated overflow-hidden">
          <div className="p-8">
            <h1 className="text-h2 mb-6">Password baru</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="input-label">Password baru</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  autoFocus
                  autoComplete="new-password"
                  disabled={loading}
                />
                <p className="input-hint">Minimal 8 karakter</p>
              </div>
              <div>
                <label htmlFor="confirm" className="input-label">Konfirmasi password</label>
                <input
                  id="confirm"
                  type="password"
                  placeholder="Ulangi password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input"
                  autoComplete="new-password"
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
                disabled={loading || !password || !confirm}
                className="btn-primary-full-lg mt-2"
              >
                {loading ? "Menyimpan…" : "Simpan Password →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
