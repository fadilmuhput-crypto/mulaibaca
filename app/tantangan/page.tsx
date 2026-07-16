import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { getChallengesData } from "@/lib/challenges";
import NavBar from "@/components/NavBar";
import TantanganClient from "./TantanganClient";

export default async function TantanganPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();
  const { available, active, completed, badges } = await getChallengesData(supabase, session.memberId);

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <TantanganClient
        initialActive={active}
        initialAvailable={available}
        initialCompleted={completed}
        initialBadges={badges}
        memberId={session.memberId}
      />
    </div>
  );
}
