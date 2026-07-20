import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  const authHeader = process.env.CRON_SECRET
    ? { "x-cron-secret": process.env.CRON_SECRET }
    : null;

  const [enrichRes, reminderRes, reviewReminderRes] = await Promise.allSettled([
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://mulaibaca.id"}/api/cron/enrich/run`,
      { headers: authHeader ?? {} }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://mulaibaca.id"}/api/cron/reminder`,
      { headers: authHeader ?? {} }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://mulaibaca.id"}/api/cron/review-reminder`,
      { headers: authHeader ?? {} }
    ),
  ]);

  const enrichResult = enrichRes.status === "fulfilled"
    ? await enrichRes.value.json()
    : { error: enrichRes.reason?.message };

  const reminderResult = reminderRes.status === "fulfilled"
    ? await reminderRes.value.json()
    : { error: reminderRes.reason?.message };

  const reviewReminderResult = reviewReminderRes.status === "fulfilled"
    ? await reviewReminderRes.value.json()
    : { error: reviewReminderRes.reason?.message };

  return NextResponse.json({ enrich: enrichResult, reminder: reminderResult, reviewReminder: reviewReminderResult });
}

export async function POST() {
  const admin = createAdminClient();

  const { data: pendingBooks } = await admin
    .from("books")
    .select("id, open_library_id")
      .in("enrichment_status", ["pending", "failed"])
    .limit(10);

  if (!pendingBooks?.length) {
    return NextResponse.json({ processed: 0, message: "No pending books" });
  }

  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const book of pendingBooks) {
    try {
      const enrichRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://mulaibaca.id"}/api/books/enrich`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId: book.id }),
        }
      );
      const data = await enrichRes.json();
      results.push({ id: book.id, ok: enrichRes.ok, error: data.error });
    } catch (err) {
      results.push({ id: book.id, ok: false, error: String(err) });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
