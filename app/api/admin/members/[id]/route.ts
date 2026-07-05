import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: member, error } = await admin
    .from("members")
    .select("*, families(name, invite_code)")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!member) return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 });

  const family = member.families as Record<string, unknown> ?? {};

  const memberId = member.id;

  const { count: totalBooks } = await admin
    .from("shelf_items")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId);

  const { count: readingCount } = await admin
    .from("shelf_items")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("status", "reading");

  const { count: doneCount } = await admin
    .from("shelf_items")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("status", "done");

  const { count: wantCount } = await admin
    .from("shelf_items")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId)
    .eq("status", "want");

  const { count: reviewCount } = await admin
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId);

  const { data: pagesResult } = await admin
    .from("reading_logs")
    .select("pages_read")
    .eq("member_id", memberId);

  const totalPages = (pagesResult ?? []).reduce((sum: number, r: { pages_read: number }) => sum + (r.pages_read ?? 0), 0);

  const { data: streak } = await admin
    .from("streaks")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();

  const { data: recentLogs } = await admin
    .from("reading_logs")
    .select("id, created_at, pages_read, shelf_items!inner(books!inner(id, title, slug, cover_url))")
    .eq("shelf_items.member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: recentReviews } = await admin
    .from("reviews")
    .select("id, rating, q_about, is_public, is_anonymous, created_at, shelf_items!inner(books!inner(id, title, slug, cover_url))")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: shelfItems } = await admin
    .from("shelf_items")
    .select("id, status, current_page, finished_at, created_at, books(id, title, slug, cover_url)")
    .eq("member_id", memberId)
    .order("updated_at", { ascending: false })
    .limit(30);

  return NextResponse.json({
    id: member.id,
    name: member.name,
    email: member.email ?? null,
    username: member.username ?? null,
    avatar: member.avatar,
    member_type: member.member_type ?? "dewasa",
    role: member.role,
    is_cms_admin: member.is_cms_admin ?? false,
    weekly_pages_goal: member.weekly_pages_goal ?? 0,
    birth_date: member.birth_date ?? null,
    birth_year: member.birth_year ?? null,
    created_at: member.created_at,
    has_account: !!member.auth_user_id,
    auth_user_id: member.auth_user_id ?? null,
    family_id: member.family_id,
    family_name: typeof family.name === "string" ? family.name : null,
    family_invite_code: typeof family.invite_code === "string" ? family.invite_code : null,
    stats: {
      total_books: totalBooks ?? 0,
      reading: readingCount ?? 0,
      done: doneCount ?? 0,
      want: wantCount ?? 0,
      reviews: reviewCount ?? 0,
      total_pages: totalPages,
    },
    streak: streak ?? null,
    recent_logs: recentLogs ?? [],
    recent_reviews: recentReviews ?? [],
    shelf_items: shelfItems ?? [],
  });
}
