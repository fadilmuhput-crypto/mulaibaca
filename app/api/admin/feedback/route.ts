import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  let query = createAdminClient()
    .from("feedback")
    .select("*, members(name, avatar)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, status, admin_reply } = body;

  if (!id) return NextResponse.json({ error: "id diperlukan" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (admin_reply !== undefined) {
    updates.admin_reply = admin_reply;
    updates.replied_at = new Date().toISOString();
    if (admin_reply && !status) updates.status = "selesai";
  }

  const { data, error } = await createAdminClient()
    .from("feedback")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
