import { cookies } from "next/headers";
import type { Session } from "./types";

const SESSION_COOKIE = "mb_session";
const FAMILY_COOKIE = "mb_family"; // persisted, readable by client JS for /masuk auto-fill

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as Session;
  } catch {
    return null;
  }
}

export async function getSavedFamily(): Promise<{ familyId: string; familyName: string } | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(FAMILY_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export function buildSetCookieHeaders(session: Session): string[] {
  const sessionVal = encodeURIComponent(JSON.stringify(session));
  const familyVal = encodeURIComponent(JSON.stringify({
    familyId: session.familyId,
    familyName: session.familyName,
  }));
  const sessionMaxAge = 60 * 60 * 24 * 30;   // 30 days
  const familyMaxAge  = 60 * 60 * 24 * 365;  // 1 year
  return [
    `${SESSION_COOKIE}=${sessionVal}; Path=/; Max-Age=${sessionMaxAge}; HttpOnly; SameSite=Lax`,
    `${FAMILY_COOKIE}=${familyVal}; Path=/; Max-Age=${familyMaxAge}; SameSite=Lax`,
  ];
}

// Keep backward-compat alias used by API routes
export function buildSetCookieHeader(session: Session): string {
  return buildSetCookieHeaders(session)[0];
}

export function buildClearCookieHeaders(): string[] {
  return [
    `${SESSION_COOKIE}=; Path=/; Max-Age=0`,
    `${FAMILY_COOKIE}=; Path=/; Max-Age=0`,
  ];
}

export function buildClearCookieHeader(): string {
  return buildClearCookieHeaders()[0];
}
