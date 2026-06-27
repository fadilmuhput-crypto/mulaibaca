"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Bookmark, Check, PenLine, RotateCcw, Star } from "lucide-react";

type BookPayload = {
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
  open_library_id: string | null;
  total_pages: number | null;
};

type ShelfCheck = {
  status: "want" | "reading" | "done" | null;
  shelf_item_id: string | null;
  review_slug: string | null;
};

export default function AddToShelfButtons({ book }: { book: BookPayload }) {
  const router = useRouter();
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [check, setCheck] = useState<ShelfCheck | null>(null);
  const [checkLoading, setCheckLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (book.open_library_id) params.set("open_library_id", book.open_library_id);
    else params.set("title", book.title);

    fetch(`/api/shelf/check?${params}`)
      .then((r) => r.json())
      .then((data) => setCheck(data))
      .catch(() => setCheck({ status: null, shelf_item_id: null, review_slug: null }))
      .finally(() => setCheckLoading(false));
  }, [book.open_library_id, book.title]);

  async function addToShelf(status: "reading" | "want") {
    setAdding(status);
    setError("");
    try {
      const res = await fetch("/api/shelf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book, status }),
      });
      const data = await res.json();
      if (res.status === 401) { router.push("/masuk"); return; }
      if (!res.ok) throw new Error(data.error);
      setAdded(true);
      setTimeout(() => router.push("/rak"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan buku");
    } finally {
      setAdding(null);
    }
  }

  async function patchStatus(status: "reading") {
    if (!check?.shelf_item_id) return;
    setAdding(status);
    setError("");
    try {
      const res = await fetch(`/api/shelf/${check.shelf_item_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) { router.push("/masuk"); return; }
      if (!res.ok) throw new Error("Gagal memperbarui status");
      router.push("/log");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui");
    } finally {
      setAdding(null);
    }
  }

  if (added) {
    return (
      <div className="bg-success-soft border border-success/20 rounded-xl px-4 py-3 text-sm text-success text-center font-medium flex items-center justify-center gap-2">
        <Check size={14} strokeWidth={2.5} /> Ditambahkan ke rak! Mengalihkan…
      </div>
    );
  }

  if (checkLoading) {
    return <div className="h-24 rounded-xl bg-border/30 animate-pulse" />;
  }

  const { status, shelf_item_id, review_slug } = check ?? { status: null, shelf_item_id: null, review_slug: null };

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-error-soft border border-error/20 rounded-xl px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {/* Not in shelf */}
      {!status && (
        <>
          <button
            onClick={() => addToShelf("reading")}
            disabled={!!adding}
            className="btn-primary-full"
          >
            {adding === "reading" ? "Menambahkan…" : (
              <span className="flex items-center justify-center gap-2">
                <BookOpen size={16} strokeWidth={2} />Sedang Baca
              </span>
            )}
          </button>
          <button
            onClick={() => addToShelf("want")}
            disabled={!!adding}
            className="btn-secondary w-full min-h-[44px]"
          >
            {adding === "want" ? "Menambahkan…" : (
              <span className="flex items-center justify-center gap-2">
                <Bookmark size={16} strokeWidth={2} />Mau Baca
              </span>
            )}
          </button>
        </>
      )}

      {/* Want to read */}
      {status === "want" && (
        <>
          <button
            onClick={() => patchStatus("reading")}
            disabled={!!adding}
            className="btn-primary-full"
          >
            {adding === "reading" ? "Memulai…" : (
              <span className="flex items-center justify-center gap-2">
                <BookOpen size={16} strokeWidth={2} />Mulai Baca
              </span>
            )}
          </button>
          <Link href="/rak" className="btn-secondary w-full min-h-[44px] flex items-center justify-center">
            Lihat di Rak
          </Link>
        </>
      )}

      {/* Currently reading */}
      {status === "reading" && (
        <>
          <Link href="/log" className="btn-primary-full flex items-center justify-center gap-2">
            <PenLine size={16} strokeWidth={2} />Catat Sesi Baca
          </Link>
          <Link href="/rak" className="btn-secondary w-full min-h-[44px] flex items-center justify-center">
            Lihat di Rak
          </Link>
        </>
      )}

      {/* Done — no review yet */}
      {status === "done" && !review_slug && (
        <>
          <Link
            href={`/review/tulis?shelf=${shelf_item_id}`}
            className="btn-primary-full flex items-center justify-center gap-2"
          >
            <Star size={16} strokeWidth={2} />Tulis Review
          </Link>
          <button
            onClick={() => patchStatus("reading")}
            disabled={!!adding}
            className="btn-secondary w-full min-h-[44px] flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} strokeWidth={2} />
            {adding === "reading" ? "Memulai…" : "Baca Lagi"}
          </button>
        </>
      )}

      {/* Done — has review */}
      {status === "done" && review_slug && (
        <>
          <Link
            href={`/review/${review_slug}`}
            className="btn-primary-full flex items-center justify-center gap-2"
          >
            <Star size={16} strokeWidth={2} />Lihat Review Saya
          </Link>
          <button
            onClick={() => patchStatus("reading")}
            disabled={!!adding}
            className="btn-secondary w-full min-h-[44px] flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} strokeWidth={2} />
            {adding === "reading" ? "Memulai…" : "Baca Lagi"}
          </button>
        </>
      )}
    </div>
  );
}
