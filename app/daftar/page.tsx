"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const AVATARS = ["📖", "🌱", "🦋", "🌟", "🎯", "🦉", "🐻", "🌈"];

export default function DaftarPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | "verify">(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [avatar, setAvatar] = useState("📖");
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
        options: { emailRedirectTo: `${location.origin}/auth/callback?next=/setup-profil` },
      });

      if (authErr) {
        if (authErr.message.toLowerCase().includes("already registered") ||
            authErr.message.toLowerCase().includes("already exists")) {
          throw new Error("Email ini sudah terdaftar. Coba masuk atau gunakan email lain.");
        }
        throw new Error(authErr.message);
      }
      if (!authData.user) throw new Error("Gagal membuat akun");

      // Email confirmation required — session belum ada
      if (!authData.session) {
        setStep("verify");
        setLoading(false);
        return;
      }

      // Email confirmation OFF — langsung buat keluarga
      const res = await fetch("/api/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyName, memberName, memberAvatar: avatar }),
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

  // Email terkirim — tunggu verifikasi
  if (step === "verify") {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">📬</div>
          <h1 className="text-2xl font-display font-bold text-ink mb-2">Cek emailmu</h1>
          <p className="text-ink-secondary mb-1">Kami mengirim link verifikasi ke</p>
          <p className="font-medium text-ink mb-6">{email}</p>
          <p className="text-ink-muted text-sm mb-8">
            Klik link di email untuk melanjutkan pendaftaran. Setelah itu kamu akan diminta mengisi nama dan membuat ruang keluarga.
          </p>
          <button
            onClick={() => setStep(1)}
            className="text-sm text-amber hover:text-amber-hover"
          >
            ← Kembali / ganti email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">
            mulaibaca
          </Link>
          <p className="mt-2 text-ink-secondary text-sm">Buat ruang baca keluargamu</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-amber" : "bg-border"}`} />
            <div className={`flex-1 h-1 rounded-full ${step === 2 ? "bg-amber" : "bg-border"}`} />
          </div>

          {step === 1 && (
            <div>
              <h1 className="text-xl font-display font-semibold text-ink mb-1">Buat akun</h1>
              <p className="text-ink-muted text-sm mb-6">Kamu akan jadi admin ruang keluarga</p>
              <div className="space-y-3">
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
                  placeholder="Password (min. 8 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                />
                <button
                  onClick={() => email && password.length >= 8 && setStep(2)}
                  disabled={!email || password.length < 8}
                  className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h1 className="text-xl font-display font-semibold text-ink mb-1">Profil & keluarga</h1>
              <p className="text-ink-muted text-sm mb-6">Siapa kamu dan nama keluargamu?</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-ink-secondary mb-2 block">Pilih avatar</label>
                  <div className="flex gap-2 flex-wrap">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAvatar(a)}
                        className={`w-11 h-11 text-2xl rounded-xl border-2 transition-all ${
                          avatar === a ? "border-amber bg-amber-soft scale-110" : "border-border bg-parchment hover:border-amber/50"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Nama kamu"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Nama keluarga (cth: Keluarga Putra)"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !memberName.trim() || !familyName.trim()}
                  className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40"
                >
                  {loading ? "Membuat ruang…" : "Mulai Membaca →"}
                </button>
                <button type="button" onClick={() => setStep(1)} className="w-full py-2 text-sm text-ink-muted hover:text-ink">
                  ← Kembali
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-ink-muted mt-6">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="text-amber hover:text-amber-hover font-medium">Masuk</Link>
        </p>
        <p className="text-center text-sm text-ink-muted mt-2">
          Punya kode undangan?{" "}
          <Link href="/bergabung" className="text-amber hover:text-amber-hover font-medium">Bergabung ke keluarga</Link>
        </p>
      </div>
    </div>
  );
}
