"use client";

import { useEffect, useRef, useCallback } from "react";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const focusTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("keydown", focusTrap);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("keydown", focusTrap);
      previousFocus.current?.focus();
    };
  }, [open, onCancel, focusTrap]);

  if (!open) return null;

  const isDanger = destructive || variant === "danger";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
        className="relative bg-surface rounded-2xl border-2 border-ink shadow-brutal w-full max-w-sm p-5 space-y-4 outline-none"
      >
        <div className="flex items-center justify-between">
          <h3 id="confirm-dialog-title" className="font-bold text-ink text-sm">{title}</h3>
          <button onClick={onCancel} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-muted hover:text-ink rounded-xl transition-colors">
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
