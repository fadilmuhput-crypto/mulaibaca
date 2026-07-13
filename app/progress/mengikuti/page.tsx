import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import FollowListClient from "../FollowListClient";

export default async function MengikutiPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const admin = createAdminClient();
  const { data: follows } = await admin
    .from("follows")
    .select("following_id")
    .eq("follower_id", session.memberId)
    .order("created_at", { ascending: false });

  const followingIds = (follows ?? []).map((f: { following_id: string }) => f.following_id);
  const { data: memberRows } = followingIds.length > 0
    ? await admin.from("members").select("id, name, avatar, username").in("id", followingIds)
    : { data: [] };

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-sm font-black uppercase tracking-widest text-ink-muted mb-4">Mengikuti</h1>
        <FollowListClient
          members={(memberRows ?? []) as { id: string; name: string; avatar: string | null; username: string | null }[]}
          viewerMemberId={session.memberId}
          emptyMessage="Belum mengikuti siapa pun"
          isFollowingMap={Object.fromEntries(((memberRows ?? []) as { id: string }[]).map((m) => [m.id, true]))}
        />
      </main>
    </div>
  );
}
