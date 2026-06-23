import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/dashboard", "/rak", "/log", "/review"];
const AUTH_ONLY = ["/masuk", "/daftar", "/bergabung"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: { headers: req.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = req.nextUrl.pathname;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    return NextResponse.redirect(new URL("/masuk", req.url));
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|api/|auth/).*)"],
};
