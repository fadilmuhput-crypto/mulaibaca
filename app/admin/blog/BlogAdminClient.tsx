"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BlogPost } from "./page";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export default function BlogAdminClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = posts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      p.author_name.toLowerCase().includes(q)
    );
  });

  const publishedCount = posts.filter((p) => p.is_published).length;

  async function togglePublish(post: BlogPost) {
    setToggling(post.id);
    try {
      const res = await fetch(`/api/admin/blog-posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !post.is_published }),
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id
              ? { ...p, is_published: !p.is_published, published_at: !p.is_published ? new Date().toISOString() : null }
              : p
          )
        );
      }
    } finally {
      setToggling(null);
    }
  }

  async function deletePost(post: BlogPost) {
    if (!confirm(`Hapus "${post.title}" secara permanen?`)) return;
    setDeleting(post.id);
    try {
      const res = await fetch(`/api/admin/blog-posts/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        router.refresh();
      }
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: posts.length },
          { label: "Terbit", value: publishedCount },
          { label: "Draf", value: posts.length - publishedCount },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-xl border border-border p-3 text-center">
            <div className="text-2xl font-display font-black text-ink">{s.value}</div>
            <div className="text-xs text-ink-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Cari artikel…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input mb-5"
      />

      {/* Post list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-ink-muted text-sm">
            {search ? "Tidak ada artikel yang cocok." : "Belum ada artikel."}
          </div>
        )}
        {filtered.map((post) => (
          <div
            key={post.id}
            className={`bg-surface rounded-2xl border p-4 flex items-start gap-4 transition-opacity ${
              post.is_published ? "border-border" : "border-border opacity-50"
            }`}
          >
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap mb-1">
                {post.is_published ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-forest/10 text-forest">
                    terbit
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-error-soft text-error">
                    draf
                  </span>
                )}
              </div>
              <p className="font-semibold text-ink text-sm line-clamp-1">{post.title}</p>
              {post.excerpt && (
                <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{post.excerpt}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[11px] text-ink-muted">{post.author_name}</span>
                <span className="text-[11px] text-ink-muted">/blog/{post.slug}</span>
                {post.published_at && (
                  <span className="text-[11px] text-ink-muted">
                    {new Date(post.published_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => togglePublish(post)}
                disabled={toggling === post.id}
                title={post.is_published ? "Turunkan" : "Terbitkan"}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment transition-colors disabled:opacity-40"
              >
                {post.is_published
                  ? <Eye size={16} strokeWidth={1.75} />
                  : <EyeOff size={16} strokeWidth={1.75} />}
              </button>
              <Link
                href={`/admin/blog/${post.id}`}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-parchment hover:text-amber transition-colors"
              >
                <Pencil size={16} strokeWidth={1.75} />
              </Link>
              <button
                onClick={() => deletePost(post)}
                disabled={deleting === post.id}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-muted hover:bg-error-soft hover:text-error transition-colors disabled:opacity-40"
              >
                <Trash2 size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
