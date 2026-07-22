import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getClubChallengeProgress } from "@/lib/club-challenges";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clubId = (await params).id;
  const challengeId = req.nextUrl.searchParams.get("challengeId");

  if (!challengeId) {
    return NextResponse.json({ error: "challengeId required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: member } = await admin
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { data: membership } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", clubId)
    .eq("member_id", member.id)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const progress = await getClubChallengeProgress(clubId, challengeId);
  if (!progress) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  return NextResponse.json(progress);
}
