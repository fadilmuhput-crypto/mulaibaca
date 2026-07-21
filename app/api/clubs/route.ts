import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";
import { getUserClubs } from "@/lib/clubs";

export async function GET(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const clubs = await getUserClubs(member.id);
  return NextResponse.json({ data: clubs });
}

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  const { name, description } = await req.json();

  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: "Nama klub wajib diisi" }, { status: 400 });
  }

  // Create club
  const { data: club, error: clubErr } = await supabase
    .from("clubs")
    .insert({
      name: name.trim(),
      description: description?.trim() ?? "",
      created_by: member.id,
    })
    .select()
    .single();

  if (clubErr || !club) {
    return NextResponse.json({ error: "Gagal membuat klub" }, { status: 500 });
  }

  // Auto-join creator as admin
  const { error: joinErr } = await supabase
    .from("club_members")
    .insert({ club_id: club.id, member_id: member.id, role: "admin" });

  if (joinErr) {
    return NextResponse.json({ error: "Gagal bergabung" }, { status: 500 });
  }

  return NextResponse.json({ data: club });
}
