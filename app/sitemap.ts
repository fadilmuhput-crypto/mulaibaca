import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase-route";
import { CATEGORY_TREE } from "@/lib/category-tree";
import { BUKU_ANAK, BUKU_LOKAL } from "@/lib/curated-books";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mulaibaca.id";

  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/daftar`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/masuk`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/review`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/panduan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/bantuan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/coba`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/brand`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/lingkar-baca`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/kategori`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  const kategoriUrls: MetadataRoute.Sitemap = CATEGORY_TREE.flatMap((cat) => [
    { url: `${baseUrl}/kategori/${cat.key}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 },
    ...cat.children.map((sub) => ({
      url: `${baseUrl}/kategori/${sub.key}` as const,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]);

  const curatedBooks = [...BUKU_ANAK, ...BUKU_LOKAL];
  const bookUrls: MetadataRoute.Sitemap = curatedBooks.map((book) => ({
    url: `${baseUrl}/buku/${toSlug(book.title)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const admin = createAdminClient();
    const { data: posts } = await admin
      .from("blog_posts")
      .select("slug, published_at, created_at")
      .eq("is_published", true);
    if (posts) {
      blogUrls = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.published_at ?? post.created_at ?? new Date()),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // blog table may not exist yet in some environments
  }

  let reviewUrls: MetadataRoute.Sitemap = [];
  let dbBookUrls: MetadataRoute.Sitemap = [];
  let profileUrls: MetadataRoute.Sitemap = [];
  try {
    const admin = createAdminClient();
    const [{ data: reviews }, { data: dbBooks }, { data: profiles }] = await Promise.all([
      admin.from("reviews").select("slug, updated_at").eq("is_draft", false),
      admin.from("books").select("slug, updated_at").eq("is_active", true).not("slug", "is", null),
      admin.from("members").select("username").not("username", "is", null).limit(200),
    ]);
    if (reviews) {
      reviewUrls = reviews.map((r) => ({
        url: `${baseUrl}/review/${r.slug}`,
        lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    }
    if (dbBooks) {
      dbBookUrls = dbBooks.map((b) => ({
        url: `${baseUrl}/buku/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
    if (profiles) {
      profileUrls = profiles.map((p) => ({
        url: `${baseUrl}/u/${p.username}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.4,
      }));
    }
  } catch {
    // tables may not exist yet
  }

  return [...staticUrls, ...kategoriUrls, ...bookUrls, ...blogUrls, ...reviewUrls, ...dbBookUrls, ...profileUrls];
}
