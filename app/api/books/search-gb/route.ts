import { NextRequest, NextResponse } from "next/server";

const GB_SEARCH = "https://www.googleapis.com/books/v1/volumes";

type GBVolumeInfo = {
  title?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  language?: string;
  industryIdentifiers?: { type: string; identifier: string }[];
};

type GBItem = {
  id: string;
  volumeInfo?: GBVolumeInfo;
};

type GBResponse = {
  totalItems?: number;
  items?: GBItem[];
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const lang = searchParams.get("lang") ?? "id";

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Query minimal 2 karakter" }, { status: 400 });
  }

  const params = new URLSearchParams({
    q,
    maxResults: "10",
    printType: "books",
    langRestrict: lang,
    projection: "lite",
  });

  const url = `${GB_SEARCH}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "Mulaibaca/1.0" },
    });

    if (!res.ok) {
      if (res.status === 429) {
        return NextResponse.json({ error: "Terlalu banyak request. Coba lagi nanti.", data: [], total: 0 }, { status: 200 });
      }
      return NextResponse.json({ error: "Gagal mencari di Google Books", data: [], total: 0 }, { status: 200 });
    }

    const data: GBResponse = await res.json();
    const items = data.items ?? [];

    const results = items
      .filter((item) => item.volumeInfo)
      .map((item) => {
        const info = item.volumeInfo!;
        const isbn13 = info.industryIdentifiers?.find((i) => i.type === "ISBN_13")?.identifier;
        const isbn10 = info.industryIdentifiers?.find((i) => i.type === "ISBN_10")?.identifier;

        return {
          gb_id: item.id,
          title: info.title ?? "Unknown",
          author: info.authors?.[0] ?? null,
          isbn: isbn13 ?? isbn10 ?? null,
          cover_url: info.imageLinks?.thumbnail
            ? info.imageLinks.thumbnail.replace("http://", "https://")
            : null,
          total_pages: info.pageCount ?? null,
          publisher: info.publisher ?? null,
          published_year: info.publishedDate ? parseInt(info.publishedDate, 10) || null : null,
          description: info.description ?? null,
          categories: info.categories ?? [],
          language: info.language ?? null,
        };
      });

    return NextResponse.json({ data: results, total: data.totalItems ?? 0 });
  } catch {
    return NextResponse.json({ error: "Gagal menghubungi Google Books", data: [], total: 0 }, { status: 200 });
  }
}
