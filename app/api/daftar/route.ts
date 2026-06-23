import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  if (!username?.trim()) {
    return NextResponse.json({ error: "Username tidak boleh kosong" }, { status: 400 });
  }

  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  // Cegah duplikat
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Akun sudah terdaftar dalam keluarga" }, { status: 409 });
  }

  // Auto-create family
  const { data: family, error: familyErr } = await supabase
    .from("families")
    .insert({ name: `Keluarga ${username.trim()}` })
    .select()
    .single();

  if (familyErr || !family) {
    return NextResponse.json({
      error: `Gagal membuat ruang keluarga: ${familyErr?.message ?? "unknown"}`,
    }, { status: 500 });
  }

  // Create admin member
  const { data: member, error: memberErr } = await supabase
    .from("members")
    .insert({
      family_id: family.id,
      name: username.trim(),
      avatar: "📖",
      pin_hash: "",
      role: "admin",
      auth_user_id: user.id,
      email: user.email,
    })
    .select()
    .single();

  if (memberErr || !member) {
    await supabase.from("families").delete().eq("id", family.id);
    return NextResponse.json({
      error: `Gagal membuat profil: ${memberErr?.message ?? "unknown"}`,
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, inviteCode: family.invite_code });
}
