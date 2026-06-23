"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Member } from "@/lib/types";

type Step = "invite" | "pick" | "pin";

export default function MasukClient({
  savedFamily,
  initialMembers,
  initialFamilyName,
  initialFamilyId,
}: {
  savedFamily: { familyId: string; familyName: string } | null;
  initialMembers: Member[];
  initialFamilyName: string;
  initialFamilyId: string;
}) {
  const router = useRouter();
  const startStep: Step = savedFamily ? "pick" : "invite";

  const [step, setStep] = useState<Step>(startStep);
  const [inviteCode, setInviteCode] = useState("");
  const [familyId, setFamilyId] = useState(initialFamilyId);
  const [familyName, setFamilyName] = useState(initialFamilyName);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: family, error: fErr } = await supabase
        .from("families")
        .select("*")
        .eq("invite_code", inviteCode.trim().toLowerCase())
        .single();

      if (fErr || !family) throw new Error("Kode undangan tidak ditemukan");

      const { data: memberList } = await supabase
        .from("members")
        .select("*")
        .eq("family_id", family.id)
        .order("created_at");

      setFamilyId(family.id);
      setFamilyName(family.name);
      setMembers(memberList ?? []);
      setStep("pick");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMember) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/masuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMember.id, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setPin("");
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
          <p className="mt-2 text-ink-secondary text-sm">
            {familyName ? `Ruang Keluarga ${familyName}` : "Masuk ke ruang keluargamu"}
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-8 shadow-sm">

          {step === "invite" && (
            <form onSubmit={handleInviteSubmit}>
              <h1 className="text-xl font-display font-semibold text-ink mb-1">
                Kode undangan
              </h1>
              <p className="text-ink-muted text-sm mb-6">
                Masukkan kode 8 karakter dari admin keluargamu
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="cth: a1b2c3d4"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-parchment text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber text-center font-mono tracking-widest uppercase"
                  maxLength={8}
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || inviteCode.trim().length < 6}
                  className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40"
                >
                  {loading ? "Mencari…" : "Lanjut →"}
                </button>
              </div>
            </form>
          )}

          {step === "pick" && (
            <div>
              <h1 className="text-xl font-display font-semibold text-ink mb-1">
                Siapa kamu?
              </h1>
              <p className="text-ink-muted text-sm mb-6">
                Pilih profilmu di {familyName}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMember(m); setStep("pin"); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border bg-parchment hover:border-amber hover:bg-amber-soft transition-all"
                  >
                    <span className="text-4xl">{m.avatar}</span>
                    <span className="text-sm font-medium text-ink">{m.name}</span>
                    {m.role === "admin" && (
                      <span className="text-[10px] text-amber font-medium">Admin</span>
                    )}
                  </button>
                ))}
              </div>
              {/* Only show "use different family" if this came from saved cookie */}
              {savedFamily && (
                <button
                  onClick={() => { setStep("invite"); setFamilyName(""); setMembers([]); }}
                  className="w-full mt-4 py-2 text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  Masuk ke keluarga lain
                </button>
              )}
            </div>
          )}

          {step === "pin" && selectedMember && (
            <form onSubmit={handlePinSubmit}>
              <div className="flex flex-col items-center mb-6">
                <span className="text-5xl mb-2">{selectedMember.avatar}</span>
                <h1 className="text-xl font-display font-semibold text-ink">
                  Halo, {selectedMember.name}!
                </h1>
                <p className="text-ink-muted text-sm mt-1">Masukkan PIN-mu</p>
              </div>
              <div className="space-y-4">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="• • • •"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-4 rounded-xl border border-border bg-parchment text-ink focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber text-center tracking-[1em] text-2xl font-mono"
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || pin.length !== 4}
                  className="w-full py-3 rounded-xl bg-amber text-white font-medium hover:bg-amber-hover transition-colors disabled:opacity-40"
                >
                  {loading ? "Masuk…" : "Masuk →"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("pick"); setPin(""); setError(""); }}
                  className="w-full py-2 text-sm text-ink-muted hover:text-ink transition-colors"
                >
                  ← Pilih profil lain
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-ink-muted mt-6">
          Belum punya akun?{" "}
          <Link href="/daftar" className="text-amber hover:text-amber-hover font-medium">
            Buat ruang keluarga
          </Link>
        </p>
      </div>
    </div>
  );
}
