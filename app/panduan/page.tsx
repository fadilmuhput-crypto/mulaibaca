import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-route";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Panduan — Mulaibaca",
  description: "Panduan lengkap menggunakan Mulaibaca. Pelajari cara membuat Family Space, menambahkan buku, dan mencatat progres bacaan keluarga.",
  alternates: { canonical: "https://mulaibaca.id/panduan" },
  openGraph: {
    title: "Panduan — Mulaibaca",
    description: "Panduan lengkap menggunakan Mulaibaca.",
    url: "https://mulaibaca.id/panduan",
  },
  twitter: {
    card: "summary",
    title: "Panduan — Mulaibaca",
    description: "Panduan lengkap menggunakan Mulaibaca.",
  },
};

type Guide = {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
};

export default async function PanduanPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("help_guides")
    .select("id, title, content, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const guides = (data ?? []) as Guide[];

  return (
    <div className="min-h-dvh bg-parchment">
      <header className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl font-display font-bold text-forest">mulaibaca</Link>
          <span className="text-xs text-ink-muted">/ panduan</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-10">
        <div>
          <h1 className="text-h1">Panduan</h1>
          <p className="text-sm text-ink-muted mt-1">Semua yang perlu kamu tahu tentang Mulaibaca</p>
        </div>

        {guides.length > 0 ? (
          <div className="space-y-6">
            {guides.map((guide, idx) => (
              <section key={guide.id}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-6 rounded-full bg-amber text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h2 className="text-h2">{guide.title}</h2>
                </div>

                {guide.image_url && (
                  <div className="rounded-2xl overflow-hidden border border-border mb-4">
                    <Image
                      src={guide.image_url}
                      alt={guide.title}
                      width={600}
                      height={300}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {guide.content && (
                  <div className="bg-surface rounded-xl border border-border p-4">
                    <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-wrap">{guide.content}</p>
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border py-12 text-center">
            <p className="text-sm text-ink-muted">Panduan akan segera hadir.</p>
          </div>
        )}

        <div className="bg-amber-soft rounded-2xl border border-amber/30 p-5 text-center space-y-3">
          <p className="font-semibold text-ink">Masih punya pertanyaan?</p>
          <Link href="/bantuan" className="btn-primary inline-flex">Hubungi kami</Link>
        </div>
      </main>
    </div>
  );
}
