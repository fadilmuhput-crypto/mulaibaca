import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export function createRouteClient(req: NextRequest, res?: NextResponse) {
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

// Use when access_token + refresh_token are passed in request body (right after signUp)
export async function createSessionClient(accessToken: string, refreshToken: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  return supabase;
}
