import { cookies } from "next/headers";
import type { Session } from "./types";

const SESSION_COOKIE = "mb_session";

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function buildSetCookieHeader(session: Session): string {
  const value = encodeURIComponent(JSON.stringify(session));
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  return `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

export function buildClearCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0`;
}
