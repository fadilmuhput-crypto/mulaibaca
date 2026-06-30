import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const { username, email, password } = await req.json();

  if (!username?.trim()) {
    return NextResponse.json({ error: "Username tidak boleh kosong" }, { status: 400 });
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
    .insert({ name: `Keluarga ${username.trim()}` })
    .select()
    .single();

  if (familyErr || !family) {
    await supabase.auth.admin.deleteUser(user.id);
    return NextResponse.json({
      error: `Gagal membuat ruang keluarga: ${familyErr?.message ?? "unknown"}`,
    }, { status: 500 });
  }

  const { data: member, error: memberErr } = await supabase
    .from("members")
    .insert({
      family_id: family.id,
      name: username.trim(),
      avatar: "book",
      pin_hash: "",
      role: "admin",
      auth_user_id: user.id,
      email: user.email,
    })
    .select()
    .single();

  if (memberErr || !member) {
    await supabase.from("families").delete().eq("id", family.id);
    await supabase.auth.admin.deleteUser(user.id);
    return NextResponse.json({
      error: `Gagal membuat profil: ${memberErr?.message ?? "unknown"}`,
    }, { status: 500 });
  }

  createNotification({
    memberId: member.id,
    title: "Selamat datang di mulaibaca 👋",
    body: "Kamu siap membangun kebiasaan membaca? Mulai dengan menambahkan buku ke rak bacaanmu.",
    type: "achievement",
    link: "/jelajah",
  }).catch(() => {});

  return NextResponse.json({ success: true, inviteCode: family.invite_code });
}
