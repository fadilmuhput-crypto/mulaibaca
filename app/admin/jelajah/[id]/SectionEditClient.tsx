"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Search, X, GripVertical, ChevronUp, ChevronDown, Upload, Trash2 } from "lucide-react";
import type { JelajahSection, SectionType, BannerItem } from "@/lib/jelajah-sections";
import { SECTION_TYPE_LABELS, SECTION_TYPE_DESC } from "@/lib/jelajah-sections";
import type { AdminBook } from "@/app/admin/buku/page";
import BookCover from "@/components/BookCover";

const MAX_BOOKS: Record<SectionType, number> = {
  featured: 4,
  grid_v:   50,
  grid_h:   20,
  banner:   0,
};

export default function SectionEditClient({
  section: initialSection,
  linkedBooks: initialLinked,
  allBooks,
}: {
  section: JelajahSection;
  linkedBooks: AdminBook[];
  allBooks: AdminBook[];
}) {
  const router = useRouter();
  const [section, setSection] = useState(initialSection);
  const [linked, setLinked] = useState(initialLinked);
  const [bookSearch, setBookSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Banner state
  const [bannerLayout, setBannerLayout] = useState<1 | 2 | 4>(
    (initialSection.config as { layout?: 1 | 2 | 4 })?.layout ?? 1
  );
  const [bannerItems, setBannerItems] = useState<BannerItem[]>(
    (initialSection.config as { items?: BannerItem[] })?.items ?? []
  );
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const linkedIds = new Set(linked.map((b) => b.id));
  const filteredBooks = allBooks.filter((b) => {
    if (linkedIds.has(b.id)) return false;
    if (!bookSearch.trim()) return true;
    const q = bookSearch.toLowerCase();
    return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
  });

  const maxBooks = MAX_BOOKS[section.type];

  async function saveSection() {
    setSaving(true);
    const config = section.type === "banner"
      ? { layout: bannerLayout, items: bannerItems }
      : {};
    await fetch(`/api/admin/jelajah-sections/${section.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: section.title,
        subtitle: section.subtitle,
        type: section.type,
        config,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addBook(book: AdminBook) {
    if (maxBooks > 0 && linked.length >= maxBooks) return;
    try {
      const res = await fetch(`/api/admin/jelajah-sections/${section.id}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.id }),
      });
      if (res.ok) {
        setLinked((prev) => [...prev, book]);
      } else {
        const err = await res.json().catch(() => ({ error: "Gagal menambahkan buku" }));
        alert(err.error);
      }
    } catch (e) {
      alert("Network error: " + (e instanceof Error ? e.message : "Gagal terhubung ke server"));
    }
  }

  async function removeBook(book: AdminBook) {
    await fetch(`/api/admin/jelajah-sections/${section.id}/books`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: book.id }),
    });
    setLinked((prev) => prev.filter((b) => b.id !== book.id));
  }

  async function moveBook(idx: number, dir: -1 | 1) {
    const next = [...linked];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setLinked(next);
    await fetch(`/api/admin/jelajah-sections/${section.id}/books`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: next.map((b, i) => ({ book_id: b.id, sort_order: i })),
      }),
    });
  }

  async function uploadBannerImage(slot: number, file: File) {
    setUploadingSlot(slot);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/jelajah-banner", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) {
      setBannerItems((prev) => {
        const next = [...prev];
        if (!next[slot]) next[slot] = { image_url: "" };
        next[slot] = { ...next[slot], image_url: data.url };
        return next;
      });
    }
    setUploadingSlot(null);
  }

  function updateBannerItem(slot: number, field: keyof BannerItem, value: string) {
    setBannerItems((prev) => {
      const next = [...prev];
      if (!next[slot]) next[slot] = { image_url: "" };
      next[slot] = { ...next[slot], [field]: value };
      return next;
    });
  }

  const slotCount = bannerLayout;

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/jelajah" className="text-ink-muted hover:text-ink transition-colors">
          <ChevronLeft size={20} strokeWidth={2} />
        </Link>
        <div className="flex-1">
          <h1 className="text-h1">Edit Section</h1>
          <p className="text-sm text-ink-muted mt-0.5">{SECTION_TYPE_LABELS[section.type]}</p>
        </div>
        <button
          onClick={saveSection}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Menyimpan…" : saved ? "✓ Tersimpan" : "Simpan"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Info dasar */}
        <div className="bg-surface rounded-xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="text-sm font-semibold text-ink mb-4">Info Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Tipe</label>
              <select
                className="input w-full"
                value={section.type}
                onChange={(e) => setSection((s) => ({ ...s, type: e.target.value as SectionType }))}
              >
                {(Object.entries(SECTION_TYPE_LABELS) as [SectionType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <p className="text-[11px] text-ink-muted mt-1">{SECTION_TYPE_DESC[section.type]}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">Judul</label>
              <input
                className="input w-full"
                value={section.title}
                onChange={(e) => setSection((s) => ({ ...s, title: e.target.value }))}
                placeholder="cth. Pilihan Editorial"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Subtitle <span className="font-normal text-ink-muted">(opsional)</span>
              </label>
              <input
                className="input w-full"
                value={section.subtitle ?? ""}
                onChange={(e) => setSection((s) => ({ ...s, subtitle: e.target.value }))}
                placeholder="cth. Buku terpilih minggu ini"
              />
            </div>
          </div>
        </div>

        {/* Banner config */}
        {section.type === "banner" && (
          <div className="bg-surface rounded-xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <h2 className="text-sm font-semibold text-ink mb-4">Konfigurasi Banner</h2>

            {/* Layout picker */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-ink-secondary mb-2">Layout</label>
              <div className="flex gap-3">
                {([1, 2, 4] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => setBannerLayout(n)}
                    className={`flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-all ${
                      bannerLayout === n
                        ? "border-ink bg-ink-card text-white"
                        : "border-border text-ink-secondary hover:border-ink/30"
                    }`}
                  >
                    {n === 1 ? "1 Banner" : n === 2 ? "2 Banner" : "4 Banner"}
                  </button>
                ))}
              </div>
            </div>

            {/* Slots */}
            <div className={`grid gap-4 ${slotCount === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {Array.from({ length: slotCount }).map((_, slot) => {
                const item = bannerItems[slot];
                return (
                  <div key={slot} className="rounded-lg border border-border p-3 space-y-3">
                    <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">
                      Banner {slot + 1}
                    </p>

                    {/* Image upload */}
                    <div
                      className="relative rounded-lg overflow-hidden bg-parchment border border-border cursor-pointer group"
                      style={{ aspectRatio: slotCount === 1 ? "3/1" : "3/2" }}
                      onClick={() => fileRefs.current[slot]?.click()}
                    >
                      {item?.image_url ? (
                        <Image src={item.image_url} alt={`Banner ${slot + 1}`} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <Upload size={20} className="text-ink-muted" />
                          <span className="text-xs text-ink-muted">Upload gambar</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-colors flex items-center justify-center">
                        {uploadingSlot === slot && (
                          <div className="bg-white/90 rounded-lg px-3 py-1.5 text-xs font-medium">Mengupload…</div>
                        )}
                      </div>
                      <input
                        ref={(el) => { fileRefs.current[slot] = el; }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadBannerImage(slot, f);
                        }}
                      />
                    </div>

                    <input
                      className="input w-full text-xs"
                      placeholder="Judul (opsional)"
                      value={item?.title ?? ""}
                      onChange={(e) => updateBannerItem(slot, "title", e.target.value)}
                    />
                    <input
                      className="input w-full text-xs"
                      placeholder="Teks CTA, cth. Lihat Koleksi"
                      value={item?.cta_text ?? ""}
                      onChange={(e) => updateBannerItem(slot, "cta_text", e.target.value)}
                    />
                    <input
                      className="input w-full text-xs"
                      placeholder="URL tujuan, cth. /jelajah?kategori=fiksi"
                      value={item?.link_url ?? ""}
                      onChange={(e) => updateBannerItem(slot, "link_url", e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Book picker (featured, grid_v, grid_h) */}
        {section.type !== "banner" && (
          <div className="bg-surface rounded-xl border border-border p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-ink">
                Buku dalam Section
              </h2>
              <span className="text-xs text-ink-muted">
                {linked.length}{maxBooks > 0 ? `/${maxBooks}` : ""} buku
              </span>
            </div>

            {/* Buku terpilih */}
            {linked.length > 0 && (
              <div className="space-y-2 mb-5">
                {linked.map((book, idx) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-3 bg-parchment rounded-lg px-3 py-2"
                  >
                    <GripVertical size={14} className="text-ink-muted flex-shrink-0" />
                    <BookCover
                      src={book.cover_url}
                      title={book.title}
                      className="w-8 h-11 rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{book.title}</p>
                      <p className="text-[11px] text-ink-muted truncate">{book.author}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => moveBook(idx, -1)}
                        disabled={idx === 0}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-border disabled:opacity-20"
                        aria-label="Naikan"
                      >
                        <ChevronUp size={12} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => moveBook(idx, 1)}
                        disabled={idx === linked.length - 1}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-border disabled:opacity-20"
                        aria-label="Turunkan"
                      >
                        <ChevronDown size={12} strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => removeBook(book)}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#FDECEA] text-error"
                        aria-label="Hapus"
                      >
                        <Trash2 size={12} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cari & tambah buku */}
            {(maxBooks === 0 || linked.length < maxBooks) && (
              <>
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  <input
                    type="search"
                    className="input input-icon-lr w-full"
                    placeholder="Cari judul atau pengarang…"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                  />
                  {bookSearch && (
                    <button
                      onClick={() => setBookSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-border">
                  {filteredBooks.slice(0, 50).map((book) => (
                    <button
                      key={book.id}
                      onClick={() => addBook(book)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-parchment transition-colors text-left"
                    >
                      <BookCover
                        src={book.cover_url}
                        title={book.title}
                        className="w-7 h-10 rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink truncate">{book.title}</p>
                        <p className="text-[11px] text-ink-muted truncate">{book.author}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-amber flex-shrink-0">+ Tambah</span>
                    </button>
                  ))}
                  {filteredBooks.length === 0 && (
                    <p className="text-xs text-ink-muted text-center py-4">Tidak ada buku yang cocok</p>
                  )}
                </div>
              </>
            )}

            {maxBooks > 0 && linked.length >= maxBooks && (
              <p className="text-xs text-ink-muted text-center py-2">
                Sudah mencapai maksimal {maxBooks} buku untuk tipe {SECTION_TYPE_LABELS[section.type]}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
