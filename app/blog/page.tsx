import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-route";

export const dynamic = "force-dynamic";

const CATEGORIES: Record<string, string> = {
  "tips-membaca": "Tips Membaca",
  "kebiasaan": "Kebiasaan & Rutinitas",
  "review-buku": "Review Buku",
  "inspirasi": "Inspirasi & Cerita",
  "produktivitas": "Produktivitas",
};

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ category?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const canonical = params?.category ? "https://mulaibaca.id/blog" : "https://mulaibaca.id/blog";
  return {
    title: "Blog — Mulaibaca",
    description: "Inspirasi dan tips membangun kebiasaan membaca, review buku, dan cerita dari para pembaca yang memulai dari satu halaman.",
    alternates: {
      canonical,
      types: { "application/rss+xml": "https://mulaibaca.id/feed.xml" },
    },
    openGraph: {
      title: "Blog — Mulaibaca",
      description: "Inspirasi dan tips membangun kebiasaan membaca.",
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Blog — Mulaibaca",
      description: "Inspirasi dan tips membangun kebiasaan membaca.",
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage(props: { searchParams?: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const activeCategory = searchParams?.category || "";

  const admin = createAdminClient();
  let query = admin
    .from("blog_posts")
    .select("*")
    .eq("is_published", true);

  if (activeCategory) {
    query = query.eq("category", activeCategory);
  }

  const { data: posts } = await query.order("published_at", { ascending: false });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Blog — Mulaibaca",
    description: "Inspirasi dan tips membangun kebiasaan membaca, review buku, dan cerita dari para pembaca.",
    url: "https://mulaibaca.id/blog",
    mainEntity: {
      "@type": "Blog",
      name: "Blog Mulaibaca",
    },
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="bg-surface/80 backdrop-blur-md border-b border-border/60 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="text-lg font-display font-bold text-forest tracking-tight" aria-label="Beranda">mulaibaca</Link>
        <nav className="flex items-center gap-3" aria-label="Navigasi">
          <Link href="/daftar" className="btn-primary-sm" aria-label="Daftar gratis">Mulai Gratis</Link>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-h1 mb-1">Blog</h1>
        <p className="text-ink-secondary text-sm mb-6">
          Inspirasi dan tips membangun kebiasaan membaca, mulai dari satu halaman
        </p>

        {/* Category filter */}
        <nav className="flex flex-wrap gap-2 mb-8" aria-label="Filter kategori">
          <Link
            href="/blog"
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              !activeCategory
                ? "bg-ink text-parchment border-ink"
                : "bg-surface text-ink-secondary border-border hover:border-ink/30"
            }`}
            aria-current={!activeCategory ? "page" : undefined}
          >
            Semua
          </Link>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <Link
              key={key}
              href={`/blog?category=${key}`}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                activeCategory === key
                  ? "bg-ink text-parchment border-ink"
                  : "bg-surface text-ink-secondary border-border hover:border-ink/30"
              }`}
              aria-current={activeCategory === key ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>

        {(posts ?? []).length === 0 ? (
          <div className="text-center py-16" role="status">
            <p className="text-ink-secondary">Belum ada artikel di kategori ini.</p>
            {activeCategory && (
              <Link href="/blog" className="text-sm text-amber font-medium hover:underline mt-2 inline-block">
                ← Lihat semua artikel
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {posts?.map((post) => (
              <article
                key={post.id}
                className="bg-surface rounded-2xl border border-border p-5 hover:border-amber/50 hover:shadow-sm transition-all"
              >
                <Link
                href={`/blog/${post.slug}`}
                className="block"
                aria-label={`Baca artikel: ${post.title}`}
                >
                {post.cover_image && (
                  <div className="rounded-xl overflow-hidden mb-4 aspect-[2/1] bg-parchment relative">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 640px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {post.category && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-soft text-amber">
                      {CATEGORIES[post.category] ?? post.category}
                    </span>
                  )}
                </div>
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
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-border text-center">
          <p className="text-sm text-ink-secondary mb-3">
            Mulai bangun kebiasaan membaca hari ini
          </p>
          <Link href="/daftar" className="btn-primary">
            Mulai Gratis →
          </Link>
        </div>
      </main>
    </div>
  );
}
