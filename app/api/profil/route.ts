import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";
import { createAdminClient } from "@/lib/supabase-route";

async function getAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id, family_id, role").eq("auth_user_id", user.id).maybeSingle();
  if (!member) return null;
  return { userId: user.id, memberId: member.id as string, familyId: member.family_id as string, role: member.role as string };
}

// PATCH /api/profil — update member name/avatar
export async function PATCH(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, avatar, familyName } = await req.json();
  const admin = createAdminClient();

  if (name || avatar) {
    const updates: Record<string, string> = {};
    if (name?.trim()) updates.name = name.trim();
    if (avatar) updates.avatar = avatar;

    const { error } = await admin
      .from("members")
      .update(updates)
      .eq("id", auth.memberId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (familyName?.trim() && auth.role === "admin") {
    const { error } = await admin
      .from("families")
      .update({ name: familyName.trim() })
      .eq("id", auth.familyId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
