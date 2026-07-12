"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import FindFriends from "./FindFriends";

export default function FindFriendsModal({
  memberId,
  onClose,
}: {
  memberId: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40">
      <div
        ref={ref}
        className="w-full sm:max-w-md bg-surface rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-ink-muted">Cari Teman</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-parchment transition-colors"
            aria-label="Tutup"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <FindFriends memberId={memberId} />
      </div>
    </div>
  );
}
