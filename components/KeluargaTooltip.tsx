"use client";

import { Info } from "lucide-react";

export default function KeluargaTooltip() {
  return (
    <div className="group relative inline-flex items-center">
      <Info size={14} strokeWidth={1.75} className="text-ink-muted cursor-help" />
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 px-3 py-2 bg-ink text-white text-xs font-medium rounded-lg shadow-lg         opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none z-10">
        Ruang bersama untuk memantau progres bacaan seluruh anggota keluarga
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-ink" />
      </div>
    </div>
  );
}
