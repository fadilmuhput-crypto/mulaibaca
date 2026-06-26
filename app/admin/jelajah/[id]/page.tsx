import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-route";
import type { JelajahSection } from "@/lib/jelajah-sections";
import type { AdminBook } from "@/app/admin/buku/page";
import SectionEditClient from "./SectionEditClient";

export default async function EditSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: section }, { data: sectionBooks }, { data: allBooks }] = await Promise.all([
    admin.from("jelajah_sections").select("*").eq("id", id).single(),
    admin
      .from("jelajah_section_books")
      .select("sort_order, curated_books(*)")
      .eq("section_id", id)
      .order("sort_order", { ascending: true }),
    admin
      .from("curated_books")
      .select("*")
      .eq("is_active", true)
      .order("title", { ascending: true }),
  ]);

  if (!section) notFound();

  const linkedBooks = (sectionBooks ?? []).map(
    (sb: { sort_order: number; curated_books: unknown }) => sb.curated_books as AdminBook
  );

  return (
    <SectionEditClient
      section={section as JelajahSection}
      linkedBooks={linkedBooks}
      allBooks={(allBooks ?? []) as AdminBook[]}
    />
  );
}
