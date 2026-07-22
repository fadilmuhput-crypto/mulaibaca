"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";

type ToastType = "error" | "success" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  show: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nextId, setNextId] = useState(0);

  const show = useCallback((message: string, type: ToastType = "error") => {
    const id = nextId;
    setNextId((n) => n + 1);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, [nextId]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-lg px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-xl brutal-border brutal-shadow-xs flex items-center justify-between gap-3 animate-in slide-in-from-top-2 fade-in duration-200 ${
              t.type === "error" ? "bg-error text-white" :
              t.type === "success" ? "bg-success text-white" :
              "bg-surface text-ink"
            }`}
          >
            <p className="text-body-sm font-medium">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="flex-shrink-0 opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
