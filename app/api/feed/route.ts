import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";

export type FeedItem = {
  id: string;
  type: "log" | "review" | "finish";
  member_id: string;
  member_name: string;
  member_avatar: string;
  member_username: string | null;
  book_title: string;
  book_slug: string;
  book_cover: string | null;
  timestamp: string;
  detail: {
    pages_read?: number;
    rating?: number;
    excerpt?: string;
  };
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Get following list
  const { data: follows } = await admin
    .from("follows")
    .select("following_id")
    .eq("follower_id", session.memberId);

  const followingIds = (follows ?? []).map((f: { following_id: string }) => f.following_id);
  // Always include self so you see your own activity too
  const memberIds = [...new Set([...followingIds, session.memberId])];

  if (memberIds.length === 0) {
    return NextResponse.json([]);
  }

  const limit = 20;

  // 1. Reading logs
  const { data: logs } = await admin
    .from("reading_logs")
    .select(`
      id, created_at, pages_read,
      shelf_items!inner(member_id, books!inner(id, title, slug, cover_url))
    `)
    .in("shelf_items.member_id", memberIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  // 2. Reviews
  const { data: reviews } = await admin
    .from("reviews")
    .select(`
      id, created_at, rating, q_about,
      member_id,
      shelf_items!inner(books!inner(id, title, slug, cover_url))
    `)
    .eq("is_public", true)
    .in("member_id", memberIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  // 3. Shelf completed
  const { data: doneItems } = await admin
    .from("shelf_items")
    .select(`
      id, member_id, finished_at, books!inner(id, title, slug, cover_url)
    `)
    .eq("status", "done")
    .not("finished_at", "is", null)
    .in("member_id", memberIds)
    .order("finished_at", { ascending: false })
    .limit(limit);

  // Fetch member info for all followed members
  const { data: members } = memberIds.length > 0
    ? await admin.from("members").select("id, name, avatar, username").in("id", memberIds)
    : { data: [] };

  const memberMap = new Map((members ?? []).map((m: { id: string; name: string; avatar: string; username: string | null }) => [m.id, m]));

  const items: FeedItem[] = [];

  // Transform logs
  for (const row of (logs ?? [])) {
    const r = row as { id: string; created_at: string; pages_read: number; shelf_items: { member_id: string; books: { id: string; title: string; slug: string; cover_url: string | null }[] }[] };
    const shelf = r.shelf_items[0];
    const book = shelf?.books?.[0];
    if (!shelf || !book) continue;
    const member = memberMap.get(shelf.member_id);
    if (!member) continue;
    items.push({
      id: `log-${r.id}`,
      type: "log",
      member_id: member.id,
      member_name: member.name,
      member_avatar: member.avatar,
      member_username: member.username,
      book_title: book.title,
      book_slug: book.slug ?? `${toSlug(book.title)}-ol${book.id}`,
      book_cover: book.cover_url,
      timestamp: r.created_at,
      detail: { pages_read: r.pages_read },
    });
  }

  // Transform reviews
  for (const row of (reviews ?? [])) {
    const r = row as { id: string; created_at: string; rating: number; q_about: string | null; member_id: string; shelf_items: { books: { id: string; title: string; slug: string; cover_url: string | null }[] }[] };
    const book = r.shelf_items?.[0]?.books?.[0];
    if (!book) continue;
    const member = memberMap.get(r.member_id);
    if (!member) continue;
    items.push({
      id: `review-${r.id}`,
      type: "review",
      member_id: member.id,
      member_name: member.name,
      member_avatar: member.avatar,
      member_username: member.username,
      book_title: book.title,
      book_slug: book.slug ?? `${toSlug(book.title)}-ol${book.id}`,
      book_cover: book.cover_url,
      timestamp: r.created_at,
      detail: { rating: r.rating, excerpt: r.q_about?.slice(0, 120) ?? undefined },
    });
  }

  // Transform completed books
  for (const row of (doneItems ?? [])) {
    const r = row as { id: string; member_id: string; finished_at: string | null; books: { id: string; title: string; slug: string; cover_url: string | null }[] };
    const book = r.books?.[0];
    if (!book) continue;
    const member = memberMap.get(r.member_id);
    if (!member) continue;
    items.push({
      id: `finish-${r.id}`,
      type: "finish",
      member_id: member.id,
      member_name: member.name,
      member_avatar: member.avatar,
      member_username: member.username,
      book_title: book.title,
      book_slug: book.slug ?? `${toSlug(book.title)}-ol${book.id}`,
      book_cover: book.cover_url,
      timestamp: r.finished_at ?? r.id,
      detail: {},
    });
  }

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(items.slice(0, limit));
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}
