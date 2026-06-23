import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import NavBar from "@/components/NavBar";
import ProfilClient from "./ProfilClient";

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  return (
    <div className="min-h-screen bg-parchment pb-20 sm:pb-0">
      <NavBar session={session} />
      <main className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-display font-bold text-ink mb-6">Profil & Keluarga</h1>
        <ProfilClient session={session} />
      </main>
    </div>
  );
}
