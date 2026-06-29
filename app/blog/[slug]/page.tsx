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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || undefined,
    author: { "@type": "Person", name: post.author_name },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.created_at,
    image: post.cover_image || undefined,
    url: `https://mulaibaca.id/blog/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://mulaibaca.id/blog/${slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-parchment">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-surface/80 backdrop-blur-md border-b border-border/60 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/" className="text-lg font-display font-bold text-forest tracking-tight">mulaibaca</Link>
        <div className="flex items-center gap-3">
          <Link href="/blog" className="text-xs text-ink-secondary font-medium hover:text-ink transition-colors">Blog</Link>
          <Link href="/daftar" className="btn-primary-sm">Mulai Gratis</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/blog"
          className="text-xs text-amber font-medium hover:text-amber-hover transition-colors mb-4 inline-block"
        >
          ← Kembali ke Blog
        </Link>

        <article>
          {post.cover_image && (
            <div className="rounded-2xl overflow-hidden mb-6 aspect-[2/1] bg-parchment">
              <img
                src={post.cover_image}
                alt={post.title}
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
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

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
