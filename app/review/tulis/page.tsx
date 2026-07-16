"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

const STARS = [1, 2, 3, 4, 5];

function TulisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shelfItemId = searchParams.get("shelf") ?? "";

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [qAbout, setQAbout] = useState("");
  const [qMemorable, setQMemorable] = useState("");
  const [qForWhom, setQForWhom] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shelfItemId) router.push("/review");
  }, [shelfItemId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError("Pilih rating bintang dulu"); return; }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
      document.body.focus?.();
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shelfItemId,
          rating,
          qAbout: qAbout.trim() || null,
          qMemorable: qMemorable.trim() || null,
          qForWhom: qForWhom.trim() || null,
          isPublic,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/review/${data.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Star rating */}
      <div className="bg-surface rounded-2xl border border-border p-5 text-center">
        <p className="text-sm font-medium text-ink mb-4">Berapa bintang untuk buku ini?</p>
        <div className="flex justify-center gap-3">
          {STARS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`${s} bintang`}
              className={`text-4xl transition-transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center ${
                s <= (hovered || rating) ? "text-amber" : "text-border"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-xs text-ink-muted mt-2">
            {["", "Kurang bagus", "Lumayan", "Bagus", "Sangat bagus", "Luar biasa!"][rating]}
          </p>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            <span className="flex items-center gap-1.5"><BookOpen size={14} strokeWidth={2} />Buku ini tentang apa?</span>
          </label>
          <textarea
            value={qAbout}
            onChange={(e) => setQAbout(e.target.value)}
            rows={3}
            placeholder="Ceritakan isi buku ini dalam 2-3 kalimat…"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-ink text-sm placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            💡 Yang paling berkesan?
          </label>
          <textarea
            value={qMemorable}
            onChange={(e) => setQMemorable(e.target.value)}
            rows={3}
            placeholder="Kutipan, pelajaran, atau cerita yang paling kamu ingat…"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-ink text-sm placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            👥 Untuk siapa cocok?
          </label>
          <textarea
            value={qForWhom}
            onChange={(e) => setQForWhom(e.target.value)}
            rows={2}
            placeholder="Siapa yang paling akan menikmati buku ini…"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-ink text-sm placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber resize-none"
          />
        </div>
      </div>

      {/* Visibility toggle */}
      <div className="bg-surface rounded-xl border border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Review publik</p>
            <p className="text-xs text-ink-muted">Bisa dilihat dan dishare siapa saja</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="Toggle review publik"
            onClick={() => setIsPublic(!isPublic)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              isPublic ? "bg-amber" : "bg-border"
            }`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-[left] ${
              isPublic ? "left-[22px]" : "left-0.5"
            }`} />
          </button>
        </div>
        <div className="group relative mt-2 border-t border-border pt-2">
          <p className="text-xs text-ink-muted flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            Setelah dipublikasi, kamu bisa atur tampilan nama atau anonim di halaman review
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-error-soft border border-error/20 rounded-xl px-4 py-3 text-sm text-error text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !rating}
        className="btn-primary-full-lg"
      >
        {loading ? "Menyimpan…" : <span className="flex items-center gap-2"><Sparkles size={14} strokeWidth={2} />Publikasikan Review</span>}
      </button>
    </form>
  );
}

export default function TulisReviewPage() {
  return (
    <div className="min-h-dvh pb-10">
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/review" className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-secondary hover:text-ink rounded-xl">
          ←
        </Link>
        <h1 className="text-h3">Tulis Review</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <Suspense fallback={<div className="text-center py-8 text-ink-muted text-sm">Memuat…</div>}>
          <TulisForm />
        </Suspense>
      </main>
    </div>
  );
}
