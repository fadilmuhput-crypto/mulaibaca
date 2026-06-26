/**
 * getEffectiveAuth — resolves the effective member for API route writes.
 *
 * When a family admin is "acting as" a child member (via the acting_as cookie),
 * all data writes must target the child's member_id. The child has no Supabase auth,
 * so we use the admin client (bypasses RLS) and manually scope to the child's ID.
 */
import { NextRequest } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { parseSwitchToken, COOKIE_NAME } from "@/lib/member-switch";
import type { SupabaseClient } from "@supabase/supabase-js";

export type EffectiveAuth = {
  memberId: string;
  familyId: string;
  dataClient: SupabaseClient;
};

function parseCookies(req: NextRequest): Record<string, string> {
  const header = req.headers.get("cookie") ?? "";
  return Object.fromEntries(
    header.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k.trim(), decodeURIComponent(v.join("="))];
    })
  );
}

export async function getEffectiveAuth(req: NextRequest): Promise<EffectiveAuth | null> {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminMember } = await supabase
    .from("members")
    .select("id, family_id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!adminMember) return null;

  const adminMemberId = adminMember.id as string;
  const adminFamilyId = adminMember.family_id as string;

  // Check acting_as cookie — only valid when admin
  if (adminMember.role === "admin") {
    const cookies = parseCookies(req);
    const switchToken = cookies[COOKIE_NAME];
    if (switchToken) {
      const parsed = parseSwitchToken(switchToken);
      if (parsed && parsed.adminMemberId === adminMemberId) {
        const admin = createAdminClient();
        const { data: target } = await admin
          .from("members")
          .select("id, family_id")
          .eq("id", parsed.targetMemberId)
          .eq("family_id", adminFamilyId)
          .maybeSingle();

        if (target) {
          return {
            memberId: target.id as string,
            familyId: target.family_id as string,
            dataClient: admin,
          };
        }
      }
    }
  }

  return {
    memberId: adminMemberId,
    familyId: adminFamilyId,
    dataClient: supabase,
  };
}
