import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";

export async function POST(req: NextRequest) {
  const { familyName, memberName, memberAvatar } = await req.json();

  if (!familyName || !memberName) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const res = NextResponse.json({ success: false });
  const supabase = createRouteClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

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
    .insert({ name: familyName })
    .select()
    .single();

  if (familyErr || !family) {
    return NextResponse.json({
      error: `Gagal membuat ruang keluarga: ${familyErr?.message ?? "unknown"}`,
    }, { status: 500 });
  }

  const { data: member, error: memberErr } = await supabase
    .from("members")
    .insert({
      family_id: family.id,
      name: memberName,
      avatar: memberAvatar || "📖",
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
