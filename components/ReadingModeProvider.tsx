"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type ReadingMode = "normal" | "eye-friendly";

type ReadingModeContextValue = {
  mode: ReadingMode;
  toggle: () => void;
};

const ReadingModeContext = createContext<ReadingModeContextValue>({
  mode: "normal",
  toggle: () => {},
});

export function useReadingMode() {
  return useContext(ReadingModeContext);
}

export default function ReadingModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ReadingMode>("normal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mulaibaca_reading_mode") as ReadingMode | null;
    if (saved === "eye-friendly") {
      setMode("eye-friendly");
      document.documentElement.setAttribute("data-reading-mode", "eye-friendly");
    }
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === "normal" ? "eye-friendly" : "normal";
      localStorage.setItem("mulaibaca_reading_mode", next);
      if (next === "eye-friendly") {
        document.documentElement.setAttribute("data-reading-mode", "eye-friendly");
      } else {
        document.documentElement.removeAttribute("data-reading-mode");
      }
      return next;
    });
  }, []);

  return (
    <ReadingModeContext.Provider value={{ mode, toggle }}>
      {children}
    </ReadingModeContext.Provider>
  );
}
