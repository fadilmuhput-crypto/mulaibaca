import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

async function getAdminAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id, role").eq("auth_user_id", user.id).maybeSingle();
  if (!member || member.role !== "admin") return null;
  return { userId: user.id, memberId: member.id };
}

export async function GET(req: NextRequest) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("content_pillars")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("content_pillars")
    .insert({
      name: body.name,
      description: body.description,
      audience: body.audience,
      channels: body.channels,
      temas: body.temas,
      goals: body.goals,
      cta_style: body.cta_style,
      sort_order: body.sort_order ?? 0,
      created_by: auth.memberId,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
