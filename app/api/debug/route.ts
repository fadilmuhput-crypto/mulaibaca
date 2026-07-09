import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import { insertActivity } from "@/lib/activity-feed";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Check activity_feed table
  const { data: feedRows, error: feedError } = await admin
    .from("activity_feed")
    .select("*")
    .limit(5);

  // Check if we can insert a test row
  let insertResult = null;
  try {
    await insertActivity(session.memberId, session.familyId, "log", {
      book_title: "Test Book",
      book_slug: "test-book",
      book_cover: null,
      pages_read: 1,
    });
    insertResult = "ok";
  } catch (err) {
    insertResult = (err as Error).message;
  }

  // Check books table for slug column
  const { data: bookSample } = await admin
    .from("books")
    .select("id, title, slug")
    .limit(1);

  return NextResponse.json({
    sessionMemberId: session.memberId,
    sessionFamilyId: session.familyId,
    activityFeed: { rows: feedRows, error: feedError },
    insertTest: insertResult,
    bookSample,
  });
}
