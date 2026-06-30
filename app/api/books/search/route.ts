import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";

export async function GET(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  if (!q && !category) {
    return NextResponse.json({ data: [], error: "Query or category required" }, { status: 400 });
  }

  let query = supabase
    .from("books")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.contains("categories", [category]);
  }

  if (q && q.length >= 2) {
    const searchTerm = q.replace(/'/g, "''");
    query = query.or(
      `title.ilike.%${searchTerm}%,` +
      `author.ilike.%${searchTerm}%,` +
      `description.ilike.%${searchTerm}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], count });
}
