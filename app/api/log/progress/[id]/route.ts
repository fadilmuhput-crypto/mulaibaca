import { createAdminClient } from "@/lib/supabase-route";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: log } = await admin
    .from("reading_logs")
    .select("shelf_item_id, to_page, shelf_items!inner(books!inner(total_pages))")
    .eq("id", id)
    .single();

  if (!log) return Response.json({ error: "Not found" }, { status: 404 });

  const book = (log.shelf_items as unknown as { books: { total_pages: number | null } }).books;

  if (!book.total_pages || book.total_pages <= 0) {
    return Response.json({ progress: null });
  }

  const { data: allLogs } = await admin
    .from("reading_logs")
    .select("to_page")
    .eq("shelf_item_id", log.shelf_item_id);

  const maxToPage = allLogs?.reduce((max, l) => Math.max(max, l.to_page ?? 0), 0) ?? log.to_page ?? 0;
  const progress = Math.min(Math.round((maxToPage / book.total_pages) * 100), 100);

  return Response.json({ progress });
}
