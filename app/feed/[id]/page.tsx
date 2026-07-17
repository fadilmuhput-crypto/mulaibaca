import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import { rowToFeedItem, enrichFinishItems, type FeedItem } from "@/lib/feed";
import FeedDetail from "./FeedDetail";

export default async function FeedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  const { id } = await params;
  const admin = createAdminClient();

  const { data: row } = await admin
    .from("activity_feed")
    .select("id, activity_type, data, created_at, member_id, members!inner(name, avatar, username)")
    .eq("id", id)
    .single();

  if (!row) redirect("/feed");

  const rawItem: FeedItem = rowToFeedItem(row as unknown as Parameters<typeof rowToFeedItem>[0]);
  await enrichFinishItems([rawItem], admin);

  return <FeedDetail item={rawItem} currentMemberId={session?.memberId ?? null} />;
}
