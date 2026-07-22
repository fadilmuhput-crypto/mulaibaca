import { cookies } from "next/headers";

function computeAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  const notYetBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (notYetBirthday) age--;
  return age;
}
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-route";
import { parseSwitchToken, COOKIE_NAME } from "@/lib/member-switch";

export type Session = {
  userId: string;
  email: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  familyId: string;
  familyName: string;
  familyType: "family" | "circle";
  inviteCode: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberBio: string;
  memberRole: "admin" | "member";
  memberUsername: string | null;
  memberType: "ayah" | "ibu" | "anak" | "dewasa";
  isCmsAdmin: boolean;
  weeklyPagesGoal: number;
  memberBirthDate: string | null; // ISO date "YYYY-MM-DD"
  memberAge: number | null;       // computed from birth_date
  // acting_as context
  actingAs: string | null;     // memberId being acted as (null = self)
  adminMemberId: string | null; // the real admin's memberId when switching
};

export async function getSession(): Promise<Session | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: self } = await supabase
    .from("members")
    .select("*, families(name, invite_code, type), weekly_pages_goal, is_cms_admin, username, member_type")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!self) return null;

  const family = self.families as { name: string; invite_code: string; type: string } | null;
  const selfId = self.id as string;

  // Check acting_as cookie (only valid for admin)
  let activeId = selfId;
  let adminMemberId: string | null = null;

  if (self.role === "admin") {
    const cookieStore = await cookies();
    const switchToken = cookieStore.get(COOKIE_NAME)?.value;
    if (switchToken) {
      const parsed = parseSwitchToken(switchToken);
      if (parsed && parsed.adminMemberId === selfId) {
        activeId = parsed.targetMemberId;
        adminMemberId = selfId;
      }
    }
  }

  // If acting as someone else, fetch that member's data
  let member = self;
  if (activeId !== selfId) {
    const admin = createAdminClient();
    const { data: target } = await admin
      .from("members")
      .select("*, families(name, invite_code, type), weekly_pages_goal, is_cms_admin, username, member_type")
      .eq("id", activeId)
      .eq("family_id", self.family_id) // must be same family
      .maybeSingle();
    if (target) member = target;
    else activeId = selfId; // fallback if target not found
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    emailVerified: !!user.email_confirmed_at,
    isAnonymous: user.is_anonymous ?? false,
    familyId: member.family_id,
    familyName: family?.name ?? "",
    familyType: (family?.type as "family" | "circle") ?? "family",
    inviteCode: family?.invite_code ?? "",
    memberId: activeId,
    memberName: member.name,
    memberAvatar: member.avatar,
    memberBio: (member.bio as string) ?? "",
    memberRole: self.role as "admin" | "member", // always the real admin role
    memberUsername: (member.username as string | null) ?? null,
    memberType: (member.member_type as "ayah" | "ibu" | "anak" | "dewasa") ?? "dewasa",
    isCmsAdmin: (self.is_cms_admin as boolean) ?? false,
    weeklyPagesGoal: (member.weekly_pages_goal as number) ?? 0,
    memberBirthDate: (member.birth_date as string | null) ?? null,
    memberAge: computeAge(member.birth_date as string | null),
    actingAs: activeId !== selfId ? activeId : null,
    adminMemberId,
  };
}
