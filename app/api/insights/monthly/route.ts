import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const memberId = session.memberId;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const prevEnd = monthStart;

  const [{ data: curPages }, { data: prevPages }, curBooksRes, prevBooksRes] = await Promise.all([
    admin.from("reading_logs")
      .select("pages_read")
      .eq("member_id", memberId)
      .gte("log_date", monthStart)
      .lt("log_date", monthEnd),
    admin.from("reading_logs")
      .select("pages_read")
      .eq("member_id", memberId)
      .gte("log_date", prevStart)
      .lt("log_date", prevEnd),
    admin.from("shelf_items")
      .select("id", { count: "exact", head: true })
      .eq("member_id", memberId)
      .eq("status", "done")
      .gte("finished_at", monthStart)
      .lt("finished_at", monthEnd)
      .then((r: unknown) => r as { count: number }),
    admin.from("shelf_items")
      .select("id", { count: "exact", head: true })
      .eq("member_id", memberId)
      .eq("status", "done")
      .gte("finished_at", prevStart)
      .lt("finished_at", prevEnd)
      .then((r: unknown) => r as { count: number }),
  ]);

  const curPagesTotal = (curPages ?? []).reduce((s: number, r: { pages_read: number }) => s + (r.pages_read ?? 0), 0);
  const prevPagesTotal = (prevPages ?? []).reduce((s: number, r: { pages_read: number }) => s + (r.pages_read ?? 0), 0);
  const curBooksTotal = curBooksRes?.count ?? 0;
  const prevBooksTotal = prevBooksRes?.count ?? 0;

  function delta(current: number, previous: number): number | null {
    if (previous === 0) return current > 0 ? null : null;
    return Math.round(((current - previous) / previous) * 100);
  }

  return NextResponse.json({
    current: { pages: curPagesTotal, books: curBooksTotal },
    previous: { pages: prevPagesTotal, books: prevBooksTotal },
    pagesDelta: delta(curPagesTotal, prevPagesTotal),
    booksDelta: delta(curBooksTotal, prevBooksTotal),
  });
}
