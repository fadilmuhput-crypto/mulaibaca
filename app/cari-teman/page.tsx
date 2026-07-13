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
        <FindFriends memberId={session.memberId} />
      </main>
    </div>
  );
}
