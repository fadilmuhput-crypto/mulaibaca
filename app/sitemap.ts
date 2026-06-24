import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://mulaibaca.my.id";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/masuk`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/daftar`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/review`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  try {
    const supabase = await createClient();
    const { data: reviews } = await supabase
      .from("reviews")
      .select("slug, published_at")
      .eq("is_public", true)
      .order("published_at", { ascending: false })
      .limit(500);

    const reviewRoutes: MetadataRoute.Sitemap = (reviews ?? []).map((r) => ({
      url: `${base}/review/${r.slug}`,
      lastModified: new Date(r.published_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...reviewRoutes];
  } catch {
    return staticRoutes;
  }
}
