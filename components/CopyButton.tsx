"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value.toUpperCase());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs font-semibold text-amber hover:text-amber-dark transition-colors flex items-center gap-1 min-h-[36px] px-2"
    >
      {copied ? <><Check size={12} strokeWidth={2.5} />Disalin</> : "Salin"}
    </button>
  );
}
