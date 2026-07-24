import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import ShelfClient from "./ShelfClient";
import CoShelvedSection from "@/components/CoShelvedSection";
import { getCollaborativeRecs } from "@/lib/recommendations";
import type { CoShelvedBook } from "@/lib/recommendations";

export default async function RakPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();
  const params = await searchParams;
  const initialTab =
    params.tab === "want" ? "want" : params.tab === "done" ? "done" : "reading";

  const [{ data: shelf }, { data: reviews }] = await Promise.all([
    supabase
      .from("shelf_items")
      .select("*, books(*)")
      .eq("member_id", session.memberId)
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("shelf_item_id, slug, is_public, is_anonymous")
      .eq("member_id", session.memberId),
  ]);

  // Collaborative recs from shelf books
  const myBookIds = (shelf ?? []).map((s: { book_id: string }) => s.book_id).filter(Boolean);
  const collabIds = await getCollaborativeRecs(session.memberId, myBookIds, 8);

  let collabBooks: CoShelvedBook[] = [];
  if (collabIds.length > 0) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("books")
      .select("id, title, author, cover_url, open_library_id, slug")
      .in("id", collabIds)
      .eq("is_active", true);
    collabBooks = data ?? [];
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-h1">Rak Buku</h1>
          <Link href="/jelajah" className="btn-primary-sm">
            + Tambah
          </Link>
        </div>
        <ShelfClient initialShelf={shelf ?? []} reviews={reviews ?? []} initialTab={initialTab} />
        <CoShelvedSection books={collabBooks} />
      </main>
    </div>
  );
}
