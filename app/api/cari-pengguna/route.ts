import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const admin = createAdminClient();
  const like = `%${q}%`;

  const { data } = await admin
    .from("members")
    .select("id, name, username, avatar, member_type")
    .or(`name.ilike.${like},username.ilike.${like}`)
    .neq("id", session.memberId)
    .limit(20);

  const ids = (data ?? []).map((m) => m.id as string);

  // Get follow status for each result
  const { data: follows } = ids.length > 0
    ? await admin
        .from("follows")
        .select("following_id")
        .eq("follower_id", session.memberId)
        .in("following_id", ids)
    : { data: [] };

  const followingIds = new Set((follows ?? []).map((f) => f.following_id as string));

  const results = (data ?? []).map((m) => ({
    id: m.id as string,
    name: m.name as string,
    username: m.username as string | null,
    avatar: m.avatar as string,
    member_type: m.member_type as string,
    is_following: followingIds.has(m.id as string),
  }));

  return NextResponse.json({ results });
}
