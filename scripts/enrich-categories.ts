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

// ── Noise words to exclude from tags ──
const NOISE = new Set([
  "the", "and", "for", "with", "from", "that", "this", "was", "are", "not",
  "but", "have", "has", "had", "can", "may", "will", "shall", "all", "any",
  "its", "into", "also", "than", "then", "them", "they", "their", "there",
  "here", "when", "where", "what", "which", "who", "whom", "how", "new",
  "york", "times", "bestseller", "general", "other", "fiction", "novel",
  "novels", "stories", "story", "books", "book", "series", "literary",
  "literature", "writing", "written", "author", "english", "indonesian",
  "translation", "translations", "large", "type", "print", "edition",
  "volume", "part", "first", "second", "third", "complete", "collected",
  "selected", "works", "text", "criticism", "studies", "study", "guide",
  "handbook", "manual", "introduction", "history", "introduction to",
  "modern", "classic", "contemporary", "popular", "basic", "advanced",
  "international", "american", "british", "european", "asian", "african",
  "latin", "french", "german", "spanish", "russian", "chinese", "japanese",
  "arabic", "hindi", "portuguese", "italian", "dutch", "korean",
  "publisher", "publishers", "publishing", "published", "press",
  "fiction, general", "fiction, historical", "fiction, mystery",
  "fiction, thrillers", "fiction, suspense", "fiction, psychological",
  "detective", "mystery", "thriller", "suspense",
  "juvenile", "young", "adult", "children",
  "didactic", "speculative",
]);

// ── Fiction rules: check ALL subjects combined ──
type Rule = { keywords: string[]; categories: string[] };

const FICTION_RULES: Rule[] = [
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

// ── Non-fiction rules: require primary topic indication ──
// These use word-boundary matching to avoid "school" in "boarding schools"
const NONFICTION_PATTERNS: { pattern: RegExp; categories: string[] }[] = [
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

  // Special Indonesian books
  if (/cerita\s*rakyat|dongeng|legenda|fabel|mitos/i.test(combined)) {
    categories.add("fiksi");
    categories.add("cerita rakyat");
  }

  // Check fiction rules first
  let isFiction = false;
  for (const rule of FICTION_RULES) {
    if (rule.keywords.some(kw => combined.includes(kw))) {
      rule.categories.forEach(c => categories.add(c));
      isFiction = true;
    }
  }

  // Generic fiction fallback
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

  // Non-fiction: only check if NOT fiction, or if subject clearly indicates primary topic
  if (!isFiction) {
    for (const { pattern, categories: cats } of NONFICTION_PATTERNS) {
      if (pattern.test(combined)) {
        cats.forEach(c => categories.add(c));
      }
    }
  }

  // Add parent categories for sub-categories
  const subCats = [...categories];
  const hasFiksiSub = subCats.some(c => ["fantasi", "romance", "thriller", "horor", "humor", "fiksi ilmiah", "fiksi sejarah", "cerita rakyat", "puisi"].includes(c));
  const hasNonFiksiSub = subCats.some(c => ["biografi", "pengembangan diri", "bisnis", "psikologi", "sejarah", "sains", "agama", "masakan", "perjalanan", "olahraga", "seni-musik", "parenting-keluarga"].includes(c));

  if (hasFiksiSub) categories.add("fiksi");
  if (hasNonFiksiSub) categories.add("non-fiksi");

  return categories.size > 0 ? [...categories] : ["lainnya"];
}

// ── Tag generation: keep meaningful multi-word phrases ──
function inferTags(subjectList: string[]): string[] {
  const tags = new Set<string>();

  for (const raw of subjectList) {
    const s = raw.toLowerCase().trim();

    // Skip noise patterns
    if (s.length < 3) continue;
    if (/^(nyt:|series:|LC)/.test(s)) continue;
    if (/new york times/i.test(s)) continue;
    if (/\d{4}-\d{2}-\d{2}/.test(s)) continue;

    const cleaned = s
      .replace(/\s+/g, " ")
      .replace(/[()]/g, "")
      .trim();

    if (cleaned.length > 30) continue;
    if (cleaned.split(" ").length > 4) continue;

    // Skip if it's just noise words
    const words = cleaned.split(/\s+/);
    const meaningfulWords = words.filter(w => !NOISE.has(w) && w.length > 2);
    if (meaningfulWords.length === 0) continue;

    // Skip generic/duplicate entries
    if (/^fiction$/i.test(cleaned)) continue;
    if (/^fiction,?\s*(general|other)/i.test(cleaned)) continue;

    tags.add(cleaned);
  }

  return Array.from(tags).slice(0, 15);
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
    const res = await fetch(`${OL_WORKS}/${olId}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.subjects ?? [];
  } catch {
    return [];
  }
}

async function main() {
  const supabase = buildSupabase();

  const mode = process.argv[2]; // "all" = re-enrich everything, default = only empty categories

  let query = supabase
    .from("books")
    .select("id, title, author, open_library_id, categories")
    .eq("is_active", true);

  const { data: books } = await query;

  if (!books || books.length === 0) {
    console.log("No books found.");
    return;
  }

  let targetBooks = books;
  if (mode !== "all") {
    targetBooks = books.filter(b => !b.categories || b.categories.length === 0 || (b.categories.length === 1 && b.categories[0] === "lainnya"));
  }

  console.log(`📚 Found ${targetBooks.length} books to enrich (mode: ${mode ?? "empty-only"}). Enriching...\n`);

  let enriched = 0;
  let improved = 0;
  let failed = 0;

  for (let i = 0; i < targetBooks.length; i++) {
    const book = targetBooks[i];
    const progress = `[${i + 1}/${targetBooks.length}]`;

    try {
      let subjects: string[] = [];

      if (book.open_library_id) {
        subjects = await fetchOLWorkSubjects(book.open_library_id);
      }

      if (subjects.length === 0) {
        const olData = await fetchOLByTitle(book.title, book.author);
        if (olData) {
          subjects = olData.subjects;
          if (!book.open_library_id && olData.olId) {
            await supabase.from("books").update({ open_library_id: olData.olId }).eq("id", book.id);
          }
        }
      }

      if (subjects.length === 0) {
        console.log(`${progress} ⏭️  No subjects for "${book.title}"`);
        failed++;
        await sleep(400);
        continue;
      }

      const categories = inferCategoriesFromSubjects(subjects);
      const tags = inferTags(subjects);

      // Check if this is an improvement
      const oldCats = book.categories ?? [];
      const isImproved = categories.some(c => c !== "lainnya") && (oldCats.length === 0 || (oldCats.length === 1 && oldCats[0] === "lainnya"));

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
        console.log(`${progress} ❌ Failed "${book.title}": ${error.message}`);
        failed++;
      } else {
        if (isImproved) improved++;
        console.log(`${progress} ✅ "${book.title}" → [${categories.join(", ")}]`);
        enriched++;
      }
    } catch (err) {
      console.log(`${progress} ❌ Error "${book.title}": ${err}`);
      failed++;
    }

    await sleep(400);
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Enriched: ${enriched}`);
  console.log(`   📈 Improved: ${improved}`);
  console.log(`   ❌ Failed/no subjects: ${failed}`);
}

main();
