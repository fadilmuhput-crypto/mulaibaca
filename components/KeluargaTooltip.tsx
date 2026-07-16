"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

export default function KeluargaTooltip() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center focus:outline-none"
        aria-label="Info keluarga"
      >
        <Info size={14} strokeWidth={1.75} className="text-ink-muted" />
      </button>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 px-3 py-2 bg-ink-card text-white text-xs font-medium rounded-lg shadow-lg z-10">
          Ruang bersama untuk memantau progres bacaan seluruh anggota keluarga
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#0C0C0A]" />
        </div>
      )}
    </div>
  );
}
