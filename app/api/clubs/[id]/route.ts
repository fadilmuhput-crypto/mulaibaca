import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";
import { getClubDetail } from "@/lib/clubs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await getClubDetail(id);

  if (!result) {
    return NextResponse.json({ error: "Klub tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(result);
}
