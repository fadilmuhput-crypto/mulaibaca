import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";
import { getEffectiveAuth } from "@/lib/effective-auth";
import { createNotification } from "@/lib/notifications";

async function getSelfAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (!member) return null;
  return { supabase, memberId: member.id as string };
}

export async function GET(req: NextRequest) {
  const auth = await getSelfAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, memberId } = auth;

  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("reading_logs")
    .select("*, shelf_items(*, books(title, cover_url, author))")
    .eq("member_id", memberId)
    .gte("log_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("log_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data, today });
}

export async function POST(req: NextRequest) {
  const auth = await getEffectiveAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dataClient: supabase, memberId } = auth;

  const { shelfItemId, pagesRead, durationMinutes, note, logDate, endPage, fromPage, toPage, images } = await req.json();

  if (!shelfItemId || pagesRead == null) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const date = logDate ?? new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("reading_logs")
    .select("id, pages_read")
    .eq("shelf_item_id", shelfItemId)
    .eq("log_date", date)
    .maybeSingle();

  let log;
  if (existing) {
    const { data, error } = await supabase
      .from("reading_logs")
      .update({
        pages_read: (existing.pages_read ?? 0) + pagesRead,
        duration_minutes: durationMinutes ?? null,
        note: note ?? null,
        images: images ?? null,
        from_page: fromPage ?? null,
        to_page: toPage ?? null,
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    log = data;
  } else {
    const { data, error } = await supabase
      .from("reading_logs")
      .insert({
        shelf_item_id: shelfItemId,
        member_id: memberId,
        log_date: date,
        pages_read: pagesRead,
        duration_minutes: durationMinutes ?? null,
        note: note ?? null,
        images: images ?? null,
        from_page: fromPage ?? null,
        to_page: toPage ?? null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    log = data;
  }

  const { data: shelf } = await supabase
    .from("shelf_items").select("current_page, books!inner(total_pages)").eq("id", shelfItemId).single();
  if (shelf) {
    const newPage = endPage != null ? endPage : (shelf.current_page ?? 0) + pagesRead;
    const updates: Record<string, unknown> = { current_page: newPage };
    const shelfData = shelf as unknown as { current_page: number; books: { total_pages: number | null } };
    if (shelfData.books?.total_pages && newPage >= shelfData.books.total_pages) {
      updates.status = "done";
      updates.finished_at = new Date().toISOString();
    }
    await supabase
      .from("shelf_items")
      .update(updates)
      .eq("id", shelfItemId);
  }

  const { data: streak } = await supabase
    .from("streaks").select("current_streak, longest_streak").eq("member_id", memberId).maybeSingle();

  const { count } = await supabase
    .from("reading_logs")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId);
  const isFirstLog = count === 1;

  if (isFirstLog) {
    createNotification({
      memberId,
      title: "📖 Catatan bacaan pertama!",
      body: "Kamu baru saja mencatat bacaan pertamamu. Tidak ada kata terlambat untuk memulai!",
      type: "achievement",
      link: "/log",
    });
  }

  const streakVal = streak?.current_streak ?? 0;
  if ([7, 14, 21, 30, 60, 100].includes(streakVal)) {
    createNotification({
      memberId,
      title: `🔥 Streak ${streakVal} hari!`,
      body: `Luar biasa! Kamu sudah membaca ${streakVal} hari berturut-turut. Terus pertahankan!`,
      type: "achievement",
      link: "/log",
    });
  }

  return NextResponse.json({ log, streak, is_first_log: isFirstLog }, { status: 201 });
}
