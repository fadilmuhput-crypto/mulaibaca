import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSession } from "@/lib/session";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shelfItemId, rating, qAbout, qMemorable, qForWhom, isPublic } = await req.json();

  if (!shelfItemId || !rating) {
    return NextResponse.json({ error: "Rating wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();

  // Get book title for slug
  const { data: shelf } = await supabase
    .from("shelf_items")
    .select("book_id, books(title)")
    .eq("id", shelfItemId)
    .single();

  const bookTitle = (shelf?.books as unknown as { title: string } | null)?.title ?? "buku";
  const baseSlug = toSlug(`${session.memberName}-${bookTitle}`);
  const suffix = Math.random().toString(36).slice(2, 6);
  const slug = `${baseSlug}-${suffix}`;

  const { data, error } = await supabase
    .from("reviews")
    .upsert(
      {
        shelf_item_id: shelfItemId,
        member_id: session.memberId,
        family_id: session.familyId,
        rating,
        q_about: qAbout || null,
        q_memorable: qMemorable || null,
        q_for_whom: qForWhom || null,
        is_public: isPublic ?? true,
        slug,
        published_at: new Date().toISOString(),
      },
      { onConflict: "shelf_item_id,member_id", ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, shelf_items(*, books(title, author, cover_url))")
    .eq("member_id", session.memberId)
    .order("published_at", { ascending: false });

  const { data: doneShelf } = await supabase
    .from("shelf_items")
    .select("id, books(title, author, cover_url)")
    .eq("member_id", session.memberId)
    .eq("status", "done");

  return NextResponse.json({ reviews: reviews ?? [], doneShelf: doneShelf ?? [] });
}
