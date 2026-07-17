"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, Share2, Check, Loader2, Smartphone, BookOpen, Clock, Flame } from "lucide-react";

type Book = {
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number | null;
};

export default function SharePreview({ logId, book, pagesRead, duration, note }: { logId: string; book: Book; pagesRead: number; duration: number | null; note: string | null }) {
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgLoaded, setImgLoaded] = useState({ landscape: false, story: false });

  const progress = book.total_pages && book.total_pages > 0
    ? Math.min(Math.round((pagesRead / book.total_pages) * 100), 100)
    : null;

  async function saveStory() {
    setSaving(true);
    try {
      const res = await fetch(`/api/og/log/${logId}/story`);
      if (!res.ok) throw new Error("Gagal memuat kartu");
      const blob = await res.blob();
      const filename = "mulaibaca-story.png";

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
      const text = `${book.title} — ${pagesRead} halaman di mulaibaca 📚 mulaibaca.id`;
      if (navigator.share) {
        try { await navigator.share({ title: "mulaibaca", text }); } catch {}
      }
    } finally {
      setSaving(false);
    }
  }

  function shareTextFallback() {
    const base = `Lagi baca "${book.title}"`;
    const pages = `${pagesRead} halaman`;
    const suffix = "via mulaibaca 📚 mulaibaca.id";
    if (book.author) return `${base} — ${book.author} (${pages}) ${suffix}`;
    return `${base} (${pages}) ${suffix}`;
  }

  async function handleShareLink() {
    const url = `https://www.mulaibaca.id/share/log/${logId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "mulaibaca", text: shareTextFallback(), url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-secondary hover:text-ink rounded-xl"
            aria-label="Kembali"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </Link>
          <h1 className="text-h3 flex-1">Bagikan Kartu</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Book Info Header */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-24 rounded-lg bg-parchment overflow-hidden flex-shrink-0">
            {book.cover_url?.startsWith("http") ? (
              <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen size={20} className="text-ink-muted/30" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-display font-black text-ink leading-tight">{book.title}</h1>
            {book.author && <p className="text-ink-muted text-sm mt-0.5">{book.author}</p>}
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-ink-muted text-xs"><BookOpen size={12} /> {pagesRead} hlm</span>
              {duration && <span className="flex items-center gap-1 text-ink-muted text-xs"><Clock size={12} /> {duration} mnt</span>}
              {progress !== null && (
                <span className="flex items-center gap-1 text-ink-muted text-xs">
                  <Flame size={12} /> {progress}%
                </span>
              )}
            </div>
            {progress !== null && (
              <div className="w-full h-1 bg-border rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber to-lime rounded-full" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>

        {note && (
          <p className="text-ink-muted text-sm italic border-l-2 border-border pl-3">&ldquo;{note}&rdquo;</p>
        )}

        {/* Story Card (portrait) — can save */}
        <section className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Smartphone size={15} className="text-pink-400" />
            <span className="text-ink-muted text-xs font-medium">Untuk Cerita / Story Instagram</span>
          </div>
          <div className="aspect-[9/16] max-h-[420px] bg-parchment rounded-xl overflow-hidden relative">
            {!imgLoaded.story && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-ink-muted/20" />
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
            onClick={saveStory}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {saving ? "Menyimpan…" : "Simpan Gambar"}
          </button>
        </section>

        {/* Post Card (landscape) — preview only, used for share link */}
        <section className="bg-surface rounded-2xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Share2 size={15} className="text-amber" />
            <span className="text-ink-muted text-xs font-medium">Tampilan saat dibagikan</span>
          </div>
          <div className="aspect-[2/1] bg-parchment rounded-xl overflow-hidden relative">
            {!imgLoaded.landscape && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-ink-muted/20" />
              </div>
            )}
            <img
              src={`/api/og/log/${logId}`}
              alt="Kartu bacaan"
              className={`w-full h-full object-contain transition-opacity duration-300 ${imgLoaded.landscape ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(prev => ({ ...prev, landscape: true }))}
            />
          </div>
        </section>

        {/* Share Link */}
        <button
          onClick={handleShareLink}
          className="w-full flex items-center justify-center gap-2 bg-amber text-white font-bold text-sm py-3 rounded-xl hover:bg-amber-dark transition-all active:scale-[0.98]"
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          {copied ? "Tautan Disalin!" : "Bagikan Tautan"}
        </button>
      </main>
    </div>
  );
}
