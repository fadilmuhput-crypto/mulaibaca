"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="w-10 h-10 flex items-center justify-center -ml-1.5 text-ink-secondary hover:text-ink rounded-xl hover:bg-parchment transition-colors"
      aria-label="Kembali"
    >
      <ChevronLeft size={20} strokeWidth={2} />
    </button>
  );
}
