import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/masuk");
  if (session.memberRole !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-parchment">
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-forest text-lg">mulaibaca</span>
            <span className="text-[10px] font-bold text-white bg-amber px-2 py-0.5 rounded uppercase tracking-wider">
              admin
            </span>
          </div>
          <nav className="flex items-center gap-5">
            <Link
              href="/admin/buku"
              className="text-sm font-medium text-ink-secondary hover:text-ink transition-colors"
            >
              Kurasi Buku
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-amber hover:text-amber-hover transition-colors"
            >
              ← Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
