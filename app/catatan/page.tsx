import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import NavBar from "@/components/NavBar";
import BookCover from "@/components/BookCover";
import CatatanClient from "./CatatanClient";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

function bookUrl(title: string, olId: string | null): string {
  if (olId) return `/buku/${toSlug(title)}-${olId.toLowerCase()}`;
  return `/buku/${toSlug(title)}`;
}

function formatDate(dateStr: string | null, fallback: string): string {
  const d = new Date(dateStr ?? fallback);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export type NoteLog = {
  id: string;
  note: string;
  pages_read: number;
  from_page: number | null;
  to_page: number | null;
  images: string[] | null;
  log_date: string | null;
  created_at: string;
  shelf_items: {
    book_id: string;
    books: {
      id: string;
      title: string;
      cover_url: string | null;
      open_library_id: string | null;
      author: string | null;
    } | null;
  } | null;
};

type BookGroup = {
  bookId: string;
  title: string;
  cover_url: string | null;
  open_library_id: string | null;
  author: string | null;
  notes: NoteLog[];
  totalPages: number;
};

export default async function CatatanPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();

  const { data: rawNotes } = await supabase
    .from("reading_logs")
    .select("id, note, pages_read, from_page, to_page, images, log_date, created_at, shelf_items(book_id, books(id, title, cover_url, open_library_id, author, slug))")
    .eq("member_id", session.memberId)
    .not("note", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  const allNotes = ((rawNotes ?? []) as unknown as NoteLog[])
    .filter((n) => n.note?.trim() && n.shelf_items?.books?.id);

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <CatatanClient notes={allNotes} />
      </main>
    </div>
  );
}
