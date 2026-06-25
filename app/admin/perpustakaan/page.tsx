import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-route";
import PerpustakaanClient from "./PerpustakaanClient";

export type LibraryBook = {
  id: string;
  title: string;
  author: string | null;
  cover_url: string | null;
  isbn: string | null;
  open_library_id: string | null;
  total_pages: number | null;
  created_at: string | null;
  shelf_items: { count: number }[];
};

export default async function PerpustakaanAdminPage() {
  const admin = createAdminClient();
  const { data: books } = await admin
    .from("books")
    .select("*, shelf_items(count)")
    .order("created_at", { ascending: false });

  const all = (books ?? []) as LibraryBook[];
  const incomplete = all.filter(
    (b) => !b.cover_url || !b.total_pages || !b.author
  ).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1">Perpustakaan</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {all.length} buku ditambahkan pengguna
            {incomplete > 0 && (
              <span className="ml-2 text-amber font-medium">· {incomplete} belum lengkap</span>
            )}
          </p>
        </div>
      </div>

      <PerpustakaanClient initialBooks={all} />
    </div>
  );
}
