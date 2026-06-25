import { createClient } from "@/lib/supabase-server";

export type Session = {
  userId: string;
  email: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  familyId: string;
  familyName: string;
  inviteCode: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberRole: "admin" | "member";
  memberUsername: string | null;
  memberType: "ayah" | "ibu" | "anak" | "dewasa";
  isCmsAdmin: boolean;
  weeklyPagesGoal: number;
};

export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("members")
    .select("*, families(name, invite_code), weekly_pages_goal, is_cms_admin, username, member_type")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) return null;

  const family = member.families as { name: string; invite_code: string } | null;

  return {
    userId: user.id,
    email: user.email ?? "",
    emailVerified: !!user.email_confirmed_at,
    isAnonymous: user.is_anonymous ?? false,
    familyId: member.family_id,
    familyName: family?.name ?? "",
    inviteCode: family?.invite_code ?? "",
    memberId: member.id,
    memberName: member.name,
    memberAvatar: member.avatar,
    memberRole: member.role as "admin" | "member",
    memberUsername: (member.username as string | null) ?? null,
    memberType: (member.member_type as "ayah" | "ibu" | "anak" | "dewasa") ?? "dewasa",
    isCmsAdmin: (member.is_cms_admin as boolean) ?? false,
    weeklyPagesGoal: (member.weekly_pages_goal as number) ?? 0,
  };
}
