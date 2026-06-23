import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase-route";

async function getAuth(req: NextRequest) {
  const supabase = createRouteClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from("members").select("id, family_id").eq("auth_user_id", user.id).maybeSingle();
  if (!member) return null;
  return { supabase, memberId: member.id as string, familyId: member.family_id as string };
}

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, memberId } = auth;

  const { data, error } = await supabase
    .from("shelf_items")
    .select("*, books(*)")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { supabase, memberId, familyId } = auth;

  const { book, status } = await req.json();

  let bookId: string;
  if (book.open_library_id) {
    const { data: existing } = await supabase
      .from("books").select("id").eq("open_library_id", book.open_library_id).maybeSingle();
    if (existing) {
      bookId = existing.id;
    } else {
      const { data: newBook, error: bookErr } = await supabase
        .from("books").insert(book).select("id").single();
      if (bookErr || !newBook) return NextResponse.json({ error: "Gagal menyimpan buku" }, { status: 500 });
      bookId = newBook.id;
    }
  } else {
    const { data: newBook, error: bookErr } = await supabase
      .from("books").insert(book).select("id").single();
    if (bookErr || !newBook) return NextResponse.json({ error: "Gagal menyimpan buku" }, { status: 500 });
    bookId = newBook.id;
  }

  const { data: shelfItem, error: shelfErr } = await supabase
    .from("shelf_items")
    .insert({
      member_id: memberId,
      family_id: familyId,
      book_id: bookId,
      status: status || "reading",
      started_at: status === "reading" ? new Date().toISOString() : null,
    })
    .select("*, books(*)")
    .single();

  if (shelfErr) {
    if (shelfErr.code === "23505") return NextResponse.json({ error: "Buku sudah ada di rak" }, { status: 409 });
    return NextResponse.json({ error: shelfErr.message }, { status: 500 });
  }

  return NextResponse.json(shelfItem, { status: 201 });
}
