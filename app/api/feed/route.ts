import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";

export type FeedItem = {
  id: string;
  type: "shelf_add" | "shelf_status" | "log" | "review" | "finish" | "follow";
  member_id: string;
  member_name: string;
  member_avatar: string;
  member_username: string | null;
  book_id?: string;
  book_title?: string;
  book_slug?: string;
  book_cover?: string | null;
  timestamp: string;
  detail: {
    pages_read?: number;
    duration_minutes?: number | null;
    from_page?: number | null;
    to_page?: number | null;
    rating?: number;
    excerpt?: string;
    review_slug?: string;
    status?: string;
    from_status?: string;
    to_status?: string;
    following_id?: string;
    following_name?: string;
    following_avatar?: string;
    following_username?: string;
  };
};

type ActivityMember = {
  name: string;
  avatar: string;
  username: string | null;
};

type ActivityRow = {
  id: string;
  activity_type: FeedItem["type"];
  data: Record<string, unknown>;
  created_at: string;
  member_id: string;
  members: ActivityMember;
};

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

  const items: FeedItem[] = (rows ?? []).map((row: unknown) => {
    const r = row as ActivityRow;
    const d = r.data ?? {};
    const m = r.members;
    const base = {
      id: r.id,
      type: r.activity_type,
      member_id: r.member_id,
      member_name: m.name,
      member_avatar: m.avatar,
      member_username: m.username,
      timestamp: r.created_at,
    };

    switch (r.activity_type) {
      case "shelf_add":
        return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { status: d.status as string } };
      case "shelf_status":
        return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { from_status: d.from_status as string, to_status: d.to_status as string } };
      case "log":
        return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { pages_read: d.pages_read as number, duration_minutes: d.duration_minutes as number | null ?? null, from_page: d.from_page as number | null ?? null, to_page: d.to_page as number | null ?? null } };
      case "review":
        return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { rating: d.rating as number, excerpt: d.excerpt as string | undefined, review_slug: d.review_slug as string } };
      case "finish":
        return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: {} };
      case "follow":
        return { ...base, detail: { following_id: d.following_id as string, following_name: d.following_name as string, following_avatar: d.following_avatar as string | undefined, following_username: d.following_username as string | undefined } };
      default:
        return { ...base, detail: {} };
    }
  });

  return NextResponse.json(items);
}
