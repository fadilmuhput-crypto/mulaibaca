import { createClient } from "@supabase/supabase-js";

function buildAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

type Book = { id: string; title: string; author: string; open_library_id: string | null; is_curated: boolean; enrichment_status: string; is_active: boolean };
type Group = { key: string; books: Book[]; keeper: Book; duplicates: Book[] };

export async function findDuplicateGroups(): Promise<Group[]> {
  const supabase = buildAdmin();
  const { data: books } = await supabase.from("books").select("id,title,author,open_library_id,is_curated,enrichment_status,is_active");
  if (!books) return [];

  const groups: Group[] = [];

  // 1. Same open_library_id
  const olMap = new Map<string, Book[]>();
  for (const b of books as Book[]) {
    if (!b.open_library_id) continue;
    if (!olMap.has(b.open_library_id)) olMap.set(b.open_library_id, []);
    olMap.get(b.open_library_id)!.push(b);
  }
  for (const [key, entries] of olMap) {
    if (entries.length < 2) continue;
    const keeper = pickBest(entries);
    const duplicates = entries.filter((b) => b.id !== keeper.id);
    groups.push({ key: `OL:${key}`, books: entries, keeper, duplicates });
  }

  // 2. Same title+author (case-insensitive, all books including those with OL ID)
  const taMap = new Map<string, Book[]>();
  for (const b of books as Book[]) {
    const k = `${b.title.toLowerCase().trim()}|${(b.author ?? "").toLowerCase().trim()}`;
    if (!taMap.has(k)) taMap.set(k, []);
    taMap.get(k)!.push(b);
  }
  for (const [key, entries] of taMap) {
    if (entries.length < 2) continue;
    const keeper = pickBest(entries);
    const duplicates = entries.filter((b) => b.id !== keeper.id);
    groups.push({ key: `TA:${key}`, books: entries, keeper, duplicates });
  }

  // 3. Same title, one has unknown author — match title-only for unknowns
  const unknownAuthorPattern = /^(pengarang tidak diketahui|unknown|anonim|anonymous|n\/a|-)$/i;
  const titleMap = new Map<string, Book[]>();
  for (const b of books as Book[]) {
    const t = b.title.toLowerCase().trim();
    if (!titleMap.has(t)) titleMap.set(t, []);
    titleMap.get(t)!.push(b);
  }
  for (const [title, entries] of titleMap) {
    if (entries.length < 2) continue;
    const unknowns = entries.filter((b) => unknownAuthorPattern.test((b.author ?? "").trim()));
    if (unknowns.length === 0) continue;
    const knowns = entries.filter((b) => !unknownAuthorPattern.test((b.author ?? "").trim()));
    if (knowns.length === 0) continue;
    // Each unknown is a duplicate of the best known
    const keeper = pickBest(knowns);
    const duplicates = unknowns.filter((b) => b.id !== keeper.id);
    if (duplicates.length === 0) continue;
    // Avoid double-counting with groups already found
    const existingIds = new Set(groups.flatMap((g) => g.books.map((b) => b.id)));
    if (duplicates.every((d) => existingIds.has(d.id))) continue;
    groups.push({ key: `TITLE:${title}`, books: [...knowns, ...unknowns], keeper, duplicates });
  }

  return groups;
}

function pickBest(books: Book[]): Book {
  const scored = books.map((b) => ({
    book: b,
    score: (b.is_curated ? 100 : 0) + (b.enrichment_status === "enriched" ? 50 : 0) + (b.is_active ? 10 : 0),
  }));
  return scored.sort((a, b) => b.score - a.score)[0].book;
}

export async function resolveDuplicates(groups: Group[]): Promise<{ resolved: number; errors: string[] }> {
  const supabase = buildAdmin();
  let resolved = 0;
  const errors: string[] = [];

  for (const group of groups) {
    for (const dup of group.duplicates) {
      try {
        await mergeBook(supabase, dup.id, group.keeper.id);
        resolved++;
      } catch (err) {
        errors.push(`${dup.title} (${dup.id}): ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  return { resolved, errors };
}

async function mergeBook(supabase: ReturnType<typeof buildAdmin>, fromId: string, toId: string) {
  // Get all shelf_items pointing to the duplicate book
  const { data: shelfItems } = await supabase
    .from("shelf_items")
    .select("id, member_id, status, current_page, started_at, finished_at")
    .eq("book_id", fromId);

  if (shelfItems) {
    for (const si of shelfItems) {
      // Check if member already has a shelf_item for the keeper book
      const { data: existingSi } = await supabase
        .from("shelf_items")
        .select("id")
        .eq("member_id", si.member_id)
        .eq("book_id", toId)
        .maybeSingle();

      if (existingSi) {
        // Migrate reviews
        await supabase
          .from("reviews")
          .update({ shelf_item_id: existingSi.id })
          .eq("shelf_item_id", si.id);

        // Migrate reading_logs (handle unique constraint)
        const { data: logs } = await supabase
          .from("reading_logs")
          .select("id, log_date")
          .eq("shelf_item_id", si.id);

        if (logs) {
          for (const log of logs) {
            // If log_date already exists for the target shelf_item, update (merge pages)
            const { data: existingLog } = await supabase
              .from("reading_logs")
              .select("id")
              .eq("shelf_item_id", existingSi.id)
              .eq("log_date", log.log_date)
              .maybeSingle();

            if (existingLog) {
              await supabase.from("reading_logs").delete().eq("id", log.id);
            } else {
              await supabase.from("reading_logs").update({ shelf_item_id: existingSi.id }).eq("id", log.id);
            }
          }
        }

        // Delete the duplicate shelf_item
        await supabase.from("shelf_items").delete().eq("id", si.id);
      } else {
        // No existing shelf_item — just point it to the keeper book
        await supabase
          .from("shelf_items")
          .update({ book_id: toId })
          .eq("id", si.id);
      }
    }
  }

  // Delete the duplicate book
  await supabase.from("books").delete().eq("id", fromId);
}
