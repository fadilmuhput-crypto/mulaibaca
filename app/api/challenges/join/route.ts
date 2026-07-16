import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

export async function POST(req: NextRequest) {
  try {
    const { challengeId, memberId } = await req.json();
    if (!challengeId || !memberId) {
      return NextResponse.json({ error: "Missing challengeId or memberId" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("challenge_participants")
      .select("id, completed_at")
      .eq("challenge_id", challengeId)
      .eq("member_id", memberId)
      .maybeSingle();

    if (existing) {
      if (existing.completed_at) {
        return NextResponse.json({ error: "Already completed this challenge" }, { status: 409 });
      }
      return NextResponse.json({ error: "Already joined this challenge" }, { status: 409 });
    }

    const { data, error } = await admin
      .from("challenge_participants")
      .insert({ challenge_id: challengeId, member_id: memberId })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
