"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  destructive,
  variant,
  onConfirm,
  onCancel,
  loading,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = destructive || variant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-surface rounded-2xl border-2 border-ink shadow-brutal w-full max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-ink text-sm">{title}</h3>
          <button onClick={onCancel} className="text-ink-muted hover:text-ink p-0.5 transition-colors">
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <p className="text-sm text-ink-secondary leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="btn-secondary-sm flex-1">{cancelLabel}</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
              isDanger
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-amber text-white hover:bg-amber-hover"
            }`}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
