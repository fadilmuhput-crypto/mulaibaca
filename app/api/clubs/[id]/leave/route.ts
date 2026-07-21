import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { id } = await params;

  const { error } = await supabase
    .from("club_members")
    .delete()
    .eq("club_id", id)
    .eq("member_id", member.id);

  if (error) {
    return NextResponse.json({ error: "Gagal keluar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
