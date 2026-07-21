import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { inviteCode } = await req.json();

  if (!inviteCode || inviteCode.trim().length === 0) {
    return NextResponse.json({ error: "Kode undangan diperlukan" }, { status: 400 });
  }

  // Find club by invite code
  const { data: club } = await supabase
    .from("clubs")
    .select("id, max_members")
    .eq("invite_code", inviteCode.trim().toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (!club) {
    return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 });
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from("club_members")
    .select("id")
    .eq("club_id", club.id)
    .eq("member_id", member.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Kamu sudah bergabung di klub ini" }, { status: 409 });
  }

  // Check max members
  if (club.max_members) {
    const { count } = await supabase
      .from("club_members")
      .select("id", { count: "exact", head: true })
      .eq("club_id", club.id);

    if (count && count >= club.max_members) {
      return NextResponse.json({ error: "Klub sudah penuh" }, { status: 403 });
    }
  }

  // Join
  const { error: joinErr } = await supabase
    .from("club_members")
    .insert({ club_id: club.id, member_id: member.id, role: "member" });

  if (joinErr) {
    return NextResponse.json({ error: "Gagal bergabung" }, { status: 500 });
  }

  return NextResponse.json({ data: { club_id: club.id } });
}
