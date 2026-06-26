import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const { inviteCode } = await req.json();
  if (!inviteCode?.trim()) return NextResponse.json({ error: "Kode undangan wajib diisi" }, { status: 400 });

  const admin = createAdminClient();

  // Get current member
  const { data: member } = await admin
    .from("members")
    .select("id, family_id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });

  const oldFamilyId = member.family_id as string;

  // Get target family from invite code
  const { data: targetFamily } = await admin
    .from("families")
    .select("id, name")
    .eq("invite_code", inviteCode.trim().toLowerCase())
    .maybeSingle();

  if (!targetFamily) return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 });
  if (targetFamily.id === oldFamilyId) return NextResponse.json({ error: "Kamu sudah ada di keluarga ini" }, { status: 409 });

  // Check target family capacity
  const { count: targetCount } = await admin
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("family_id", targetFamily.id);

  if ((targetCount ?? 0) >= 8)
    return NextResponse.json({ error: "Keluarga ini sudah penuh (maks. 8 anggota)" }, { status: 409 });

  // Check if current family has other members
  const { count: currentCount } = await admin
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("family_id", oldFamilyId);

  // Hanya bisa gabung jika sendirian di keluarga saat ini
  if ((currentCount ?? 0) > 1) {
    return NextResponse.json({
      error: "Tidak bisa pindah keluarga karena keluargamu memiliki anggota lain.",
    }, { status: 409 });
  }

  // Move member to new family (role becomes "member" in new family)
  const { error: moveError } = await admin
    .from("members")
    .update({ family_id: targetFamily.id, role: "member" })
    .eq("id", member.id);

  if (moveError) return NextResponse.json({ error: moveError.message }, { status: 500 });

  // Delete old family since member was the only one
  await admin.from("families").delete().eq("id", oldFamilyId);

  return NextResponse.json({ ok: true, familyName: targetFamily.name });
}
