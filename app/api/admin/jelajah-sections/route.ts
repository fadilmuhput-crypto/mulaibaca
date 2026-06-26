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

export async function GET(req: NextRequest) {
  const session = await assertAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: sections, error } = await admin
    .from("jelajah_sections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sections });
}

export async function POST(req: NextRequest) {
  const session = await assertAdmin(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, subtitle, type, config } = body;

  if (!title || !type) {
    return NextResponse.json({ error: "title dan type wajib diisi" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Dapatkan sort_order tertinggi
  const { data: last } = await admin
    .from("jelajah_sections")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sort_order = (last?.sort_order ?? 0) + 1;

  const { data: section, error } = await admin
    .from("jelajah_sections")
    .insert({ title, subtitle: subtitle || null, type, config: config ?? {}, sort_order })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ section }, { status: 201 });
}
