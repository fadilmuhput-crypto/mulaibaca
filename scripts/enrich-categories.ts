import { createClient } from "@supabase/supabase-js";

const OL_SEARCH = "https://openlibrary.org/search.json";
const OL_WORKS = "https://openlibrary.org/works";

function buildSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function inferCategoriesFromSubjects(subjectList: string[]): string[] {
  const subjects = new Set(subjectList.map(s => s.toLowerCase()));
  const categories: string[] = [];

  if (["fiction", "novels", "short stories"].some(s => subjects.has(s))) categories.push("fiksi");
  if (["biography", "autobiography", "memoirs"].some(s => subjects.has(s))) { categories.push("non-fiksi"); categories.push("biografi"); }
  if (["self-help", "self-help publications", "personal development", "conduct of life", "productivity"].some(s => subjects.has(s))) { categories.push("non-fiksi"); categories.push("pengembangan diri"); }
  if (["business", "economics", "management", "leadership", "finance", "career"].some(s => subjects.has(s))) { categories.push("non-fiksi"); categories.push("bisnis"); }
  if (["psychology", "philosophy", "mental health"].some(s => subjects.has(s))) { categories.push("non-fiksi"); categories.push("psikologi"); }
  if (["history", "historical", "civilization"].some(s => subjects.has(s))) { categories.push("non-fiksi"); categories.push("sejarah"); }
  if (["science", "technology", "physics", "biology", "chemistry", "nature"].some(s => subjects.has(s))) { categories.push("non-fiksi"); categories.push("sains"); }
  if (["religion", "spirituality", "islam", "buddhism", "christianity", "faith"].some(s => subjects.has(s))) { categories.push("non-fiksi"); categories.push("agama"); }
  if (["fantasy", "magic", "mythology", "dragons", "paranormal"].some(s => subjects.has(s))) { categories.push("fiksi"); categories.push("fantasi"); }
  if (["science fiction", "sci-fi", "dystopian", "time travel"].some(s => subjects.has(s))) { categories.push("fiksi"); categories.push("fiksi ilmiah"); }
  if (["romance", "love", "romance fiction"].some(s => subjects.has(s))) { categories.push("fiksi"); categories.push("romance"); }
  if (["thriller", "mystery", "suspense", "detective", "crime"].some(s => subjects.has(s))) { categories.push("fiksi"); categories.push("thriller"); }
  if (["horror"].some(s => subjects.has(s))) { categories.push("fiksi"); categories.push("horor"); }
  if (["humor", "comedy", "wit", "satire"].some(s => subjects.has(s))) { categories.push("fiksi"); categories.push("humor"); }
  if (["historical fiction", "historical novels"].some(s => subjects.has(s))) { categories.push("fiksi"); categories.push("fiksi sejarah"); }
  if (["young adult", "ya", "teen", "young adult fiction"].some(s => subjects.has(s))) categories.push("remaja");
  if (["children", "juvenile", "picture books", "board books", "children's stories"].some(s => subjects.has(s))) categories.push("anak-anak");
  if (["comics", "graphic novels", "manga", "comic books", "webtoon"].some(s => subjects.has(s))) categories.push("komik");
  if (["education", "study", "learning", "reference", "encyclopedia", "dictionary", "language"].some(s => subjects.has(s))) categories.push("pendidikan");
  if (["cooking", "food", "recipes", "culinary"].some(s => subjects.has(s))) categories.push("masakan");
  if (["travel", "voyages", "adventure"].some(s => subjects.has(s))) categories.push("perjalanan");

  return categories.length > 0 ? categories : ["lainnya"];
}

function inferTags(subjectList: string[]): string[] {
  const tags = new Set<string>();
  subjectList.forEach(s => {
    s.toLowerCase().split(/[,\s/]+/).filter(t => t.length > 2).forEach(t => tags.add(t));
  });
  return Array.from(tags).slice(0, 20);
}

async function fetchOLByTitle(title: string, author: string | null): Promise<{ subjects: string[]; olId: string | null } | null> {
  const q = author ? `${title} ${author}` : title;
  try {
    const res = await fetch(`${OL_SEARCH}?q=${encodeURIComponent(q)}&limit=3&fields=key,title,subject,subject_facet`);
    if (!res.ok) return null;
    const data = await res.json();
    const doc = data.docs?.[0];
    if (!doc) return null;
    return {
      subjects: doc.subject ?? [],
      olId: doc.key?.replace("/works/", "") ?? null,
    };
  } catch {
    return null;
  }
}

async function fetchOLWorkSubjects(olId: string): Promise<string[]> {
  try {
    const res = await fetch(`${OL_WORKS}/${olId}.json`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.subjects ?? [];
  } catch {
    return [];
  }
}

async function main() {
  const supabase = buildSupabase();

  // Get books without categories (empty array or null)
  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, open_library_id, categories")
    .eq("is_active", true);

  if (!books || books.length === 0) {
    console.log("No books found.");
    return;
  }

  // Filter to those without categories in JS (Supabase can't filter empty arrays easily)
  const booksWithoutCats = books.filter(b => !b.categories || b.categories.length === 0);

  console.log(`📚 Found ${booksWithoutCats.length} books without categories. Enriching...\n`);

  let enriched = 0;
  let failed = 0;

  for (let i = 0; i < booksWithoutCats.length; i++) {
    const book = booksWithoutCats[i];
    const progress = `[${i + 1}/${booksWithoutCats.length}]`;

    try {
      let subjects: string[] = [];

      // Strategy 1: Use OL ID to fetch subjects directly
      if (book.open_library_id) {
        subjects = await fetchOLWorkSubjects(book.open_library_id);
      }

      // Strategy 2: Search by title+author
      if (subjects.length === 0) {
        const olData = await fetchOLByTitle(book.title, book.author);
        if (olData) {
          subjects = olData.subjects;
          // Also update OL ID if missing
          if (!book.open_library_id && olData.olId) {
            await supabase.from("books").update({ open_library_id: olData.olId }).eq("id", book.id);
          }
        }
      }

      if (subjects.length === 0) {
        console.log(`${progress} ⏭️  No subjects found for "${book.title}"`);
        failed++;
        await sleep(400);
        continue;
      }

      const categories = inferCategoriesFromSubjects(subjects);
      const tags = inferTags(subjects);

      const { error } = await supabase
        .from("books")
        .update({
          categories,
          tags,
          enrichment_status: "enriched",
          updated_at: new Date().toISOString(),
        })
        .eq("id", book.id);

      if (error) {
        console.log(`${progress} ❌ Failed to update "${book.title}": ${error.message}`);
        failed++;
      } else {
        console.log(`${progress} ✅ "${book.title}" → [${categories.join(", ")}]`);
        enriched++;
      }
    } catch (err) {
      console.log(`${progress} ❌ Error processing "${book.title}": ${err}`);
      failed++;
    }

    // Rate limit: OL allows ~100 req/min
    await sleep(400);
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Enriched: ${enriched}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⏭️  No subjects: ${failed}`);
}

main();
