import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-route";

export const metadata: Metadata = {
  title: "Blog — Mulaibaca",
  description: "Inspirasi dan tips membangun budaya baca keluarga. Temukan panduan, rekomendasi buku, dan cerita dari keluarga Indonesia.",
  alternates: { canonical: "https://mulaibaca.id/blog" },
  openGraph: {
    title: "Blog — Mulaibaca",
    description: "Inspirasi dan tips membangun budaya baca keluarga.",
    url: "https://mulaibaca.id/blog",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Blog — Mulaibaca",
    description: "Inspirasi dan tips membangun budaya baca keluarga.",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const admin = createAdminClient();
  const { data: posts } = await admin
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-surface/80 backdrop-blur-md border-b border-border/60 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="text-lg font-display font-bold text-forest tracking-tight">mulaibaca</Link>
        <Link href="/masuk" className="btn-primary-sm">Masuk</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-h1 mb-1">Blog</h1>
        <p className="text-ink-secondary text-sm mb-8">
          Inspirasi dan tips membangun budaya baca keluarga
        </p>

        {(posts ?? []).length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-secondary">Belum ada artikel. Nantikan update terbaru!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts?.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="bg-surface rounded-2xl border border-border p-5 hover:border-amber/50 hover:shadow-sm transition-all block"
              >
                {post.cover_image && (
                  <div className="rounded-xl overflow-hidden mb-4 aspect-[2/1] bg-parchment">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <h2 className="font-display font-bold text-lg text-ink leading-tight mb-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-ink-secondary leading-relaxed mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-ink-muted">
                  <span>{post.author_name}</span>
                  <span>{post.published_at ? formatDate(post.published_at) : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-sm text-ink-secondary mb-3">
            Ingin mulai membaca bersama keluarga?
          </p>
          <Link href="/daftar" className="btn-primary">
            Buat Ruang Keluarga Gratis →
          </Link>
        </div>
      </main>
    </div>
  );
}
