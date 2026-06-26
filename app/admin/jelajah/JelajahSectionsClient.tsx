"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { JelajahSection, SectionType } from "@/lib/jelajah-sections";
import { SECTION_TYPE_LABELS, SECTION_TYPE_DESC } from "@/lib/jelajah-sections";
import { GripVertical, Pencil, Trash2, ChevronUp, ChevronDown, Plus, Eye, EyeOff } from "lucide-react";

const TYPE_COLORS: Record<SectionType, string> = {
  featured: "bg-amber-soft text-amber border-amber/30",
  grid_v:   "bg-[#EAF4EE] text-[#2A6B3E] border-[#2A6B3E]/20",
  grid_h:   "bg-[#EBF0F8] text-[#2D4D7A] border-[#2D4D7A]/20",
  banner:   "bg-cream text-ink-secondary border-border",
};

export default function JelajahSectionsClient({ initialSections }: { initialSections: JelajahSection[] }) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<SectionType>("featured");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function toggleActive(section: JelajahSection) {
    const updated = sections.map((s) =>
      s.id === section.id ? { ...s, is_active: !s.is_active } : s
    );
    setSections(updated);
    await fetch(`/api/admin/jelajah-sections/${section.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !section.is_active }),
    });
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = sections.findIndex((s) => s.id === id);
    if (idx + dir < 0 || idx + dir >= sections.length) return;
    const next = [...sections];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    const reordered = next.map((s, i) => ({ ...s, sort_order: i + 1 }));
    setSections(reordered);
    await fetch("/api/admin/jelajah-sections/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((s) => ({ id: s.id, sort_order: s.sort_order })) }),
    });
  }

  async function deleteSection(id: string) {
    if (!confirm("Hapus section ini? Semua buku yang terhubung juga akan dihapus.")) return;
    setDeletingId(id);
    await fetch(`/api/admin/jelajah-sections/${id}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  }

  async function createSection() {
    if (!newTitle.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/jelajah-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), type: newType }),
    });
    const data = await res.json();
    if (res.ok) {
      setSections((prev) => [...prev, data.section]);
      setNewTitle("");
      setCreating(false);
      router.push(`/admin/jelajah/${data.section.id}`);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-3">
      {sections.length === 0 && !creating && (
        <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
          <p className="text-sm text-ink-muted mb-4">Belum ada section. Tambahkan section pertama.</p>
        </div>
      )}

      {sections.map((s, idx) => (
        <div
          key={s.id}
          className={`bg-surface rounded-xl border border-border flex items-center gap-3 px-4 py-3 transition-opacity ${
            !s.is_active ? "opacity-50" : ""
          }`}
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <GripVertical size={16} className="text-ink-muted flex-shrink-0 cursor-grab" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-ink">{s.title}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLORS[s.type]}`}>
                {SECTION_TYPE_LABELS[s.type]}
              </span>
              {!s.is_active && (
                <span className="text-[10px] text-ink-muted bg-border/60 px-2 py-0.5 rounded-full">nonaktif</span>
              )}
            </div>
            {s.subtitle && (
              <p className="text-xs text-ink-muted mt-0.5 truncate">{s.subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => move(s.id, -1)}
              disabled={idx === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment disabled:opacity-20 transition-colors"
              aria-label="Naikan"
            >
              <ChevronUp size={15} strokeWidth={2} />
            </button>
            <button
              onClick={() => move(s.id, 1)}
              disabled={idx === sections.length - 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment disabled:opacity-20 transition-colors"
              aria-label="Turunkan"
            >
              <ChevronDown size={15} strokeWidth={2} />
            </button>
            <button
              onClick={() => toggleActive(s)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment transition-colors"
              aria-label={s.is_active ? "Nonaktifkan" : "Aktifkan"}
              title={s.is_active ? "Nonaktifkan" : "Aktifkan"}
            >
              {s.is_active
                ? <Eye size={15} strokeWidth={2} className="text-ink-secondary" />
                : <EyeOff size={15} strokeWidth={2} className="text-ink-muted" />
              }
            </button>
            <Link
              href={`/admin/jelajah/${s.id}`}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment transition-colors"
              aria-label="Edit"
            >
              <Pencil size={14} strokeWidth={2} className="text-ink-secondary" />
            </Link>
            <button
              onClick={() => deleteSection(s.id)}
              disabled={deletingId === s.id}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FDECEA] transition-colors disabled:opacity-40"
              aria-label="Hapus"
            >
              <Trash2 size={14} strokeWidth={2} className="text-error" />
            </button>
          </div>
        </div>
      ))}

      {/* Form buat section baru */}
      {creating ? (
        <div
          className="bg-surface rounded-xl border-2 border-amber p-4 space-y-3"
          style={{ boxShadow: "var(--shadow-brutal-sm)" }}
        >
          <p className="text-sm font-semibold text-ink">Section baru</p>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Judul section</label>
            <input
              className="input w-full"
              placeholder="cth. Pilihan Editorial"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && createSection()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">Tipe</label>
            <select
              className="input w-full"
              value={newType}
              onChange={(e) => setNewType(e.target.value as SectionType)}
            >
              {(Object.entries(SECTION_TYPE_LABELS) as [SectionType, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <p className="text-[11px] text-ink-muted mt-1">{SECTION_TYPE_DESC[newType]}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createSection}
              disabled={saving || !newTitle.trim()}
              className="btn-primary flex-1"
            >
              {saving ? "Menyimpan…" : "Buat & Edit →"}
            </button>
            <button
              onClick={() => { setCreating(false); setNewTitle(""); }}
              className="btn-ghost-ink"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full rounded-xl border-2 border-dashed border-border py-3 flex items-center justify-center gap-2 text-sm font-semibold text-ink-secondary hover:border-amber/50 hover:text-ink transition-colors"
        >
          <Plus size={16} strokeWidth={2} />
          Tambah Section
        </button>
      )}
    </div>
  );
}
