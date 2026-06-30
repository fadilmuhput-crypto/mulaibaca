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

function inferCategoriesFromSubjects(subjectList: string[]): string[] {
  const subjects = new Set(subjectList.map(s => s.toLowerCase()));

  const categories: string[] = [];

  if (["fiction", "novels", "short stories"].some(s => subjects.has(s))) {
    categories.push("fiksi");
  }
  if (["biography", "autobiography", "memoirs"].some(s => subjects.has(s))) {
    categories.push("non-fiksi", "biografi");
  }
  if (["self-help", "self-help publications", "personal development", "conduct of life", "productivity"].some(s => subjects.has(s))) {
    categories.push("non-fiksi", "pengembangan diri");
  }
  if (["business", "economics", "management", "leadership", "finance", "career"].some(s => subjects.has(s))) {
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
  if (["religion", "spirituality", "islam", "buddhism", "christianity", "faith"].some(s => subjects.has(s))) {
    categories.push("non-fiksi", "agama");
  }
  if (["fantasy", "magic", "mythology", "dragons", "paranormal"].some(s => subjects.has(s))) {
    categories.push("fiksi", "fantasi");
  }
  if (["science fiction", "sci-fi", "dystopian", "time travel"].some(s => subjects.has(s))) {
    categories.push("fiksi", "fiksi ilmiah");
  }
  if (["romance", "love", "romance fiction"].some(s => subjects.has(s))) {
    categories.push("fiksi", "romance");
  }
  if (["thriller", "mystery", "suspense", "detective", "crime"].some(s => subjects.has(s))) {
    categories.push("fiksi", "thriller");
  }
  if (["horror"].some(s => subjects.has(s))) {
    categories.push("fiksi", "horor");
  }
  if (["humor", "comedy", "wit", "satire"].some(s => subjects.has(s))) {
    categories.push("fiksi", "humor");
  }
  if (["historical fiction", "historical novels"].some(s => subjects.has(s))) {
    categories.push("fiksi", "fiksi sejarah");
  }
  if (["young adult", "ya", "teen", "young adult fiction"].some(s => subjects.has(s))) {
    categories.push("remaja");
  }
  if (["children", "juvenile", "picture books", "board books", "children's stories"].some(s => subjects.has(s))) {
    categories.push("anak-anak");
  }
  if (["comics", "graphic novels", "manga", "comic books", "webtoon"].some(s => subjects.has(s))) {
    categories.push("komik");
  }
  if (["education", "study", "learning", "reference", "encyclopedia", "dictionary", "language"].some(s => subjects.has(s))) {
    categories.push("pendidikan");
  }
  if (["cooking", "food", "recipes", "culinary"].some(s => subjects.has(s))) {
    categories.push("masakan");
  }
  if (["travel", "voyages", "adventure"].some(s => subjects.has(s))) {
    categories.push("perjalanan");
  }

  return categories.length > 0 ? categories : ["lainnya"];
}

function inferCategories(olBook: OLBook): string[] {
  return inferCategoriesFromSubjects(olBook.subject ?? []);
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
      const { data: existing } = await admin
        .from("books")
        .select("total_pages, published_year, publisher, cover_url, description, categories, tags, open_library_id")
        .eq("id", book.id)
        .single();

      const updates: Record<string, unknown> = {
        enrichment_status: "enriched",
        updated_at: new Date().toISOString(),
      };

      // Strategy: only fill NULL/empty fields, never overwrite existing data
      if (book.open_library_id) {
        // Book has OL ID → fetch description + cover from that specific work
        const desc = await fetchOLDescription(book.open_library_id);
        if (!existing?.description && desc) {
          updates.description = desc;
        }
        // Also fetch cover from the specific work
        try {
          const workRes = await fetch(`${OL_WORKS}/${book.open_library_id}.json`, { next: { revalidate: 86400 } });
          if (workRes.ok) {
            const work = await workRes.json();
            if (!existing?.cover_url && work.covers?.[0]) {
              updates.cover_url = `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`;
            }
            if ((!existing?.categories || existing.categories.length === 0 || (existing.categories as string[]).every((c: string) => c === "lainnya")) && work.subjects) {
              updates.categories = inferCategoriesFromSubjects(work.subjects);
            }
          }
        } catch { /* skip cover/categories from work */ }
      } else {
        // No OL ID → search by title+author
        const olBook = await fetchOLByTitle(book.title, book.author ?? undefined);
        if (olBook) {
          if (olBook.key) {
            updates.open_library_id = olBook.key.replace("/works/", "");
          }
          if (!existing?.total_pages && olBook.number_of_pages_median) {
            updates.total_pages = olBook.number_of_pages_median;
          }
          if (!existing?.published_year && olBook.first_publish_year) {
            updates.published_year = olBook.first_publish_year;
          }
          if (!existing?.publisher && olBook.publisher && olBook.publisher.length > 0) {
            updates.publisher = olBook.publisher[0];
          }
          if (!existing?.cover_url && olBook.cover_i) {
            updates.cover_url = `https://covers.openlibrary.org/b/id/${olBook.cover_i}-M.jpg`;
          }
          if ((!existing?.categories || existing.categories.length === 0 || (existing.categories as string[]).every((c: string) => c === "lainnya"))) {
            updates.categories = inferCategories(olBook);
          }
          if (!existing?.tags || (existing.tags as string[]).length === 0) {
            updates.tags = inferTags(olBook);
          }
        }
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
