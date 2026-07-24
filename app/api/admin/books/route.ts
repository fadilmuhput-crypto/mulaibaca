import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

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
    .from("books")
    .select("*, source")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ books: data });
}

export async function POST(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, author, description, cover_url, open_library_id, isbn, total_pages, categories, tags, publisher, published_year, language, is_active } = await req.json();

  if (!title?.trim() || !author?.trim()) {
    return NextResponse.json({ error: "Judul dan pengarang wajib diisi" }, { status: 400 });
  }

  if (!total_pages || Math.floor(Number(total_pages)) < 1) {
    return NextResponse.json({ error: "Total halaman wajib diisi" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("books")
    .insert({
      title: title.trim(),
      author: author.trim(),
      is_curated: true,
      enrichment_status: open_library_id ? "pending" : "enriched",
      description: description?.trim() ?? "",
      cover_url: cover_url?.trim() || null,
      open_library_id: open_library_id?.trim() || null,
      isbn: isbn?.trim() || null,
      total_pages: total_pages ? Math.floor(Number(total_pages)) : null,
      categories: Array.isArray(categories) ? categories.filter(Boolean) : [],
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      publisher: publisher?.trim() || null,
      published_year: published_year ? Math.floor(Number(published_year)) : null,
      language: language || "id",
      is_active: is_active !== false,
      sort_order: 0,
      source: "admin_manual",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ book: data }, { status: 201 });
}
