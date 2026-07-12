import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import type { FeedItem } from "@/app/api/feed/route";
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

  const items: FeedItem[] = (rows ?? []).map((row: Record<string, unknown>) => {
    const r = row as { id: string; activity_type: string; data: Record<string, unknown>; created_at: string; member_id: string; members: { name: string; avatar: string; username: string | null } };
    const d = r.data ?? {};
    const m = r.members;
    const base = {
      id: r.id,
      type: r.activity_type as FeedItem["type"],
      member_id: r.member_id,
      member_name: m.name,
      member_avatar: m.avatar,
      member_username: m.username,
      timestamp: r.created_at,
    };

    switch (r.activity_type) {
      case "shelf_add":
        return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_cover: (d.book_cover as string | null) ?? null, detail: { status: d.status as string } };
      case "shelf_status":
        return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_cover: (d.book_cover as string | null) ?? null, detail: { from_status: d.from_status as string, to_status: d.to_status as string } };
      case "log":
        return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_cover: (d.book_cover as string | null) ?? null, detail: { pages_read: d.pages_read as number, duration_minutes: d.duration_minutes as number | null ?? null, from_page: d.from_page as number | null ?? null, to_page: d.to_page as number | null ?? null, images: d.images as string[] | null ?? null } };
      case "review":
        return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_cover: (d.book_cover as string | null) ?? null, detail: { rating: d.rating as number, excerpt: d.excerpt as string | undefined, review_slug: d.review_slug as string } };
      case "finish":
        return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_cover: (d.book_cover as string | null) ?? null, detail: {} };
      case "follow":
        return { ...base, detail: { following_id: d.following_id as string, following_name: d.following_name as string, following_avatar: d.following_avatar as string | undefined, following_username: d.following_username as string | undefined } };
      default:
        return { ...base, detail: {} };
    }
  });

  // Enrich finish items with total_pages from books table
  const finishBookIds = [...new Set(items.filter((i) => i.type === "finish" && i.book_id).map((i) => i.book_id!))];
  if (finishBookIds.length > 0) {
    const { data: books } = await admin
      .from("books")
      .select("id, total_pages")
      .in("id", finishBookIds);
    const pagesMap = new Map((books ?? []).map((b) => [b.id, b.total_pages as number | null]));
    for (const item of items) {
      if (item.type === "finish" && item.book_id) {
        (item as Record<string, unknown>).book_total_pages = pagesMap.get(item.book_id) ?? null;
      }
    }
  }

  return (
    <div className="min-h-screen bg-parchment">
      <FeedClient initial={items} currentMemberId={session.memberId} />
    </div>
  );
}
