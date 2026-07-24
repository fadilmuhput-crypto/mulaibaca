import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";

async function isAdmin(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: member } = await supabase
    .from("members")
    .select("is_cms_admin")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return member?.is_cms_admin === true;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { url } = await req.json();
  if (!url || !url.includes("goodreads.com")) {
    return NextResponse.json({ error: "URL harus dari goodreads.com" }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Gagal mengakses Goodreads" }, { status: 502 });
    }

    const html = await res.text();

    let title: string | null = null;
    let author: string | null = null;
    let coverUrl: string | null = null;
    let isbn: string | null = null;
    let description: string | null = null;
    let pages: number | null = null;
    let publisher: string | null = null;
    let publishedYear: number | null = null;

    // Try JSON-LD first
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const ld = JSON.parse(jsonLdMatch[1]);
        title = ld.name ?? null;

        // Handle author as array or object
        if (Array.isArray(ld.author)) {
          author = ld.author[0]?.name ?? null;
        } else if (typeof ld.author === "string") {
          author = ld.author;
        } else {
          author = ld.author?.name ?? null;
        }

        // ISBN
        isbn = ld.isbn?.replace(/^="|"$|="|"/g, "").trim() || null;
        if (isbn && !/^\d{10}(\d{3})?$/.test(isbn)) isbn = null;

        pages = ld.numberOfPages ?? null;

        // Description — JSON-LD rarely has it, but check anyway
        if (typeof ld.description === "string") {
          description = ld.description;
        } else if (ld.description?.value) {
          description = ld.description.value;
        }

        // Publisher
        if (typeof ld.publisher === "string") {
          publisher = ld.publisher;
        } else if (ld.publisher?.name) {
          publisher = ld.publisher.name;
        }

        // Date published
        if (ld.datePublished) {
          const yearMatch = String(ld.datePublished).match(/(\d{4})/);
          if (yearMatch) publishedYear = parseInt(yearMatch[1]);
        }
      } catch {
        // ignore
      }
    }

    // Fallbacks from meta tags
    if (!title) {
      const m = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);
      if (m) title = m[1];
    }

    // Author fallback: try og:title "Title by Author | Goodreads"
    if (!author) {
      const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleTag) {
        const byMatch = titleTag[1].match(/\bby\s+(.+?)(?:\s*\|\s*Goodreads|$)/i);
        if (byMatch) author = byMatch[1].trim();
      }
    }

    // Author fallback: meta name="author"
    if (!author) {
      const m = html.match(/<meta[^>]*name="author"[^>]*content="([^"]*)"/i);
      if (m) author = m[1];
    }

    if (!coverUrl) {
      const m = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i);
      if (m) coverUrl = m[1];
    }

    // Description fallback: look for DescriptionSection in HTML
    if (!description) {
      // Try the "Description" section content
      const descMatch = html.match(/<span[^>]*data-testid="description"[^>]*>([\s\S]*?)<\/span>/i);
      if (descMatch) {
        description = descMatch[1].replace(/<[^>]+>/g, "").trim();
      }
    }
    if (!description) {
      // Try "About" section
      const aboutMatch = html.match(/class="[^"]*BookPageMetadataSection__description[^"]*"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i);
      if (aboutMatch) {
        description = aboutMatch[1].replace(/<[^>]+>/g, "").trim();
      }
    }
    if (!description) {
      const m = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/i);
      if (m) description = m[1];
    }

    // Pages fallback
    if (!pages) {
      const pagesMatch = html.match(/(\d+)\s*(?:pages|halaman)/i);
      if (pagesMatch) pages = parseInt(pagesMatch[1]);
    }

    // Publisher fallback: look for "Publisher" in the metadata section
    if (!publisher) {
      const pubMatch = html.match(/Publisher[^<]*<\/span>\s*<span[^>]*>([^<]+)<\/span>/i);
      if (pubMatch) publisher = pubMatch[1].trim();
    }
    if (!publisher) {
      // Try "Published by" pattern
      const pubMatch2 = html.match(/Published[^:]*:\s*([A-Za-z][^<\n,]+)/i);
      if (pubMatch2) publisher = pubMatch2[1].trim();
    }

    // Year fallback: look for published date in metadata
    if (!publishedYear) {
      const yearMatch = html.match(/First published[^<]*?(\d{4})/i);
      if (yearMatch) publishedYear = parseInt(yearMatch[1]);
    }
    if (!publishedYear) {
      const yearMatch = html.match(/Published[^<]*?(\w+ \d{1,2},? (\d{4})|\d{4})/i);
      if (yearMatch) {
        const y = parseInt(yearMatch[2] ?? yearMatch[1]);
        if (y > 1000 && y < 2100) publishedYear = y;
      }
    }

    return NextResponse.json({
      data: {
        title,
        author,
        cover_url: coverUrl,
        isbn,
        description: description?.substring(0, 2000) || null,
        total_pages: pages,
        publisher,
        published_year: publishedYear,
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data dari Goodreads" }, { status: 500 });
  }
}
