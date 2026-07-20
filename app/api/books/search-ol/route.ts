import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

const OL_SEARCH = "https://openlibrary.org/search.json";

type OLDoc = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Query minimal 2 karakter" }, { status: 400 });
  }

  const fields = "key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median";
  const url = `${OL_SEARCH}?q=${encodeURIComponent(q)}&limit=12&fields=${fields}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Gagal mencari di OpenLibrary" }, { status: 502 });
  }

  const data = await res.json();
  const docs: OLDoc[] = data.docs ?? [];

  const supabase = createAdminClient();
  const { data: existingBooks } = await supabase
    .from("books")
    .select("open_library_id")
    .not("open_library_id", "is", null);

  const existingIds = new Set((existingBooks ?? []).map((b) => b.open_library_id));

  const results = docs.map((doc) => {
    const olId = doc.key.replace("/works/", "");
    return {
      ol_id: olId,
      title: doc.title,
      author: doc.author_name?.[0] ?? "Unknown",
      first_publish_year: doc.first_publish_year ?? null,
      isbn: doc.isbn?.[0] ?? null,
      cover_url: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      total_pages: doc.number_of_pages_median ?? null,
      already_exists: existingIds.has(olId),
    };
  });

  return NextResponse.json({ data: results, total: data.numFound ?? 0 });
}
