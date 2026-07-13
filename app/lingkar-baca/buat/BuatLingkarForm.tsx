"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BuatLingkarForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Nama lingkar wajib diisi"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/lingkar-baca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/lingkar-baca/saya");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="input-label">Nama Lingkar Baca</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: Keluarga Budi"
            className="input"
            autoFocus
            maxLength={100}
          />
          <p className="text-xs text-ink-muted mt-1.5">
            Nama ini akan terlihat oleh semua anggota lingkar
          </p>
        </div>

        {error && (
          <p className="text-error text-sm text-center bg-error-soft rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary-full-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Menyimpan…</>
          ) : "Buat Lingkar →"}
        </button>
      </form>
    </main>
  );
}
