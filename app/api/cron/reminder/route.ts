import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

async function getVapidKeys() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys not configured");
  }
  return { publicKey, privateKey };
}

export async function GET() {
  try {
    const admin = createAdminClient();
    const { publicKey, privateKey } = await getVapidKeys();

    const now = new Date();
    const currentHour = now.getUTCHours() + 7;
    const wibHour = Math.max(0, Math.min(23, currentHour));
    const timeStr = `${String(wibHour).padStart(2, "0")}:00`;

    const { data: members } = await admin
      .from("members")
      .select("id")
      .eq("reminder_enabled", true)
      .eq("reminder_time", timeStr);

    if (!members?.length) {
      return NextResponse.json({ sent: 0, message: "No members to remind at this hour" });
    }

    const memberIds = members.map((m) => m.id as string);

    // Fetch streaks & today's logs in parallel
    const today = new Date().toISOString().split("T")[0];
    const [{ data: streaks }, { data: todayLogs }] = await Promise.all([
      admin.from("streaks").select("member_id, current_streak").in("member_id", memberIds),
      admin.from("reading_logs").select("member_id").eq("log_date", today).in("member_id", memberIds),
    ]);

    const streakMap = new Map((streaks ?? []).map((s: any) => [s.member_id, s.current_streak]));
    const todayLogSet = new Set((todayLogs ?? []).map((l: any) => l.member_id));

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, member_id, endpoint, p256dh, auth")
      .in("member_id", memberIds);

    if (!subs?.length) {
      return NextResponse.json({ sent: 0, message: "No push subscriptions found" });
    }

    const webpush = await import("web-push");

    webpush.setVapidDetails(
      "mailto:hello@mulaibaca.id",
      publicKey,
      privateKey
    );

    let sent = 0;
    let errors = 0;

    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        const memberId = sub.member_id as string;
        const streak = streakMap.get(memberId) ?? 0;
        const hasLoggedToday = todayLogSet.has(memberId);

        let title: string;
        let body: string;

        if (streak > 0 && !hasLoggedToday) {
          title = `🔥 Streak ${streak} hari belum aman!`;
          body = `Kamu belum catat bacaan hari ini. Ayo baca 1 halaman dulu biar streak ${streak} hari tetap aman!`;
        } else {
          title = "Waktunya baca!";
          body = "Jangan lupa catat progres bacaan hari ini di Mulaibaca.";
        }

        const subscription = {
          endpoint: sub.endpoint as string,
          keys: {
            p256dh: sub.p256dh as string,
            auth: sub.auth as string,
          },
        };
        const payload = JSON.stringify({ title, body });
        await webpush.sendNotification(subscription, payload);
        sent++;
      })
    );

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === "rejected") {
        const err = r.reason as Error;
        if (err.message?.includes("410") || err.message?.includes("gone")) {
          await admin.from("push_subscriptions").delete().eq("id", subs[i].id);
        }
        errors++;
      }
    }

    return NextResponse.json({ sent, errors, totalMembers: memberIds.length, streakSaverCount: memberIds.filter((id) => (streakMap.get(id) ?? 0) > 0 && !todayLogSet.has(id)).length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
