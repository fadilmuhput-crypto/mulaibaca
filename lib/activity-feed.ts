import { createAdminClient } from "@/lib/supabase-route";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ActivityType = "shelf_add" | "shelf_status" | "log" | "review" | "finish" | "follow" | "challenge_earn";

export type ActivityData = {
  book_id?: string;
  book_title?: string;
  book_slug?: string;
  book_cover?: string | null;
  pages_read?: number;
  duration_minutes?: number | null;
  from_page?: number | null;
  to_page?: number | null;
  images?: string[] | null;
  rating?: number;
  excerpt?: string;
  review_slug?: string;
  status?: string;
  from_status?: string;
  to_status?: string;
  following_id?: string;
  following_name?: string;
  following_avatar?: string;
  following_username?: string;
  challenge_id?: string;
  challenge_title?: string;
  badge_name?: string;
  badge_icon?: string;
  badge_color?: string;
  period_label?: string | null;
};

export async function insertActivity(
  memberId: string,
  familyId: string,
  activityType: ActivityType,
  data: ActivityData = {},
  admin?: SupabaseClient
) {
  const client = admin ?? createAdminClient();
  const { error } = await client.from("activity_feed").insert({
    member_id: memberId,
    family_id: familyId,
    activity_type: activityType,
    data,
  });
  if (error) {
    console.error(`Failed to insert activity (${activityType}):`, error);
    throw new Error(`Activity insert failed: ${error.message}`);
  }
}
