"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  destructive = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-sm bg-surface rounded-t-3xl sm:rounded-2xl p-6 space-y-4"
        style={{ border: "1.5px solid var(--color-ink)", boxShadow: "var(--shadow-brutal)" }}
      >
        <div className="flex items-start justify-between">
          <h2 className="font-display font-black text-lg text-ink">{title}</h2>
          <button
            onClick={onCancel}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-muted hover:text-ink rounded-xl -mr-2 -mt-2"
            aria-label="Tutup"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <p className="text-sm text-ink-secondary leading-relaxed">{message}</p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="btn-ghost-ink flex-1 text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors ${
              destructive
                ? "bg-error text-white hover:bg-error/90"
                : "btn-primary-sm"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
