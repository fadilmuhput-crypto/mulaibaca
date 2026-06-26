import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { createSwitchToken, COOKIE_NAME } from "@/lib/member-switch";

// POST /api/anggota-switch — set acting_as cookie
// DELETE /api/anggota-switch — clear acting_as cookie (return to self)

async function getAdminMemberId(req: NextRequest): Promise<string | null> {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!member || member.role !== "admin") return null;
  return member.id as string;
}

export async function POST(req: NextRequest) {
  const adminId = await getAdminMemberId(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetMemberId } = await req.json();
  if (!targetMemberId) return NextResponse.json({ error: "targetMemberId required" }, { status: 400 });

  // Verify target is in same family
  const supabase = createRouteClient(req);
  const { data: self } = await supabase.from("members").select("family_id").eq("id", adminId).maybeSingle();
  const admin = createAdminClient();
  const { data: target } = await admin
    .from("members")
    .select("id, family_id")
    .eq("id", targetMemberId)
    .eq("family_id", self?.family_id ?? "")
    .maybeSingle();

  if (!target) return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });

  const token = createSwitchToken(targetMemberId, adminId);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  const adminId = await getAdminMemberId(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
