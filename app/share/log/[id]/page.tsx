import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import SharePreview from "./SharePreview";

export default async function ShareLogPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const { id } = await params;

  const admin = createAdminClient();
  const { data: log } = await admin
    .from("reading_logs")
    .select(`
      id, pages_read, duration_minutes, note,
      shelf_items!inner(
        books!inner(id, title, author, cover_url, total_pages)
      )
    `)
    .eq("id", id)
    .single();

  if (!log) redirect("/dashboard");

  const shelfRow = log.shelf_items as unknown as {
    books: { id: string; title: string; author: string | null; cover_url: string | null; total_pages: number | null };
  };

  return <SharePreview logId={id} book={shelfRow.books} pagesRead={log.pages_read} duration={log.duration_minutes} note={log.note} />;
}
