import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { getClubDetail } from "@/lib/clubs";
import NavBar from "@/components/NavBar";
import KlubDetailClient from "./KlubDetailClient";

export default async function KlubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const { id } = await params;
  const result = await getClubDetail(id);

  if (!result) notFound();

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <KlubDetailClient
        club={result.club}
        members={result.members}
        memberId={session.memberId}
      />
    </div>
  );
}
