import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { parseSwitchToken, COOKIE_NAME } from "@/lib/member-switch";

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });

  const { email, password } = await req.json();
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Get current admin member
  const { data: adminMember } = await supabase
    .from("members").select("id, role").eq("auth_user_id", user.id).maybeSingle();

  if (!adminMember || adminMember.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang bisa setup akun anggota" }, { status: 403 });
  }

  // Check acting-as cookie to get target member
  const switchToken = req.cookies.get(COOKIE_NAME)?.value;
  if (!switchToken) {
    return NextResponse.json({ error: "Tidak ada sesi kelola anggota" }, { status: 400 });
  }

  const parsed = parseSwitchToken(switchToken);
  if (!parsed || parsed.adminMemberId !== adminMember.id) {
    return NextResponse.json({ error: "Token tidak valid" }, { status: 403 });
  }

  // Get target member's auth_user_id
  const { data: targetMember } = await admin
    .from("members")
    .select("auth_user_id")
    .eq("id", parsed.targetMemberId)
    .maybeSingle();

  if (!targetMember?.auth_user_id) {
    return NextResponse.json({ error: "Anggota tidak ditemukan" }, { status: 404 });
  }

  // Check email uniqueness across members
  const { data: existing } = await admin
    .from("members")
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });
  }

  // Update auth user with real email + password
  const { error: updateErr } = await admin.auth.admin.updateUserById(
    targetMember.auth_user_id as string,
    {
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
    }
  );

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Update member record with real email
  const { error: memberErr } = await admin
    .from("members")
    .update({ email: email.trim().toLowerCase() })
    .eq("id", parsed.targetMemberId);

  if (memberErr) {
    return NextResponse.json({ error: memberErr.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
