import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createClient } from "@/lib/supabase";
import { buildSetCookieHeader } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { memberId, pin } = await req.json();

  if (!memberId || !pin) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }

  const supabase = createClient();

  const { data: member, error } = await supabase
    .from("members")
    .select("*, families(name)")
    .eq("id", memberId)
    .single();

  if (error || !member) {
    return NextResponse.json({ error: "Profil tidak ditemukan" }, { status: 404 });
  }

  const valid = await bcrypt.compare(pin, member.pin_hash);
  if (!valid) {
    return NextResponse.json({ error: "PIN salah" }, { status: 401 });
  }

  const session = {
    familyId: member.family_id,
    familyName: (member.families as { name: string }).name,
    memberId: member.id,
    memberName: member.name,
    memberAvatar: member.avatar,
    memberRole: member.role as "admin" | "member",
  };

  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: { "Set-Cookie": buildSetCookieHeader(session) },
    }
  );
}
