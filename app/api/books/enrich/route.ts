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

const NOISE_TAGS = new Set([
  "the", "and", "for", "with", "from", "that", "this", "was", "are", "not",
  "but", "have", "has", "had", "can", "may", "will", "shall", "all", "any",
  "its", "into", "also", "than", "then", "them", "they", "their", "there",
  "here", "when", "where", "what", "which", "who", "whom", "how", "new",
  "york", "times", "bestseller", "general", "other", "fiction", "novel",
  "novels", "stories", "story", "books", "book", "series", "literary",
  "literature", "writing", "written", "author", "english", "indonesian",
  "translation", "translations", "large", "type", "print", "edition",
  "juvenile", "young", "adult", "children",
]);

type FictionRule = { keywords: string[]; categories: string[] };

const FICTION_RULES: FictionRule[] = [
  { keywords: ["juvenile fiction", "children's fiction", "children's stories", "children's picture", "picture book", "board book"], categories: ["anak-anak"] },
  { keywords: ["young adult", "ya fiction", "teen fiction"], categories: ["remaja"] },
  { keywords: ["science fiction", "sci-fi", "dystop", "time travel", "space opera"], categories: ["fiksi", "fiksi ilmiah"] },
  { keywords: ["fantasy", "magic", "mytholog", "dragons", "paranormal", "supernatural"], categories: ["fiksi", "fantasi"] },
  { keywords: ["romance", "love story", "romantic"], categories: ["fiksi", "romance"] },
  { keywords: ["thriller", "mystery", "suspense", "detective", "crime", "murder", "criminal"], categories: ["fiksi", "thriller"] },
  { keywords: ["horror", "ghost", "haunted"], categories: ["fiksi", "horor"] },
  { keywords: ["humor", "comedy", "funny", "satire", "parody", "wit"], categories: ["fiksi", "humor"] },
  { keywords: ["historical fiction", "historical novel"], categories: ["fiksi", "fiksi sejarah"] },
  { keywords: ["comics", "graphic novel", "manga", "webtoon", "comic book"], categories: ["komik"] },
  { keywords: ["fairy tale", "folklore", "folk tale", "fable", "legend", "myth", "dongeng", "cerita rakyat"], categories: ["fiksi", "cerita rakyat"] },
  { keywords: ["poetry", "poems", "poet", "puisi", "sajak"], categories: ["fiksi", "puisi"] },
  { keywords: ["drama", "play", "theater", "theatre"], categories: ["fiksi"] },
];

type NonFictionPattern = { pattern: RegExp; categories: string[] };

const NONFICTION_PATTERNS: NonFictionPattern[] = [
  { pattern: /\bbiograph/i, categories: ["non-fiksi", "biografi"] },
  { pattern: /\bautobiograph/i, categories: ["non-fiksi", "biografi"] },
  { pattern: /\bmemoirs?\b/i, categories: ["non-fiksi", "biografi"] },
  { pattern: /\bself[- ]?help\b/i, categories: ["non-fiksi", "pengembangan diri"] },
  { pattern: /\bpersonal (development|growth)\b/i, categories: ["non-fiksi", "pengembangan diri"] },
  { pattern: /\bmotivational\b|\binspirational\b|\bsuccess\b(?!ful)/i, categories: ["non-fiksi", "pengembangan diri"] },
  { pattern: /\bproductiv/i, categories: ["non-fiksi", "pengembangan diri"] },
  { pattern: /\bbusiness\b(?! fiction)|\beconomics\b|\bmanagement\b|\bleadership\b|\bfinance\b|\binvesting\b|\bentrepreneur/i, categories: ["non-fiksi", "bisnis"] },
  { pattern: /\bpsycholog(?!y fiction)|\bpsychoanaly/i, categories: ["non-fiksi", "psikologi"] },
  { pattern: /\bphilosoph(?!y fiction)|\bethics\b|\bexistential/i, categories: ["non-fiksi", "psikologi"] },
  { pattern: /\bhistory\b(?!\s*fiction)|\bcivilization\b|\bempire\b|\bwar\b(?! fiction)|\brevolution\b|\bcolonial/i, categories: ["non-fiksi", "sejarah"] },
  { pattern: /\bphysics\b|\bbiology\b|\bchemistry\b|\bastronomy\b|\bmathematics\b|\bevolution\b|\bquantum\b|\bgenetic\b|\bDNA\b/i, categories: ["non-fiksi", "sains"] },
  { pattern: /\bcomputer\b|\bprogramming\b|\bsoftware\b|\binternet\b|\bdigital\b|\bartificial intelligence\b/i, categories: ["non-fiksi", "sains"] },
  { pattern: /\breligion\b|\bislam\b|\bmuslim\b|\bchristian\b|\bbuddhist\b|\bfaith\b|\bprayer\b|\bquran\b|\bbible\b/i, categories: ["non-fiksi", "agama"] },
  { pattern: /\bcooking\b|\brecipe\b|\bculinary\b|\bbaking\b|\bmasak\b|\bresep\b/i, categories: ["non-fiksi", "masakan"] },
  { pattern: /\btravel\b(?! fiction)|\btravelogue\b|\bbackpacking\b/i, categories: ["non-fiksi", "perjalanan"] },
  { pattern: /\bsport\b|\bathlet\b|\bfootball\b|\bsoccer\b|\bfitness\b|\bexercise\b|\olahraga/i, categories: ["non-fiksi", "olahraga"] },
  { pattern: /\bpaint(ing|er)\b|\bsculpture\b|\bphotography\b|\barchitecture\b|\binstrument\b/i, categories: ["non-fiksi", "seni-musik"] },
  { pattern: /\bparenting\b|\bfamily\b(?! fiction)|\bchild-rearing\b|\bchildcare\b/i, categories: ["non-fiksi", "parenting-keluarga"] },
  { pattern: /\beducation\b(?! fiction)|\bteaching\b|\bteacher\b|\bclassroom\b|\bcurriculum\b/i, categories: ["referensi", "pendidikan"] },
  { pattern: /\bgrammar\b|\bvocabulary\b|\bdictionary\b|\bkamus\b|\blinguistic\b/i, categories: ["referensi", "bahasa"] },
  { pattern: /\bencyclopedia\b|\balmanac\b|\batlas\b/i, categories: ["referensi"] },
];

function inferCategoriesFromSubjects(subjectList: string[]): string[] {
  const combined = subjectList.join(" ").toLowerCase();
  const categories = new Set<string>();

  if (/cerita\s*rakyat|dongeng|legenda|fabel|mitos/i.test(combined)) {
    categories.add("fiksi");
    categories.add("cerita rakyat");
  }

  let isFiction = false;
  for (const rule of FICTION_RULES) {
    if (rule.keywords.some(kw => combined.includes(kw))) {
      rule.categories.forEach(c => categories.add(c));
      isFiction = true;
    }
  }

  if (!isFiction) {
    if (/\bfiction\b/i.test(combined) || /\bnovel\b/i.test(combined)) {
      categories.add("fiksi");
      isFiction = true;
    } else if (/\bchildren/i.test(combined) || /\bjuvenile\b/i.test(combined)) {
      categories.add("anak-anak");
      isFiction = true;
    } else if (/\byoung adult\b/i.test(combined) || /\bteen\b/i.test(combined)) {
      categories.add("remaja");
      isFiction = true;
    }
  }

  if (!isFiction) {
    for (const { pattern, categories: cats } of NONFICTION_PATTERNS) {
      if (pattern.test(combined)) {
        cats.forEach(c => categories.add(c));
      }
    }
  }

  const subCats = [...categories];
  const hasFiksiSub = subCats.some(c => ["fantasi", "romance", "thriller", "horor", "humor", "fiksi ilmiah", "fiksi sejarah", "cerita rakyat", "puisi"].includes(c));
  const hasNonFiksiSub = subCats.some(c => ["biografi", "pengembangan diri", "bisnis", "psikologi", "sejarah", "sains", "agama", "masakan", "perjalanan", "olahraga", "seni-musik", "parenting-keluarga"].includes(c));

  if (hasFiksiSub) categories.add("fiksi");
  if (hasNonFiksiSub) categories.add("non-fiksi");

  return categories.size > 0 ? [...categories] : ["lainnya"];
}

function inferCategories(olBook: OLBook): string[] {
  return inferCategoriesFromSubjects(olBook.subject ?? []);
}

function inferTags(olBook: OLBook): string[] {
  const tags = new Set<string>();
  for (const raw of olBook.subject ?? []) {
    const s = raw.toLowerCase().trim();
    if (s.length < 3) continue;
    if (/^(nyt:|series:|LC)/.test(s)) continue;
    if (/new york times/i.test(s)) continue;
    if (/\d{4}-\d{2}-\d{2}/.test(s)) continue;
    const cleaned = s.replace(/\s+/g, " ").replace(/[()]/g, "").trim();
    if (cleaned.length > 30) continue;
    if (cleaned.split(" ").length > 4) continue;
    const words = cleaned.split(/\s+/);
    const meaningfulWords = words.filter(w => !NOISE_TAGS.has(w) && w.length > 2);
    if (meaningfulWords.length === 0) continue;
    if (/^fiction$/i.test(cleaned)) continue;
    if (/^fiction,?\s*(general|other)/i.test(cleaned)) continue;
    tags.add(cleaned);
  }
  if (olBook.author_name) {
    olBook.author_name.forEach(a => {
      const first = a.toLowerCase().split(" ")[0];
      if (first.length > 2 && !NOISE_TAGS.has(first)) tags.add(first);
    });
  }
  return Array.from(tags).slice(0, 15);
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
