import { MetadataRoute } from "next";
import { BUKU_ANAK, BUKU_LOKAL } from "@/lib/curated-books";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

const base = "https://www.mulaibaca.my.id";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,             lastModified: new Date(), changeFrequency: "weekly",  priority: 1   },
    { url: `${base}/daftar`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.5 },
    { url: `${base}/review`, lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
  ];

  const bookRoutes: MetadataRoute.Sitemap = [...BUKU_ANAK, ...BUKU_LOKAL].map((b) => ({
    url: `${base}/buku/${toSlug(b.title)}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...bookRoutes];
}
