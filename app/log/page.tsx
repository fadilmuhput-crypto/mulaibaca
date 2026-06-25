import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import NavBar from "@/components/NavBar";
import LogClient from "./LogClient";

export default async function LogPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

  const [{ data: shelf }, { data: todayLogs }, { data: streak }, { data: weekLogs }] =
    await Promise.all([
      supabase
        .from("shelf_items")
        .select("id, current_page, books(id, title, author, cover_url, total_pages)")
        .eq("member_id", session.memberId)
        .eq("status", "reading")
        .order("created_at", { ascending: false }),
      supabase
        .from("reading_logs")
        .select("*, shelf_items(book_id, books(title, cover_url))")
        .eq("member_id", session.memberId)
        .eq("log_date", today)
        .order("created_at", { ascending: false }),
      supabase
        .from("streaks")
        .select("current_streak, longest_streak, last_log_date")
        .eq("member_id", session.memberId)
        .maybeSingle(),
      supabase
        .from("reading_logs")
        .select("log_date, pages_read")
        .eq("member_id", session.memberId)
        .gte("log_date", sevenDaysAgoStr),
    ]);

  // Aggregate pages per day for last 7 days
  const pagesPerDay: Record<string, number> = {};
  for (const log of weekLogs ?? []) {
    const d = log.log_date as string;
    pagesPerDay[d] = (pagesPerDay[d] ?? 0) + (log.pages_read as number);
  }

  return (
    <div className="min-h-screen bg-parchment pb-20">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <LogClient
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          shelf={(shelf ?? []) as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          todayLogs={(todayLogs ?? []) as any}
          streak={streak ?? { current_streak: 0, longest_streak: 0, last_log_date: null }}
          pagesPerDay={pagesPerDay}
          weeklyPagesGoal={session.weeklyPagesGoal}
          today={today}
        />
      </main>
    </div>
  );
}
