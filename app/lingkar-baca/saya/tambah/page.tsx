"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AVATAR_OPTIONS } from "@/components/AvatarIcon";
import BackButton from "@/components/BackButton";

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

export default function TambahAnakPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("book");
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
          memberType: "anak",
          birthDate,
        }),
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
    <div className="min-h-dvh flex flex-col bg-parchment">
      <header className="bg-surface border-b-2 border-ink px-4 py-3 flex items-center gap-2 sticky top-0 z-10">
        <BackButton />
        <h1 className="font-semibold text-ink text-sm">Tambah Akun Anak</h1>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <p className="text-xs text-ink-muted mb-6 leading-relaxed">
          Buatkan akun bacaan untuk anak yang belum punya email. Kamu bisa kelola
          progres dan pantau bacaannya dari dashboard.
        </p>
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
              <div className="mt-2 flex items-center gap-2 bg-amber-soft border border-amber/30 rounded-xl px-3 py-2">
                <span className="text-xs font-semibold text-amber">{age} tahun</span>
                <span className="text-[10px] text-amber/40">|</span>
                <span className="text-[11px] text-ink-muted">{ageLabel}</span>
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
              {AVATAR_OPTIONS.map((opt) => {
                const Icon = opt.Icon;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setAvatar(opt.key)}
                    className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${
                      avatar === opt.key
                        ? "border-amber bg-amber-soft text-amber"
                        : "border-border bg-surface text-ink-secondary hover:border-amber/40 hover:text-amber"
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs text-error text-center bg-error-soft border border-error/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn-primary-full-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Menyimpan…</>
            ) : "Tambah Akun Anak →"}
          </button>
        </form>
      </main>
    </div>
  );
}
