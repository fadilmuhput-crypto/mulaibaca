import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("reading_logs")
    .select("*, shelf_items(*, books(title, cover_url, author))")
    .eq("member_id", session.memberId)
    .gte("log_date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("log_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data, today });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { shelfItemId, pagesRead, durationMinutes, note, logDate } = await req.json();

  if (!shelfItemId || pagesRead == null) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const supabase = await createClient();
  const date = logDate ?? new Date().toISOString().split("T")[0];

  // Check if log already exists for this book today (upsert)
  const { data: existing } = await supabase
    .from("reading_logs")
    .select("id, pages_read")
    .eq("shelf_item_id", shelfItemId)
    .eq("log_date", date)
    .maybeSingle();

  let log;
  if (existing) {
    // Update existing log: add pages
    const newPages = (existing.pages_read ?? 0) + pagesRead;
    const { data, error } = await supabase
      .from("reading_logs")
      .update({
        pages_read: newPages,
        duration_minutes: durationMinutes ?? null,
        note: note ?? null,
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
        member_id: session.memberId,
        log_date: date,
        pages_read: pagesRead,
        duration_minutes: durationMinutes ?? null,
        note: note ?? null,
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    log = data;
  }

  // Update current_page on shelf item
  const { data: shelf } = await supabase
    .from("shelf_items")
    .select("current_page")
    .eq("id", shelfItemId)
    .single();

  if (shelf) {
    await supabase
      .from("shelf_items")
      .update({ current_page: (shelf.current_page ?? 0) + pagesRead })
      .eq("id", shelfItemId);
  }

  // Fetch updated streak
  const { data: streak } = await supabase
    .from("streaks")
    .select("current_streak, longest_streak")
    .eq("member_id", session.memberId)
    .maybeSingle();

  return NextResponse.json({ log, streak }, { status: 201 });
}
