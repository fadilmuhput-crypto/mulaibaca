import { NextRequest, NextResponse } from "next/server";
import { createRouteClient, createAdminClient } from "@/lib/supabase-route";

async function getAdminAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id, is_cms_admin").eq("auth_user_id", user.id).maybeSingle();
  if (!member || !member.is_cms_admin) return null;
  return { userId: user.id };
}

export async function POST(req: NextRequest) {
  const auth = await getAdminAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = `
    ALTER TABLE curated_books ADD COLUMN IF NOT EXISTS isbn text;
    ALTER TABLE curated_books ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}'::text[];
    ALTER TABLE curated_books ADD COLUMN IF NOT EXISTS publisher text;
    ALTER TABLE curated_books ADD COLUMN IF NOT EXISTS published_year integer;
    ALTER TABLE curated_books ADD COLUMN IF NOT EXISTS language text DEFAULT 'id';

    ALTER TABLE books ADD COLUMN IF NOT EXISTS description text;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}'::text[];
    ALTER TABLE books ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];
    ALTER TABLE books ADD COLUMN IF NOT EXISTS publisher text;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS published_year integer;
    ALTER TABLE books ADD COLUMN IF NOT EXISTS language text DEFAULT 'id';
    ALTER TABLE books ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
  `;

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("exec_sql", { sql_text: sql });

  if (error) {
    return NextResponse.json({
      error: error.message,
      hint: "Run SQL manually via Supabase SQL editor",
      sql,
    });
  }

  return NextResponse.json({ success: true, message: "Migration berhasil" });
}
