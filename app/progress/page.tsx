import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import ProgressClient from "./ProgressClient";

type DailyReading = {
  date: string;
  pages: number;
};

type Activity = {
  id: string;
  type: string;
  book_title?: string;
  book_slug?: string;
  book_cover?: string | null;
  detail: Record<string, unknown>;
  timestamp: string;
};

type FollowInfo = {
  id: string;
  name: string;
  avatar: string | null;
  username: string | null;
};

export default async function ProgressPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const cutoff = sixtyDaysAgo.toISOString().split("T")[0];

  let doneShelf: { id: string }[] | null = null;
  let logs: { log_date: string; pages_read: number }[] | null = null;
  let streak: { current_streak: number; longest_streak: number } | null = null;
  let feed: { id: string; activity_type: string; data: Record<string, unknown>; created_at: string }[] | null = null;
  let followerCount: number | null = null;
  let followingCount: number | null = null;
  try {
    const admin = createAdminClient();
    const results = await Promise.all([
      supabase.from("shelf_items").select("id").eq("member_id", session.memberId).eq("status", "done"),
      supabase.from("reading_logs").select("log_date, pages_read").eq("member_id", session.memberId).gte("log_date", cutoff),
      supabase.from("streaks").select("current_streak, longest_streak").eq("member_id", session.memberId).maybeSingle(),
      admin.from("activity_feed").select("id, activity_type, data, created_at").eq("member_id", session.memberId).order("created_at", { ascending: false }).limit(50),
      admin.from("follows").select("*", { count: "exact", head: true }).eq("following_id", session.memberId),
      admin.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", session.memberId),
    ]);
    doneShelf = results[0].data;
    logs = results[1].data;
    streak = results[2].data;
    feed = results[3].data;
    followerCount = results[4].count;
    followingCount = results[5].count;
  } catch { /* graceful degradation */ }

  const dateMap = new Map<string, number>();
  for (const log of logs ?? []) {
    dateMap.set(log.log_date, (dateMap.get(log.log_date) ?? 0) + log.pages_read);
  }
  const dailyReadings: DailyReading[] = Array.from(dateMap.entries()).map(([date, pages]) => ({ date, pages }));

  const activities: Activity[] = (feed ?? []).map((r) => {
    const d = (r.data ?? {}) as Record<string, unknown>;
    const base: Activity = {
      id: r.id,
      type: r.activity_type,
      timestamp: r.created_at,
      detail: d,
    };
    if (typeof d.book_title === "string") base.book_title = d.book_title;
    if (typeof d.book_slug === "string") base.book_slug = d.book_slug;
    if (typeof d.book_cover === "string") base.book_cover = d.book_cover;
    return base;
  });

  const booksFinished = doneShelf?.length ?? 0;
  const totalPagesRead = dailyReadings.reduce((s, r) => s + r.pages, 0);
  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <ProgressClient
          session={session}
          dailyReadings={dailyReadings}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          totalPagesRead={totalPagesRead}
          booksFinished={booksFinished}
          activities={activities}
          followerCount={followerCount ?? 0}
          followingCount={followingCount ?? 0}
        />
      </main>
    </div>
  );
}
