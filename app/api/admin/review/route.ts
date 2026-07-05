import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const visibility = searchParams.get("visibility");
  const search = searchParams.get("search");

  const admin = createAdminClient();
  let query = admin
    .from("reviews")
    .select("*, members!inner(id, name, avatar, username), shelf_items!inner(books!inner(id, title, slug, cover_url, author))")
    .order("created_at", { ascending: false });

  if (visibility === "public") query = query.eq("is_public", true).eq("is_anonymous", false);
  else if (visibility === "anonymous") query = query.eq("is_anonymous", true);
  else if (visibility === "private") query = query.eq("is_public", false);

  if (search) {
    const q = `%${search}%`;
    query = query.or(`members.name.ilike.${q},shelf_items.books.title.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((r: Record<string, unknown>) => {
    const m = r.members as Record<string, unknown>;
    const shelf = (r.shelf_items as Record<string, unknown>[])?.[0];
    const book = shelf?.books as Record<string, unknown>;
    return {
      id: r.id,
      slug: r.slug,
      rating: r.rating,
      q_about: r.q_about,
      q_memorable: r.q_memorable,
      q_for_whom: r.q_for_whom,
      is_public: r.is_public,
      is_anonymous: r.is_anonymous,
      created_at: r.created_at,
      published_at: r.published_at,
      member: m ? { id: m.id, name: m.name, avatar: m.avatar, username: m.username } : null,
      book: book ? { id: book.id, title: book.title, slug: book.slug, cover_url: book.cover_url, author: book.author } : null,
    };
  });

  return NextResponse.json(items);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, is_public, is_anonymous } = body;

  if (!id) return NextResponse.json({ error: "id diperlukan" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (is_public !== undefined) updates.is_public = is_public;
  if (is_anonymous !== undefined) updates.is_anonymous = is_anonymous;

  const { data, error } = await createAdminClient()
    .from("reviews")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id diperlukan" }, { status: 400 });

  const { error } = await createAdminClient().from("reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
