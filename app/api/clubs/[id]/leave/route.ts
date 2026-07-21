import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

async function getMemberId(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return member?.id ?? null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberId(req);
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin
    .from("club_members")
    .delete()
    .eq("club_id", id)
    .eq("member_id", memberId);

  if (error) {
    return NextResponse.json({ error: "Gagal keluar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
