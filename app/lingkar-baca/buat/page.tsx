import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import BuatLingkarForm from "./BuatLingkarForm";

export const metadata: Metadata = {
  title: "Buat Lingkar Baca Baru",
};

export default async function BuatLingkarPage() {
  const session = await getSession();
  if (!session) redirect("/masuk");

  if (session.familyId) {
    redirect("/lingkar-baca/saya");
  }

  return (
    <div className="min-h-dvh bg-parchment">
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/lingkar-baca" className="p-2 -ml-2 rounded-lg hover:bg-parchment transition-colors">
          <ChevronLeft size={20} strokeWidth={2} className="text-ink" />
        </Link>
        <h1 className="font-semibold text-ink">Buat Lingkar Baca Baru</h1>
      </header>
      <BuatLingkarForm />
    </div>
  );
}
