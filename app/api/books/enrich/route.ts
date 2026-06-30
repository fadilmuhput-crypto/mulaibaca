import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

const OL_SEARCH = "https://openlibrary.org/search.json";
const OL_WORKS = "https://openlibrary.org/works";

type OLBook = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  publisher?: string[];
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  subject?: string[];
  subject_facet?: string[];
  ia?: string[];
  first_sentence?: string[];
  description?: string;
  subtitle?: string;
};

async function fetchOLByTitle(title: string, author?: string): Promise<OLBook | null> {
  const q = author ? `${title} ${author}` : title;
  const res = await fetch(`${OL_SEARCH}?q=${encodeURIComponent(q)}&limit=5&fields=key,title,author_name,first_publish_year,publisher,isbn,cover_i,number_of_pages_median,subject,subject_facet,ia,first_sentence`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const docs: OLBook[] = data.docs ?? [];
  return docs[0] ?? null;
}

async function fetchOLDescription(olId: string): Promise<string | null> {
  try {
    const res = await fetch(`${OL_WORKS}/${olId}.json`, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data = await res.json();
    const desc = data.description;
    if (!desc) return null;
    if (typeof desc === "string") return desc;
    if (desc.value) return desc.value;
    return null;
  } catch {
    return null;
  }
}

function inferCategories(olBook: OLBook): string[] {
  const subjects = new Set((olBook.subject ?? []).map(s => s.toLowerCase()));
  const categories: string[] = [];

  if (subjects.has("fiction") || subjects.has("novels") || subjects.has("short stories")) {
    categories.push("fiksi");
  }
  if (["biography", "autobiography", "memoirs"].some(s => subjects.has(s))) {
    categories.push("non-fiksi", "biografi");
  }
  if (["self-help", "self-help publications", "personal development", "conduct of life"].some(s => subjects.has(s))) {
    categories.push("non-fiksi", "pengembangan-diri");
  }
  if (["business", "economics", "management", "leadership", "finance"].some(s => subjects.has(s))) {
    categories.push("non-fiksi", "bisnis");
  }
  if (["psychology", "philosophy", "mental health"].some(s => subjects.has(s))) {
    categories.push("non-fiksi", "psikologi");
  }
  if (["history", "historical", "civilization"].some(s => subjects.has(s))) {
    categories.push("non-fiksi", "sejarah");
  }
  if (["science", "technology", "physics", "biology", "chemistry", "nature"].some(s => subjects.has(s))) {
    categories.push("non-fiksi", "sains");
  }
  if (["religion", "spirituality", "islam", "buddhism", "christianity"].some(s => subjects.has(s))) {
    categories.push("non-fiksi", "agama");
  }
  if (["fantasy", "magic", "mythology", "dragons"].some(s => subjects.has(s))) {
    categories.push("fiksi", "fantasi");
  }
  if (["science fiction", "sci-fi", "dystopian", "time travel"].some(s => subjects.has(s))) {
    categories.push("fiksi", "fiksi-ilmiah");
  }
  if (["romance", "love", "romance fiction"].some(s => subjects.has(s))) {
    categories.push("fiksi", "romance");
  }
  if (["thriller", "mystery", "suspense", "detective", "crime", "horror"].some(s => subjects.has(s))) {
    categories.push("fiksi", "thriller");
  }
  if (["humor", "comedy", "wit"].some(s => subjects.has(s))) {
    categories.push("fiksi", "humor");
  }
  if (["young adult", "ya", "teen", "young adult fiction"].some(s => subjects.has(s))) {
    categories.push("remaja");
  }
  if (["children", "juvenile", "picture books", "board books"].some(s => subjects.has(s))) {
    categories.push("anak-anak");
  }
  if (["comics", "graphic novels", "manga", "comic books"].some(s => subjects.has(s))) {
    categories.push("komik-grafis");
  }

  return categories.length > 0 ? categories : ["lainnya"];
}

function inferTags(olBook: OLBook): string[] {
  const tags = new Set<string>();
  (olBook.subject ?? []).forEach(s => {
    s.toLowerCase().split(/[,\s/]+/).filter(t => t.length > 2).forEach(t => tags.add(t));
  });
  if (olBook.author_name) {
    olBook.author_name.forEach(a => tags.add(a.toLowerCase().split(" ")[0]));
  }
  return Array.from(tags).slice(0, 20);
}

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookId, ids } = await req.json();

  const bookIds: string[] = ids ?? (bookId ? [bookId] : []);

  if (bookIds.length === 0) {
    return NextResponse.json({ error: "bookId or ids required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: books } = await admin
    .from("books")
    .select("id, title, author, open_library_id, enrichment_status")
    .in("id", bookIds);

  if (!books || books.length === 0) {
    return NextResponse.json({ error: "Books not found" }, { status: 404 });
  }

  const results: { id: string; status: string }[] = [];

  for (const book of books) {
    try {
      let olBook: OLBook | null = null;
      let description: string | null = null;

      if (book.open_library_id) {
        description = await fetchOLDescription(book.open_library_id);
      }

      olBook = await fetchOLByTitle(book.title, book.author ?? undefined);

      const updates: Record<string, unknown> = {
        enrichment_status: "enriched",
        updated_at: new Date().toISOString(),
      };

      if (olBook) {
        if (!book.open_library_id && olBook.key) {
          updates.open_library_id = olBook.key.replace("/works/", "");
        }
        if (olBook.number_of_pages_median) {
          updates.total_pages = olBook.number_of_pages_median;
        }
        if (olBook.first_publish_year) {
          updates.published_year = olBook.first_publish_year;
        }
        if (olBook.publisher && olBook.publisher.length > 0) {
          updates.publisher = olBook.publisher[0];
        }
        if (olBook.cover_i) {
          updates.cover_url = `https://covers.openlibrary.org/b/id/${olBook.cover_i}-M.jpg`;
        }
        updates.categories = inferCategories(olBook);
        updates.tags = inferTags(olBook);
      }

      if (description) {
        updates.description = description;
      }

      const { error: updateErr } = await admin
        .from("books")
        .update(updates)
        .eq("id", book.id);

      if (updateErr) {
        results.push({ id: book.id, status: "failed" });
      } else {
        results.push({ id: book.id, status: "enriched" });
      }
    } catch {
      results.push({ id: book.id, status: "failed" });
    }
  }

  return NextResponse.json({ results });
}

export async function GET(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: pending } = await admin
    .from("books")
    .select("id, title, author")
    .eq("enrichment_status", "pending")
    .limit(20);

  return NextResponse.json({ pending: pending ?? [] });
}
