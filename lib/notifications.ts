import { createAdminClient } from "@/lib/supabase-route";

export type NotificationType = "info" | "achievement" | "system";

export type CreateNotificationInput = {
  memberId: string;
  title: string;
  body?: string | null;
  type?: NotificationType;
  link?: string | null;
};

/**
 * createNotification — inserts a notification for a specific member.
 * Uses admin client (bypasses RLS), safe to call from any server-side API route.
 */
export async function createNotification(input: CreateNotificationInput) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .insert({
      member_id: input.memberId,
      title: input.title,
      body: input.body ?? null,
      type: input.type ?? "info",
      link: input.link ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
  return data;
}

/**
 * notifyFamily — creates the same notification for all members of a family.
 * Useful for events like "a new review was posted" or "someone joined the family".
 */
export async function notifyFamily(
  familyId: string,
  notification: Omit<CreateNotificationInput, "memberId">,
  excludeMemberId?: string
) {
  const admin = createAdminClient();
  const { data: members } = await admin
    .from("members")
    .select("id")
    .eq("family_id", familyId);

  if (!members || members.length === 0) return [];

  const records = members
    .filter((m) => m.id !== excludeMemberId)
    .map((m) => ({
      member_id: m.id,
      title: notification.title,
      body: notification.body ?? null,
      type: notification.type ?? "info",
      link: notification.link ?? null,
    }));

  const { data, error } = await admin
    .from("notifications")
    .insert(records)
    .select();

  if (error) {
    console.error("Failed to notify family:", error);
    return [];
  }
  return data;
}
