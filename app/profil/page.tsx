import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import ProfilClient from "./ProfilClient";

const DUMMY_DOMAIN = "@child.mulaibaca.app";

export type ProfilStats = {
  booksFinished: number;
  totalPagesRead: number;
  longestStreak: number;
  familyMemberCount: number;
};

export type FamilyMember = {
  id: string;
  name: string;
  avatar: string;
};

export type ActingAsInfo = {
  email: string;
  emailVerified: boolean;
  isDummy: boolean;
} | null;

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();
  const adminClient = createAdminClient();

  const [{ data: doneShelf }, { data: logs }, { data: streak }, { count: memberCount }, { data: familyMembersRaw }, { data: familyData }] = await Promise.all([
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
    adminClient
      .from("members")
      .select("id, name, avatar")
      .eq("family_id", session.familyId)
      .order("created_at", { ascending: true }),
    adminClient
      .from("families")
      .select("weekly_challenge_pages")
      .eq("id", session.familyId)
      .maybeSingle(),
  ]);

  // Fetch acting-as member's auth email
  let actingAsInfo: ActingAsInfo = null;
  if (session.actingAs) {
    const { data: targetMember } = await adminClient
      .from("members")
      .select("auth_user_id")
      .eq("id", session.actingAs)
      .maybeSingle();

    if (targetMember?.auth_user_id) {
      const { data: authUser } = await adminClient.auth.admin.getUserById(targetMember.auth_user_id as string);
      if (authUser?.user) {
        const email = authUser.user.email ?? "";
        actingAsInfo = {
          email,
          emailVerified: !!authUser.user.email_confirmed_at,
          isDummy: email.endsWith(DUMMY_DOMAIN),
        };
      }
    }
  }

  const stats: ProfilStats = {
    booksFinished: doneShelf?.length ?? 0,
    totalPagesRead: (logs ?? []).reduce((s, l) => s + ((l as { pages_read: number }).pages_read), 0),
    longestStreak: (streak?.longest_streak as number) ?? 0,
    familyMemberCount: memberCount ?? 1,
  };

  const familyMembers: FamilyMember[] = (familyMembersRaw ?? []) as FamilyMember[];
  const familyWeeklyChallenge = (familyData?.weekly_challenge_pages as number) ?? 0;

  return (
    <div className="min-h-screen bg-parchment pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-h1 mb-6">Profil</h1>
        <ProfilClient
          session={session}
          stats={stats}
          actingAsInfo={actingAsInfo}
          familyMembers={familyMembers}
          familyWeeklyChallenge={familyWeeklyChallenge}
        />
      </main>
    </div>
  );
}
