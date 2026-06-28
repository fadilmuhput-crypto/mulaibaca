import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";

export async function PUT(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await getSession();
  if (!session?.isCmsAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { order } = await req.json();
  const admin = createAdminClient();
  await Promise.all(
    order.map(({ id, sort_order }: { id: string; sort_order: number }) =>
      admin.from("help_faqs").update({ sort_order }).eq("id", id)
    )
  );
  return NextResponse.json({ success: true });
}
