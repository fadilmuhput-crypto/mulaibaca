import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/rak", "/log", "/profil", "/api/", "/setup-profil", "/keluarga", "/admin", "/catatan", "/cari"],
    },
    sitemap: "https://mulaibaca.id/sitemap.xml",
  };
}
