import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { getChallengesData, getPeriodBounds, getPeriodLabel, type Challenge } from "@/lib/challenges";
import NavBar from "@/components/NavBar";
import TantanganDetailClient from "./TantanganDetailClient";

export default async function KomunitasTantanganDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();

  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", id)
    .single();

  if (!challenge) notFound();

  const { active, completed, badges } = await getChallengesData(supabase, session.memberId);
  const isActive = active.find((c) => c.id === id);
  const isCompleted = completed.find((c) => c.id === id);
  const badge = badges.find((b) => b.challenge_id === id);
  const progress = isActive?.progress ?? 0;
  const periodLabel = isActive?.period_label ?? getPeriodLabel(challenge.duration_type);
  const bounds = getPeriodBounds(challenge.duration_type);

  const c = challenge as Challenge;

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <TantanganDetailClient
          challenge={c}
          progress={progress}
          isActive={!!isActive}
          isCompleted={!!isCompleted}
          badge={badge ?? null}
          periodLabel={periodLabel}
          deadline={c.duration_type !== "unlimited" ? bounds.end.toISOString() : null}
          memberId={session.memberId}
        />
      </main>
    </div>
  );
}
