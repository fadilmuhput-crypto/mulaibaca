"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Share2, Check, Loader2, Smartphone, BookOpen, Clock, Flame } from "lucide-react";
import { shareCard } from "@/lib/share-card";

type Book = {
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number | null;
};

export default function SharePreview({ logId, book, pagesRead, duration, note }: { logId: string; book: Book; pagesRead: number; duration: number | null; note: string | null }) {
  const router = useRouter();
  const [saving, setSaving] = useState<"landscape" | "story" | null>(null);
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState({ landscape: false, story: false });

  const progress = book.total_pages && book.total_pages > 0
    ? Math.min(Math.round((pagesRead / book.total_pages) * 100), 100)
    : null;

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
        ? `${book.title} — ${pagesRead} halaman di mulaibaca 📚 mulaibaca.id`
        : shareTextFallback();
      if (navigator.share) {
        try { await navigator.share({ title: "mulaibaca", text }); } catch {}
      }
    } finally {
      setSaving(null);
    }
  }

  function shareTextFallback() {
    const base = `Lagi baca "${book.title}"`;
    const pages = `${pagesRead} halaman`;
    const suffix = "via mulaibaca 📚 mulaibaca.id";
    if (book.author) return `${base} — ${book.author} (${pages}) ${suffix}`;
    return `${base} (${pages}) ${suffix}`;
  }

  async function handleShare() {
    await shareCard(logId, shareTextFallback());
  }

  return (
    <div className="min-h-screen bg-forest px-4 py-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={18} /> Kembali
        </button>

        {/* Book Info Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-24 rounded-lg bg-white/10 overflow-hidden flex-shrink-0">
            {book.cover_url?.startsWith("http") ? (
              <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={20} className="text-white/30" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-display font-black text-white leading-tight">{book.title}</h1>
            {book.author && <p className="text-white/50 text-sm mt-0.5">{book.author}</p>}
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-white/40 text-xs"><BookOpen size={12} /> {pagesRead} hlm</span>
              {duration && <span className="flex items-center gap-1 text-white/40 text-xs"><Clock size={12} /> {duration} mnt</span>}
              {progress !== null && (
                <span className="flex items-center gap-1 text-white/40 text-xs">
                  <Flame size={12} /> {progress}%
                </span>
              )}
            </div>
            {progress !== null && (
              <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber to-lime rounded-full" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>

        {note && (
          <p className="text-white/40 text-sm mb-6 italic border-l-2 border-white/10 pl-3">&ldquo;{note}&rdquo;</p>
        )}

        {/* Post Card (landscape) */}
        <div className="bg-white/[0.06] rounded-2xl p-4 mb-4 brutal-border">
          <div className="aspect-[2/1] bg-white/5 rounded-xl mb-3 overflow-hidden relative">
            {!imgLoaded.landscape && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-white/20" />
              </div>
            )}
            <img
              src={`/api/og/log/${logId}`}
              alt="Kartu bacaan"
              className={`w-full h-full object-contain transition-opacity duration-300 ${imgLoaded.landscape ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(prev => ({ ...prev, landscape: true }))}
            />
          </div>
          <button
            onClick={() => saveImage("landscape")}
            disabled={saving !== null}
            className="w-full flex items-center justify-center gap-2 bg-white text-ink font-bold text-sm py-3 rounded-xl hover:bg-white/90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving === "landscape" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Simpan atau Bagikan
          </button>
        </div>

        {/* Story Card (portrait) */}
        <div className="bg-white/[0.06] rounded-2xl p-4 mb-4 brutal-border">
          <div className="flex items-center gap-1.5 mb-3">
            <Smartphone size={15} className="text-pink-400" />
            <span className="text-white/50 text-xs font-medium">Untuk Cerita / Story Instagram</span>
          </div>
          <div className="aspect-[9/16] max-h-[400px] bg-white/5 rounded-xl mb-3 overflow-hidden relative">
            {!imgLoaded.story && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-white/20" />
              </div>
            )}
            <img
              src={`/api/og/log/${logId}/story`}
              alt="Kartu untuk Story Instagram"
              className={`w-full h-full object-contain transition-opacity duration-300 ${imgLoaded.story ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(prev => ({ ...prev, story: true }))}
            />
          </div>
          <button
            onClick={() => saveImage("story")}
            disabled={saving !== null}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving === "story" ? <Loader2 size={16} className="animate-spin" /> : <Smartphone size={16} />}
            Simpan untuk Story
          </button>
        </div>

        {/* Share Link */}
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 text-white/80 font-semibold text-sm py-2.5 rounded-xl hover:bg-white/20 transition-all active:scale-[0.98]"
          >
            <Share2 size={14} /> Bagikan Tautan
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText("mulaibaca.id"); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center justify-center gap-2 bg-white/10 text-white/80 font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-white/20 transition-all active:scale-[0.98]"
          >
            {copied ? <Check size={14} className="text-lime" /> : <span className="text-lg leading-none">🔗</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
