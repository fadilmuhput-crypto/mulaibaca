"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Share2, Check, Loader2, Smartphone } from "lucide-react";
import { shareCard } from "@/lib/share-card";

export default function SharePreview({ logId }: { logId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState<"landscape" | "story" | null>(null);
  const [copied, setCopied] = useState(false);

  async function saveImage(format: "landscape" | "story") {
    setSaving(format);
    try {
      const url = format === "story" ? `/api/og/log/${logId}/story` : `/api/og/log/${logId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Gagal memuat kartu");
      const blob = await res.blob();
      const filename = format === "story" ? "mulaibaca-story.png" : "mulaibaca-card.png";

      if (navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: "image/png" })] })) {
        const file = new File([blob], filename, { type: "image/png" });
        await navigator.share({ files: [file], title: "mulaibaca" });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error("Save failed:", err);
      const text = format === "story"
        ? "Baca bareng, tumbuh bareng di mulaibaca 📚 mulaibaca.id"
        : shareTextFallback();
      if (navigator.share) {
        try { await navigator.share({ title: "mulaibaca", text }); } catch {}
      }
    } finally {
      setSaving(null);
    }
  }

  function shareTextFallback() {
    return "Catat progres bacaan di mulaibaca 📚 mulaibaca.id";
  }

  async function handleShare() {
    await shareCard(logId, shareTextFallback());
  }

  return (
    <div className="min-h-screen bg-forest px-4 py-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={20} /> Kembali
        </button>

        <h1 className="text-2xl font-display font-black text-white mb-2">Kartu Bacaan</h1>
        <p className="text-white/50 text-sm mb-6">Pilih format yang mau dibagikan</p>

        {/* Post Card (landscape) */}
        <div className="bg-white/10 rounded-2xl p-4 mb-4">
          <div className="aspect-[2/1] bg-white/5 rounded-xl mb-3 overflow-hidden">
            <img src={`/api/og/log/${logId}`} alt="Kartu bacaan" className="w-full h-full object-contain" loading="lazy" />
          </div>
          <button
            onClick={() => saveImage("landscape")}
            disabled={saving !== null}
            className="w-full flex items-center justify-center gap-2 bg-white text-ink font-bold text-sm py-3 rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {saving === "landscape" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Simpan atau Bagikan
          </button>
        </div>

        {/* Story Card (portrait) */}
        <div className="bg-white/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Smartphone size={16} className="text-pink-400" />
            <span className="text-white/60 text-xs font-medium">Cerita / Story</span>
          </div>
          <div className="aspect-[9/16] max-h-[400px] bg-white/5 rounded-xl mb-3 overflow-hidden">
            <img src={`/api/og/log/${logId}/story`} alt="Kartu untuk Story Instagram" className="w-full h-full object-contain" loading="lazy" />
          </div>
          <button
            onClick={() => saveImage("story")}
            disabled={saving !== null}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving === "story" ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
            Simpan untuk Story
          </button>
        </div>

        {/* Share Link */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-sm py-2.5 rounded-xl hover:bg-white/20 transition-colors"
          >
            <Share2 size={14} /> Bagikan Tautan
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText("mulaibaca.id"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-white/20 transition-colors"
          >
            {copied ? <Check size={14} className="text-lime" /> : "🔗"}
          </button>
        </div>
      </div>
    </div>
  );
}
