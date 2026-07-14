import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import NavBar from "@/components/NavBar";
import EditProfilClient from "./EditProfilClient";

const DUMMY_DOMAIN = "@child.mulaibaca.app";

export type ProfilStats = {
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

  const adminClient = createAdminClient();

  const [{ count: memberCount }, { data: familyMembersRaw }, { data: familyData }] = await Promise.all([
    adminClient.from("members").select("id", { count: "exact", head: true }).eq("family_id", session.familyId),
    adminClient.from("members").select("id, name, avatar").eq("family_id", session.familyId).order("created_at", { ascending: true }),
    adminClient.from("families").select("weekly_challenge_pages").eq("id", session.familyId).maybeSingle(),
  ]);

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
    familyMemberCount: memberCount ?? 1,
  };

  const familyMembers: FamilyMember[] = (familyMembersRaw ?? []) as FamilyMember[];
  const familyWeeklyChallenge = (familyData?.weekly_challenge_pages as number) ?? 0;

  return (
    <div className="min-h-screen">
      <NavBar session={session} hideBottomNav />
      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-h1 mb-6">Edit Profil</h1>
        <EditProfilClient
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
