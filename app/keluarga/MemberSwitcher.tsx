"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, LogOut } from "lucide-react";

export default function MemberSwitcher({
  targetId,
  label,
  variant,
}: {
  targetId: string | null;
  label: string;
  variant: "switch" | "exit";
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSwitch() {
    setLoading(true);
    try {
      if (variant === "exit") {
        await fetch("/api/anggota-switch", { method: "DELETE" });
      } else {
        await fetch("/api/anggota-switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetMemberId: targetId }),
        });
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (variant === "exit") {
    return (
      <button
        onClick={handleSwitch}
        disabled={loading}
        className="flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white min-h-[32px] px-2 disabled:opacity-50"
      >
        <LogOut size={12} strokeWidth={2.5} />
        {loading ? "…" : label}
      </button>
    );
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={loading}
      className="flex items-center gap-1 text-[11px] font-semibold text-ink-secondary hover:text-amber border border-border hover:border-amber/40 rounded-lg px-2.5 min-h-[28px] transition-colors disabled:opacity-40"
    >
      <ArrowLeftRight size={10} strokeWidth={2.5} />
      {loading ? "…" : label}
    </button>
  );
}
