import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shelf_items")
    .select("*, books(*)")
    .eq("member_id", session.memberId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { book, status } = await req.json();
  const supabase = await createClient();

  // Upsert book
  let bookId: string;
  if (book.open_library_id) {
    const { data: existing } = await supabase
      .from("books")
      .select("id")
      .eq("open_library_id", book.open_library_id)
      .maybeSingle();
    if (existing) {
      bookId = existing.id;
    } else {
      const { data: newBook, error: bookErr } = await supabase
        .from("books")
        .insert(book)
        .select("id")
        .single();
      if (bookErr || !newBook) return NextResponse.json({ error: "Gagal menyimpan buku" }, { status: 500 });
      bookId = newBook.id;
    }
  } else {
    const { data: newBook, error: bookErr } = await supabase
      .from("books")
      .insert(book)
      .select("id")
      .single();
    if (bookErr || !newBook) return NextResponse.json({ error: "Gagal menyimpan buku" }, { status: 500 });
    bookId = newBook.id;
  }

  // Add to shelf
  const { data: shelfItem, error: shelfErr } = await supabase
    .from("shelf_items")
    .insert({
      member_id: session.memberId,
      family_id: session.familyId,
      book_id: bookId,
      status: status || "reading",
      started_at: status === "reading" ? new Date().toISOString() : null,
    })
    .select("*, books(*)")
    .single();

  if (shelfErr) {
    if (shelfErr.code === "23505") {
      return NextResponse.json({ error: "Buku sudah ada di rak" }, { status: 409 });
    }
    return NextResponse.json({ error: shelfErr.message }, { status: 500 });
  }

  return NextResponse.json(shelfItem, { status: 201 });
}
