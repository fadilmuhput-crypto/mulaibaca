import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import NavBar from "@/components/NavBar";
import CariTemanClient from "./CariTemanClient";

export default async function CariTemanPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  return (
    <div className="pb-24">
      <NavBar session={session} />
      <main className="px-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-lg font-bold text-ink mb-1">Cari Teman</h1>
        <p className="text-sm text-ink-muted mb-4">Temukan pengguna lain untuk diikuti</p>
        <CariTemanClient viewerMemberId={session.memberId} />
      </main>
    </div>
  );
}
