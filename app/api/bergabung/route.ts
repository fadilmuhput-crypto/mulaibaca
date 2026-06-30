import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

export async function POST(req: NextRequest) {
  const { inviteCode, username, email, password } = await req.json();
  const memberName = username?.trim();

  if (!inviteCode || !memberName) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email tidak boleh kosong" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Create auth user via admin API — bypasses email confirmation
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
  });

  if (authErr || !authData.user) {
    return NextResponse.json({
      error: authErr?.message ?? "Gagal membuat akun",
    }, { status: 500 });
  }

  const user = authData.user;

  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Akun sudah terdaftar dalam keluarga" }, { status: 409 });
  }

  const { data: family, error: familyErr } = await supabase
    .from("families")
    .select("*")
    .eq("invite_code", inviteCode.trim().toLowerCase())
    .single();

  if (familyErr || !family) {
    await supabase.auth.admin.deleteUser(user.id);
    return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 });
  }

  const { count: memberCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("family_id", family.id);

  if ((memberCount ?? 0) >= 8) {
    await supabase.auth.admin.deleteUser(user.id);
    return NextResponse.json({ error: "Keluarga ini sudah penuh (maks. 8 anggota)" }, { status: 409 });
  }

  const { data: member, error: memberErr } = await supabase
    .from("members")
    .insert({
      family_id: family.id,
      name: memberName,
      avatar: "book",
      pin_hash: "",
      role: "member",
      auth_user_id: user.id,
      email: user.email,
    })
    .select()
    .single();

  if (memberErr || !member) {
    await supabase.auth.admin.deleteUser(user.id);
    return NextResponse.json({
      error: `Gagal bergabung: ${memberErr?.message ?? "unknown"}`,
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, familyName: family.name });
}
