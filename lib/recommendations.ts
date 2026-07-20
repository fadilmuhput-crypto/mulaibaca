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
