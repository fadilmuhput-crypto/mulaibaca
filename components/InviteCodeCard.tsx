"use client";

import { useState } from "react";

export default function InviteCodeCard({
  inviteCode,
  familyName,
}: {
  inviteCode: string;
  familyName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleShare() {
    const text = `Yuk gabung ke ${familyName} di mulaibaca! Gunakan kode undangan: ${inviteCode.toUpperCase()} di https://mulaibaca.my.id/bergabung`;
    if (navigator.share) {
      await navigator.share({ title: "Gabung mulaibaca", text });
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <section className="bg-forest rounded-2xl p-5 text-white">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1">
        Undang anggota keluarga
      </p>
      <p className="text-sm text-white/80 mb-4">
        Bagikan kode ini agar keluargamu bisa bergabung ke {familyName}
      </p>

      {/* Code display */}
      <div className="bg-white/10 rounded-xl px-5 py-3 mb-4 flex items-center justify-between">
        <span className="font-mono text-2xl font-bold tracking-[0.2em] uppercase text-white">
          {inviteCode}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs font-medium text-white/70 hover:text-white transition-colors min-h-[36px] px-3"
        >
          {copied ? "✓ Disalin" : "Salin"}
        </button>
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full bg-amber text-white font-medium rounded-xl min-h-[44px] text-sm hover:bg-amber-hover transition-colors"
      >
        Bagikan ke Keluarga →
      </button>

      <p className="text-xs text-white/50 text-center mt-3">
        Mereka daftar di mulaibaca.my.id/bergabung
      </p>
    </section>
  );
}
