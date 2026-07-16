"use client";

import { usePathname } from "next/navigation";
import { useReadingMode } from "./ReadingModeProvider";

export default function ReadingModeToggle() {
  const pathname = usePathname();
  const { mode, toggle } = useReadingMode();
  const active = mode === "eye-friendly";

  // Only show on blog pages
  if (!pathname.startsWith("/blog")) return null;

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 shadow-brutal-xs transition-all hover:shadow-brutal-sm text-[11px] font-semibold ${
        active ? "bg-cream text-ink" : "bg-surface text-ink"
      }`}
      style={{ borderColor: "var(--color-ink)" }}
      aria-label={active ? "Mode baca normal" : "Mode baca ramah mata"}
      title={active ? "Mode baca normal" : "Mode baca ramah mata"}
    >
      {active ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
      <span className="hidden sm:inline">{active ? "Normal" : "Ramah Mata"}</span>
    </button>
  );
}
