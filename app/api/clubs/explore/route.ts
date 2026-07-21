import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

export async function GET(req: NextRequest) {
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

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  const { data: userClubIds } = await admin
    .from("club_members")
    .select("club_id")
    .eq("member_id", member.id);

  const joinedIds = new Set((userClubIds ?? []).map((r: any) => r.club_id));

  let query = admin
    .from("clubs")
    .select("id, name, description, cover_url, invite_code, created_at, max_members, is_active, visibility, join_type")
    .eq("is_active", true)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: clubs } = await query;

  if (!clubs) return NextResponse.json({ data: [], joinedIds: [] });

  // Count members for each club
  const clubsWithCount = await Promise.all(
    clubs.map(async (c) => {
      const { count } = await admin
        .from("club_members")
        .select("id", { count: "exact", head: true })
        .eq("club_id", c.id);
      return { ...c, member_count: count ?? 0 };
    })
  );

  return NextResponse.json({
    data: clubsWithCount,
    joinedIds: Array.from(joinedIds),
  });
}
