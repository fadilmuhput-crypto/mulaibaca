import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getEffectiveAuth } from "@/lib/effective-auth";
import { createNotification } from "@/lib/notifications";
import { insertActivity } from "@/lib/activity-feed";

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
  const { dataClient: supabase, memberId, familyId } = auth;

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

  // Fetch shelf (needed for book_id) then book + stats in parallel
  const admin = createAdminClient();
  const { data: shelf } = await admin
    .from("shelf_items").select("id, current_page, book_id, status").eq("id", shelfItemId).maybeSingle();

  if (shelf) {
    const [{ data: book }, { data: streak }, { count }] = await Promise.all([
      shelf.book_id
        ? admin.from("books").select("id, title, cover_url, total_pages").eq("id", shelf.book_id).maybeSingle()
        : Promise.resolve({ data: null }),
      admin.from("streaks").select("current_streak, longest_streak").eq("member_id", memberId).maybeSingle(),
      admin.from("reading_logs").select("id", { count: "exact", head: true }).eq("member_id", memberId),
    ]);

    const isFirstLog = count === 1;

    if (book) {
      const newPage = endPage != null ? endPage : (shelf.current_page ?? 0) + pagesRead;
      const updates: Record<string, unknown> = { current_page: newPage };
      const autoFinished = book.total_pages != null && newPage >= book.total_pages;
      if (autoFinished) {
        updates.status = "done";
        updates.finished_at = new Date().toISOString();
      }
      await admin.from("shelf_items").update(updates).eq("id", shelfItemId);

      // Fire-and-forget activity inserts + notifications (reuse admin client)
      const slug = book.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
      const promises: Promise<unknown>[] = [
        insertActivity(memberId, familyId, "log", {
          book_id: book.id, book_title: book.title, book_slug: slug, book_cover: book.cover_url, pages_read: pagesRead, duration_minutes: durationMinutes ?? null, from_page: fromPage ?? null, to_page: toPage ?? null, images: images ?? null,
        }, admin),
      ];
      if (autoFinished) {
        promises.push(insertActivity(memberId, familyId, "finish", {
          book_id: book.id, book_title: book.title, book_slug: slug, book_cover: book.cover_url,
        }, admin));
      }
      if (isFirstLog) {
        promises.push(createNotification({
          memberId,
          title: "📖 Catatan bacaan pertama!",
          body: "Kamu baru saja mencatat bacaan pertamamu. Tidak ada kata terlambat untuk memulai!",
          type: "achievement",
          link: "/log",
        }, admin));
      }
      const streakVal = streak?.current_streak ?? 0;
      if ([7, 14, 21, 30, 60, 100].includes(streakVal)) {
        const checkNotif = async () => {
          const { data: existingNotif } = await admin
            .from("notifications").select("id").eq("member_id", memberId).eq("title", `🔥 Streak ${streakVal} hari!`).maybeSingle();
          if (!existingNotif) {
            return createNotification({
              memberId, title: `🔥 Streak ${streakVal} hari!`, body: `Luar biasa! Kamu sudah membaca ${streakVal} hari berturut-turut. Terus pertahankan!`, type: "achievement", link: "/log",
            }, admin);
          }
        };
        promises.push(checkNotif());
      }
      Promise.allSettled(promises);
    }

    return NextResponse.json({ log, streak, is_first_log: isFirstLog }, { status: 201 });
  }

  return NextResponse.json({ error: "Shelf item not found" }, { status: 404 });
}
