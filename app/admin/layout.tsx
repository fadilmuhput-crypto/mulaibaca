import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/masuk");
  if (!session.isCmsAdmin) redirect("/dashboard");

  return (
    <div className="min-h-screen">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
            <span className="font-display font-bold text-forest text-lg">mulaibaca</span>
            <span className="text-[10px] font-bold text-white bg-amber px-2 py-0.5 rounded uppercase tracking-wider">
              admin
            </span>
          </Link>
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-1 min-w-max">
              <Link href="/admin/buku" className="nav-chip">Buku</Link>
              <Link href="/admin/members" className="nav-chip">Anggota</Link>
              <Link href="/admin/review" className="nav-chip">Review</Link>
              <Link href="/admin/jelajah" className="nav-chip">Jelajah</Link>
              <Link href="/admin/blog" className="nav-chip">Blog</Link>
              <Link href="/admin/bantuan" className="nav-chip">Bantuan</Link>
              <Link href="/admin/feedback" className="nav-chip">Feedback</Link>
              <Link href="/admin/metrics" className="nav-chip">📊 Metrics</Link>
              <Link href="/admin/threads" className="nav-chip">Threads</Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-medium text-amber hover:text-amber-hover transition-colors flex-shrink-0"
          >
            ← Dashboard
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
