import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

async function getMemberId(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return member?.id ?? null;
}

type Activity = {
  type: "log" | "finished" | "joined";
  member_id: string;
  member_name: string;
  member_avatar: string;
  detail: string;
  created_at: string;
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberId(req);
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const cursor = searchParams.get("cursor");

  const admin = createAdminClient();

  // Verify membership
  const { data: membership } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", id)
    .eq("member_id", memberId)
    .maybeSingle();

  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  // Get club member IDs
  const { data: clubMemberRows } = await admin
    .from("club_members")
    .select("member_id")
    .eq("club_id", id);

  const memberIds = (clubMemberRows ?? []).map((r: any) => r.member_id);
  if (memberIds.length === 0) return NextResponse.json([]);

  // Get member info
  const { data: memberRows } = await admin
    .from("members")
    .select("id, name, avatar")
    .in("id", memberIds);

  const memberMap = new Map((memberRows ?? []).map((m: any) => [m.id, m]));

  const activities: Activity[] = [];

  // 1. Reading logs (recent)
  const { data: logs } = await admin
    .from("reading_logs")
    .select("member_id, pages_read, log_date, created_at, shelf_item_id")
    .in("member_id", memberIds)
    .gt("pages_read", 0)
    .order("created_at", { ascending: false })
    .limit(100);

  // Get book titles for logs
  const shelfItemIds = [...new Set((logs ?? []).map((l: any) => l.shelf_item_id))];
  const { data: shelfItems } = await admin
    .from("shelf_items")
    .select("id, book_id")
    .in("id", shelfItemIds);

  const bookIds = [...new Set((shelfItems ?? []).map((s: any) => s.book_id))];
  const { data: books } = await admin
    .from("books")
    .select("id, title")
    .in("id", bookIds);

  const bookMap = new Map((books ?? []).map((b: any) => [b.id, b.title]));
  const shelfBookMap = new Map((shelfItems ?? []).map((s: any) => [s.id, s.book_id]));

  for (const log of logs ?? []) {
    const m = memberMap.get(log.member_id);
    if (!m) continue;
    const bookId = shelfBookMap.get(log.shelf_item_id);
    const title = bookId ? bookMap.get(bookId) ?? "buku" : "buku";
    activities.push({
      type: "log",
      member_id: log.member_id,
      member_name: m.name,
      member_avatar: m.avatar,
      detail: `baca ${log.pages_read} halaman "${title}"`,
      created_at: log.created_at,
    });
  }

  // 2. Finished books (recent)
  const { data: finished } = await admin
    .from("shelf_items")
    .select("member_id, book_id, finished_at")
    .in("member_id", memberIds)
    .eq("status", "done")
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false })
    .limit(50);

  for (const item of finished ?? []) {
    const m = memberMap.get(item.member_id);
    if (!m) continue;
    const title = bookMap.get(item.book_id) ?? "buku";
    activities.push({
      type: "finished",
      member_id: item.member_id,
      member_name: m.name,
      member_avatar: m.avatar,
      detail: `selesai membaca "${title}"`,
      created_at: item.finished_at,
    });
  }

  // 3. Joined club (recent)
  const { data: joined } = await admin
    .from("club_members")
    .select("member_id, joined_at")
    .eq("club_id", id)
    .order("joined_at", { ascending: false })
    .limit(20);

  for (const item of joined ?? []) {
    const m = memberMap.get(item.member_id);
    if (!m) continue;
    activities.push({
      type: "joined",
      member_id: item.member_id,
      member_name: m.name,
      member_avatar: m.avatar,
      detail: "bergabung ke klub",
      created_at: item.joined_at,
    });
  }

  // Sort by created_at desc, deduplicate, and apply cursor
  activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Remove duplicates (same member + same type + same created_at within 1 second)
  const seen = new Set<string>();
  const unique = activities.filter((a) => {
    const key = `${a.member_id}-${a.type}-${a.created_at}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Apply cursor
  let result = unique;
  if (cursor) {
    const cursorTime = new Date(cursor).getTime();
    result = unique.filter((a) => new Date(a.created_at).getTime() < cursorTime);
  }

  return NextResponse.json(result.slice(0, limit));
}
