import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { parseSwitchToken, COOKIE_NAME } from "@/lib/member-switch";

async function getAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id, family_id, role, username").eq("auth_user_id", user.id).maybeSingle();
  if (!member) return null;

  // Check acting-as cookie — admin managing a child/family member
  const switchToken = req.cookies.get(COOKIE_NAME)?.value;
  let activeMemberId = member.id as string;
  if (switchToken && member.role === "admin") {
    const parsed = parseSwitchToken(switchToken);
    if (parsed && parsed.adminMemberId === member.id) {
      activeMemberId = parsed.targetMemberId;
    }
  }

  // Get target member's username status (different from admin when acting-as)
  let existingUsername: string | null = member.username as string | null;
  if (activeMemberId !== member.id) {
    const admin = createAdminClient();
    const { data: target } = await admin
      .from("members").select("username").eq("id", activeMemberId).maybeSingle();
    if (target) {
      existingUsername = target.username as string | null;
    }
  }

  return {
    userId: user.id,
    adminMemberId: member.id as string,
    activeMemberId,
    familyId: member.family_id as string,
    role: member.role as string,
    existingUsername,
  };
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, avatar, birthDate, familyName, weeklyPagesGoal, username, memberType } = await req.json();
  const admin = createAdminClient();

  const updates: Record<string, string | number | null> = {};
  if (name?.trim()) updates.name = name.trim();
  if (avatar) updates.avatar = avatar;
  if (weeklyPagesGoal !== undefined) updates.weekly_pages_goal = Math.max(0, Math.floor(Number(weeklyPagesGoal)));
  if (memberType) updates.member_type = memberType;
  if (birthDate !== undefined) updates.birth_date = birthDate || null;

  // Username: only settable once (one-time update)
  if (username !== undefined) {
    if (auth.existingUsername) {
      return NextResponse.json({ error: "Username sudah diset dan tidak bisa diubah" }, { status: 400 });
    }
    const clean = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(clean)) {
      return NextResponse.json({ error: "Username hanya boleh huruf kecil, angka, dan underscore (3–30 karakter)" }, { status: 400 });
    }
    // Check uniqueness
    const { data: existing } = await admin.from("members").select("id").eq("username", clean).maybeSingle();
    if (existing) return NextResponse.json({ error: "Username sudah digunakan" }, { status: 409 });
    updates.username = clean;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await admin.from("members").update(updates).eq("id", auth.activeMemberId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (familyName?.trim() && auth.role === "admin") {
    const { error } = await admin.from("families").update({ name: familyName.trim() }).eq("id", auth.familyId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
