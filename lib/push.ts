import { createAdminClient } from "./supabase-route";

export async function sendPushToMembers(
  memberIds: string[],
  title: string,
  body: string
): Promise<{ sent: number; errors: number }> {
  if (!memberIds.length) return { sent: 0, errors: 0 };

  const admin = createAdminClient();

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, member_id, endpoint, p256dh, auth")
    .in("member_id", memberIds);

  if (!subs?.length) return { sent: 0, errors: 0 };

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const privateKey = process.env.VAPID_PRIVATE_KEY!;

  const webpush = await import("web-push");
  webpush.setVapidDetails("mailto:hello@mulaibaca.id", publicKey, privateKey);

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
      await webpush.sendNotification(
        subscription,
        JSON.stringify({ title, body })
      );
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

  return { sent, errors };
}
