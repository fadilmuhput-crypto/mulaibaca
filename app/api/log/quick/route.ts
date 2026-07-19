import { NextRequest, NextResponse } from "next/server";
import { getEffectiveAuth } from "@/lib/effective-auth";
import { createAdminClient } from "@/lib/supabase-route";
import { insertActivity } from "@/lib/activity-feed";
import { createNotification } from "@/lib/notifications";
import { checkAndCompleteChallenges } from "@/lib/challenges";

export async function POST(req: NextRequest) {
  const auth = await getEffectiveAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dataClient: supabase, memberId, familyId } = auth;
  const admin = createAdminClient();

  const { shelfItemId, pagesRead } = await req.json();
  if (!shelfItemId || !pagesRead || pagesRead < 1) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const date = new Date().toISOString().split("T")[0];

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
      .update({ pages_read: (existing.pages_read ?? 0) + pagesRead })
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
      })
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    log = data;
  }

  const { data: shelf } = await admin
    .from("shelf_items").select("id, current_page, book_id, status").eq("id", shelfItemId).maybeSingle();

  if (!shelf) return NextResponse.json({ error: "Shelf item not found" }, { status: 404 });

  const [{ data: book }, { data: streak }, { count }] = await Promise.all([
    shelf.book_id
      ? admin.from("books").select("id, title, cover_url, total_pages").eq("id", shelf.book_id).maybeSingle()
      : Promise.resolve({ data: null }),
    admin.from("streaks").select("current_streak, longest_streak").eq("member_id", memberId).maybeSingle(),
    admin.from("reading_logs").select("id", { count: "exact", head: true }).eq("member_id", memberId),
  ]);

  const isFirstLog = count === 1;

  let bookDone = false;
  let completedChallenges: { title: string; badge_name: string; badge_icon: string }[] = [];
  if (book) {
    const newPage = (shelf.current_page ?? 0) + pagesRead;
    const updates: Record<string, unknown> = { current_page: newPage };
    bookDone = book.total_pages != null && newPage >= book.total_pages;
    if (bookDone) {
      updates.status = "done";
      updates.finished_at = new Date().toISOString();
    }
    await admin.from("shelf_items").update(updates).eq("id", shelfItemId);

    const slug = book.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
    const promises: Promise<unknown>[] = [
      insertActivity(memberId, familyId, "log", {
        book_id: book.id, book_title: book.title, book_slug: slug, book_cover: book.cover_url,
        pages_read: pagesRead, duration_minutes: null, from_page: null, to_page: null,
        images: null, note: null, log_id: log.id,
      }, admin),
    ];
    if (bookDone) {
      promises.push(insertActivity(memberId, familyId, "finish", {
        book_id: book.id, book_title: book.title, book_slug: slug, book_cover: book.cover_url,
      }, admin));
    }
    if (isFirstLog) {
      promises.push(createNotification({
        memberId, title: "Catatan bacaan pertama!", body: "Kamu baru saja mencatat bacaan pertamamu. Tidak ada kata terlambat untuk memulai!", type: "achievement", link: "/log",
      }, admin));
    }
    completedChallenges = (await checkAndCompleteChallenges(supabase, memberId, familyId, admin)).completed;
    const streakVal = streak?.current_streak ?? 0;
    if ([7, 14, 21, 30, 60, 100].includes(streakVal)) {
      promises.push((async () => {
        const { data: existingNotif } = await admin
          .from("notifications").select("id").eq("member_id", memberId).eq("title", `Streak ${streakVal} hari!`).maybeSingle();
        if (!existingNotif) {
          return createNotification({
            memberId, title: `Streak ${streakVal} hari!`, body: `Luar biasa! Kamu sudah membaca ${streakVal} hari berturut-turut. Terus pertahankan!`, type: "achievement", link: "/log",
          }, admin);
        }
      })());
    }
    Promise.allSettled(promises);
  }

  return NextResponse.json({ log, streak, is_first_log: isFirstLog, pagesRead, bookDone, completedChallenges }, { status: 201 });
}
