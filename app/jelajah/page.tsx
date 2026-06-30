import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-route";
import JelajahClient from "./JelajahClient";
import type { Book } from "@/lib/books";
import type { JelajahSection } from "@/lib/jelajah-sections";

export type FamilyBook = {
  memberName: string;
  title: string;
  coverUrl: string | null;
  author: string;
};

export default async function JelajahPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();

  const { data: otherMembers } = await supabase
    .from("members")
    .select("id, name")
    .eq("family_id", session.familyId)
    .neq("id", session.memberId);

  const otherIds = (otherMembers ?? []).map((m: { id: string }) => m.id);
  let familyBooks: FamilyBook[] = [];

  if (otherIds.length > 0) {
    const { data: familyReading } = await supabase
      .from("shelf_items")
      .select("member_id, books(title, cover_url, author)")
      .in("member_id", otherIds)
      .eq("status", "reading")
      .limit(6);

    const memberMap = Object.fromEntries(
      (otherMembers ?? []).map((m: { id: string; name: string }) => [m.id, m.name])
    );

    familyBooks = (familyReading ?? [])
      .filter((item: { books: unknown }) => item.books)
      .map((item: { member_id: string; books: unknown }) => {
        const b = item.books as { title: string; cover_url: string | null; author: string | null };
        return {
          memberName: memberMap[item.member_id] ?? "Anggota",
          title: b.title,
          coverUrl: b.cover_url,
          author: b.author ?? "",
        };
      });
  }

  const adminClient = createAdminClient();
  const [
    { data: bookRows },
    { data: sectionRows },
    { data: linkRows },
    { data: trendingRows },
    { data: myShelf },
  ] = await Promise.all([
    adminClient
      .from("books")
      .select("id,title,author,cover_url,open_library_id,total_pages,description,categories,tags,publisher,published_year,language,is_curated")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true }),
    adminClient
      .from("jelajah_sections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    adminClient
      .from("jelajah_section_books")
      .select("section_id, book_id")
      .order("sort_order", { ascending: true }),
    adminClient
      .from("shelf_items")
      .select("book_id")
      .not("book_id", "is", null)
      .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase
      .from("shelf_items")
      .select("book_id")
      .eq("member_id", session.memberId)
      .in("status", ["reading", "want"]),
  ]);

  const allBooks = (bookRows ?? []) as Book[];
  const bookMap = new Map(allBooks.map((b) => [b.id, b]));

  // Pasangkan buku ke masing-masing section
  const sections: JelajahSection[] = (sectionRows ?? []).map((s) => {
    const books = (linkRows ?? [])
      .filter((l: { section_id: string }) => l.section_id === s.id)
      .map((l: { book_id: string }) => bookMap.get(l.book_id))
      .filter(Boolean) as Book[];
    return { ...s, books } as JelajahSection;
  });

  // Trending: count shelf additions in last 30 days
  const trendingCounts = (trendingRows ?? []).reduce((acc: Record<string, number>, t: { book_id: string }) => {
    if (t.book_id) acc[t.book_id] = (acc[t.book_id] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const trendingBookIds = Object.entries(trendingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id]) => id);
  const trendingBooks = trendingBookIds.map((id: string) => bookMap.get(id)).filter(Boolean) as Book[];

  // Personalized: find categories from user's shelf books, recommend similar
  const myBookIds = [...new Set((myShelf ?? []).map((s: { book_id: string }) => s.book_id))];
  const myBooks = myBookIds.map((id: string) => bookMap.get(id)).filter((b): b is Book => !!b);
  const myBookTags = myBooks.flatMap((b) => [...(b.categories ?? []), ...b.tags]);
  const tagFrequency = myBookTags.reduce((acc: Record<string, number>, t: string) => {
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  const personalBooks = topTags.length > 0
    ? allBooks
        .filter((b: Book) => !myBookIds.includes(b.id ?? "") && (b.tags ?? []).some((t) => topTags.includes(t)))
        .slice(0, 10)
    : [];

  return (
    <JelajahClient
      familyBooks={familyBooks}
      allBooks={allBooks}
      sections={sections}
      trendingBooks={trendingBooks}
      personalBooks={personalBooks}
      memberType={session.memberType}
      memberAge={session.memberAge}
      memberName={session.memberName}
    />
  );
}
