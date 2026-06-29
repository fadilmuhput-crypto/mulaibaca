"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = {
  initial?: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    author_name: string;
    cover_image: string | null;
    is_published: boolean;
  };
};

export default function BlogForm({ initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [authorName, setAuthorName] = useState(initial?.author_name ?? "Tim Mulaibaca");
  const [coverImage, setCoverImage] = useState(initial?.cover_image ?? "");
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul wajib diisi");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const method = initial ? "PATCH" : "POST";
      const url = initial
        ? `/api/admin/blog-posts/${initial.id}`
        : "/api/admin/blog-posts";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          excerpt: excerpt.trim(),
          author_name: authorName.trim(),
          cover_image: coverImage.trim() || null,
          is_published: isPublished,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menyimpan");
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="bg-error-soft border border-error/30 rounded-xl p-4 text-sm text-error">
          {error}
        </div>
      )}

      <div>
        <label className="input-label">Judul Artikel</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input w-full"
          placeholder="Judul artikel"
          required
        />
      </div>

      <div>
        <label className="input-label">Ringkasan (excerpt)</label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="input w-full h-20 resize-none"
          placeholder="Ringkasan singkat yang muncul di halaman blog…"
        />
        <p className="input-hint">Akan muncul di kartu blog dan meta description</p>
      </div>

      <div>
        <label className="input-label">Konten</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input w-full h-64 resize-y font-mono text-sm leading-relaxed"
          placeholder="Tulis konten artikel di sini…"
        />
        <p className="input-hint">HTML didukung. Bisa juga gunakan Markdown sederhana.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">Nama Penulis</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="input-label">URL Gambar Sampul</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="input w-full"
            placeholder="https://…"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="w-4 h-4 rounded border-border text-forest focus:ring-forest"
        />
        <div>
          <span className="text-sm font-medium text-ink">Terbitkan sekarang</span>
          <p className="text-xs text-ink-muted">Artikel akan langsung tampil di halaman publik /blog</p>
        </div>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Menyimpan…" : initial ? "Simpan Perubahan" : "Buat Artikel"}
        </button>
        <Link href="/admin/blog" className="btn-ghost-ink">
          Batal
        </Link>
      </div>
    </form>
  );
}
