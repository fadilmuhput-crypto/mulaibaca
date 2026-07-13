import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import { rowToFeedItem, enrichFinishItems, type FeedItem, type FeedDetail } from "@/lib/feed";

export type { FeedItem, FeedDetail };

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const { data: follows } = await admin
    .from("follows")
    .select("following_id")
    .eq("follower_id", session.memberId);

  const followingIds = (follows ?? []).map((f: { following_id: string }) => f.following_id);
  const memberIds = [...new Set([...followingIds, session.memberId])];

  if (memberIds.length === 0) {
    return NextResponse.json([]);
  }

  const { data: rows } = await admin
    .from("activity_feed")
    .select(`
      id, activity_type, data, created_at,
      member_id, members!inner(name, avatar, username)
    `)
    .in("member_id", memberIds)
    .order("created_at", { ascending: false })
    .limit(20);

  const items: FeedItem[] = (rows ?? []).map((r: unknown) => rowToFeedItem(r as Parameters<typeof rowToFeedItem>[0]));
  await enrichFinishItems(items, admin);

  return NextResponse.json(items);
}
