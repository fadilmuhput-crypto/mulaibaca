import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";

async function isAdmin(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const session = await getSession();
  return !!session?.isCmsAdmin;
}

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("help_guides")
    .select("id, title, content, image_url, sort_order, is_active")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, content, image_url } = await req.json();
  if (!title?.trim())
    return NextResponse.json({ error: "Judul wajib diisi" }, { status: 400 });

  const admin = createAdminClient();
  const { data: maxData } = await admin
    .from("help_guides")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = ((maxData?.sort_order as number) ?? 0) + 1;

  const { data, error } = await admin
    .from("help_guides")
    .insert({ title: title.trim(), content: content?.trim() ?? null, image_url: image_url ?? null, sort_order })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
