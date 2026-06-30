import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profil";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if member profile exists
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: member } = await supabase
          .from("members")
          .select("id")
          .eq("auth_user_id", user.id)
          .maybeSingle();

        if (!member) {
          // New Google user — needs to set up profile
          return NextResponse.redirect(`${origin}/setup-profil`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/masuk?error=auth_callback_failed`);
}
