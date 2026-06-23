import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { createClient } from "@/lib/supabase-server";
import NavBar from "@/components/NavBar";
import EmailVerifyBanner from "@/components/EmailVerifyBanner";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  const supabase = await createClient();

  const [{ data: shelf }, { data: familyMembers }, { data: streaks }] = await Promise.all([
    supabase
      .from("shelf_items")
      .select("*, books(*)")
      .eq("member_id", session.memberId)
      .eq("status", "reading")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("members")
      .select("id, name, avatar")
      .eq("family_id", session.familyId),
    supabase
      .from("streaks")
      .select("*")
      .eq("member_id", session.memberId)
      .maybeSingle(),
  ]);

  const currentStreak = streaks?.current_streak ?? 0;
  const readingNow = shelf ?? [];

  return (
    <div className="min-h-screen bg-parchment pb-20 sm:pb-0">
      <NavBar session={session} />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Greeting + streak */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">
              Halo, {session.memberName}!
            </h1>
            <p className="text-ink-secondary text-sm mt-0.5">{session.familyName}</p>
          </div>
          <div className="text-center bg-surface rounded-2xl border border-border px-4 py-2">
            <div className="text-2xl">🔥</div>
            <div className="text-xl font-bold text-ink leading-none">{currentStreak}</div>
            <div className="text-[10px] text-ink-muted mt-0.5">hari</div>
          </div>
        </div>

        {/* Currently reading */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink">Sedang dibaca</h2>
            <Link href="/rak" className="text-sm text-amber hover:text-amber-hover">
              Lihat semua →
            </Link>
          </div>

          {readingNow.length === 0 ? (
            <Link
              href="/rak/tambah"
              className="block border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-amber transition-colors"
            >
              <div className="text-3xl mb-2">📖</div>
              <p className="text-ink-secondary text-sm">Belum ada buku yang dibaca</p>
              <p className="text-amber text-sm font-medium mt-1">+ Tambah buku</p>
            </Link>
          ) : (
            <div className="space-y-3">
              {readingNow.map((item: {
                id: string;
                current_page: number;
                books: { title: string; author: string | null; cover_url: string | null; total_pages: number | null } | null;
              }) => {
                const book = item.books;
                if (!book) return null;
                const progress =
                  book.total_pages && item.current_page
                    ? Math.min(Math.round((item.current_page / book.total_pages) * 100), 100)
                    : 0;
                return (
                  <Link
                    key={item.id}
                    href={`/rak`}
                    className="flex gap-3 bg-surface rounded-2xl border border-border p-3 hover:border-amber/50 transition-colors"
                  >
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📗</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink text-sm truncate">{book.title}</p>
                      {book.author && (
                        <p className="text-xs text-ink-muted truncate">{book.author}</p>
                      )}
                      <div className="mt-2">
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-ink-muted mt-1">
                          {progress > 0
                            ? `${item.current_page} / ${book.total_pages} hal`
                            : "Belum mulai"}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Family members */}
        {familyMembers && familyMembers.length > 1 && (
          <section>
            <h2 className="font-semibold text-ink mb-3">Anggota keluarga</h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {familyMembers.map((m: { id: string; name: string; avatar: string }) => (
                <div key={m.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${
                    m.id === session.memberId ? "border-amber bg-amber-soft" : "border-border bg-surface"
                  }`}>
                    {m.avatar}
                  </div>
                  <span className="text-xs text-ink-secondary max-w-[48px] truncate text-center">{m.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick actions */}
        <section className="grid grid-cols-2 gap-3">
          <Link
            href="/rak/tambah"
            className="bg-forest text-white rounded-2xl p-4 flex flex-col gap-2 hover:bg-forest-dark transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span className="font-medium text-sm">Tambah Buku</span>
          </Link>
          <Link
            href="/log"
            className="bg-amber text-white rounded-2xl p-4 flex flex-col gap-2 hover:bg-amber-hover transition-colors"
          >
            <span className="text-2xl">📝</span>
            <span className="font-medium text-sm">Catat Bacaan</span>
          </Link>
        </section>

        {/* Invite code */}
        {session.inviteCode && (
          <section className="bg-amber-soft rounded-2xl border border-amber/20 p-4">
            <p className="text-xs font-semibold text-amber uppercase tracking-wide mb-1">
              Kode undangan keluarga
            </p>
            <p className="text-ink-muted text-xs mb-2">
              Bagikan kode ini agar anggota keluarga bisa bergabung
            </p>
            <p className="font-mono text-2xl font-bold text-ink tracking-widest uppercase">
              {session.inviteCode}
            </p>
          </section>
        )}

        {/* Email verification status */}
        {!session.emailVerified && (
          <EmailVerifyBanner email={session.email} />
        )}
      </main>
    </div>
  );
}
