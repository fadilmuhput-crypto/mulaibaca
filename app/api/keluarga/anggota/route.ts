import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { randomUUID } from "crypto";

export const DUMMY_EMAIL_DOMAIN = "@child.mulaibaca.app";

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

async function generateUsername(admin: ReturnType<typeof createAdminClient>, name: string): Promise<string> {
  const base = name.trim().toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 25) || "anak";

  let username = base;
  let suffix = 2;
  while (true) {
    const { data } = await admin.from("members").select("id").eq("username", username).maybeSingle();
    if (!data) return username;
    username = `${base}${suffix}`;
    suffix++;
  }
}

// GET /api/keluarga/anggota — list family members
export async function GET(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: members, error } = await admin
    .from("members")
    .select("id, name, avatar, role, member_type, birth_date, auth_user_id, username")
    .eq("family_id", auth.familyId)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(members ?? []);
}

// POST /api/keluarga/anggota — create child member with dummy email + username
export async function POST(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, avatar, birthDate, memberType } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });

  const admin = createAdminClient();

  // 1. Create Supabase auth user with dummy email (no real email needed)
  const dummyEmail = `${randomUUID().replace(/-/g, "")}${DUMMY_EMAIL_DOMAIN}`;
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: dummyEmail,
    email_confirm: true,
    password: randomUUID(),
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Gagal membuat akun" }, { status: 500 });
  }

  // 2. Generate unique username from child's name
  const username = await generateUsername(admin, name);

  // 3. Insert member linked to auth user
  const { data: member, error } = await admin
    .from("members")
    .insert({
      family_id: auth.familyId,
      name: name.trim(),
      avatar: avatar ?? "book",
      member_type: memberType ?? "anak",
      birth_date: birthDate ?? null,
      pin_hash: "",
      role: "member",
      auth_user_id: authData.user.id,
      username,
    })
    .select()
    .single();

  if (error) {
    // Clean up auth user if member insert fails
    await admin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(member, { status: 201 });
}

// PATCH /api/keluarga/anggota — assign username (+ create dummy auth if missing) to existing member
export async function PATCH(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { memberId, username } = await req.json();
  if (!memberId || !username) return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  if (!/^[a-z0-9_]{3,30}$/.test(username))
    return NextResponse.json({ error: "Username tidak valid" }, { status: 400 });

  const admin = createAdminClient();

  const { data: member } = await admin
    .from("members")
    .select("auth_user_id, family_id, username")
    .eq("id", memberId)
    .maybeSingle();

  if (!member || member.family_id !== auth.familyId)
    return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
  if (member.username)
    return NextResponse.json({ error: "Username sudah diatur" }, { status: 409 });

  // Check username uniqueness
  const { data: taken } = await admin.from("members").select("id").eq("username", username).maybeSingle();
  if (taken) return NextResponse.json({ error: "Username sudah dipakai" }, { status: 409 });

  // Create auth user if not yet linked
  let authUserId = member.auth_user_id as string | null;
  if (!authUserId) {
    const dummyEmail = `${randomUUID().replace(/-/g, "")}${DUMMY_EMAIL_DOMAIN}`;
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: dummyEmail,
      email_confirm: true,
      password: randomUUID(),
    });
    if (authError || !authData.user)
      return NextResponse.json({ error: authError?.message ?? "Gagal membuat akun" }, { status: 500 });
    authUserId = authData.user.id;
  }

  const { error } = await admin
    .from("members")
    .update({ username, auth_user_id: authUserId })
    .eq("id", memberId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, username });
}

// DELETE /api/keluarga/anggota?id=xxx — remove child member (dummy-email only)
export async function DELETE(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("id");
  if (!memberId) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("members")
    .select("auth_user_id, family_id")
    .eq("id", memberId)
    .maybeSingle();

  if (!target || target.family_id !== auth.familyId)
    return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });

  if (target.auth_user_id) {
    // Only allow deletion if it's a dummy-email account
    const { data: authUser } = await admin.auth.admin.getUserById(target.auth_user_id as string);
    if (authUser.user?.email && !authUser.user.email.endsWith(DUMMY_EMAIL_DOMAIN)) {
      return NextResponse.json({ error: "Tidak bisa hapus akun dengan email asli" }, { status: 403 });
    }
    // Delete the auth user (cascades nothing — member record must be deleted separately)
    await admin.auth.admin.deleteUser(target.auth_user_id as string);
  }

  const { error } = await admin.from("members").delete().eq("id", memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
