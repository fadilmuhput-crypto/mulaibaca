import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import NavBar from "@/components/NavBar";
import BookCover from "@/components/BookCover";
import { BookOpen, ChevronRight } from "lucide-react";

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
    .select("id, note, pages_read, images, log_date, created_at, shelf_items(book_id, books(id, title, cover_url, open_library_id, author))")
    .eq("member_id", session.memberId)
    .not("note", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  const allNotes = ((rawNotes ?? []) as unknown as NoteLog[])
    .filter((n) => n.note?.trim() && n.shelf_items?.books?.id);

  const groups = new Map<string, BookGroup>();
  for (const note of allNotes) {
    const book = note.shelf_items!.books!;
    const key = book.id;
    if (!groups.has(key)) {
      groups.set(key, {
        bookId: book.id,
        title: book.title,
        cover_url: book.cover_url,
        open_library_id: book.open_library_id,
        author: book.author,
        notes: [],
        totalPages: 0,
      });
    }
    const group = groups.get(key)!;
    group.notes.push(note);
    group.totalPages += note.pages_read;
  }

  const groupedNotes = Array.from(groups.values());

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-h1">Catatan Bacaan</h1>
            <p className="text-sm text-ink-muted mt-0.5">
              {allNotes.length} catatan dari {groupedNotes.length} buku
            </p>
          </div>
          <Link href="/log" className="btn-ghost-ink px-3 py-2 text-sm">
            + Tulis log
          </Link>
        </div>

        {groupedNotes.length === 0 ? (
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
          <div className="space-y-6">
            {groupedNotes.map((group) => (
              <div key={group.bookId}>
                <Link
                  href={bookUrl(group.title, group.open_library_id)}
                  className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity group"
                >
                  <BookCover
                    src={group.cover_url}
                    title={group.title}
                    className="w-10 h-14 rounded-xl flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink truncate group-hover:text-amber transition-colors">
                      {group.title}
                    </p>
                    {group.author && (
                      <p className="text-xs text-ink-muted truncate">{group.author}</p>
                    )}
                    <p className="text-xs text-ink-muted mt-0.5">
                      {group.notes.length} catatan · {group.totalPages} halaman
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    strokeWidth={2}
                    className="text-ink-muted flex-shrink-0 group-hover:text-amber transition-colors"
                  />
                </Link>

                <div className="space-y-2">
                  {group.notes.map((log) => {
                    const dateLabel = formatDate(log.log_date, log.created_at);
                    return (
                      <div
                        key={log.id}
                        className="bg-surface rounded-xl brutal-border p-3 space-y-2"
                      >
                        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                          {log.note}
                        </p>
                        {(() => {
                          const imgs = log.images ?? [];
                          if (imgs.length === 0) return null;
                          return (
                            <div className="flex gap-1.5 flex-wrap">
                              {imgs.map((url, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover border border-border" />
                              ))}
                            </div>
                          );
                        })()}
                        <div className="flex items-center justify-between text-xs text-ink-muted pt-1 border-t border-border">
                          <span>{dateLabel}</span>
                          <span className="font-semibold text-amber">+{log.pages_read} hal</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
