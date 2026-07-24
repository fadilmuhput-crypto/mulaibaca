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

    // Try JSON-LD first
    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const ld = JSON.parse(jsonLdMatch[1]);
        title = ld.name ?? null;
        author = typeof ld.author === "string" ? ld.author : (ld.author?.name ?? null);
        isbn = ld.isbn?.replace(/^="|"$|="|"/g, "").trim() || null;
        if (isbn && !/^\d{10}(\d{3})?$/.test(isbn)) isbn = null;
        pages = ld.numberOfPages ?? null;
        description = ld.description ?? null;
      } catch {
        // ignore
      }
    }

    // Fallbacks from meta tags
    if (!title) {
      const m = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);
      if (m) title = m[1];
    }
    if (!author) {
      const m = html.match(/<meta[^>]*name="author"[^>]*content="([^"]*)"/i);
      if (m) author = m[1];
    }
    if (!coverUrl) {
      const m = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i);
      if (m) coverUrl = m[1];
    }
    if (!description) {
      const m = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/i);
      if (m) description = m[1];
    }

    // Try extracting pages from HTML if not in JSON-LD
    if (!pages) {
      const pagesMatch = html.match(/(\d+)\s*(?:pages|halaman)/i);
      if (pagesMatch) pages = parseInt(pagesMatch[1]);
    }

    return NextResponse.json({
      data: {
        title,
        author,
        cover_url: coverUrl,
        isbn,
        description: description?.substring(0, 2000) || null,
        total_pages: pages,
      },
    });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data dari Goodreads" }, { status: 500 });
  }
}
