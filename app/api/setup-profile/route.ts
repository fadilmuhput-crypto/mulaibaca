import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { createNotification, notifyFamily } from "@/lib/notifications";

function randomCode() {
  return Math.random().toString(36).slice(2, 8);
}

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const { mode, memberName, avatar, familyName, inviteCode } = await req.json();

  if (!memberName?.trim()) {
    return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check if member already exists
  const { data: existing } = await admin
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Profil sudah dibuat" }, { status: 409 });
  }

  if (mode === "new") {
    if (!familyName?.trim()) {
      return NextResponse.json({ error: "Nama keluarga tidak boleh kosong" }, { status: 400 });
    }

    // Create family
    const { data: family, error: familyErr } = await admin
      .from("families")
      .insert({ name: familyName.trim() })
      .select()
      .single();

    if (familyErr || !family) {
      return NextResponse.json({
        error: `Gagal membuat keluarga: ${familyErr?.message ?? "unknown"}`,
      }, { status: 500 });
    }

    // Create member
    const { error: memberErr } = await admin
      .from("members")
      .insert({
        family_id: family.id,
        name: memberName.trim(),
        avatar: avatar || "book",
        pin_hash: "",
        role: "admin",
        auth_user_id: user.id,
        email: user.email,
      });

    if (memberErr) {
      await admin.from("families").delete().eq("id", family.id);
      return NextResponse.json({
        error: `Gagal membuat profil: ${memberErr.message}`,
      }, { status: 500 });
    }

    createNotification({
      memberId: (await admin.from("members").select("id").eq("auth_user_id", user.id).maybeSingle()).data?.id,
      title: "Selamat datang di mulaibaca 👋",
      body: "Kamu siap membangun kebiasaan membaca? Mulai dengan menambahkan buku ke rak bacaanmu.",
      type: "achievement",
      link: "/jelajah",
    }).catch(() => {});

    return NextResponse.json({ success: true, inviteCode: family.invite_code });
  }

  if (mode === "join") {
    if (!inviteCode?.trim()) {
      return NextResponse.json({ error: "Kode undangan tidak boleh kosong" }, { status: 400 });
    }

    // Find family by invite code
    const { data: family, error: familyErr } = await admin
      .from("families")
      .select("id, name")
      .eq("invite_code", inviteCode.trim().toLowerCase())
      .maybeSingle();

    if (familyErr || !family) {
      return NextResponse.json({ error: "Kode undangan tidak valid" }, { status: 404 });
    }

    // Check capacity
    const { count } = await admin
      .from("members")
      .select("id", { count: "exact", head: true })
      .eq("family_id", family.id);

    if ((count ?? 0) >= 8) {
      return NextResponse.json({ error: "Keluarga ini sudah penuh (maks. 8 anggota)" }, { status: 409 });
    }

    // Create member
    const { error: memberErr } = await admin
      .from("members")
      .insert({
        family_id: family.id,
        name: memberName.trim(),
        avatar: avatar || "book",
        pin_hash: "",
        role: "member",
        auth_user_id: user.id,
        email: user.email,
      });

    if (memberErr) {
      return NextResponse.json({
        error: `Gagal bergabung: ${memberErr.message}`,
      }, { status: 500 });
    }

    notifyFamily(family.id, {
      title: `${memberName.trim()} bergabung ke keluarga`,
      body: `Selamat datang! Sekarang ada ${(count ?? 0) + 1} orang di keluarga.`,
      type: "info",
      link: "/lingkar-baca/saya",
    });

    return NextResponse.json({ success: true, familyName: family.name });
  }

  return NextResponse.json({ error: "Mode tidak valid" }, { status: 400 });
}
