import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

async function getAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (!member) return null;
  return { memberId: member.id as string };
}

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const [activeRes, badgesRes] = await Promise.all([
    admin.from("challenge_participants")
      .select("id", { count: "exact", head: true })
      .eq("member_id", auth.memberId)
      .is("completed_at", null),
    admin.from("challenge_badges")
      .select("id", { count: "exact", head: true })
      .eq("member_id", auth.memberId),
  ]);

  return NextResponse.json({
    active: activeRes.count ?? 0,
    badges: badgesRes.count ?? 0,
  });
}
