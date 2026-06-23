import { NextResponse } from "next/server";
import { buildClearCookieHeaders } from "@/lib/session";

export async function POST() {
  const res = NextResponse.json({ success: true });
  buildClearCookieHeaders().forEach((c) => res.headers.append("Set-Cookie", c));
  return res;
}
