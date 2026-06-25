import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-route";
import EditBukuClient from "./EditBukuClient";

export default async function EditBukuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: book } = await admin.from("curated_books").select("*").eq("id", id).maybeSingle();

  if (!book) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-h1">Edit Buku</h1>
        <p className="text-sm text-ink-muted mt-0.5 line-clamp-1">{book.title}</p>
      </div>
      <EditBukuClient book={book} />
    </div>
  );
}
