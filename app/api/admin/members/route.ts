import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const memberType = searchParams.get("member_type");
  const role = searchParams.get("role");
  const hasAccount = searchParams.get("has_account");

  const admin = createAdminClient();
  let query = admin
    .from("members")
    .select("*, families(name)")
    .order("created_at", { ascending: false });

  if (search) {
    const q = `%${search}%`;
    query = query.or(`name.ilike.${q},email.ilike.${q},username.ilike.${q}`);
  }
  if (memberType) query = query.eq("member_type", memberType);
  if (role) query = query.eq("role", role);
  if (hasAccount === "yes") query = query.not("auth_user_id", "is", null);
  else if (hasAccount === "no") query = query.is("auth_user_id", null);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data ?? []).map((r: Record<string, unknown>) => {
    const f = r.families as Record<string, unknown> ?? {};
    return {
      id: r.id,
      name: r.name,
      email: r.email ?? null,
      username: r.username ?? null,
      avatar: r.avatar,
      member_type: r.member_type ?? "dewasa",
      role: r.role,
      is_cms_admin: r.is_cms_admin ?? false,
      weekly_pages_goal: r.weekly_pages_goal ?? 0,
      birth_date: r.birth_date ?? null,
      created_at: r.created_at,
      has_account: !!r.auth_user_id,
      family_id: r.family_id,
      family_name: f.name ?? null,
    };
  });

  return NextResponse.json(items);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id diperlukan" }, { status: 400 });

  const allowed = ["member_type", "role", "is_cms_admin", "weekly_pages_goal", "name"];
  const clean: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) clean[key] = updates[key];
  }

  if (Object.keys(clean).length === 0) {
    return NextResponse.json({ error: "Tidak ada field yang diubah" }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .from("members")
    .update(clean)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
