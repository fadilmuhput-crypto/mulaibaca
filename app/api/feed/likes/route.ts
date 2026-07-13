import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ids = req.nextUrl.searchParams.get("ids");
  if (!ids) return NextResponse.json({});

  const feedIds = ids.split(",").filter(Boolean);
  if (feedIds.length === 0) return NextResponse.json({});

  const admin = createAdminClient();

  const [likesResult, myLikesResult] = await Promise.all([
    admin.from("feed_likes").select("feed_id, id").in("feed_id", feedIds),
    admin.from("feed_likes").select("feed_id").eq("member_id", session.memberId).in("feed_id", feedIds),
  ]);
  const likes = likesResult.data as { feed_id: string; id: string }[] | null;
  const myLikes = myLikesResult.data as { feed_id: string }[] | null;

  const countMap: Record<string, number> = {};
  for (const l of likes ?? []) {
    countMap[l.feed_id] = (countMap[l.feed_id] ?? 0) + 1;
  }
  const likedSet = new Set((myLikes ?? []).map((l) => l.feed_id));

  const result: Record<string, { count: number; liked_by_me: boolean }> = {};
  for (const id of feedIds) {
    result[id] = { count: countMap[id] ?? 0, liked_by_me: likedSet.has(id) };
  }

  return NextResponse.json(result);
}
