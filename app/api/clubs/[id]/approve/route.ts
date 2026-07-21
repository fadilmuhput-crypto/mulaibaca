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
  const { requestId } = await req.json();
  if (!requestId) return NextResponse.json({ error: "requestId required" }, { status: 400 });

  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", id)
    .eq("member_id", memberId)
    .eq("role", "admin")
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: "Hanya admin" }, { status: 403 });

  const { data: joinReq } = await admin
    .from("join_requests")
    .select("member_id")
    .eq("id", requestId)
    .eq("club_id", id)
    .eq("status", "pending")
    .single();

  if (!joinReq) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const { error: updateErr } = await admin
    .from("join_requests")
    .update({ status: "approved" })
    .eq("id", requestId);

  if (updateErr) return NextResponse.json({ error: "Gagal approve" }, { status: 500 });

  const { error: joinErr } = await admin
    .from("club_members")
    .insert({ club_id: id, member_id: joinReq.member_id, role: "member" });

  if (joinErr) return NextResponse.json({ error: "Gagal menambah anggota" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
