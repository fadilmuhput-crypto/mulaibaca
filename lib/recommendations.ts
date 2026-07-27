import { createAdminClient } from "./supabase-route";

export async function getCollaborativeRecs(
  memberId: string,
  myBookIds: string[],
  limit = 10
): Promise<string[]> {
  if (myBookIds.length === 0) return [];

  const supabase = createAdminClient();

  const { data: similarShelves } = await supabase
    .from("shelf_items")
    .select("member_id, book_id")
    .in("book_id", myBookIds)
    .neq("member_id", memberId)
    .in("status", ["reading", "done", "want"]);

  if (!similarShelves || similarShelves.length === 0) return [];

  const simMemberBookIds: Record<string, Set<string>> = {};
  for (const row of similarShelves) {
    if (!simMemberBookIds[row.member_id]) simMemberBookIds[row.member_id] = new Set();
    simMemberBookIds[row.member_id].add(row.book_id);
  }

  const similarMemberIds = Object.keys(simMemberBookIds);
  if (similarMemberIds.length === 0) return [];

  const excludeSet = new Set(myBookIds);
  const { data: otherBooks } = await supabase
    .from("shelf_items")
    .select("book_id")
    .in("member_id", similarMemberIds)
    .in("status", ["reading", "done", "want"]);

  if (!otherBooks || otherBooks.length === 0) return [];

  const scores: Record<string, number> = {};
  for (const row of otherBooks) {
    if (excludeSet.has(row.book_id)) continue;
    scores[row.book_id] = (scores[row.book_id] ?? 0) + 1;
  }

  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

export type CoShelvedBook = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  open_library_id: string | null;
  slug: string | null;
};

export async function getCoShelvedBooks(
  bookId: string,
  excludeIds: string[] = [],
  limit = 8
): Promise<CoShelvedBook[]> {
  const supabase = createAdminClient();

  // Find members who have this book on their shelf
  const { data: shelfHolders } = await supabase
    .from("shelf_items")
    .select("member_id")
    .eq("book_id", bookId)
    .in("status", ["reading", "done", "want"]);

  if (!shelfHolders || shelfHolders.length === 0) return [];

  const memberIds = [...new Set(shelfHolders.map((s) => s.member_id))];

  // Find other books on those members' shelves
  const { data: coShelved } = await supabase
    .from("shelf_items")
    .select("book_id")
    .in("member_id", memberIds)
    .neq("book_id", bookId)
    .in("status", ["reading", "done", "want"]);

  if (!coShelved || coShelved.length === 0) return [];

  // Score by co-occurrence
  const excludeSet = new Set([bookId, ...excludeIds]);
  const scores: Record<string, number> = {};
  for (const row of coShelved) {
    if (excludeSet.has(row.book_id)) continue;
    scores[row.book_id] = (scores[row.book_id] ?? 0) + 1;
  }

  const topIds = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) return [];

  // Fetch book details
  const { data: books } = await supabase
    .from("books")
    .select("id, title, author, cover_url, open_library_id, slug")
    .in("id", topIds)
    .eq("is_active", true);

  if (!books) return [];

  // Maintain score order
  const bookMap = new Map(books.map((b) => [b.id, b]));
  return topIds
    .map((id) => bookMap.get(id))
    .filter((b): b is CoShelvedBook => !!b);
}

export async function getFallbackRecs(
  bookId: string,
  categories: string[],
  tags: string[],
  author: string | null,
  limit = 8
): Promise<CoShelvedBook[]> {
  const supabase = createAdminClient();
  const excludeSet = new Set([bookId]);
  const results: CoShelvedBook[] = [];

  // Strategy 1: same tags/categories
  const matchTags = [...new Set([...categories, ...tags])].filter(Boolean);
  if (matchTags.length > 0) {
    const { data: tagBooks } = await supabase
      .from("books")
      .select("id, title, author, cover_url, open_library_id, slug, tags, categories")
      .eq("is_active", true)
      .neq("id", bookId)
      .limit(20);

    if (tagBooks) {
      const scored = tagBooks
        .filter((b) => !excludeSet.has(b.id))
        .map((b) => {
          const bookTags = [...new Set([...(b.categories ?? []), ...(b.tags ?? [])])];
          const overlap = matchTags.filter((t) => bookTags.includes(t)).length;
          return { book: b, score: overlap };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score);

      for (const { book } of scored) {
        if (results.length >= limit) break;
        excludeSet.add(book.id);
        results.push({
          id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
          open_library_id: book.open_library_id,
          slug: book.slug,
        });
      }
    }
  }

  // Strategy 2: same author (fill remaining slots)
  if (author && results.length < limit) {
    const { data: authorBooks } = await supabase
      .from("books")
      .select("id, title, author, cover_url, open_library_id, slug")
      .eq("is_active", true)
      .eq("author", author)
      .neq("id", bookId)
      .limit(limit - results.length);

    if (authorBooks) {
      for (const book of authorBooks) {
        if (results.length >= limit || excludeSet.has(book.id)) continue;
        excludeSet.add(book.id);
        results.push({
          id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
          open_library_id: book.open_library_id,
          slug: book.slug,
        });
      }
    }
  }

  return results.slice(0, limit);
}
