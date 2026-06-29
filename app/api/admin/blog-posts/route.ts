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

export async function GET(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data });
}

export async function POST(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, excerpt, author_name, cover_image, is_published } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 });
  }

  const admin = createAdminClient();
  const slug = toSlug(title);

  const { data, error } = await admin
    .from("blog_posts")
    .insert({
      title: title.trim(),
      slug,
      content: content ?? "",
      excerpt: excerpt?.trim() ?? "",
      author_name: author_name?.trim() ?? "Tim Mulaibaca",
      cover_image: cover_image?.trim() || null,
      is_published: is_published === true,
      published_at: is_published ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data }, { status: 201 });
}
