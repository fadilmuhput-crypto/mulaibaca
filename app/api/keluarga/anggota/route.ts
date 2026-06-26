import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

async function getAdminAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members")
    .select("id, family_id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!member || member.role !== "admin") return null;
  return { memberId: member.id as string, familyId: member.family_id as string };
}

// GET /api/keluarga/anggota — list family members
export async function GET(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: members, error } = await admin
    .from("members")
    .select("id, name, avatar, role, member_type, birth_year, auth_user_id")
    .eq("family_id", auth.familyId)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(members ?? []);
}

// POST /api/keluarga/anggota — create child member (no email/auth needed)
export async function POST(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, avatar, birthYear, memberType } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });

  const admin = createAdminClient();
  const { data: member, error } = await admin
    .from("members")
    .insert({
      family_id: auth.familyId,
      name: name.trim(),
      avatar: avatar ?? "book",
      member_type: memberType ?? "anak",
      birth_year: birthYear ?? null,
      pin_hash: "",
      role: "member",
      auth_user_id: null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(member, { status: 201 });
}

// DELETE /api/keluarga/anggota?id=xxx — remove child member
export async function DELETE(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("id");
  if (!memberId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = createAdminClient();

  // Must be in same family and must NOT have auth (can't delete full accounts here)
  const { data: target } = await admin
    .from("members")
    .select("auth_user_id, family_id")
    .eq("id", memberId)
    .maybeSingle();

  if (!target || target.family_id !== auth.familyId)
    return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
  if (target.auth_user_id)
    return NextResponse.json({ error: "Tidak bisa hapus akun dengan email" }, { status: 403 });

  const { error } = await admin.from("members").delete().eq("id", memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
