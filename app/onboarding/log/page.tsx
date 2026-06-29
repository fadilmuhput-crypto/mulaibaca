"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, BookOpen, Minus, Plus } from "lucide-react";
import BookCover from "@/components/BookCover";
import { Suspense } from "react";

function OnboardingLogContent() {
  const router = useRouter();
  const params = useSearchParams();
  const shelfItemId = params.get("id") ?? "";
  const bookTitle = params.get("title") ?? "Buku kamu";
  const bookCover = params.get("cover") ?? "";

  const [pages, setPages] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function adjust(delta: number) {
    setPages((p) => Math.max(0, p + delta));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shelfItemId || pages < 1) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shelfItemId, pagesRead: pages }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan log");
      router.push("/dashboard?onboarding=done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan log");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-4 pt-8 pb-4">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="text-xl font-display font-bold text-forest">
            mulaibaca
          </Link>
        </div>
      </header>

      {/* Step indicator */}
      <div className="flex-shrink-0 px-4 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex gap-1.5">
              <div className="w-6 h-1.5 rounded-full bg-amber" />
              <div className="w-6 h-1.5 rounded-full bg-amber" />
            </div>
            <span className="text-xs text-ink-muted font-medium">Langkah 2 dari 2</span>
          </div>
          <h1 className="text-h1 mt-3">Sudah baca berapa halaman?</h1>
          <p className="text-sm text-ink-muted mt-1">
            Catat bacaan hari ini untuk mulai membangun kebiasaan membacamu.
          </p>
        </div>
      </div>

      <div className="flex-1 px-4">
        <div className="max-w-lg mx-auto space-y-6">

          {/* Book preview */}
          <div className="bg-surface rounded-2xl border border-border p-4 flex items-center gap-3">
            <BookCover
              src={bookCover || null}
              title={bookTitle}
              className="w-10 h-14 rounded-lg flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs text-ink-muted font-medium mb-0.5">Buku yang sedang dibaca</p>
              <p className="text-sm font-semibold text-ink truncate">{bookTitle}</p>
            </div>
          </div>

          {/* Pages input */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="input-label mb-3 block">
                Halaman yang dibaca hari ini
              </label>

              {/* Stepper */}
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => adjust(-10)}
                  disabled={pages < 10}
                  className="w-11 h-11 rounded-2xl border-2 border-border flex items-center justify-center text-ink-muted hover:border-amber/50 hover:text-ink disabled:opacity-30 transition-all"
                >
                  <Minus size={16} strokeWidth={2.5} />
                </button>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type="number"
                    min={0}
                    max={9999}
                    value={pages === 0 ? "" : pages}
                    onChange={(e) => setPages(Math.max(0, Math.min(9999, parseInt(e.target.value) || 0)))}
                    placeholder="0"
                    className="w-32 h-16 text-center text-3xl font-bold border-2 border-border rounded-2xl bg-surface text-ink focus:border-amber focus:outline-none transition-colors"
                  />
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-ink-muted whitespace-nowrap">
                    halaman
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => adjust(10)}
                  className="w-11 h-11 rounded-2xl border-2 border-border flex items-center justify-center text-ink-muted hover:border-amber/50 hover:text-ink transition-all"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Quick presets */}
              <div className="flex gap-2 justify-center flex-wrap mt-8">
                {[10, 20, 30, 50].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPages(n)}
                    className={`px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all ${
                      pages === n
                        ? "border-amber bg-amber-soft text-amber"
                        : "border-border text-ink-secondary hover:border-amber/40"
                    }`}
                  >
                    {n} hal
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-error text-sm bg-error-soft rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={saving || pages < 1}
              className="btn-primary-full-lg flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 size={16} className="animate-spin" /> Menyimpan…</>
              ) : (
                <><BookOpen size={16} strokeWidth={1.75} /> Simpan & Mulai</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer skip */}
      <div className="flex-shrink-0 px-4 pb-8 pt-6 border-t border-border bg-parchment mt-6">
        <div className="max-w-lg mx-auto text-center">
          <Link
            href="/dashboard"
            className="text-sm text-ink-muted hover:text-ink transition-colors"
          >
            Lewati untuk sekarang →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingLogPage() {
  return (
    <Suspense>
      <OnboardingLogContent />
    </Suspense>
  );
}
