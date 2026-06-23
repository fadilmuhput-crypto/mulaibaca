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
        // Email confirmation required — shouldn't happen if disabled in Supabase
        throw new Error("Cek emailmu untuk verifikasi sebelum melanjutkan.");
      }

      const res = await fetch("/api/daftar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authData.session.access_token}`,
        },
        body: JSON.stringify({ username }),
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
          <p className="mt-2 text-ink-secondary text-sm">Buat akun untuk mulai membaca bersama keluarga</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
          <h1 className="text-xl font-display font-semibold text-ink mb-6">Daftar</h1>
          <form onSubmit={handleSubmit} className="space-y-3">
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
              {loading ? "Membuat akun…" : "Daftar →"}
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
