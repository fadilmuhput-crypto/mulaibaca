import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";
import { getPeriodBounds } from "@/lib/challenges";

export async function POST(req: NextRequest) {
  try {
    const { challengeId, memberId } = await req.json();
    if (!challengeId || !memberId) {
      return NextResponse.json({ error: "Missing challengeId or memberId" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("challenge_participants")
      .select("id, completed_at, started_at")
      .eq("challenge_id", challengeId)
      .eq("member_id", memberId)
      .maybeSingle();

    if (existing) {
      const { data: challenge } = await admin
        .from("challenges")
        .select("duration_type")
        .eq("id", challengeId)
        .single();

      const isRecurring = challenge && challenge.duration_type !== "unlimited";

      if (existing.completed_at) {
        if (isRecurring) {
          const completedDate = new Date(existing.completed_at);
          const bounds = getPeriodBounds(challenge.duration_type);
          if (completedDate < bounds.start) {
            await admin
              .from("challenge_participants")
              .update({ completed_at: null, progress: 0, started_at: new Date().toISOString().split("T")[0] })
              .eq("id", existing.id);
            return NextResponse.json({ data: { id: existing.id, reset: true } });
          }
        }
        return NextResponse.json({ error: "Already completed this challenge" }, { status: 409 });
      }

      if (isRecurring) {
        const participantDate = new Date(existing.started_at);
        const bounds = getPeriodBounds(challenge.duration_type);
        if (participantDate < bounds.start) {
          await admin
            .from("challenge_participants")
            .update({ progress: 0, started_at: new Date().toISOString().split("T")[0] })
            .eq("id", existing.id);
          return NextResponse.json({ data: { id: existing.id, reset: true } });
        }
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
