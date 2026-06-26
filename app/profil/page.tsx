import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import ProfilClient from "./ProfilClient";

export type ProfilStats = {
  booksFinished: number;
  totalPagesRead: number;
  longestStreak: number;
  familyMemberCount: number;
};

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();

  const adminClient = createAdminClient();

  const [{ data: doneShelf }, { data: logs }, { data: streak }, { count: memberCount }] = await Promise.all([
    supabase
      .from("shelf_items")
      .select("id")
      .eq("member_id", session.memberId)
      .eq("status", "done"),
    supabase
      .from("reading_logs")
      .select("pages_read")
      .eq("member_id", session.memberId),
    supabase
      .from("streaks")
      .select("longest_streak")
      .eq("member_id", session.memberId)
      .maybeSingle(),
    adminClient
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("family_id", session.familyId),
  ]);

  const stats: ProfilStats = {
    booksFinished: doneShelf?.length ?? 0,
    totalPagesRead: (logs ?? []).reduce((s, l) => s + ((l as { pages_read: number }).pages_read), 0),
    longestStreak: (streak?.longest_streak as number) ?? 0,
    familyMemberCount: memberCount ?? 1,
  };

  return (
    <div className="min-h-screen bg-parchment pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-h1 mb-6">Profil</h1>
        <ProfilClient session={session} stats={stats} />
      </main>
    </div>
  );
}
