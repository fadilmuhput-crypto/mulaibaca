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
  const { toMemberId } = await req.json();

  if (!toMemberId) {
    return NextResponse.json({ error: "Member ID diperlukan" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Verify current user is admin
  const { data: currentMembership } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", id)
    .eq("member_id", memberId)
    .eq("role", "admin")
    .maybeSingle();

  if (!currentMembership) {
    return NextResponse.json({ error: "Hanya admin yang bisa transfer kepemilikan" }, { status: 403 });
  }

  // Verify target is a member
  const { data: targetMembership } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", id)
    .eq("member_id", toMemberId)
    .maybeSingle();

  if (!targetMembership) {
    return NextResponse.json({ error: "Anggota tidak ditemukan di klub ini" }, { status: 404 });
  }

  // Demote current admin to member
  await admin
    .from("club_members")
    .update({ role: "member" })
    .eq("club_id", id)
    .eq("member_id", memberId);

  // Promote target to admin
  await admin
    .from("club_members")
    .update({ role: "admin" })
    .eq("club_id", id)
    .eq("member_id", toMemberId);

  return NextResponse.json({ ok: true });
}
