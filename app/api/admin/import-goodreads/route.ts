import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";
import { importGoodreadsUrls } from "@/lib/goodreads-import";
import type { NextRequest } from "next/server";

async function isAdmin(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: member } = await supabase
    .from("members")
    .select("is_cms_admin")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return member?.is_cms_admin === true;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { urls } = await req.json();

  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "URLs harus berupa array dan tidak boleh kosong" }, { status: 400 });
  }

  if (urls.length > 100) {
    return NextResponse.json({ error: "Maksimal 100 URL per import" }, { status: 400 });
  }

  const cleaned = urls
    .map((u: string) => String(u).trim())
    .filter((u: string) => u.length > 0);

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "Tidak ada URL valid" }, { status: 400 });
  }

  const result = await importGoodreadsUrls(cleaned);

  return NextResponse.json(result);
}
