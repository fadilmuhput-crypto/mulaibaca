import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import { rowToFeedItem, enrichFinishItems, type FeedItem } from "@/lib/feed";
import FeedClient from "./FeedClient";

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const admin = createAdminClient();

  const { data: follows } = await admin
    .from("follows")
    .select("following_id")
    .eq("follower_id", session.memberId);

  const followingIds = (follows ?? []).map((f: { following_id: string }) => f.following_id);
  const memberIds = [...new Set([...followingIds, session.memberId])];

  const { data: rows } = memberIds.length > 0
    ? await admin
        .from("activity_feed")
        .select("id, activity_type, data, created_at, member_id, members!inner(name, avatar, username)")
        .in("member_id", memberIds)
        .order("created_at", { ascending: false })
        .limit(50)
    : { data: [] };

  const items: FeedItem[] = (rows ?? []).map((r: unknown) => rowToFeedItem(r as Parameters<typeof rowToFeedItem>[0]));
  await enrichFinishItems(items, admin);

  return (
    <div className="min-h-screen bg-parchment">
      <FeedClient initial={items} currentMemberId={session.memberId} />
    </div>
  );
}
