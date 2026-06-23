import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// For routes called right after signUp — pass access_token in Authorization header
export function createRouteClient(req: NextRequest, res?: NextResponse) {
  const authHeader = req.headers.get("Authorization");

  // If Authorization header present, use it directly (avoids cookie timing issues)
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    ) as ReturnType<typeof createServerClient>;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          if (res) {
            cookies.forEach(({ name, value, options }) => {
              res.cookies.set(name, value, options);
            });
          }
        },
      },
    }
  );
}
