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
  const { data: shelf } = await supabase
    .from("shelf_items")
    .select("*, books(*)")
    .eq("member_id", session.memberId)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-parchment pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-display font-bold text-ink">Rak Buku</h1>
          <Link
            href="/rak/tambah"
            className="text-sm bg-amber text-white px-4 py-2 rounded-xl font-medium hover:bg-amber-hover transition-colors"
          >
            + Tambah
          </Link>
        </div>
        <ShelfClient initialShelf={shelf ?? []} />
      </main>
    </div>
  );
}
