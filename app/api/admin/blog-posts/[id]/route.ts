import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 100) || "post";
}

async function getAdminAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id, is_cms_admin").eq("auth_user_id", user.id).maybeSingle();
  if (!member || !member.is_cms_admin) return null;
  return { userId: user.id, memberId: member.id };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin.from("blog_posts").select("*").eq("id", id).maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post: data });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.title !== undefined) updates.slug = toSlug(body.title);
  if (body.content !== undefined) updates.content = body.content;
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt?.trim() ?? "";
  if (body.author_name !== undefined) updates.author_name = body.author_name?.trim() ?? "Tim Mulaibaca";
  if (body.cover_image !== undefined) updates.cover_image = body.cover_image?.trim() || null;
  if (body.is_published !== undefined) {
    updates.is_published = body.is_published === true;
    updates.published_at = body.is_published ? new Date().toISOString() : null;
  }
  updates.updated_at = new Date().toISOString();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from("blog_posts").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
