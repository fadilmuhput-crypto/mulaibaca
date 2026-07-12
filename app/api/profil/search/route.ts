import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

export async function GET(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members")
    .select("id, family_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const memberId = member.id as string;
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const admin = createAdminClient();

  // Get IDs already followed
  const { data: follows } = await admin
    .from("follows")
    .select("following_id")
    .eq("follower_id", memberId);
  const followedIds = new Set((follows ?? []).map((f: { following_id: string }) => f.following_id));

  let query = admin
    .from("members")
    .select("id, name, avatar, username")
    .neq("id", memberId)
    .limit(10);

  if (q.length >= 2) {
    query = query.or(`name.ilike.%${q}%,username.ilike.%${q}%`);
  } else {
    // Show some active members when not searching
    query = query.order("created_at", { ascending: false });
  }

  const { data: members } = await query;

  const results = (members ?? [])
    .filter((m) => !followedIds.has(m.id as string))
    .map((m) => ({
      id: m.id as string,
      name: m.name as string,
      avatar: m.avatar as string | null,
      username: m.username as string | null,
    }));

  return NextResponse.json({ results });
}
