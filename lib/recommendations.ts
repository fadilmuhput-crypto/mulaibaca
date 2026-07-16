import { BUKU_ANAK, BUKU_LOKAL, type CuratedBook } from "./curated-books";

const ALL = [...BUKU_ANAK, ...BUKU_LOKAL];

export function getRecommendations(
  existingTitles: string[],
  count = 4,
): CuratedBook[] {
  // Collect tags from user's existing books
  const ownedTitles = new Set(existingTitles.map((t) => t.toLowerCase()));
  const ownedTags = new Map<string, number>();
  for (const book of ALL) {
    if (ownedTitles.has(book.title.toLowerCase())) {
      for (const tag of book.tags) {
        ownedTags.set(tag, (ownedTags.get(tag) ?? 0) + 1);
      }
    }
  }

  // If no tags found (no curated books owned), recommend popular picks
  if (ownedTags.size === 0) {
    return ALL
      .filter((b) => !ownedTitles.has(b.title.toLowerCase()))
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }

  // Sort tags by frequency
  const topTags = [...ownedTags.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);

  // Score each unowned book by how many top tags it matches
  const scored = ALL
    .filter((b) => !ownedTitles.has(b.title.toLowerCase()))
    .map((b) => ({
      book: b,
      score: b.tags.filter((t) => topTags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score);

  const top = scored.filter((s) => s.score > 0).slice(0, count);
  if (top.length < count) {
    // Fill remaining with random unowned books
    const usedTitles = new Set(top.map((s) => s.book.title.toLowerCase()));
    const fillers = ALL
      .filter((b) => !ownedTitles.has(b.title.toLowerCase()) && !usedTitles.has(b.title.toLowerCase()))
      .sort(() => Math.random() - 0.5)
      .slice(0, count - top.length);
    return [...top.map((s) => s.book), ...fillers];
  }
  return top.map((s) => s.book);
}
