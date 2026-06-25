import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("u")?.trim().toLowerCase();
  if (!username) return NextResponse.json({ available: false, error: "Username kosong" });
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return NextResponse.json({ available: false, error: "Hanya huruf kecil, angka, underscore (3–30 karakter)" });
  }
  const admin = createAdminClient();
  const { data } = await admin.from("members").select("id").eq("username", username).maybeSingle();
  return NextResponse.json({ available: !data });
}
