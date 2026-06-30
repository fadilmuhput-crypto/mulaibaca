import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-route";
import BukuAdminClient from "./BukuAdminClient";

export type AdminBook = {
  id: string;
  title: string;
  author: string;
  cover_url: string | null;
  open_library_id: string | null;
  total_pages: number | null;
  description: string;
  categories: string[];
  tags: string[];
  isbn: string | null;
  publisher: string | null;
  published_year: number | null;
  language: string;
  is_curated?: boolean;
  enrichment_status?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type LibraryBook = AdminBook & {
  shelf_items: { count: number }[];
};

export default async function AdminBukuPage() {
  const admin = createAdminClient();

  const [{ data: allBooks }, { data: withUsage }] = await Promise.all([
    admin
      .from("books")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true }),
    admin
      .from("books")
      .select("*, shelf_items(count)")
      .order("created_at", { ascending: false }),
  ]);

  const buku = (allBooks ?? []) as AdminBook[];
  const perpustakaan = (withUsage ?? []) as LibraryBook[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1">Buku</h1>
          <p className="text-sm text-ink-muted mt-0.5">{buku.length} total</p>
        </div>
        <Link href="/admin/buku/tambah" className="btn-primary">
          + Tambah Buku
        </Link>
      </div>

      <BukuAdminClient
        initialBooks={buku}
        initialLibrary={perpustakaan}
      />
    </div>
  );
}
