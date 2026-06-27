import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";
import { getEffectiveAuth } from "@/lib/effective-auth";

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

  const { shelfItemId, pagesRead, durationMinutes, note, logDate, endPage } = await req.json();

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
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    log = data;
  }

  const { data: shelf } = await supabase
    .from("shelf_items").select("current_page").eq("id", shelfItemId).single();
  if (shelf) {
    const newPage = endPage != null ? endPage : (shelf.current_page ?? 0) + pagesRead;
    await supabase
      .from("shelf_items")
      .update({ current_page: newPage })
      .eq("id", shelfItemId);
  }

  const { data: streak } = await supabase
    .from("streaks").select("current_streak, longest_streak").eq("member_id", memberId).maybeSingle();

  return NextResponse.json({ log, streak }, { status: 201 });
}
