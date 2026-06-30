import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";
import { notifyFamily } from "@/lib/notifications";

async function getAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id, family_id, name").eq("auth_user_id", user.id).maybeSingle();
  if (!member) return null;
  return { supabase, memberId: member.id as string, familyId: member.family_id as string, memberName: member.name as string };
}

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60);
}

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, memberId, familyId, memberName } = auth;

  const { shelfItemId, rating, qAbout, qMemorable, qForWhom, isPublic } = await req.json();
  if (!shelfItemId || !rating) return NextResponse.json({ error: "Rating wajib diisi" }, { status: 400 });

  const { data: shelf } = await supabase
    .from("shelf_items").select("book_id, books(title)").eq("id", shelfItemId).single();

  const bookTitle = (shelf?.books as unknown as { title: string } | null)?.title ?? "buku";

  // Check if review already exists — avoid relying on DB unique constraint for upsert
  const { data: existing } = await supabase
    .from("reviews")
    .select("id, slug")
    .eq("shelf_item_id", shelfItemId)
    .eq("member_id", memberId)
    .maybeSingle();

  let data, error;

  if (existing) {
    // Update existing review; keep the original slug so the public URL stays stable
    ({ data, error } = await supabase
      .from("reviews")
      .update({
        rating,
        q_about: qAbout || null,
        q_memorable: qMemorable || null,
        q_for_whom: qForWhom || null,
        is_public: isPublic ?? true,
        published_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single());
  } else {
    const slug = `${toSlug(`${memberName}-${bookTitle}`)}-${Math.random().toString(36).slice(2, 6)}`;
    ({ data, error } = await supabase
      .from("reviews")
      .insert({
        shelf_item_id: shelfItemId,
        member_id: memberId,
        family_id: familyId,
        rating,
        q_about: qAbout || null,
        q_memorable: qMemorable || null,
        q_for_whom: qForWhom || null,
        is_public: isPublic ?? true,
        slug,
        published_at: new Date().toISOString(),
      })
      .select()
      .single());
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Review tidak tersimpan" }, { status: 500 });

  if (!existing) {
    notifyFamily(familyId, {
      title: `${memberName} nulis review ${bookTitle}`,
      body: "Baca review-nya dan lihat apa kata mereka tentang buku ini.",
      type: "info",
      link: `/review/${data.slug}`,
    }, memberId);
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, memberId } = auth;

  const { slug, is_public, is_anonymous } = await req.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const { error } = await supabase
    .from("reviews")
    .update({ is_public, is_anonymous })
    .eq("slug", slug)
    .eq("member_id", memberId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, memberId } = auth;

  const [{ data: reviews }, { data: doneShelf }] = await Promise.all([
    supabase.from("reviews")
      .select("*, shelf_items(*, books(title, author, cover_url))")
      .eq("member_id", memberId)
      .order("published_at", { ascending: false }),
    supabase.from("shelf_items")
      .select("id, books(title, author, cover_url)")
      .eq("member_id", memberId)
      .eq("status", "done"),
  ]);

  return NextResponse.json({ reviews: reviews ?? [], doneShelf: doneShelf ?? [] });
}
