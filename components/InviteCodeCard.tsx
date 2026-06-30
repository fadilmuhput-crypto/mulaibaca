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

  const shareUrl = `https://mulaibaca.id/bergabung?code=${inviteCode.toUpperCase()}`;
  const shareText = `Ayo gabung ke "${familyName}" di mulaibaca! 📚\n\nKlik link ini langsung:\n${shareUrl}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteCode.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: "Gabung mulaibaca", text: shareText, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareText);
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
        Bagikan kode ini agar mereka bisa langsung bergabung
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
        Bagikan →
      </button>

      {/* WhatsApp link */}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-1.5 w-full text-xs text-white/60 hover:text-white transition-colors py-2"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Bagikan lewat WhatsApp
      </a>

      <p className="text-xs text-white/50 text-center mt-2">
        Mereka daftar di mulaibaca.id/bergabung
      </p>
    </section>
  );
}
