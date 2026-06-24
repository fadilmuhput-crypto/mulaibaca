import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

const MAX_MEMBERS = 8;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim().toLowerCase();
  if (!code || code.length < 4) {
    return NextResponse.json({ valid: false, error: "Kode terlalu pendek" });
  }

  const supabase = createAdminClient();
  const { data: family } = await supabase
    .from("families")
    .select("id, name")
    .eq("invite_code", code)
    .maybeSingle();

  if (!family) {
    return NextResponse.json({ valid: false, error: "Kode undangan tidak ditemukan" });
  }

  const { count } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("family_id", family.id);

  if ((count ?? 0) >= MAX_MEMBERS) {
    return NextResponse.json({ valid: false, error: `Keluarga ini sudah penuh (maks. ${MAX_MEMBERS} anggota)` });
  }

  return NextResponse.json({ valid: true, familyName: family.name });
}
