import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getClubChallenges, getClubChallengeProgress } from "@/lib/club-challenges";
import { sendPushToMembers } from "@/lib/push";

async function getAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data: member } = await admin
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return member?.id ?? null;
}

async function isAdmin(admin: ReturnType<typeof createAdminClient>, clubId: string, memberId: string) {
  const { data } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", clubId)
    .eq("member_id", memberId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getAuth(req);
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clubId = (await params).id;
  const admin = createAdminClient();

  const { data: membership } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", clubId)
    .eq("member_id", memberId)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const challenges = await getClubChallenges(clubId);
  return NextResponse.json(challenges);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getAuth(req);
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clubId = (await params).id;
  const admin = createAdminClient();

  if (!(await isAdmin(admin, clubId, memberId))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json();
  const { title, target, start_date, end_date } = body;

  if (!title || !target || !start_date || !end_date) {
    return NextResponse.json({ error: "Judul, target halaman, tanggal mulai, dan tanggal selesai wajib diisi" }, { status: 400 });
  }

  if (target < 1) {
    return NextResponse.json({ error: "Target harus lebih dari 0" }, { status: 400 });
  }

  if (new Date(end_date) <= new Date(start_date)) {
    return NextResponse.json({ error: "Tanggal selesai harus setelah tanggal mulai" }, { status: 400 });
  }

  // Check no active challenge exists
  const { data: active } = await admin
    .from("club_challenges")
    .select("id")
    .eq("club_id", clubId)
    .eq("status", "active")
    .maybeSingle();

  if (active) {
    return NextResponse.json({ error: "Sudah ada tantangan aktif. Selesaikan atau hapus yang dulu." }, { status: 409 });
  }

  const { data, error } = await admin
    .from("club_challenges")
    .insert({
      club_id: clubId,
      created_by: memberId,
      title: title.trim(),
      target,
      start_date,
      end_date,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Gagal membuat tantangan" }, { status: 500 });
  }

  // Notify all club members
  const { data: members } = await admin
    .from("club_members")
    .select("member_id")
    .eq("club_id", clubId)
    .neq("member_id", memberId);

  const { data: club } = await admin
    .from("clubs")
    .select("name")
    .eq("id", clubId)
    .single();

  if (members?.length && club) {
    const memberIds = members.map((m) => m.member_id);
    await sendPushToMembers(
      memberIds,
      "🏆 Tantangan baru!",
      `${club.name}: "${title}" — Target ${target} halaman. Yuk baca bareng!`
    );
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getAuth(req);
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clubId = (await params).id;
  const admin = createAdminClient();

  if (!(await isAdmin(admin, clubId, memberId))) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { challengeId, action } = await req.json();

  if (!challengeId || !action) {
    return NextResponse.json({ error: "challengeId and action required" }, { status: 400 });
  }

  if (action === "complete") {
    // Check progress before marking complete
    const progress = await getClubChallengeProgress(clubId, challengeId);
    if (!progress) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

    if ((progress.pages_read ?? 0) < progress.target) {
      return NextResponse.json(
        { error: `Belum mencapai target (${progress.pages_read ?? 0}/${progress.target} halaman)` },
        { status: 400 }
      );
    }

    const { error } = await admin
      .from("club_challenges")
      .update({ status: "completed" })
      .eq("id", challengeId)
      .eq("club_id", clubId)
      .eq("status", "active");

    if (error) {
      return NextResponse.json({ error: "Gagal menyelesaikan tantangan" }, { status: 500 });
    }

    // Notify all club members
    const { data: members } = await admin
      .from("club_members")
      .select("member_id")
      .eq("club_id", clubId);

    const { data: club } = await admin
      .from("clubs")
      .select("name")
      .eq("id", clubId)
      .single();

    if (members?.length && club) {
      const memberIds = members.map((m) => m.member_id);
      await sendPushToMembers(
        memberIds,
        "🎉 Tantangan tercapai!",
        `${club.name}: "${progress.title}" selesai! ${progress.target} halaman terbaca bareng.`
      );
    }

    return NextResponse.json({ success: true });
  }

  if (action === "cancel") {
    const { error } = await admin
      .from("club_challenges")
      .update({ status: "expired" })
      .eq("id", challengeId)
      .eq("club_id", clubId)
      .eq("status", "active");

    if (error) {
      return NextResponse.json({ error: "Gagal membatalkan tantangan" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
