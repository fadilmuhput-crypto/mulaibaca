import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { getChallengesData, getChallengeStage } from "@/lib/challenges";
import NavBar from "@/components/NavBar";
import KomunitasClient from "./KomunitasClient";

export default async function KomunitasPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();
  const { available, active, completed, badges } = await getChallengesData(supabase, session.memberId);
  const challengeStage = await getChallengeStage(supabase, session.memberId);

  const weekStart = (() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  })();
  const { data: weeklyLogs } = await supabase
    .from("reading_logs")
    .select("pages_read")
    .eq("member_id", session.memberId)
    .gte("log_date", weekStart);
  const weeklyPages = ((weeklyLogs ?? []) as { pages_read: number }[]).reduce((s, l) => s + (l.pages_read ?? 0), 0);

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <KomunitasClient
        initialActive={active}
        initialAvailable={available}
        initialCompleted={completed}
        initialBadges={badges}
        memberId={session.memberId}
        challengeStage={challengeStage}
        weeklyPages={weeklyPages}
        weeklyGoal={session.weeklyPagesGoal}
      />
    </div>
  );
}
