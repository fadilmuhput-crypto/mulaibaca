import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";

export type FeedComment = {
  id: string;
  feed_id: string;
  member_id: string;
  member_name: string;
  member_avatar: string;
  member_username: string | null;
  content: string;
  created_at: string;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from("feed_comments")
    .select("id, feed_id, member_id, content, created_at, members!inner(name, avatar, username)")
    .eq("feed_id", id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const comments: FeedComment[] = (rows ?? []).map((r: Record<string, unknown>) => {
    const m = r.members as { name: string; avatar: string; username: string | null };
    return {
      id: r.id as string,
      feed_id: r.feed_id as string,
      member_id: r.member_id as string,
      member_name: m.name,
      member_avatar: m.avatar,
      member_username: m.username,
      content: r.content as string,
      created_at: r.created_at as string,
    };
  });

  return NextResponse.json(comments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("feed_comments")
    .insert({ feed_id: id, member_id: session.memberId, content: content.trim() })
    .select("id, feed_id, member_id, content, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: feedId } = await params;
  const commentId = req.nextUrl.searchParams.get("comment_id");
  if (!commentId) {
    return NextResponse.json({ error: "comment_id is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: comment } = await admin
    .from("feed_comments")
    .select("id, member_id")
    .eq("id", commentId)
    .eq("feed_id", feedId)
    .maybeSingle();

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  if (comment.member_id !== session.memberId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await admin.from("feed_comments").delete().eq("id", commentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
