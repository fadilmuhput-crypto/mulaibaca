import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-route";
import EditLibraryClient from "./EditLibraryClient";

export default async function EditLibraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: book } = await admin
    .from("books")
    .select("*, shelf_items(count)")
    .eq("id", id)
    .maybeSingle();

  if (!book) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1">Lengkapi Data Buku</h1>
        <p className="text-sm text-ink-muted mt-0.5 line-clamp-1">{book.title}</p>
      </div>
      <EditLibraryClient book={book} />
    </div>
  );
}
