import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-route";
import { CATEGORY_TREE } from "@/lib/category-tree";

export const metadata: Metadata = {
  title: "Kategori Buku — Mulaibaca",
  description: "Jelajahi ribuan buku Indonesia berdasarkan kategori. Temukan buku anak, fiksi, nonfiksi, agama, dan berbagai genre lainnya.",
  alternates: { canonical: "https://mulaibaca.id/kategori" },
  openGraph: {
    title: "Kategori Buku — Mulaibaca",
    description: "Jelajahi ribuan buku Indonesia berdasarkan kategori.",
    url: "https://mulaibaca.id/kategori",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kategori Buku — Mulaibaca",
    description: "Jelajahi ribuan buku Indonesia berdasarkan kategori.",
  },
};

export default async function KategoriOverviewPage() {
  const admin = createAdminClient();
  const { data: books } = await admin.from("books").select("categories").eq("is_active", true);
  const allTags = (books ?? []).flatMap((b) => (b.categories ?? []) as string[]);

  function count(matchTags: string[]) {
    return allTags.filter((t) => matchTags.includes(t)).length;
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-surface border-b border-border px-4 py-3 sticky top-0 z-10">
        <h1 className="text-h1">Kategori Buku</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {CATEGORY_TREE.map((cat) => (
          <section key={cat.key}>
            <div className="flex items-center justify-between mb-3">
              <Link href={`/kategori/${cat.key}`} className="text-h3 hover:text-amber transition-colors">
                {cat.label}
              </Link>
              <span className="text-xs text-ink-muted">{count(cat.matchTags)} buku</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {cat.children.map((sub) => {
                const c = count(sub.matchTags);
                return (
                  <Link
                    key={sub.key}
                    href={`/kategori/${sub.key}`}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                      c > 0
                        ? "border-border bg-surface text-ink-secondary hover:border-amber/50 hover:text-ink"
                        : "border-border/40 text-ink-muted/40 cursor-default"
                    }`}
                  >
                    {sub.label} ({c})
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
