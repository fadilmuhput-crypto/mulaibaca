"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";

const AVATARS = ["book", "star", "heart", "sun", "moon", "tree", "flower", "rocket", "cat", "dog", "fish", "bear"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 18 }, (_, i) => CURRENT_YEAR - i);

const MEMBER_TYPES = [
  { value: "anak", label: "Anak" },
  { value: "ayah", label: "Ayah" },
  { value: "ibu", label: "Ibu" },
  { value: "dewasa", label: "Dewasa lainnya" },
];

export default function TambahAnakPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("book");
  const [memberType, setMemberType] = useState("anak");
  const [birthYear, setBirthYear] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Nama wajib diisi"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/keluarga/anggota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          avatar,
          memberType,
          birthYear: birthYear ? parseInt(birthYear) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/keluarga");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-parchment flex flex-col">
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/keluarga" className="p-2 -ml-2 rounded-lg hover:bg-parchment transition-colors">
          <ChevronLeft size={20} strokeWidth={2} className="text-ink" />
        </Link>
        <h1 className="font-semibold text-ink">Tambah Anggota</h1>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="input-label">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama anggota"
              className="input"
              autoFocus
              maxLength={50}
            />
          </div>

          {/* Member type */}
          <div>
            <label className="input-label">Peran dalam keluarga</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {MEMBER_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setMemberType(t.value)}
                  className={`py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    memberType === t.value
                      ? "border-amber bg-amber-soft text-amber"
                      : "border-border bg-surface text-ink-secondary hover:border-amber/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Birth year */}
          <div>
            <label className="input-label">
              Tahun lahir <span className="text-ink-muted font-normal">(opsional)</span>
            </label>
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="input bg-surface"
            >
              <option value="">— Pilih tahun —</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y} ({CURRENT_YEAR - y} tahun)</option>
              ))}
            </select>
            <p className="text-xs text-ink-muted mt-1">
              Digunakan untuk rekomendasi buku yang sesuai usia
            </p>
          </div>

          {/* Avatar */}
          <div>
            <label className="input-label">Avatar</label>
            <div className="grid grid-cols-6 gap-2 mt-1">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`aspect-square rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                    avatar === a
                      ? "border-amber bg-amber-soft"
                      : "border-border bg-surface hover:border-amber/40"
                  }`}
                >
                  {a === "book" ? "📖" : a === "star" ? "⭐" : a === "heart" ? "❤️" : a === "sun" ? "☀️" : a === "moon" ? "🌙" : a === "tree" ? "🌳" : a === "flower" ? "🌸" : a === "rocket" ? "🚀" : a === "cat" ? "🐱" : a === "dog" ? "🐶" : a === "fish" ? "🐟" : "🐻"}
                </button>
              ))}
            </div>
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
            ) : "Tambah Anggota →"}
          </button>
        </form>
      </main>
    </div>
  );
}
