import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase-route";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "no session" }, { status: 401 });

    const supabase = createAdminClient();
    const familyId = session.familyId;

    const { data: members } = await supabase
      .from("members")
      .select("id, name")
      .eq("family_id", familyId);

    const memberIds = (members ?? []).map((m: { id: string }) => m.id);

    const { data: rawShelfReading, error: shelfErr } = await supabase
      .from("shelf_items")
      .select("id, member_id, current_page, book_id, books(id, title, cover_url, total_pages)")
      .in("member_id", memberIds)
      .eq("status", "reading")
      .order("updated_at", { ascending: false });

    const { data: allShelfItems } = await supabase
      .from("shelf_items")
      .select("id, member_id")
      .in("member_id", memberIds);

    return NextResponse.json({
      familyId,
      memberIds,
      members,
      rawShelfReading,
      shelfError: shelfErr?.message ?? null,
      rawShelfItemCount: rawShelfReading?.length ?? 0,
      allShelfItemCount: allShelfItems?.length ?? 0,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
