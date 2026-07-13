import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Belum masuk" }, { status: 401 });
  }

  const { name, type, memberType } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nama lingkar tidak boleh kosong" }, { status: 400 });
  }
  const circleType = type === "circle" ? "circle" : "family";

  const supabase = createAdminClient();

  const { error: familyErr } = await supabase
    .from("families")
    .update({ name: name.trim(), type: circleType })
    .eq("id", session.familyId);

  if (familyErr) {
    return NextResponse.json({
      error: `Gagal menyimpan: ${familyErr.message}`,
    }, { status: 500 });
  }

  const { error: memberErr } = await supabase
    .from("members")
    .update({ member_type: memberType ?? "dewasa" })
    .eq("id", session.memberId);

  if (memberErr) {
    return NextResponse.json({ error: `Gagal menyimpan peran: ${memberErr.message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
