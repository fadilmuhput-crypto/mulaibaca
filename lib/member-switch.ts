import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "dev-fallback-secret";
const COOKIE_NAME = "acting_as";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createSwitchToken(targetMemberId: string, adminMemberId: string): string {
  const payload = `${targetMemberId}:${adminMemberId}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

export function parseSwitchToken(token: string): { targetMemberId: string; adminMemberId: string } | null {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return null;
    const payload = Buffer.from(b64, "base64url").toString();
    const expected = sign(payload);
    if (!timingSafeEqual(Buffer.from(sig, "base64url"), Buffer.from(expected, "base64url"))) return null;
    const [targetMemberId, adminMemberId] = payload.split(":");
    if (!targetMemberId || !adminMemberId) return null;
    return { targetMemberId, adminMemberId };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
