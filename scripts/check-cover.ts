import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from("reading_logs")
    .select(`
      id, pages_read, duration_minutes, note,
      shelf_items!inner(
        member_id,
        books!inner(id, title, author, cover_url, total_pages)
      )
    `)
    .eq("id", "ff4259d9-4d78-4ddf-a043-2ddc8e473a94")
    .single();

  if (error) {
    console.error("Error:", error);
    return;
  }
  
  const shelfRow = data.shelf_items as any;
  console.log("Book:", shelfRow.books.title);
  console.log("Cover URL:", shelfRow.books.cover_url);
  console.log("Total Pages:", shelfRow.books.total_pages);
  
  const { data: member } = await supabase
    .from("members")
    .select("name, avatar")
    .eq("id", shelfRow.member_id)
    .single();
  
  console.log("Member:", member?.name);
  console.log("Avatar:", member?.avatar);
}

main().catch(console.error);
