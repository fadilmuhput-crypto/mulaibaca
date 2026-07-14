import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Belum masuk" }, { status: 401 });
  }

  const { inviteCode } = await req.json();
  if (!inviteCode?.trim()) {
    return NextResponse.json({ error: "Kode undangan tidak boleh kosong" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: family, error: familyErr } = await supabase
    .from("families")
    .select("id, name, type")
    .eq("invite_code", inviteCode.trim().toLowerCase())
    .single();

  if (familyErr || !family) {
    return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 });
  }

  if (family.id === session.familyId) {
    return NextResponse.json({ error: "Kamu sudah berada di lingkar ini" }, { status: 400 });
  }

  const { count: memberCount } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("family_id", family.id);

  if (!memberCount || memberCount >= 20) {
    return NextResponse.json({ error: "Lingkar ini sudah penuh" }, { status: 409 });
  }

  const { error: memberErr } = await supabase
    .from("members")
    .update({ family_id: family.id, role: "member" })
    .eq("id", session.memberId);

  if (memberErr) {
    return NextResponse.json({
      error: `Gagal bergabung: ${memberErr.message}`,
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, familyName: family.name });
}
