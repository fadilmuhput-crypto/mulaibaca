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

export async function POST(req: NextRequest) {
  const memberId = await getMemberId(req);
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { inviteCode } = await req.json();

  if (!inviteCode || inviteCode.trim().length === 0) {
    return NextResponse.json({ error: "Kode undangan diperlukan" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: club } = await admin
    .from("clubs")
    .select("id, max_members")
    .eq("invite_code", inviteCode.trim().toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (!club) {
    return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 });
  }

  const { data: existing } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", club.id)
    .eq("member_id", memberId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Kamu sudah bergabung di klub ini" }, { status: 409 });
  }

  if (club.max_members) {
    const { count } = await admin
      .from("club_members")
      .select("id", { count: "exact", head: true })
      .eq("club_id", club.id);

    if (count && count >= club.max_members) {
      return NextResponse.json({ error: "Klub sudah penuh" }, { status: 403 });
    }
  }

  const { error: joinErr } = await admin
    .from("club_members")
    .insert({ club_id: club.id, member_id: memberId, role: "member" });

  if (joinErr) {
    return NextResponse.json({ error: "Gagal bergabung" }, { status: 500 });
  }

  return NextResponse.json({ data: { club_id: club.id } });
}
