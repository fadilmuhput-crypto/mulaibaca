import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  if (!user.is_anonymous) return NextResponse.json({ error: "Akun sudah permanen" }, { status: 400 });

  const { name, email, password } = await req.json();
  if (!email?.trim() || !password || !name?.trim()) {
    return NextResponse.json({ error: "Nama, email, dan password wajib diisi" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check email uniqueness
  const { data: existing } = await admin.from("members").select("id").eq("email", email.trim().toLowerCase()).maybeSingle();
  if (existing) return NextResponse.json({ error: "Email sudah digunakan" }, { status: 409 });

  // Upgrade the anonymous Supabase user to a permanent account (same UID, data preserved)
  const { error: upgradeErr } = await admin.auth.admin.updateUserById(user.id, {
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true, // skip email verification for smooth UX
  });
  if (upgradeErr) return NextResponse.json({ error: upgradeErr.message }, { status: 500 });

  // Update member name + email
  const { error: memberErr } = await admin
    .from("members")
    .update({ name: name.trim(), email: email.trim().toLowerCase() })
    .eq("auth_user_id", user.id);
  if (memberErr) return NextResponse.json({ error: memberErr.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
