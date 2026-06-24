"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Bookmark, Check } from "lucide-react";

type BookPayload = {
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
  open_library_id: string | null;
  total_pages: number | null;
};

export default function AddToShelfButtons({ book }: { book: BookPayload }) {
  const router = useRouter();
  const [adding, setAdding] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

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
      if (res.status === 401) {
        router.push("/masuk");
        return;
      }
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      setTimeout(() => router.push("/rak"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambahkan buku");
    } finally {
      setAdding(null);
    }
  }

  if (done) {
    return (
      <div className="bg-success-soft border border-success/20 rounded-xl px-4 py-3 text-sm text-success text-center font-medium flex items-center justify-center gap-2">
        <Check size={14} strokeWidth={2.5} /> Ditambahkan ke rak! Mengalihkan…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-error-soft border border-error/20 rounded-xl px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      <button
        onClick={() => addToShelf("reading")}
        disabled={!!adding}
        className="btn-primary-full"
      >
        {adding === "reading" ? "Menambahkan…" : <span className="flex items-center justify-center gap-2"><BookOpen size={16} strokeWidth={2} />Sedang Baca</span>}
      </button>
      <button
        onClick={() => addToShelf("want")}
        disabled={!!adding}
        className="btn-secondary w-full min-h-[44px]"
      >
        {adding === "want" ? "Menambahkan…" : <span className="flex items-center justify-center gap-2"><Bookmark size={16} strokeWidth={2} />Mau Baca</span>}
      </button>
    </div>
  );
}
