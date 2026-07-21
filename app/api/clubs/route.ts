import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getUserClubs } from "@/lib/clubs";

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

export async function GET(req: NextRequest) {
  const memberId = await getMemberId(req);
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clubs = await getUserClubs(memberId);
  return NextResponse.json({ data: clubs });
}

export async function POST(req: NextRequest) {
  const memberId = await getMemberId(req);
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, visibility, join_type } = await req.json();

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: "Nama klub wajib diisi" }, { status: 400 });
  }

  if (visibility && !["public", "private"].includes(visibility)) {
    return NextResponse.json({ error: "Visibility tidak valid" }, { status: 400 });
  }

  if (join_type && !["auto", "approval"].includes(join_type)) {
    return NextResponse.json({ error: "Join type tidak valid" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: club, error: clubErr } = await admin
    .from("clubs")
    .insert({
      name: name.trim(),
      description: description?.trim() ?? "",
      created_by: memberId,
      visibility: visibility ?? "public",
      join_type: join_type ?? "auto",
    })
    .select()
    .single();

  if (clubErr || !club) {
    return NextResponse.json({ error: "Gagal membuat klub" }, { status: 500 });
  }

  const { error: joinErr } = await admin
    .from("club_members")
    .insert({ club_id: club.id, member_id: memberId, role: "admin" });

  if (joinErr) {
    return NextResponse.json({ error: "Gagal bergabung" }, { status: 500 });
  }

  return NextResponse.json({ data: club });
}
