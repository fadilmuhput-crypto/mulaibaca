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

  const [{ data: shelf }, { data: todayLogs }, { data: streak }] = await Promise.all([
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
  ]);

  return (
    <div className="min-h-screen bg-parchment pb-20">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-display font-bold text-ink">Log Baca</h1>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-1.5">
            <span className="text-lg">🔥</span>
            <span className="font-bold text-ink text-lg leading-none">
              {streak?.current_streak ?? 0}
            </span>
            <span className="text-xs text-ink-muted">hari</span>
          </div>
        </div>

        <LogClient
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          shelf={(shelf ?? []) as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          todayLogs={(todayLogs ?? []) as any}
          streak={streak ?? { current_streak: 0, longest_streak: 0, last_log_date: null }}
        />
      </main>
    </div>
  );
}
