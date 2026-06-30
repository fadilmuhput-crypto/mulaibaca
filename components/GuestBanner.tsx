"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { trackUpgrade } from "@/lib/analytics";

export default function GuestBanner() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleUpgrade(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Re-auth with the new permanent credentials so session cookie refreshes
      const supabase = createClient();
      await supabase.auth.signInWithPassword({ email, password });

      trackUpgrade();
      setDone(true);
      setTimeout(() => {
        setModalOpen(false);
        router.refresh();
      }, 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat akun");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Banner */}
      <div
        className="w-full flex items-center justify-between gap-3 px-4 py-2"
        style={{ backgroundColor: "#C26E2A", borderBottom: "1.5px solid #0C0C0A" }}
      >
        <p className="text-white text-xs font-medium flex-1 text-center">
          Mode Tamu — data tidak disimpan permanen.{" "}
          <button
            onClick={() => setModalOpen(true)}
            className="underline font-bold hover:no-underline"
          >
            Buat akun gratis →
          </button>
        </p>
      </div>

      {/* Upgrade Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md bg-surface rounded-t-3xl sm:rounded-2xl p-6 space-y-4"
            style={{ border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal)" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-h3 flex items-center gap-2">
                  <UserPlus size={18} strokeWidth={1.75} className="text-amber" />
                  Buat Akun
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  Data yang sudah kamu tambahkan akan tetap tersimpan.
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-muted hover:text-ink"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {done ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-3">
                  <Check size={24} strokeWidth={2} className="text-forest" />
                </div>
                <p className="font-semibold text-ink">Akun berhasil dibuat!</p>
                <p className="text-sm text-ink-muted mt-1">Selamat datang di mulaibaca.</p>
              </div>
            ) : (
              <form onSubmit={handleUpgrade} className="space-y-4">
                <div>
                  <label htmlFor="upgrade-name" className="input-label">Nama</label>
                  <input
                    id="upgrade-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama tampilan"
                    className="input mt-1"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label htmlFor="upgrade-email" className="input-label">Email</label>
                  <input
                    id="upgrade-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="input mt-1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="upgrade-pw" className="input-label">Password</label>
                  <input
                    id="upgrade-pw"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="input mt-1"
                    required
                    minLength={6}
                  />
                </div>
                {error && (
                  <p className="text-error text-sm bg-error-soft rounded-xl px-4 py-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-full-lg"
                >
                  {saving ? "Membuat akun…" : "Buat Akun & Simpan Data"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
