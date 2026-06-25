import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

export async function POST(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();

  const { category, message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });

  let memberId: string | null = null;
  if (user) {
    const { data: member } = await supabase.from("members").select("id").eq("auth_user_id", user.id).maybeSingle();
    memberId = member?.id ?? null;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("feedback").insert({
    member_id: memberId,
    category: category || null,
    message: message.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
