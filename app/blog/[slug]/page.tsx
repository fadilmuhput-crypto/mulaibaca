import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-route";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: post } = await admin
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!post) return { title: "Blog — Mulaibaca" };

  const url = `https://mulaibaca.id/blog/${slug}`;

  return {
    title: `${post.title} — Mulaibaca`,
    description: post.excerpt || post.content?.slice(0, 200) || "",
    alternates: { canonical: url },
    openGraph: {
      title: `${post.title} — Mulaibaca`,
      description: post.excerpt || post.content?.slice(0, 200) || "",
      url,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — Mulaibaca`,
      description: post.excerpt || post.content?.slice(0, 200) || "",
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  };
}

const CATEGORIES = {
  "tips-membaca": "Tips Membaca",
  "kebiasaan": "Kebiasaan & Rutinitas",
  "review-buku": "Review Buku",
  "inspirasi": "Inspirasi & Cerita",
  "produktivitas": "Produktivitas",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: post } = await admin
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!post) notFound();

  const url = `https://mulaibaca.id/blog/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Blog", item: "https://mulaibaca.id/blog" },
          { "@type": "ListItem", position: 2, name: post.title, item: url },
        ],
      },
      {
        "@type": "Article",
        headline: post.title,
        description: post.excerpt || undefined,
        author: { "@type": "Person", name: post.author_name },
        publisher: { "@type": "Organization", name: "Mulaibaca", logo: { "@type": "ImageObject", url: "https://mulaibaca.id/icon.png" } },
        datePublished: post.published_at,
        dateModified: post.updated_at || post.created_at,
        image: post.cover_image || undefined,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-surface/80 backdrop-blur-md border-b border-border/60 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="text-lg font-display font-bold text-forest tracking-tight" aria-label="Beranda">mulaibaca</Link>
        <nav className="flex items-center gap-3" aria-label="Navigasi">
          <Link href="/blog" className="text-xs text-ink-secondary font-medium hover:text-ink transition-colors">Blog</Link>
          <Link href="/daftar" className="btn-primary-sm" aria-label="Daftar gratis">Mulai Gratis</Link>
        </nav>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/blog"
          className="text-xs text-amber font-medium hover:text-amber-hover transition-colors mb-4 inline-block"
          aria-label="Kembali ke daftar blog"
        >
          ← Kembali ke Blog
        </Link>

        <article className="reading-content-area">
          {post.cover_image && (
            <div className="rounded-2xl overflow-hidden mb-6 aspect-[2/1] bg-parchment">
              <img
                src={post.cover_image}
                alt={post.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-h1 mb-3">{post.title}</h1>

          <div className="flex items-center gap-3 text-sm text-ink-muted mb-6">
            <span>{post.author_name}</span>
            {post.category && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-soft text-amber">
                  {CATEGORIES[post.category as keyof typeof CATEGORIES] ?? post.category}
                </span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>{post.published_at ? formatDate(post.published_at) : ""}</span>
          </div>

          <div
            className="prose-blog max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content?.replace(/<img(?![^>]*loading=)/g, '<img loading="lazy"') ?? "" }}
          />
        </article>

        {/* Related posts */}
        {post.category && (
          <RelatedPosts category={post.category} excludeSlug={slug} />
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

async function RelatedPosts({ category, excludeSlug }: { category: string; excludeSlug: string }) {
  const admin = createAdminClient();
  const { data: related } = await admin
    .from("blog_posts")
    .select("slug, title, excerpt, cover_image, category, author_name, published_at")
    .eq("is_published", true)
    .eq("category", category)
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(2);

  if (!related || related.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border" aria-labelledby="related-heading">
      <h2 id="related-heading" className="text-h2 mb-4">Bacaan Lainnya</h2>
      <div className="grid gap-4">
        {related.map((r) => (
          <Link
            key={r.slug}
            href={`/blog/${r.slug}`}
            className="bg-surface rounded-xl border border-border p-4 hover:border-amber/50 transition-colors flex gap-4"
          >
            {r.cover_image && (
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-parchment">
                <img src={r.cover_image} alt={r.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-amber-soft text-amber mb-1.5 inline-block">
                {CATEGORIES[r.category as keyof typeof CATEGORIES] ?? r.category}
              </span>
              <h3 className="font-display font-bold text-sm text-ink leading-tight line-clamp-2">{r.title}</h3>
              <p className="text-xs text-ink-muted mt-1">{r.author_name} · {r.published_at ? formatDate(r.published_at) : ""}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
