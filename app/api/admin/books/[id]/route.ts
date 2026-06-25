import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

async function getAdminAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id, role").eq("auth_user_id", user.id).maybeSingle();
  if (!member || member.role !== "admin") return null;
  return { userId: user.id };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, author, category, description, cover_url, open_library_id, total_pages, tags, is_active, sort_order } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title.trim();
  if (author !== undefined) updates.author = author.trim();
  if (category !== undefined) updates.category = category;
  if (description !== undefined) updates.description = description.trim();
  if (cover_url !== undefined) updates.cover_url = cover_url?.trim() || null;
  if (open_library_id !== undefined) updates.open_library_id = open_library_id?.trim() || null;
  if (total_pages !== undefined) updates.total_pages = total_pages ? Math.floor(Number(total_pages)) : null;
  if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags.filter(Boolean) : [];
  if (is_active !== undefined) updates.is_active = Boolean(is_active);
  if (sort_order !== undefined) updates.sort_order = Number(sort_order);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("curated_books")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ book: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("curated_books").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
