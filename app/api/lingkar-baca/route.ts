import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Belum masuk" }, { status: 401 });
  }
  if (session.familyId) {
    return NextResponse.json({ error: "Kamu sudah punya lingkar baca" }, { status: 400 });
  }

  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nama lingkar tidak boleh kosong" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: family, error: familyErr } = await supabase
    .from("families")
    .insert({ name: name.trim() })
    .select()
    .single();

  if (familyErr || !family) {
    return NextResponse.json({
      error: `Gagal membuat lingkar: ${familyErr?.message ?? "unknown"}`,
    }, { status: 500 });
  }

  const { error: memberErr } = await supabase
    .from("members")
    .update({
      family_id: family.id,
      role: "admin",
    })
    .eq("auth_user_id", session.userId);

  if (memberErr) {
    await supabase.from("families").delete().eq("id", family.id);
    return NextResponse.json({
      error: `Gagal memperbarui profil: ${memberErr.message}`,
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, inviteCode: family.invite_code });
}
