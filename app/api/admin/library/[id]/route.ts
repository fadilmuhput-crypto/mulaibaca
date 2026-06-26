import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

async function getAdminAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id, is_cms_admin").eq("auth_user_id", user.id).maybeSingle();
  if (!member || !member.is_cms_admin) return null;
  return { userId: user.id };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, author, cover_url, isbn, open_library_id, total_pages, description, categories, tags, publisher, published_year, language, is_active } = body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title.trim();
  if (author !== undefined) updates.author = author?.trim() || null;
  if (cover_url !== undefined) updates.cover_url = cover_url?.trim() || null;
  if (isbn !== undefined) updates.isbn = isbn?.trim() || null;
  if (open_library_id !== undefined) updates.open_library_id = open_library_id?.trim() || null;
  if (total_pages !== undefined) updates.total_pages = total_pages ? Math.floor(Number(total_pages)) : null;
  if (description !== undefined) updates.description = description?.trim() || null;
  if (categories !== undefined) updates.categories = Array.isArray(categories) ? categories.filter(Boolean) : [];
  if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags.filter(Boolean) : [];
  if (publisher !== undefined) updates.publisher = publisher?.trim() || null;
  if (published_year !== undefined) updates.published_year = published_year ? Math.floor(Number(published_year)) : null;
  if (language !== undefined) updates.language = language || "id";
  if (is_active !== undefined) updates.is_active = Boolean(is_active);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("books")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ book: data });
}
