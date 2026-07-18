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

    // Find members with reminder enabled whose reminder_time matches current hour
    const now = new Date();
    const currentHour = now.getUTCHours() + 7; // WIB (UTC+7)
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

    // Fetch push subscriptions for these members
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, member_id, endpoint, p256dh, auth")
      .in("member_id", memberIds);

    if (!subs?.length) {
      return NextResponse.json({ sent: 0, message: "No push subscriptions found" });
    }

    // Import web-push dynamically (ESM)
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
        const subscription = {
          endpoint: sub.endpoint as string,
          keys: {
            p256dh: sub.p256dh as string,
            auth: sub.auth as string,
          },
        };
        const payload = JSON.stringify({
          title: "Waktunya baca!",
          body: "Jangan lupa catat progres bacaan hari ini di Mulaibaca.",
        });
        await webpush.sendNotification(subscription, payload);
        sent++;
      })
    );

    // Delete invalid subscriptions (410 Gone = endpoint expired)
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

    return NextResponse.json({ sent, errors, totalMembers: memberIds.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
