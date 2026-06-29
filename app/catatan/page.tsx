import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import NavBar from "@/components/NavBar";
import BookCover from "@/components/BookCover";
import { BookOpen } from "lucide-react";

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

type NoteLog = {
  id: string;
  note: string;
  pages_read: number;
  log_date: string | null;
  created_at: string;
  shelf_items: {
    books: {
      title: string;
      cover_url: string | null;
      open_library_id: string | null;
      author: string | null;
    } | null;
  } | null;
};

export default async function CatatanPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();

  const { data: rawNotes } = await supabase
    .from("reading_logs")
    .select("id, note, pages_read, log_date, created_at, shelf_items(books(title, cover_url, open_library_id, author))")
    .eq("member_id", session.memberId)
    .not("note", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  const notes = ((rawNotes ?? []) as unknown as NoteLog[]).filter((n) => n.note?.trim());

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-h1">Catatan Bacaan</h1>
            <p className="text-sm text-ink-muted mt-0.5">{notes.length} catatan tersimpan</p>
          </div>
          <Link href="/log" className="btn-ghost-ink px-3 py-2 text-sm">
            + Tulis log
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center text-ink-muted mb-3">
              <BookOpen size={40} strokeWidth={1.5} />
            </div>
            <p className="text-ink-secondary font-medium">Belum ada catatan</p>
            <p className="text-sm text-ink-muted mt-1 mb-4">
              Tambahkan catatan saat kamu mengisi log bacaan harian
            </p>
            <Link href="/log" className="btn-primary px-5 py-2 text-sm">
              Catat bacaan sekarang →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((log) => {
              const book = log.shelf_items?.books;
              const dateLabel = formatDate(log.log_date, log.created_at);
              return (
                <div
                  key={log.id}
                  className="bg-surface rounded-2xl brutal-border p-4 space-y-3"
                >
                  {/* Book info header */}
                  {book && (
                    <Link
                      href={bookUrl(book.title, book.open_library_id)}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <BookCover
                        src={book.cover_url}
                        title={book.title}
                        className="w-8 h-11 rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{book.title}</p>
                        {book.author && (
                          <p className="text-xs text-ink-muted truncate">{book.author}</p>
                        )}
                      </div>
                    </Link>
                  )}

                  {/* Note text */}
                  <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                    {log.note}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-ink-muted pt-1 border-t border-border">
                    <span>{dateLabel}</span>
                    <span className="font-semibold text-amber">+{log.pages_read} hal</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
