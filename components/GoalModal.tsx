"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, X } from "lucide-react";

export default function GoalModal({
  currentGoal,
  onClose,
}: {
  currentGoal: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [goal, setGoal] = useState(currentGoal);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (goal === currentGoal) { onClose(); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weeklyPagesGoal: goal }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Gagal menyimpan");
      }
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-surface rounded-2xl w-full max-w-sm p-6 space-y-4 brutal-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} strokeWidth={1.75} className="text-amber" />
            <h3 className="font-semibold text-ink text-sm">Target membaca mingguan</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-ink-muted hover:bg-parchment transition-colors">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <p className="text-xs text-ink-muted">Berapa halaman targetmu setiap minggu?</p>

        <div className="flex gap-2 flex-wrap">
          {[25, 50, 100, 150].map((preset) => (
            <button key={preset} type="button" onClick={() => setGoal(preset)}
              className={`min-h-[40px] px-4 rounded-xl text-sm font-medium border-2 transition-all ${
                goal === preset ? "border-amber bg-amber text-white" : "border-border bg-parchment text-ink-secondary hover:border-amber/50"
              }`}
            >{preset} hal</button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <input type="number" min={0} max={999} value={goal || ""} onChange={(e) => setGoal(Math.max(0, parseInt(e.target.value) || 0))} placeholder="Atau ketik sendiri" className="input flex-1" />
          {goal > 0 && <button type="button" onClick={() => setGoal(0)} className="btn-ghost-ink px-3 text-sm">Hapus</button>}
        </div>

        {error && <p className="text-xs text-error text-center">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Batal</button>
          <button onClick={handleSave} disabled={saving || goal === currentGoal} className="btn-primary flex-1 text-sm">
            {saving ? "Menyimpan…" : goal > 0 ? "Simpan Target" : "Hapus Target"}
          </button>
        </div>
      </div>
    </div>
  );
}
