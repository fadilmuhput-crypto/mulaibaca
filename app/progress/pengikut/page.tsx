import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import FollowListClient from "../FollowListClient";

export default async function PengikutPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const admin = createAdminClient();
  const { data: follows } = await admin
    .from("follows")
    .select("follower_id")
    .eq("following_id", session.memberId)
    .order("created_at", { ascending: false });

  const followerIds = (follows ?? []).map((f: { follower_id: string }) => f.follower_id);
  const { data: memberRows } = followerIds.length > 0
    ? await admin.from("members").select("id, name, avatar, username").in("id", followerIds)
    : { data: [] };

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-sm font-black uppercase tracking-widest text-ink-muted mb-4">Pengikut</h1>
        <FollowListClient
          members={(memberRows ?? []) as { id: string; name: string; avatar: string | null; username: string | null }[]}
          viewerMemberId={session.memberId}
          emptyMessage="Belum ada pengikut"
        />
      </main>
    </div>
  );
}
