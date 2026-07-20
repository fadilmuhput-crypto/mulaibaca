import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";
import { createNotification } from "@/lib/notifications";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = createAdminClient();

    // Shelf items finished exactly 3 days ago (one-day window)
    const now = new Date();
    const target = new Date(now);
    target.setDate(target.getDate() - 3);
    const dayStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const { data: shelfItems } = await admin
      .from("shelf_items")
      .select("id, member_id, books!inner(title)")
      .eq("status", "done")
      .gte("finished_at", dayStart.toISOString())
      .lt("finished_at", dayEnd.toISOString());

    if (!shelfItems?.length) {
      return NextResponse.json({ sent: 0, message: "No books finished 3 days ago" });
    }

    const shelfItemIds = shelfItems.map((s: any) => s.id);
    const { data: existingReviews } = await admin
      .from("reviews")
      .select("shelf_item_id")
      .in("shelf_item_id", shelfItemIds);

    const reviewedIds = new Set((existingReviews ?? []).map((r: any) => r.shelf_item_id));

    let sent = 0;
    for (const item of shelfItems as any[]) {
      if (reviewedIds.has(item.id)) continue;

      const bookTitle = item.books?.title ?? "buku ini";

      await createNotification({
        memberId: item.member_id,
        title: `✍️ Review "${bookTitle}"?`,
        body: `3 hari lalu kamu selesai baca "${bookTitle}". Yuk tulis review-nya!`,
        type: "info",
        link: `/review/tulis?shelf=${item.id}`,
      }, admin);

      sent++;
    }

    return NextResponse.json({ sent, total: shelfItems.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
