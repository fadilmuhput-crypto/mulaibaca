import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-route";
import { getSession } from "@/lib/session";
import { CATEGORY_TREE, findSubCategory, findParentOfSub } from "@/lib/category-tree";
import BookCover from "@/components/BookCover";
import type { Book } from "@/lib/books";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const parent = CATEGORY_TREE.find((c) => c.key === slug);
  const sub = findSubCategory(slug);
  const label = parent?.label ?? sub?.label ?? slug;
  const url = `https://mulaibaca.id/kategori/${slug}`;
  return {
    title: `${label} — Mulaibaca`,
    description: `Temukan dan baca buku ${label.toLowerCase()} favoritmu di Mulaibaca.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${label} — Mulaibaca`,
      description: `Temukan dan baca buku ${label.toLowerCase()} favoritmu di Mulaibaca.`,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${label} — Mulaibaca`,
      description: `Temukan dan baca buku ${label.toLowerCase()} favoritmu di Mulaibaca.`,
    },
  };
}

export default async function KategoriPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  const { slug } = await params;

  const parent = CATEGORY_TREE.find((c) => c.key === slug);
  const sub = findSubCategory(slug);
  const parentOfSub = sub ? findParentOfSub(slug) : null;

  if (!parent && !sub) notFound();

  const matchTags = parent?.matchTags ?? sub?.matchTags ?? [];
  const label = parent?.label ?? sub?.label ?? slug;

  const admin = createAdminClient();
  const { data: books } = await admin
    .from("books")
    .select("id,title,author,cover_url,open_library_id,total_pages,description,categories,tags")
    .eq("is_active", true)
    .order("title", { ascending: true });

  const matched = (books ?? []).filter((b: { categories?: string[]; tags?: string[] }) =>
    matchTags.some((t) => (b.categories ?? []).includes(t) || (b.tags ?? []).includes(t))
  ) as Book[];

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Link
          href={parentOfSub ? `/kategori/${parentOfSub.key}` : "/jelajah"}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-secondary hover:text-ink rounded-xl"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <div>
          <h1 className="text-h1">{label}</h1>
          {parentOfSub && !parent && (
            <p className="text-xs text-ink-muted mt-0.5">{parentOfSub.label}</p>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {parent?.children && parent.children.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-4 -mx-4 px-4">
            {parent.children.map((child) => (
              <Link
                key={child.key}
                href={`/kategori/${child.key}`}
                className="flex-shrink-0 px-4 py-2 rounded-xl border-2 border-border text-xs font-semibold text-ink-secondary hover:border-amber/50 transition-colors"
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-ink-muted">{matched.length} buku</p>
        </div>

        {matched.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl mb-3">📭</p>
            <p className="text-sm font-semibold text-ink mb-1">Belum ada buku di kategori ini</p>
            <p className="text-xs text-ink-muted">Buku akan muncul setelah di-enrich dengan kategori yang sesuai</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-x-3 gap-y-5">
            {matched.map((b) => {
              const card = {
                id: b.id ?? "",
                title: b.title,
                author: b.author,
                cover_url: b.cover_url,
                open_library_id: b.open_library_id,
                total_pages: b.total_pages,
                description: b.description ?? "",
                tags: b.categories ?? [],
                isLokal: false,
              };
              const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(card.id);
              const href = isUUID || /^OL\d+/i.test(card.id)
                ? `/buku/${card.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60)}-${card.id.toLowerCase()}`
                : `/buku/${card.id}`;

              return (
                <div key={b.id} className="flex flex-col">
                  <Link href={href}>
                    <BookCover src={b.cover_url} title={b.title} className="w-full h-[120px] rounded-xl" />
                  </Link>
                  <Link href={href} className="hover:text-amber transition-colors">
                    <p className="text-[11px] font-semibold text-ink line-clamp-2 leading-snug mt-1.5">{b.title}</p>
                  </Link>
                  <p className="text-[10px] text-ink-muted truncate mt-0.5">{b.author}</p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
