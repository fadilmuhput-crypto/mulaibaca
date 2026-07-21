import { createAdminClient } from "./supabase-route";

export type MemberStats = {
  member_id: string;
  name: string;
  avatar: string;
  username: string | null;
  role: "admin" | "member";
  current_streak: number;
  pages_this_week: number;
  minutes_this_week: number;
  books_finished_this_month: number;
};

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { weekStart: monday.toISOString(), weekEnd: sunday.toISOString() };
}

function getMonthBounds() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { monthStart: first.toISOString(), monthEnd: last.toISOString() };
}

export async function getClubMemberStats(clubId: string): Promise<MemberStats[]> {
  const supabase = createAdminClient();
  const { weekStart, weekEnd } = getWeekBounds();
  const { monthStart, monthEnd } = getMonthBounds();

  const { data: members } = await supabase
    .from("club_members")
    .select("member_id, role, members!inner(id, name, avatar, username)")
    .eq("club_id", clubId);

  if (!members || members.length === 0) return [];

  const memberIds = members.map((m: any) => m.member_id);

  const [{ data: streaks }, { data: weeklyLogs }, { data: thisMonthDone }] = await Promise.all([
    supabase.from("streaks").select("member_id, current_streak").in("member_id", memberIds),
    supabase
      .from("reading_logs")
      .select("member_id, pages_read, duration_minutes")
      .in("member_id", memberIds)
      .gte("log_date", weekStart)
      .lte("log_date", weekEnd),
    supabase
      .from("shelf_items")
      .select("member_id")
      .in("member_id", memberIds)
      .eq("status", "done")
      .gte("finished_at", monthStart)
      .lte("finished_at", monthEnd),
  ]);

  const streakMap = new Map((streaks ?? []).map((s: any) => [s.member_id, s.current_streak]));

  const pageMap = new Map<string, number>();
  const minuteMap = new Map<string, number>();
  for (const log of weeklyLogs ?? []) {
    pageMap.set(log.member_id, (pageMap.get(log.member_id) ?? 0) + (log.pages_read ?? 0));
    minuteMap.set(log.member_id, (minuteMap.get(log.member_id) ?? 0) + (log.duration_minutes ?? 0));
  }

  const bookCountMap = new Map<string, number>();
  for (const item of thisMonthDone ?? []) {
    bookCountMap.set(item.member_id, (bookCountMap.get(item.member_id) ?? 0) + 1);
  }

  return members.map((m: any) => ({
    member_id: m.member_id,
    name: m.members.name,
    avatar: m.members.avatar,
    username: m.members.username,
    role: m.role,
    current_streak: streakMap.get(m.member_id) ?? 0,
    pages_this_week: pageMap.get(m.member_id) ?? 0,
    minutes_this_week: minuteMap.get(m.member_id) ?? 0,
    books_finished_this_month: bookCountMap.get(m.member_id) ?? 0,
  }));
}
