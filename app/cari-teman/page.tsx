import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import NavBar from "@/components/NavBar";
import FindFriends from "@/components/FindFriends";

export default async function CariTemanPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">
            <path d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          <h1 className="text-sm font-black uppercase tracking-widest text-ink-muted">Cari Teman</h1>
        </div>
        <FindFriends memberId={session.memberId} />
      </main>
    </div>
  );
}
