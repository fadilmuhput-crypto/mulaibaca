import type { SupabaseClient } from "@supabase/supabase-js";

export type FeedItemType = "shelf_add" | "shelf_status" | "log" | "review" | "finish" | "follow" | "challenge_earn";

export type FeedDetail = {
  pages_read?: number;
  duration_minutes?: number | null;
  from_page?: number | null;
  to_page?: number | null;
  images?: string[] | null;
  note?: string | null;
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
  challenge_id?: string;
  challenge_title?: string;
  badge_name?: string;
  badge_icon?: string;
  badge_color?: string;
  period_label?: string | null;
};

export type FeedItem = {
  id: string;
  type: FeedItemType;
  member_id: string;
  member_name: string;
  member_avatar: string;
  member_username: string | null;
  book_id?: string;
  book_title?: string;
  book_slug?: string;
  book_cover?: string | null;
  book_total_pages?: number | null;
  timestamp: string;
  detail: FeedDetail;
};

type ActivityMember = { name: string; avatar: string; username: string | null };
type ActivityRow = {
  id: string;
  activity_type: FeedItemType;
  data: Record<string, unknown>;
  created_at: string;
  member_id: string;
  members: ActivityMember;
  book_id?: string;
};

export function rowToFeedItem(row: ActivityRow): FeedItem {
  const d = row.data ?? {};
  const m = row.members;
  const base = {
    id: row.id,
    type: row.activity_type,
    member_id: row.member_id,
    member_name: m.name,
    member_avatar: m.avatar,
    member_username: m.username,
    timestamp: row.created_at,
  };
  switch (row.activity_type) {
    case "shelf_add":
      return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { status: d.status as string } as FeedDetail };
    case "shelf_status":
      return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { from_status: d.from_status as string, to_status: d.to_status as string } as FeedDetail };
    case "log":
      return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { pages_read: d.pages_read as number, duration_minutes: (d.duration_minutes as number | null) ?? null, from_page: (d.from_page as number | null) ?? null, to_page: (d.to_page as number | null) ?? null, images: (d.images as string[] | null) ?? null, note: (d.note as string | null) ?? null } as FeedDetail };
    case "review":
      return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: { rating: d.rating as number, excerpt: d.excerpt as string | undefined, review_slug: d.review_slug as string } as FeedDetail };
    case "finish":
      return { ...base, book_id: d.book_id as string, book_title: d.book_title as string, book_slug: d.book_slug as string, book_cover: (d.book_cover as string | null) ?? null, detail: {} as FeedDetail };
    case "follow":
      return { ...base, detail: { following_id: d.following_id as string, following_name: d.following_name as string, following_avatar: d.following_avatar as string | undefined, following_username: d.following_username as string | undefined } as FeedDetail };
    case "challenge_earn":
      return { ...base, detail: { challenge_id: d.challenge_id as string, challenge_title: d.challenge_title as string, badge_name: d.badge_name as string, badge_icon: d.badge_icon as string, badge_color: d.badge_color as string, period_label: (d.period_label as string | null) ?? null } as FeedDetail };
    default:
      return { ...base, detail: {} as FeedDetail };
  }
}

export async function enrichFinishItems(items: FeedItem[], admin: SupabaseClient): Promise<void> {
  const ids = [...new Set(items.filter((i) => i.type === "finish" && i.book_id).map((i) => i.book_id!))];
  if (ids.length === 0) return;
  const { data: books } = await admin.from("books").select("id, total_pages").in("id", ids);
  const pagesMap = new Map((books ?? []).map((b: { id: string; total_pages: number | null }) => [b.id, b.total_pages]));
  for (const item of items) {
    if (item.type === "finish" && item.book_id) {
      item.book_total_pages = pagesMap.get(item.book_id) ?? null;
    }
  }
}
