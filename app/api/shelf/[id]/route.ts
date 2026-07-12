import { NextRequest, NextResponse } from "next/server";
import { getEffectiveAuth } from "@/lib/effective-auth";
import { insertActivity } from "@/lib/activity-feed";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getEffectiveAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dataClient: supabase, memberId, familyId } = auth;

  const { id } = await params;
  const body = await req.json();

  const { data: current } = await supabase
    .from("shelf_items")
    .select("status, books!inner(id, title, slug, cover_url)")
    .eq("id", id)
    .eq("member_id", memberId)
    .single();

  const updates: Record<string, unknown> = {};
  if (body.current_page !== undefined) updates.current_page = body.current_page;
  if (body.status) {
    updates.status = body.status;
    if (body.status === "done") updates.finished_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("shelf_items")
    .update(updates)
    .eq("id", id)
    .eq("member_id", memberId)
    .select("*, books(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.status && current) {
    const book = current.books as unknown as { id: string; title: string; slug: string; cover_url: string | null };
    if (book) {
      const oldStatus = current.status;
      if (body.status === "done" && oldStatus !== "done") {
        insertActivity(memberId, familyId, "finish", {
          book_id: book.id,
          book_title: book.title,
          book_slug: book.slug,
          book_cover: book.cover_url,
        });
      }
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getEffectiveAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dataClient: supabase, memberId } = auth;

  const { id } = await params;
  const { error } = await supabase
    .from("shelf_items")
    .delete()
    .eq("id", id)
    .eq("member_id", memberId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
