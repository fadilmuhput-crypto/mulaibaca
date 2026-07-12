"use client";

import { useState } from "react";
import { Info } from "lucide-react";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-10 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer focus:outline-none disabled:opacity-50 ${
        checked ? "bg-forest" : "bg-border"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function ReviewSettings({
  slug,
  initialPublic,
  initialAnonymous,
}: {
  slug: string;
  initialPublic: boolean;
  initialAnonymous: boolean;
}) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [isAnonymous, setIsAnonymous] = useState(initialAnonymous);
  const [saving, setSaving] = useState(false);

  async function update(field: "is_public" | "is_anonymous", value: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, [field]: value }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan");
      if (field === "is_public") setIsPublic(value);
      if (field === "is_anonymous") setIsAnonymous(value);
    } catch {
      // revert
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-3 space-y-2">
      <div className="flex items-center gap-1 text-ink-muted">
        <Info size={11} strokeWidth={2} />
        <p className="text-[11px] font-semibold uppercase tracking-wider">
          Pengaturan Review
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink">Publik</p>
        <Toggle checked={isPublic} onChange={() => update("is_public", !isPublic)} disabled={saving} />
      </div>

      {isPublic && (
        <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
          <p className="text-sm text-ink">Tampil anonim</p>
          <Toggle checked={isAnonymous} onChange={() => update("is_anonymous", !isAnonymous)} disabled={saving} />
        </div>
      )}
    </div>
  );
}
