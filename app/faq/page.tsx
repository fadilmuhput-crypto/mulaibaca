import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-route";
import FaqAccordion from "./FaqAccordion";

export const revalidate = 60;

export default async function FAQPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("help_faqs")
    .select("id, question, answer")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const faqs = (data ?? []) as { id: string; question: string; answer: string }[];

  return (
    <div className="min-h-dvh bg-parchment">
      <header className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl font-display font-bold text-forest">mulaibaca</Link>
          <span className="text-xs text-ink-muted">/ faq</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-h1">FAQ</h1>
          <p className="text-sm text-ink-muted mt-1">Pertanyaan yang sering diajukan</p>
        </div>

        {faqs.length > 0 ? (
          <FaqAccordion faqs={faqs} />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border py-12 text-center">
            <p className="text-sm text-ink-muted">FAQ akan segera hadir.</p>
          </div>
        )}

        <div className="bg-amber-soft rounded-2xl border border-amber/30 p-5 text-center space-y-3">
          <p className="font-semibold text-ink">Tidak menemukan jawaban?</p>
          <Link href="/bantuan" className="btn-primary inline-flex">Hubungi kami</Link>
        </div>
      </main>
    </div>
  );
}
