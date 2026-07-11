import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";

async function assertAdmin() {
  const session = await getSession();
  if (!session?.isCmsAdmin) return null;
  return session;
}

// POST — tambah buku ke section
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: section_id } = await params;
  const { book_id } = await req.json();

  if (!book_id) {
    return NextResponse.json({ error: "book_id wajib diisi" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Sort order = jumlah buku yang sudah ada
  const { count } = await admin
    .from("jelajah_section_books")
    .select("id", { count: "exact", head: true })
    .eq("section_id", section_id);

  const { error } = await admin
    .from("jelajah_section_books")
    .insert({ section_id, book_id, sort_order: count ?? 0 });

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Buku sudah ada di section ini" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

// DELETE — hapus buku dari section
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: section_id } = await params;
  const { book_id } = await req.json();

  const admin = createAdminClient();
  const { error } = await admin
    .from("jelajah_section_books")
    .delete()
    .eq("section_id", section_id)
    .eq("book_id", book_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// PUT — update urutan buku (kirim array of { curated_book_id, sort_order })
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: section_id } = await params;
  const { order } = await req.json() as { order: { book_id: string; sort_order: number }[] };

  const admin = createAdminClient();
  const updates = order.map(({ book_id, sort_order }) =>
    admin
      .from("jelajah_section_books")
      .update({ sort_order })
      .eq("section_id", section_id)
      .eq("book_id", book_id)
  );

  await Promise.all(updates);
  return NextResponse.json({ ok: true });
}
