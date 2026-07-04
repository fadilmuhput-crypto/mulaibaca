import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import FeedClient from "./FeedClient";
import type { FeedItem } from "@/app/api/feed/route";
import { createAdminClient } from "@/lib/supabase-route";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

export default async function FeedPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const admin = createAdminClient();
  const memberId = session.memberId;

  // Get following list
  const { data: follows } = await admin
    .from("follows")
    .select("following_id")
    .eq("follower_id", memberId);

  const followingIds = (follows ?? []).map((f: { following_id: string }) => f.following_id);
  const memberIds = [...new Set([...followingIds, memberId])];
  const limit = 20;

  const initial: FeedItem[] = [];

  if (memberIds.length > 0) {
    const { data: members } = await admin.from("members").select("id, name, avatar, username").in("id", memberIds);
    const memberMap = new Map((members ?? []).map((m: { id: string; name: string; avatar: string; username: string | null }) => [m.id, m]));

    const [{ data: logs }, { data: reviews }, { data: doneItems }] = await Promise.all([
      admin.from("reading_logs").select(`id, created_at, pages_read, shelf_items!inner(member_id, books!inner(id, title, slug, cover_url))`).in("shelf_items.member_id", memberIds).order("created_at", { ascending: false }).limit(limit),
      admin.from("reviews").select(`id, created_at, rating, q_about, member_id, shelf_items!inner(books!inner(id, title, slug, cover_url))`).eq("is_public", true).in("member_id", memberIds).order("created_at", { ascending: false }).limit(limit),
      admin.from("shelf_items").select(`id, member_id, finished_at, books!inner(id, title, slug, cover_url)`).eq("status", "done").not("finished_at", "is", null).in("member_id", memberIds).order("finished_at", { ascending: false }).limit(limit),
    ]);

    for (const row of logs ?? []) {
      const r = row as { id: string; created_at: string; pages_read: number; shelf_items: { member_id: string; books: { id: string; title: string; slug: string; cover_url: string | null }[] }[] };
      const shelf = r.shelf_items[0];
      const b = shelf?.books?.[0];
      if (!shelf || !b) continue;
      const m = memberMap.get(shelf.member_id);
      if (!m) continue;
      initial.push({ id: `log-${r.id}`, type: "log", member_id: m.id, member_name: m.name, member_avatar: m.avatar, member_username: m.username, book_title: b.title, book_slug: b.slug ?? `${toSlug(b.title)}-ol${b.id}`, book_cover: b.cover_url, timestamp: r.created_at, detail: { pages_read: r.pages_read } });
    }

    for (const row of reviews ?? []) {
      const r = row as { id: string; created_at: string; rating: number; q_about: string | null; member_id: string; shelf_items: { books: { id: string; title: string; slug: string; cover_url: string | null }[] }[] };
      const b = r.shelf_items?.[0]?.books?.[0];
      if (!b) continue;
      const m = memberMap.get(r.member_id);
      if (!m) continue;
      initial.push({ id: `review-${r.id}`, type: "review", member_id: m.id, member_name: m.name, member_avatar: m.avatar, member_username: m.username, book_title: b.title, book_slug: b.slug ?? `${toSlug(b.title)}-ol${b.id}`, book_cover: b.cover_url, timestamp: r.created_at, detail: { rating: r.rating, excerpt: r.q_about?.slice(0, 120) ?? undefined } });
    }

    for (const row of doneItems ?? []) {
      const r = row as { id: string; member_id: string; finished_at: string | null; books: { id: string; title: string; slug: string; cover_url: string | null }[] };
      const b = r.books?.[0];
      if (!b) continue;
      const m = memberMap.get(r.member_id);
      if (!m) continue;
      initial.push({ id: `finish-${r.id}`, type: "finish", member_id: m.id, member_name: m.name, member_avatar: m.avatar, member_username: m.username, book_title: b.title, book_slug: b.slug ?? `${toSlug(b.title)}-ol${b.id}`, book_cover: b.cover_url, timestamp: r.finished_at ?? r.id, detail: {} });
    }

    initial.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  return <FeedClient initial={initial.slice(0, limit)} />;
}
