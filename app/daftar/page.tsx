"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function DaftarPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
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
      if (!authData.session) {
        throw new Error("Cek emailmu untuk verifikasi sebelum melanjutkan.");
      }

      const res = await fetch("/api/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        {/* Brand */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">mulaibaca</Link>
          <p className="mt-2 text-ink-secondary text-sm">Buat akun untuk mulai membaca bersama keluarga</p>
        </div>

        <div className="card-elevated p-8">
          <h1 className="text-h2 mb-6">Daftar Akun</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="btn-primary-full-lg mt-2"
            >
              {loading ? "Membuat akun…" : "Buat Akun →"}
            </button>
          </form>
        </div>

        <div className="text-center text-sm text-ink-muted mt-6 space-y-2">
          <p>
            Sudah punya akun?{" "}
            <Link href="/masuk" className="text-amber hover:text-amber-hover font-medium">Masuk</Link>
          </p>
          <p>
            Punya kode undangan?{" "}
            <Link href="/bergabung" className="text-amber hover:text-amber-hover font-medium">Bergabung ke keluarga</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
