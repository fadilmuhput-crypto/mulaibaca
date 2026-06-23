import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createApiClient as createClient } from "@/lib/supabase-api";
import { buildSetCookieHeaders } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { familyName, memberName, memberAvatar, pin } = await req.json();

  if (!familyName || !memberName || !pin || pin.length !== 4) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const supabase = createClient();
  const pin_hash = await bcrypt.hash(pin, 10);

  // Create family
  const { data: family, error: familyErr } = await supabase
    .from("families")
    .insert({ name: familyName })
    .select()
    .single();

  if (familyErr || !family) {
    return NextResponse.json({
      error: `Gagal membuat ruang keluarga: ${familyErr?.message ?? "unknown"} (code: ${familyErr?.code ?? "-"})`,
    }, { status: 500 });
  }

  // Create admin member
  const { data: member, error: memberErr } = await supabase
    .from("members")
    .insert({
      family_id: family.id,
      name: memberName,
      avatar: memberAvatar || "📖",
      pin_hash,
      role: "admin",
    })
    .select()
    .single();

  if (memberErr || !member) {
    return NextResponse.json({
      error: `Gagal membuat profil: ${memberErr?.message ?? "unknown"} (code: ${memberErr?.code ?? "-"})`,
    }, { status: 500 });
  }

  const session = {
    familyId: family.id,
    familyName: family.name,
    memberId: member.id,
    memberName: member.name,
    memberAvatar: member.avatar,
    memberRole: "admin" as const,
  };

  const res = NextResponse.json({ success: true, inviteCode: family.invite_code }, { status: 200 });
  buildSetCookieHeaders(session).forEach((c) => res.headers.append("Set-Cookie", c));
  return res;
}
