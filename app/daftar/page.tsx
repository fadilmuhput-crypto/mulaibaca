"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AVATARS = ["📖", "🌱", "🦋", "🌟", "🎯", "🦉", "🐻", "🌈"];

export default function DaftarPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [familyName, setFamilyName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [avatar, setAvatar] = useState("📖");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (pin !== confirmPin) {
      setError("PIN tidak sama");
      return;
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("PIN harus 4 angka");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/daftar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyName, memberName, memberAvatar: avatar, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-display font-bold text-forest">
            mulaibaca
          </Link>
          <p className="mt-2 text-ink-secondary text-sm">Buat ruang baca keluargamu</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-amber" : "bg-border"}`} />
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-amber" : "bg-border"}`} />
          </div>

          {step === 1 && (
            <div>
              <h1 className="text-xl font-display font-semibold text-ink mb-1">
                Nama keluargamu
              </h1>
              <p className="text-ink-muted text-sm mb-6">
                Ini akan menjadi nama ruang baca keluargamu
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="cth: Keluarga Putra"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
                  autoFocus
                />
                <button
                  onClick={() => familyName.trim() && setStep(2)}
                  disabled={!familyName.trim()}
                  className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Lanjut →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h1 className="text-xl font-display font-semibold text-ink mb-1">
                Profil kamu
              </h1>
              <p className="text-ink-muted text-sm mb-6">
                Kamu akan jadi admin keluarga {familyName}
              </p>
              <div className="space-y-4">
                {/* Avatar picker */}
                <div>
                  <label className="text-sm font-medium text-ink-secondary mb-2 block">
                    Pilih avatar
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setAvatar(a)}
                        className={`w-11 h-11 text-2xl rounded-xl border-2 transition-all ${
                          avatar === a
                            ? "border-amber bg-amber-soft scale-110"
                            : "border-border bg-parchment hover:border-amber/50"
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

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="PIN (4 angka)"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber text-center tracking-[0.5em] font-mono"
                  />
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Ulangi PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber text-center tracking-[0.5em] font-mono"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !memberName.trim() || pin.length !== 4}
                  className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Membuat ruang…" : "Mulai Membaca →"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  ← Kembali
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-ink-muted mt-6">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="text-amber hover:text-amber-hover font-medium">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
