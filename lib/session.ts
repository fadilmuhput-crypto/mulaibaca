import { createClient } from "@/lib/supabase-server";

export type Session = {
  userId: string;
  email: string;
  emailVerified: boolean;
  familyId: string;
  familyName: string;
  inviteCode: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberRole: "admin" | "member";
  weeklyPagesGoal: number;
};

export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("members")
    .select("*, families(name, invite_code), weekly_pages_goal")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) return null;

  const family = member.families as { name: string; invite_code: string } | null;

  return {
    userId: user.id,
    email: user.email ?? "",
    emailVerified: !!user.email_confirmed_at,
    familyId: member.family_id,
    familyName: family?.name ?? "",
    inviteCode: family?.invite_code ?? "",
    memberId: member.id,
    memberName: member.name,
    memberAvatar: member.avatar,
    memberRole: member.role as "admin" | "member",
    weeklyPagesGoal: (member.weekly_pages_goal as number) ?? 0,
  };
}
