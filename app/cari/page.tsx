import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import CariClient from "./CariClient";
import type { Book } from "@/lib/books";

export default async function CariPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const admin = createAdminClient();
  const { data: books } = await admin
    .from("books")
    .select("id,title,author,cover_url,open_library_id,total_pages,description,categories,tags,publisher,published_year,language,is_curated")
    .eq("is_active", true)
    .order("title", { ascending: true });

  return <CariClient allBooks={(books ?? []) as Book[]} />;
}
