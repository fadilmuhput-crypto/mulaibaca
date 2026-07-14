"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Heart, User, Smile, Baby, Loader2, ChevronLeft, BookOpen, Share2, Target, Copy, Check } from "lucide-react";
import type { Session } from "@/lib/session";

const MEMBER_TYPES = [
  { key: "ayah",   label: "Ayah",   icon: User,  desc: "Ayah dalam keluarga" },
  { key: "ibu",    label: "Ibu",    icon: Heart, desc: "Ibu dalam keluarga" },
  { key: "dewasa", label: "Dewasa", icon: Smile, desc: "Anggota dewasa lainnya" },
] as const;

export default function OnboardingFlow({ session }: { session: Session }) {
  const router = useRouter();
  const [step, setStep] = useState<"intro" | "type" | "form" | "done">("intro");
  const [type, setType] = useState<"family" | "circle" | null>(null);
  const [name, setName] = useState(session.familyName ?? "");
  const [role, setRole] = useState("ayah");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim()) { setError("Nama wajib diisi"); return; }
    if (type === "family" && !role) { setError("Pilih peran kamu"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/lingkar-baca/setup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          memberType: type === "family" ? role : "dewasa",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("done");
      setTimeout(() => {
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (step === "done") {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto">
          <BookOpen size={32} className="text-forest" />
        </div>
        <h2 className="font-display text-2xl font-black text-ink">Siap!</h2>
        <p className="text-sm text-ink-muted">Lingkar bacamu sudah siap. Yuk ajak anggota bergabung!</p>
        {type === "circle" && (
          <InviteCodeDisplay code={session.inviteCode} />
        )}
      </main>
    );
  }

  if (step === "intro") {
    return (
      <main className="max-w-lg mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-soft flex items-center justify-center mx-auto">
            <Users size={28} className="text-amber" />
          </div>
          <h1 className="font-display text-2xl font-black text-ink leading-tight">
            Selamat datang di<br />Lingkar Baca!
          </h1>
          <p className="text-sm text-ink-muted max-w-xs mx-auto leading-relaxed">
            Lingkar Baca adalah ruang bersama untuk saling memantau progres membaca.
          </p>
        </div>

        <div className="space-y-3">
          {[
            { Icon: Users, title: "Pantau anggota", desc: "Lihat streak, halaman, dan buku yang dibaca setiap orang." },
            { Icon: Share2, title: "Undang dengan kode", desc: "Anggota baru tinggal masuk pakai kode undangan. Praktis." },
            { Icon: Target, title: "Tantangan mingguan", desc: "Setel target halaman untuk lingkar dan capai bersama." },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 bg-surface rounded-xl p-4 border border-border">
              <div className="w-9 h-9 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={18} className="text-forest" />
              </div>
              <div>
                <h3 className="font-semibold text-ink text-sm">{title}</h3>
                <p className="text-xs text-ink-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep("type")}
          className="btn-primary-full-lg"
        >
          Mulai Setup →
        </button>
      </main>
    );
  }

  if (step === "type") {
    return (
      <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-h2">Mau bikin apa?</h2>
          <p className="text-sm text-ink-muted">Pilih tipe ruang bacamu</p>
        </div>

        <button
          onClick={() => { setType("family"); setStep("form"); }}
          className="w-full bg-surface rounded-2xl border-2 border-border hover:border-amber/40 p-6 text-left space-y-3 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-forest/10 flex items-center justify-center">
            <Users size={24} className="text-forest" />
          </div>
          <div>
            <h3 className="font-bold text-ink text-lg">Lingkar Keluarga</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Buat ruang bersama untuk Ayah, Ibu, dan Anak. Pantau progres anak,
              setel tantangan, dan kelola akun bacaan anak.
            </p>
          </div>
          <div className="flex gap-2">
            {[Baby, Heart, User].map((Icon, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-parchment border border-border flex items-center justify-center">
                <Icon size={14} className="text-ink-muted" />
              </div>
            ))}
          </div>
        </button>

        <button
          onClick={() => { setType("circle"); setStep("form"); }}
          className="w-full bg-surface rounded-2xl border-2 border-border hover:border-amber/40 p-6 text-left space-y-3 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-soft flex items-center justify-center">
            <Heart size={24} className="text-amber" />
          </div>
          <div>
            <h3 className="font-bold text-ink text-lg">Lingkar Teman</h3>
            <p className="text-sm text-ink-muted leading-relaxed">
              Buat ruang baca bareng teman, pasangan, atau komunitas.
              Saling lihat progres dan streak tanpa fitur peran keluarga.
            </p>
          </div>
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <button
        onClick={() => setStep("type")}
        className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink mb-4 transition-colors"
      >
        <ChevronLeft size={16} strokeWidth={2} />
        Kembali
      </button>

      <div className="space-y-6">
        <div>
          <label className="input-label">
            {type === "family" ? "Nama Keluarga" : "Nama Lingkar"}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === "family" ? "Keluarga Budi" : "Lingkar Baca Sastra"}
            className="input"
            autoFocus
            maxLength={100}
          />
        </div>

        {type === "family" && (
          <div>
            <label className="input-label">Peran kamu</label>
            <div className="space-y-2 mt-1">
              {MEMBER_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setRole(t.key)}
                  className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                    role === t.key
                      ? "border-amber bg-amber text-white"
                      : "border-border bg-surface text-ink-secondary hover:border-amber/40"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${role === t.key ? "bg-white/20" : "bg-parchment"}`}>
                    <t.icon size={16} strokeWidth={1.75} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{t.label}</p>
                    <p className={`text-xs ${role === t.key ? "text-white/70" : "text-ink-muted"}`}>{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-error text-sm text-center bg-error-soft rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading || !name.trim()}
          className="btn-primary-full-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Menyimpan…</>
          ) : "Simpan & Selesai →"}
        </button>
      </div>
    </main>
  );
}

function InviteCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-amber-soft rounded-2xl border border-amber/20 p-4 text-left">
      <p className="text-xs text-ink-muted mb-1">Kode undangan</p>
      <div className="flex items-center gap-2">
        <p className="font-mono text-xl font-bold text-ink tracking-widest uppercase flex-1">{code}</p>
        <button
          onClick={handleCopy}
          className="text-xs font-semibold text-amber hover:text-amber-dark transition-colors flex items-center gap-1 min-h-[36px] px-2"
        >
          {copied ? <><Check size={12} strokeWidth={2.5} />Disalin</> : "Salin"}
        </button>
      </div>
      <p className="text-xs text-ink-muted mt-1">Bagikan kode ini agar teman bisa bergabung</p>
    </div>
  );
}
