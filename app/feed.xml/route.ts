import { createAdminClient } from "@/lib/supabase-route";

export const dynamic = "force-dynamic";

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = "https://mulaibaca.id";

  const admin = createAdminClient();
  const { data: posts } = await admin
    .from("blog_posts")
    .select("slug, title, excerpt, content, author_name, category, published_at, created_at, cover_image")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const items = (posts ?? []).map((post) => {
    const pubDate = post.published_at
      ? new Date(post.published_at).toUTCString()
      : new Date(post.created_at ?? new Date()).toUTCString();
    const url = `${baseUrl}/blog/${post.slug}`;
    const description = post.excerpt || post.content?.slice(0, 300) || "";
    const categories = post.category ? [post.category] : [];

    return `
  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <description>${escapeXml(description)}</description>
    <pubDate>${pubDate}</pubDate>
    ${post.author_name ? `<author>${escapeXml(post.author_name)}</author>` : ""}
    ${post.cover_image ? `<enclosure url="${escapeXml(post.cover_image)}" type="image/jpeg" />` : ""}
    ${categories.map((c) => `<category>${escapeXml(c)}</category>`).join("\n    ")}
  </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Mulaibaca — Bangun Kebiasaan Membaca</title>
    <link>${baseUrl}</link>
    <description>Inspirasi dan tips membangun kebiasaan membaca, review buku, dan cerita dari para pembaca yang memulai dari satu halaman.</description>
    <language>id</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/icon.png</url>
      <title>Mulaibaca</title>
      <link>${baseUrl}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=1800",
    },
  });
}
