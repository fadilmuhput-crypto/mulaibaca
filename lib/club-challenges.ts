import { createAdminClient } from "./supabase-route";

export type ClubChallenge = {
  id: string;
  club_id: string;
  created_by: string;
  title: string;
  target: number;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "expired";
  created_at: string;
  pages_read?: number;
  created_by_name?: string;
};

export async function getClubChallenges(clubId: string): Promise<ClubChallenge[]> {
  const supabase = createAdminClient();

  const { data: challenges } = await supabase
    .from("club_challenges")
    .select("*, members!club_challenges_created_by_fkey(name)")
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  if (!challenges) return [];

  // Get member IDs for progress calculation
  const { data: members } = await supabase
    .from("club_members")
    .select("member_id")
    .eq("club_id", clubId);

  const memberIds = (members ?? []).map((m) => m.member_id);
  if (!memberIds.length) return challenges.map((c) => ({ ...c, created_by_name: (c as any).members?.name }));

  const result: ClubChallenge[] = [];

  for (const c of challenges) {
    let pages_read = 0;

    if (c.status === "active") {
      // Calculate live progress for active challenges
      const { data: logs } = await supabase
        .from("reading_logs")
        .select("pages_read")
        .in("member_id", memberIds)
        .gte("log_date", c.start_date)
        .lte("log_date", c.end_date);

      pages_read = (logs ?? []).reduce((sum, l) => sum + ((l.pages_read as number) || 0), 0);
    } else if (c.status === "completed") {
      // For completed, show the target as final count
      pages_read = c.target;
    }

    result.push({
      ...c,
      pages_read,
      created_by_name: (c as any).members?.name,
    });
  }

  return result;
}

export async function getClubChallengeProgress(clubId: string, challengeId: string) {
  const supabase = createAdminClient();

  const { data: challenge } = await supabase
    .from("club_challenges")
    .select("*")
    .eq("id", challengeId)
    .eq("club_id", clubId)
    .single();

  if (!challenge) return null;

  const { data: members } = await supabase
    .from("club_members")
    .select("member_id")
    .eq("club_id", clubId);

  const memberIds = (members ?? []).map((m) => m.member_id);
  if (!memberIds.length) return { ...challenge, pages_read: 0, members_progress: [] };

  // Get per-member progress
  const { data: logs } = await supabase
    .from("reading_logs")
    .select("member_id, pages_read")
    .in("member_id", memberIds)
    .gte("log_date", challenge.start_date)
    .lte("log_date", challenge.end_date);

  // Aggregate per member
  const memberMap = new Map<string, number>();
  for (const m of memberIds) memberMap.set(m, 0);
  for (const l of logs ?? []) {
    const mid = l.member_id as string;
    memberMap.set(mid, (memberMap.get(mid) ?? 0) + ((l.pages_read as number) || 0));
  }

  // Get member names
  const { data: memberRows } = await supabase
    .from("club_members")
    .select("member_id, members!inner(name, avatar)")
    .eq("club_id", clubId);

  const nameMap = new Map<string, { name: string; avatar: string }>();
  for (const m of memberRows ?? []) {
    nameMap.set(m.member_id, (m as any).members);
  }

  const members_progress = Array.from(memberMap.entries())
    .map(([id, pages]) => ({
      member_id: id,
      name: nameMap.get(id)?.name ?? "Unknown",
      avatar: nameMap.get(id)?.avatar ?? "",
      pages,
    }))
    .sort((a, b) => b.pages - a.pages);

  const total_pages = members_progress.reduce((sum, m) => sum + m.pages, 0);

  return {
    ...challenge,
    pages_read: total_pages,
    members_progress,
  };
}
