"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";

const OPTIONS = [
  { key: "light", Icon: Sun, label: "Terang" },
  { key: "dark", Icon: Moon, label: "Gelap" },
  { key: "system", Icon: Monitor, label: "Sistem" },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 bg-parchment rounded-xl border border-border p-0.5">
      {OPTIONS.map(({ key, Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => setTheme(key)}
          className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-xs transition-all ${
            theme === key
              ? "bg-amber text-white shadow-sm"
              : "text-ink-muted hover:text-ink"
          }`}
          aria-label={label}
          title={label}
        >
          <Icon size={15} strokeWidth={1.75} />
        </button>
      ))}
    </div>
  );
}
