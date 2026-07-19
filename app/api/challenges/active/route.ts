import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getChallengesData } from "@/lib/challenges";

export async function GET(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (!member) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const data = await getChallengesData(admin, member.id);

  const active = data.active.map((c) => ({
    id: c.id,
    title: c.title,
    activity_type: c.activity_type,
    goal_value: c.goal_value,
    progress: c.progress,
    percentage: Math.min(Math.round((c.progress / c.goal_value) * 100), 100),
    icon: c.badge_icon,
    color: c.badge_color,
    deadline: c.deadline,
  }));

  return NextResponse.json({ active, badges: data.badges.slice(0, 5) });
}
