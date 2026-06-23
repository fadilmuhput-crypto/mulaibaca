import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const supabase = await createClient();

  const updates: Record<string, unknown> = {};
  if (body.current_page !== undefined) updates.current_page = body.current_page;
  if (body.status) {
    updates.status = body.status;
    if (body.status === "done") updates.finished_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("shelf_items")
    .update(updates)
    .eq("id", id)
    .eq("member_id", session.memberId)
    .select("*, books(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("shelf_items")
    .delete()
    .eq("id", id)
    .eq("member_id", session.memberId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
