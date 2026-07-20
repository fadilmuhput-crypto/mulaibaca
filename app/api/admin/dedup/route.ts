import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";
import { findDuplicateGroups, resolveDuplicates } from "@/lib/dedup";
import type { NextRequest } from "next/server";

async function isAdmin(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: member } = await supabase
    .from("members")
    .select("is_cms_admin")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return member?.is_cms_admin === true;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const groups = await findDuplicateGroups();

  const report = groups.map((g) => ({
    key: g.key,
    keeper: { id: g.keeper.id, title: g.keeper.title, author: g.keeper.author },
    duplicates: g.duplicates.map((d) => ({ id: d.id, title: d.title, author: d.author })),
  }));

  return NextResponse.json({ total: groups.length, groups: report });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { groupKeys } = await req.json().catch(() => ({}));
  const allGroups = await findDuplicateGroups();
  const toResolve = groupKeys ? allGroups.filter((g) => groupKeys.includes(g.key)) : allGroups;

  if (toResolve.length === 0) {
    return NextResponse.json({ error: "No groups to resolve" }, { status: 400 });
  }

  const result = await resolveDuplicates(toResolve);

  return NextResponse.json({ resolved: result.resolved, errors: result.errors });
}
