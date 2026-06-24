import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/rak", "/log", "/profil", "/api/", "/setup-profil", "/keluarga"],
    },
    sitemap: "https://www.mulaibaca.my.id/sitemap.xml",
  };
}
