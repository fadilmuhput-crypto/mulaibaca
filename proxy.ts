import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// /review and /review/[slug] are public — only protect auth-required sub-pages
const PROTECTED = ["/dashboard", "/rak", "/log", "/profil", "/edit-profil", "/review/tulis", "/admin", "/lingkar-baca", "/jelajah", "/onboarding", "/catatan"];
const PROTECTED_EXACT: string[] = [];
const AUTH_ONLY = ["/masuk", "/daftar", "/lingkar-baca/gabung", "/bergabung"];

export async function proxy(req: NextRequest) {
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

  // getSession reads cookies directly — no network call, safe for edge/proxy
  const { data: { session } } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  const isProtected =
    PROTECTED.some((p) => pathname.startsWith(p)) ||
    PROTECTED_EXACT.some((p) => pathname === p);
  const isAuthPage = AUTH_ONLY.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/masuk", req.url));
  }

  // Anonymous users can visit /daftar and /masuk to upgrade their account
  const isAnonymous = session?.user?.is_anonymous ?? false;
  if (isAuthPage && session && !isAnonymous) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/|auth/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json|woff2?|ttf|otf)$).*)",
  ],
};
