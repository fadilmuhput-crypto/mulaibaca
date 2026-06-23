import { NextResponse } from "next/server";
import { buildClearCookieHeader } from "@/lib/session";

export async function POST() {
  return NextResponse.json(
    { success: true },
    { headers: { "Set-Cookie": buildClearCookieHeader() } }
  );
}
