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
    <div className="bg-surface rounded-xl border-2 border-border p-4 space-y-4">
      <div className="flex items-center gap-1.5">
        <Info size={12} strokeWidth={2} className="text-ink-muted" />
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
          Pengaturan Review
        </p>
      </div>

      {/* Public toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`p-1.5 rounded-lg ${isPublic ? "bg-forest/10 text-forest" : "bg-border/50 text-ink-muted"}`}>
            {isPublic ? <Eye size={14} strokeWidth={1.75} /> : <EyeOff size={14} strokeWidth={1.75} />}
          </span>
          <div>
            <p className="text-sm font-medium text-ink">{isPublic ? "Publik" : "Privat"}</p>
            <p className="text-xs text-ink-muted leading-tight">{isPublic ? "Semua orang bisa melihat review ini" : "Hanya kamu yang bisa melihatnya"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => update("is_public", !isPublic)}
          disabled={saving}
          className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isPublic ? "bg-forest" : "bg-border"}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-[24px]" : "translate-x-[2px]"}`} />
        </button>
      </div>

      {/* Anonymous toggle */}
      {isPublic && (
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <div className="flex items-center gap-2.5">
            <span className={`p-1.5 rounded-lg ${isAnonymous ? "bg-amber/10 text-amber" : "bg-border/50 text-ink-muted"}`}>
              {isAnonymous ? <UserX size={14} strokeWidth={1.75} /> : <User size={14} strokeWidth={1.75} />}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{isAnonymous ? "Sembunyikan nama" : "Tampilkan nama"}</p>
              <p className="text-xs text-ink-muted leading-tight">{isAnonymous ? "Review tampil sebagai Anonim" : "Review atas namamu sendiri"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => update("is_anonymous", !isAnonymous)}
            disabled={saving}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isAnonymous ? "bg-amber" : "bg-border"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isAnonymous ? "translate-x-[24px]" : "translate-x-[2px]"}`} />
          </button>
        </div>
      )}
    </div>
  );
}
