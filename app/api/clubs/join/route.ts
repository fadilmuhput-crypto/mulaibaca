import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { sendPushToMembers } from "@/lib/push";

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
    .select("id, max_members, join_type, visibility")
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

  // Approval flow
  if (club.join_type === "approval") {
    const { data: existingReq } = await admin
      .from("join_requests")
      .select("id, status")
      .eq("club_id", club.id)
      .eq("member_id", memberId)
      .maybeSingle();

    if (existingReq) {
      if (existingReq.status === "pending") {
        return NextResponse.json({ error: "Permintaanmu masih menunggu persetujuan admin" }, { status: 409 });
      }
      if (existingReq.status === "rejected") {
        return NextResponse.json({ error: "Permintaanmu sebelumnya ditolak. Hubungi admin klub." }, { status: 403 });
      }
    }

    const { error: reqErr } = await admin
      .from("join_requests")
      .insert({ club_id: club.id, member_id: memberId });

    if (reqErr) {
      return NextResponse.json({ error: "Gagal mengirim permintaan" }, { status: 500 });
    }

    // Notify club admins
    const [{ data: requester }, { data: clubDetail }, { data: admins }] = await Promise.all([
      admin.from("members").select("name").eq("id", memberId).single(),
      admin.from("clubs").select("name").eq("id", club.id).single(),
      admin.from("club_members").select("member_id").eq("club_id", club.id).eq("role", "admin"),
    ]);

    if (requester?.name && clubDetail?.name && admins?.length) {
      const adminIds = admins.map((a) => a.member_id);
      await sendPushToMembers(
        adminIds,
        `📋 Ada yang mau gabung!`,
        `${requester.name} ingin bergabung ke ${clubDetail.name}. Buka aplikasi untuk menyetujui atau menolak.`
      );
    }

    return NextResponse.json({ data: { club_id: club.id, status: "pending" } });
  }

  const { error: joinErr } = await admin
    .from("club_members")
    .insert({ club_id: club.id, member_id: memberId, role: "member" });

  if (joinErr) {
    return NextResponse.json({ error: "Gagal bergabung" }, { status: 500 });
  }

  return NextResponse.json({ data: { club_id: club.id } });
}
