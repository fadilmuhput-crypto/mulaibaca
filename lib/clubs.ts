import { createAdminClient } from "./supabase-route";

export type Club = {
  id: string;
  name: string;
  description: string;
  cover_url: string | null;
  created_by: string;
  invite_code: string;
  max_members: number | null;
  is_active: boolean;
  visibility: "public" | "private";
  join_type: "auto" | "approval";
  created_at: string;
};

export type ClubMember = {
  id: string;
  club_id: string;
  member_id: string;
  role: "admin" | "member";
  joined_at: string;
  members?: {
    id: string;
    name: string;
    avatar: string;
    username: string | null;
  };
};

export async function getUserClubs(memberId: string): Promise<(Club & { member_count: number })[]> {
  const supabase = createAdminClient();

  const { data: memberships } = await supabase
    .from("club_members")
    .select("club_id")
    .eq("member_id", memberId);

  if (!memberships || memberships.length === 0) return [];

  const clubIds = memberships.map((m) => m.club_id);

  const { data: clubs } = await supabase
    .from("clubs")
    .select("*")
    .in("id", clubIds)
    .eq("is_active", true);

  if (!clubs) return [];

  const counts = await Promise.all(
    clubs.map((c) =>
      supabase
        .from("club_members")
        .select("id", { count: "exact", head: true })
        .eq("club_id", c.id)
    )
  );

  return clubs.map((c, i) => ({
    ...c,
    member_count: counts[i].count ?? 0,
  }));
}

export async function getClubDetail(clubId: string) {
  const supabase = createAdminClient();

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", clubId)
    .single();

  if (!club) return null;

  const { data: memberRows } = await supabase
    .from("club_members")
    .select("*, members!inner(id, name, avatar, username)")
    .eq("club_id", clubId);

  const members: ClubMember[] = (memberRows ?? []).map((m: any) => ({
    id: m.id,
    club_id: m.club_id,
    member_id: m.member_id,
    role: m.role,
    joined_at: m.joined_at,
    members: m.members,
  }));

  return { club, members };
}
