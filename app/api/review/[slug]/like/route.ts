import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

async function getAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (!member) return null;
  return { memberId: member.id as string };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { memberId } = auth;
  const { slug } = await params;

  const admin = createAdminClient();

  const { data: review } = await admin
    .from("reviews")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  const { data: existing } = await admin
    .from("review_likes")
    .select("id")
    .eq("member_id", memberId)
    .eq("review_id", review.id)
    .maybeSingle();

  if (existing) {
    await admin.from("review_likes").delete().eq("id", existing.id);
  } else {
    await admin.from("review_likes").insert({ member_id: memberId, review_id: review.id });
  }

  const { count } = await admin
    .from("review_likes")
    .select("id", { count: "exact", head: true })
    .eq("review_id", review.id);

  return NextResponse.json({ liked: !existing, likes_count: count ?? 0 });
}
