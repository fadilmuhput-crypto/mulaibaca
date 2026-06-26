import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";

async function assertAdmin(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const session = await getSession();
  if (!session?.isCmsAdmin) return null;
  return session;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { data: section, error } = await admin
    .from("jelajah_sections")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Section tidak ditemukan" }, { status: 404 });

  // Ambil buku yang terhubung
  const { data: sectionBooks } = await admin
    .from("jelajah_section_books")
    .select("sort_order, curated_books(*)")
    .eq("section_id", id)
    .order("sort_order", { ascending: true });

  const books = (sectionBooks ?? []).map((sb: { curated_books: unknown }) => sb.curated_books);

  return NextResponse.json({ section: { ...section, books } });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, subtitle, type, config, is_active } = body;

  const admin = createAdminClient();
  const updates: Record<string, unknown> = {};
  if (title !== undefined)     updates.title     = title;
  if (subtitle !== undefined)  updates.subtitle  = subtitle || null;
  if (type !== undefined)      updates.type      = type;
  if (config !== undefined)    updates.config    = config;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data: section, error } = await admin
    .from("jelajah_sections")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ section });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin.from("jelajah_sections").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
