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

export default async function AdminBukuPage() {
  const admin = createAdminClient();
  const { data: books } = await admin
    .from("books")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1">Kurasi Buku</h1>
          <p className="text-sm text-ink-muted mt-0.5">{(books ?? []).length} buku tersimpan</p>
        </div>
        <Link href="/admin/buku/tambah" className="btn-primary">
          + Tambah Buku
        </Link>
      </div>

      <BukuAdminClient initialBooks={(books ?? []) as AdminBook[]} />
    </div>
  );
}
