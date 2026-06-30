"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";

const AVATARS = ["book", "star", "heart", "sun", "moon", "tree", "flower", "rocket", "cat", "dog", "fish", "bear"];
const AVATAR_EMOJI: Record<string, string> = {
  book: "📖", star: "⭐", heart: "❤️", sun: "☀️", moon: "🌙", tree: "🌳",
  flower: "🌸", rocket: "🚀", cat: "🐱", dog: "🐶", fish: "🐟", bear: "🐻",
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 18 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function computeAge(day: string, month: string, year: string): number | null {
  if (!day || !month || !year) return null;
  const today = new Date();
  const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  let age = today.getFullYear() - dob.getFullYear();
  const notYet =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (notYet) age--;
  return age;
}

function ageGroupLabel(age: number | null): string {
  if (age === null) return "";
  if (age <= 3) return "Balita (0–3) · buku bergambar";
  if (age <= 8) return "Anak Awal (4–8) · cerita rakyat & early reader";
  if (age <= 12) return "Anak Akhir (9–12) · chapter book & novel";
  return "Remaja (13+)";
}

const MEMBER_TYPES = [
  { value: "anak", label: "Anak" },
  { value: "ayah", label: "Ayah" },
  { value: "ibu", label: "Ibu" },
  { value: "dewasa", label: "Dewasa" },
];

export default function TambahAnakPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("book");
  const [memberType, setMemberType] = useState("anak");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const daysInMonth = month && year ? getDaysInMonth(parseInt(month), parseInt(year)) : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
  const age = computeAge(day, month, year);
  const ageLabel = ageGroupLabel(age);

  // Build ISO date string for API
  const birthDate = day && month && year
    ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    : null;

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
          birthDate,
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
    <div className="min-h-dvh flex flex-col">
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

          {/* Date of birth */}
          <div>
            <label className="input-label">
              Tanggal lahir <span className="text-ink-muted font-normal">(opsional)</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="input bg-surface text-sm"
              >
                <option value="">Tgl</option>
                {days.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  // Reset day if it's now out of range
                  if (day && year) {
                    const max = getDaysInMonth(parseInt(e.target.value), parseInt(year));
                    if (parseInt(day) > max) setDay(String(max));
                  }
                }}
                className="input bg-surface text-sm"
              >
                <option value="">Bulan</option>
                {MONTHS.map((m, i) => (
                  <option key={i + 1} value={String(i + 1)}>{m}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input bg-surface text-sm"
              >
                <option value="">Tahun</option>
                {YEARS.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>

            {/* Age preview */}
            {age !== null && (
              <div className="mt-2 flex items-center gap-2 bg-amber-soft rounded-xl px-3 py-2">
                <span className="text-sm font-semibold text-amber">{age} tahun</span>
                <span className="text-xs text-ink-muted">·</span>
                <span className="text-xs text-ink-secondary">{ageLabel}</span>
              </div>
            )}
            {!age && (
              <p className="text-xs text-ink-muted mt-1.5">
                Digunakan untuk rekomendasi buku yang sesuai usia
              </p>
            )}
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
                  {AVATAR_EMOJI[a]}
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
