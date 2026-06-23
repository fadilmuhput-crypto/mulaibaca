import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const { inviteCode, memberName, memberAvatar } = await req.json();

  if (!inviteCode || !memberName) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  // Check: user already has a member profile
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Akun sudah terdaftar dalam keluarga" }, { status: 409 });
  }

  // Find family by invite code
  const { data: family, error: familyErr } = await supabase
    .from("families")
    .select("*")
    .eq("invite_code", inviteCode.trim().toLowerCase())
    .single();

  if (familyErr || !family) {
    return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 });
  }

  // Create member
  const { data: member, error: memberErr } = await supabase
    .from("members")
    .insert({
      family_id: family.id,
      name: memberName,
      avatar: memberAvatar || "📖",
      pin_hash: "",
      role: "member",
      auth_user_id: user.id,
      email: user.email,
    })
    .select()
    .single();

  if (memberErr || !member) {
    return NextResponse.json({
      error: `Gagal bergabung: ${memberErr?.message ?? "unknown"}`,
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, familyName: family.name });
}
