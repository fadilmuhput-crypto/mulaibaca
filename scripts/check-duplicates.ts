import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const { data: books } = await supabase.from("books").select("id,title,author,open_library_id,is_curated,enrichment_status,is_active").order("title");
  if (!books) { console.log("No books"); return; }

  // 1. Duplicate open_library_id
  const olDups = new Map<string, typeof books>();
  for (const b of books) {
    if (!b.open_library_id) continue;
    if (!olDups.has(b.open_library_id)) olDups.set(b.open_library_id, []);
    olDups.get(b.open_library_id)!.push(b);
  }

  console.log("=== DUPLIKAT open_library_id ===");
  let olDupCount = 0;
  for (const [olId, entries] of olDups) {
    if (entries.length > 1) {
      olDupCount++;
      console.log(`\nOL ID: ${olId}`);
      for (const e of entries) {
        console.log(`  [${e.id}] ${e.title} — ${e.author} curated=${e.is_curated} status=${e.enrichment_status}`);
      }
    }
  }
  if (!olDupCount) console.log("(none)");

  // 2. Duplicate title+author (case-insensitive, null OL ID)
  const taDups = new Map<string, typeof books>();
  for (const b of books) {
    if (b.open_library_id) continue;
    const key = `${b.title.toLowerCase().trim()}|${(b.author ?? "").toLowerCase().trim()}`;
    if (!taDups.has(key)) taDups.set(key, []);
    taDups.get(key)!.push(b);
  }

  console.log("\n=== DUPLIKAT title+author (tanpa OL ID) ===");
  let taDupCount = 0;
  for (const [key, entries] of taDups) {
    if (entries.length > 1) {
      taDupCount++;
      const [t, a] = key.split("|");
      console.log(`\n"${t}" — ${a}`);
      for (const e of entries) {
        console.log(`  [${e.id}] curated=${e.is_curated} status=${e.enrichment_status}`);
      }
    }
  }
  if (!taDupCount) console.log("(none)");

  // 3. Same title (case-insensitive), different author — potential match
  const titleDups = new Map<string, typeof books>();
  for (const b of books) {
    const t = b.title.toLowerCase().trim();
    if (!titleDups.has(t)) titleDups.set(t, []);
    titleDups.get(t)!.push(b);
  }

  console.log("\n=== JUDUL SAMA, BEDA AUTHOR (potensi duplikat) ===");
  let titleDupCount = 0;
  for (const [title, entries] of titleDups) {
    if (entries.length > 1) {
      const authors = [...new Set(entries.map(e => (e.author ?? "").toLowerCase().trim()))];
      if (authors.length > 1) {
        titleDupCount++;
        console.log(`\n"${title}"`);
        for (const e of entries) {
          console.log(`  [${e.id}] ${e.author} | OL=${e.open_library_id} curated=${e.is_curated}`);
        }
      }
    }
  }
  if (!titleDupCount) console.log("(none)");

  console.log(`\n\nTotal buku: ${books.length}`);
  console.log(`OL ID duplikat: ${olDupCount} grup`);
  console.log(`Title+author duplikat: ${taDupCount} grup`);
  console.log(`Judul sama beda author: ${titleDupCount} grup`);
}

main().catch(console.error);
