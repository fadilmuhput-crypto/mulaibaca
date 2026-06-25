import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import NavBar from "@/components/NavBar";
import ShelfClient from "./ShelfClient";

export default async function RakPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();

  const [{ data: shelf }, { data: reviews }] = await Promise.all([
    supabase
      .from("shelf_items")
      .select("*, books(*)")
      .eq("member_id", session.memberId)
      .order("created_at", { ascending: false }),
    supabase
      .from("reviews")
      .select("shelf_item_id")
      .eq("member_id", session.memberId),
  ]);

  const reviewedIds = (reviews ?? []).map((r: { shelf_item_id: string }) => r.shelf_item_id);

  return (
    <div className="min-h-screen bg-parchment pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-h1">Rak Buku</h1>
          <Link href="/jelajah" className="btn-primary-sm">
            + Tambah
          </Link>
        </div>
        <ShelfClient initialShelf={shelf ?? []} reviewedIds={reviewedIds} />
      </main>
    </div>
  );
}
