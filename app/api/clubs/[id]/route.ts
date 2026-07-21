import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getClubDetail } from "@/lib/clubs";

async function getMemberId(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return member?.id ?? null;
}

async function isClubAdmin(clubId: string, memberId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("club_members")
    .select("id")
    .eq("club_id", clubId)
    .eq("member_id", memberId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await getClubDetail(id);

  if (!result) {
    return NextResponse.json({ error: "Klub tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberId(req);
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (!(await isClubAdmin(id, memberId))) {
    return NextResponse.json({ error: "Hanya admin yang bisa mengedit klub" }, { status: 403 });
  }

  const { name, description, cover_url } = await req.json();
  const admin = createAdminClient();

  const updates: Record<string, string> = {};
  if (name?.trim()) updates.name = name.trim();
  if (description !== undefined) updates.description = description.trim();
  if (cover_url !== undefined) updates.cover_url = cover_url;

  const { data, error } = await admin
    .from("clubs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Gagal mengupdate klub" }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberId(req);
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (!(await isClubAdmin(id, memberId))) {
    return NextResponse.json({ error: "Hanya admin yang bisa menghapus klub" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { error } = await admin.from("clubs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Gagal menghapus klub" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
