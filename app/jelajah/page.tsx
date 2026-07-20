import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import JelajahClient from "./JelajahClient";
import type { Book } from "@/lib/books";
import type { JelajahSection } from "@/lib/jelajah-sections";
import type { Metadata } from "next";
import { getCollaborativeRecs } from "@/lib/recommendations";

export type FamilyBook = {
  memberName: string;
  title: string;
  coverUrl: string | null;
  author: string;
};

export const metadata: Metadata = {
  title: "Jelajah Buku — Mulaibaca",
  description: "Temukan dan jelajahi ribuan buku untuk dibaca bersama keluarga. Rekomendasi buku anak, buku lokal Indonesia, dan berbagai kategori.",
  alternates: { canonical: "https://mulaibaca.id/jelajah" },
  openGraph: {
    title: "Jelajah Buku — Mulaibaca",
    description: "Temukan buku baru untuk dibaca bersama keluarga.",
    url: "https://mulaibaca.id/jelajah",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jelajah Buku — Mulaibaca",
    description: "Temukan buku baru untuk dibaca bersama keluarga.",
  },
};

export default async function JelajahPage() {
  const session = await getSession();

  let familyBooks: FamilyBook[] = [];
  let myShelf: { book_id: string }[] = [];

  if (session) {
    const supabase = await createClient();
    const { data: otherMembers } = await supabase
      .from("members")
      .select("id, name")
      .eq("family_id", session.familyId)
      .neq("id", session.memberId);

    const otherIds = (otherMembers ?? []).map((m: { id: string }) => m.id);

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

    const { data: shelfData } = await supabase
      .from("shelf_items")
      .select("book_id")
      .eq("member_id", session.memberId)
      .in("status", ["reading", "want"]);

    myShelf = (shelfData ?? []) as { book_id: string }[];
  }

  const adminClient = createAdminClient();
  const [
    { data: bookRows },
    { data: sectionRows },
    { data: linkRows },
    { data: trendingRows },
    { data: shelfCountRows },
    { data: reviewStatsRows },
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
    adminClient
      .from("shelf_items")
      .select("book_id")
      .not("book_id", "is", null),
    adminClient
      .from("reviews")
      .select("shelf_item_id, rating, shelf_items!inner(book_id)")
      .not("rating", "is", null),
  ]);

  const allBooks = (bookRows ?? []) as Book[];
  const bookIds = allBooks.map((b) => b.id).filter(Boolean) as string[];

  // Enrich with shelf counts (total readers per book)
  const shelfCountMap: Record<string, number> = {};
  for (const row of shelfCountRows ?? []) {
    if (row.book_id) shelfCountMap[row.book_id] = (shelfCountMap[row.book_id] ?? 0) + 1;
  }

  // Enrich with review stats (avg rating + review count per book)
  const reviewStatsMap: Record<string, { sum: number; count: number }> = {};
  for (const row of reviewStatsRows ?? []) {
    const r = row as { rating: number; shelf_items: { book_id: string }[] };
    const bookId = r.shelf_items?.[0]?.book_id;
    if (!bookId) continue;
    if (!reviewStatsMap[bookId]) reviewStatsMap[bookId] = { sum: 0, count: 0 };
    reviewStatsMap[bookId].sum += r.rating;
    reviewStatsMap[bookId].count += 1;
  }

  // Merge enrichment into book objects
  const enrichedBooks: Book[] = allBooks.map((b) => {
    const stats = b.id ? reviewStatsMap[b.id] : undefined;
    return {
      ...b,
      shelf_count: b.id ? (shelfCountMap[b.id] ?? 0) : 0,
      rating_avg: stats && stats.count > 0 ? Math.round((stats.sum / stats.count) * 10) / 10 : null,
      rating_count: stats?.count ?? 0,
    };
  });
  const bookMap = new Map(enrichedBooks.map((b) => [b.id, b]));

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
    ? enrichedBooks
        .filter((b: Book) => !myBookIds.includes(b.id ?? "") && (b.tags ?? []).some((t) => topTags.includes(t)))
        .slice(0, 10)
    : [];

  const collabIds = session
    ? await getCollaborativeRecs(session.memberId, myBookIds, 10)
    : [];
  const collabBooks = collabIds
    .map((id) => bookMap.get(id))
    .filter((b): b is Book => !!b);

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      {session && <NavBar session={session} noStickyTop />}
      <JelajahClient
        familyBooks={familyBooks}
        allBooks={enrichedBooks}
        sections={sections}
        trendingBooks={trendingBooks}
        personalBooks={personalBooks}
        collabBooks={collabBooks}
        memberType={session?.memberType ?? "dewasa"}
        memberAge={session?.memberAge ?? null}
        memberName={session?.memberName ?? "Pengunjung"}
      />
    </div>
  );
}
