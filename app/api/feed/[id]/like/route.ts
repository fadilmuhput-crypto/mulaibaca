import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { count } = await admin
    .from("feed_likes")
    .select("id", { count: "exact", head: true })
    .eq("feed_id", id);

  const { data: myLike } = await admin
    .from("feed_likes")
    .select("id")
    .eq("feed_id", id)
    .eq("member_id", session.memberId)
    .maybeSingle();

  return NextResponse.json({ count: count ?? 0, liked_by_me: !!myLike });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin.from("feed_likes").upsert(
    { feed_id: id, member_id: session.memberId },
    { onConflict: "feed_id, member_id", ignoreDuplicates: true }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin
    .from("feed_likes")
    .delete()
    .eq("feed_id", id)
    .eq("member_id", session.memberId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
