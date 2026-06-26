import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-route";
import JelajahClient from "./JelajahClient";
import type { CuratedBook } from "@/lib/curated-books";

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
  const { data: curatedRows } = await adminClient
    .from("curated_books")
    .select("title,author,cover_url,open_library_id,total_pages,description,category,tags")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  const allBooks = (curatedRows ?? []) as CuratedBook[];

  return <JelajahClient familyBooks={familyBooks} allBooks={allBooks} />;
}
