import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

function randomCode() {
  return "TAMU" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const admin = createAdminClient();

  // Idempotent — skip if already set up
  const { data: existing } = await admin.from("members").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (existing) return NextResponse.json({ success: true });

  // Create a guest family
  const { data: family, error: fErr } = await admin
    .from("families")
    .insert({ name: "Keluarga Tamu", invite_code: randomCode() })
    .select("id")
    .single();
  if (fErr) return NextResponse.json({ error: fErr.message }, { status: 500 });

  // Create a guest member
  const { error: mErr } = await admin.from("members").insert({
    auth_user_id: user.id,
    family_id: family.id,
    name: "Pembaca",
    role: "admin",
    member_type: "dewasa",
    avatar: "user",
  });
  if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
