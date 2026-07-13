import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { following_id } = await req.json();
  if (!following_id) return NextResponse.json({ error: "following_id diperlukan" }, { status: 400 });
  if (following_id === session.memberId) return NextResponse.json({ error: "Tidak bisa follow diri sendiri" }, { status: 400 });

  const admin = createAdminClient();

  // Check if already following
  const { data: existing } = await admin
    .from("follows")
    .select()
    .eq("follower_id", session.memberId)
    .eq("following_id", following_id)
    .maybeSingle();

  if (existing) {
    // Unfollow
    await admin
      .from("follows")
      .delete()
      .eq("follower_id", session.memberId)
      .eq("following_id", following_id);
    return NextResponse.json({ following: false, is_following: false });
  }

  // Follow
  await admin.from("follows").insert({
    follower_id: session.memberId,
    following_id,
  });

  // Notify the followed user
  const { data: follower } = await admin
    .from("members")
    .select("name, username")
    .eq("id", session.memberId)
    .single();
  if (follower) {
    createNotification({
      memberId: following_id,
      title: `${follower.name} mengikutimu`,
      body: "Ikuti balik untuk lihat aktivitas bacaan mereka.",
      type: "info",
      link: follower.username ? `/u/${follower.username}` : null,
    });
  }

  return NextResponse.json({ following: true, is_following: true });
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const memberId = searchParams.get("member_id") || session.memberId;

  const admin = createAdminClient();

  const [{ count: followers }, { count: following }, { data: isFollowingData }] = await Promise.all([
    admin.from("follows").select("*", { count: "exact", head: true }).eq("following_id", memberId),
    admin.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", memberId),
    memberId !== session.memberId
      ? admin.from("follows").select().eq("follower_id", session.memberId).eq("following_id", memberId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return NextResponse.json({
    followers: followers ?? 0,
    following: following ?? 0,
    is_following: !!isFollowingData,
  });
}
