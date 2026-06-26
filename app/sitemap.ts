import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { BUKU_ANAK, BUKU_LOKAL } from "@/lib/curated-books";

export const revalidate = 3600; // cache 1 jam

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.mulaibaca.my.id";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,              lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/masuk`,   lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/daftar`,  lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/review`,  lastModified: new Date(), changeFrequency: "daily",  priority: 0.8 },
  ];

  // Curated books — static, always available
  const curatedBookRoutes: MetadataRoute.Sitemap = [...BUKU_ANAK, ...BUKU_LOKAL].map((b) => ({
    url: `${base}/buku/${toSlug(b.title)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const timeout = <T>(p: Promise<T>, ms = 5000): Promise<T> =>
      Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

    const [{ data: reviews }, { data: olBooks }] = await timeout(Promise.all([
      supabase
        .from("reviews")
        .select("slug, published_at")
        .eq("is_public", true)
        .order("published_at", { ascending: false })
        .limit(500),
      supabase
        .from("books")
        .select("title, open_library_id")
        .not("open_library_id", "is", null)
        .limit(500),
    ]));

    const reviewRoutes: MetadataRoute.Sitemap = (reviews ?? []).map((r) => ({
      url: `${base}/review/${r.slug}`,
      lastModified: new Date(r.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    // OL books from user shelves — deduplicate against curated
    const curatedSlugs = new Set(
      [...BUKU_ANAK, ...BUKU_LOKAL].map((b) => toSlug(b.title))
    );
    const olBookRoutes: MetadataRoute.Sitemap = (olBooks ?? [])
      .filter((b: { title: string; open_library_id: string }) => {
        const slug = `${toSlug(b.title)}-${b.open_library_id.toLowerCase()}`;
        return !curatedSlugs.has(toSlug(b.title)) && slug.length > 5;
      })
      .map((b: { title: string; open_library_id: string }) => ({
        url: `${base}/buku/${toSlug(b.title)}-${b.open_library_id.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));

    return [...staticRoutes, ...curatedBookRoutes, ...reviewRoutes, ...olBookRoutes];
  } catch {
    return [...staticRoutes, ...curatedBookRoutes];
  }
}
