import { NextRequest, NextResponse } from "next/server";
import { getEffectiveAuth } from "@/lib/effective-auth";

const EMPTY = { status: null, shelf_item_id: null, review_slug: null };

export async function GET(req: NextRequest) {
  const auth = await getEffectiveAuth(req);
  if (!auth) return NextResponse.json(EMPTY);

  const { dataClient: supabase, memberId } = auth;
  const { searchParams } = new URL(req.url);
  const open_library_id = searchParams.get("open_library_id");
  const title = searchParams.get("title");

  if (!open_library_id && !title) return NextResponse.json(EMPTY);

  // Find book_id
  let bookId: string | null = null;
  if (open_library_id) {
    const { data } = await supabase
      .from("books").select("id").eq("open_library_id", open_library_id).maybeSingle();
    bookId = data?.id ?? null;
  } else {
    const { data } = await supabase
      .from("books").select("id").ilike("title", title!).maybeSingle();
    bookId = data?.id ?? null;
  }

  if (!bookId) return NextResponse.json(EMPTY);

  const { data: item } = await supabase
    .from("shelf_items")
    .select("id, status")
    .eq("book_id", bookId)
    .eq("member_id", memberId)
    .maybeSingle();

  if (!item) return NextResponse.json(EMPTY);

  let review_slug: string | null = null;
  if (item.status === "done") {
    const { data: review } = await supabase
      .from("reviews")
      .select("slug")
      .eq("shelf_item_id", item.id)
      .eq("member_id", memberId)
      .maybeSingle();
    review_slug = review?.slug ?? null;
  }

  return NextResponse.json({ status: item.status, shelf_item_id: item.id, review_slug });
}
