import { createAdminClient } from "@/lib/supabase-route";
import FaqAdminClient from "./FaqAdminClient";
import PanduanAdminClient from "./PanduanAdminClient";

export type HelpFaq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

export type HelpGuide = {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export default async function BantuanAdminPage() {
  const admin = createAdminClient();

  const [{ data: faqs }, { data: guides }] = await Promise.all([
    admin.from("help_faqs").select("id, question, answer, sort_order, is_active").order("sort_order", { ascending: true }),
    admin.from("help_guides").select("id, title, content, image_url, sort_order, is_active").order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold text-ink mb-1">Konten Bantuan</h1>
        <p className="text-sm text-ink-muted">Kelola FAQ dan panduan yang tampil di halaman publik</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-lg font-bold text-ink">FAQ</h2>
            <span className="text-xs bg-border text-ink-muted px-2 py-0.5 rounded-full font-medium">
              {(faqs ?? []).length} item
            </span>
          </div>
          <FaqAdminClient initialFaqs={(faqs ?? []) as HelpFaq[]} />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-lg font-bold text-ink">Panduan</h2>
            <span className="text-xs bg-border text-ink-muted px-2 py-0.5 rounded-full font-medium">
              {(guides ?? []).length} item
            </span>
          </div>
          <PanduanAdminClient initialGuides={(guides ?? []) as HelpGuide[]} />
        </section>
      </div>

      <div className="bg-amber-soft border border-amber/30 rounded-2xl p-5">
        <p className="text-sm font-semibold text-ink mb-1">SQL Migration</p>
        <p className="text-xs text-ink-muted mb-3">Jalankan SQL ini di Supabase jika tabel belum ada:</p>
        <pre className="text-[11px] bg-surface border border-border rounded-xl p-4 overflow-x-auto text-ink-secondary leading-relaxed">
{`CREATE TABLE IF NOT EXISTS help_faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS help_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);`}
        </pre>
      </div>
    </div>
  );
}
