"use client";

import { useState } from "react";
import { Eye, EyeOff, User, UserX, Info } from "lucide-react";

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
    <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
        <Info size={12} strokeWidth={2} />
        Pengaturan Review
      </p>

      {/* Public toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPublic ? <Eye size={14} strokeWidth={1.75} className="text-forest" /> : <EyeOff size={14} strokeWidth={1.75} className="text-ink-muted" />}
          <div>
            <p className="text-sm font-medium text-ink">{isPublic ? "Publik" : "Privat"}</p>
            <p className="text-xs text-ink-muted">{isPublic ? "Semua orang bisa melihat" : "Hanya kamu yang bisa lihat"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => update("is_public", !isPublic)}
          disabled={saving}
          className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${isPublic ? "bg-forest" : "bg-border"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
        </button>
      </div>

      {/* Anonymous toggle — only when public */}
      {isPublic && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            {isAnonymous ? <UserX size={14} strokeWidth={1.75} className="text-amber" /> : <User size={14} strokeWidth={1.75} className="text-ink-muted" />}
            <div>
              <p className="text-sm font-medium text-ink">{isAnonymous ? "Anonim" : "Tampilkan nama"}</p>
              <p className="text-xs text-ink-muted">{isAnonymous ? "Namamu tidak ditampilkan" : "Review atas namamu"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => update("is_anonymous", !isAnonymous)}
            disabled={saving}
            className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${isAnonymous ? "bg-amber" : "bg-border"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAnonymous ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
          </button>
        </div>
      )}
    </div>
  );
}
