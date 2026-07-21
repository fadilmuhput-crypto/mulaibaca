import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getClubMemberStats } from "@/lib/club-stats";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: member } = await admin
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { data: membership } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", (await params).id)
    .eq("member_id", member.id)
    .single();

  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const stats = await getClubMemberStats((await params).id);
  stats.sort((a, b) => b.pages_this_week - a.pages_this_week);

  return NextResponse.json(stats);
}
