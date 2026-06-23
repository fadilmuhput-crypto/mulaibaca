import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { inviteCode, username, accessToken } = await req.json();
  const memberName = username?.trim();

  if (!inviteCode || !memberName) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }
  if (!accessToken) {
    return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
  }

  // Verify user identity from their token
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  const { data: { user } } = await anonClient.auth.getUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }

  const supabase = createAdminClient();

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
    return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 });
  }

  const { data: member, error: memberErr } = await supabase
    .from("members")
    .insert({
      family_id: family.id,
      name: memberName,
      avatar: "📖",
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
