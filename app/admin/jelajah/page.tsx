import { createAdminClient } from "@/lib/supabase-route";
import type { JelajahSection } from "@/lib/jelajah-sections";
import JelajahSectionsClient from "./JelajahSectionsClient";

export default async function AdminJelajahPage() {
  const admin = createAdminClient();
  const { data: sections } = await admin
    .from("jelajah_sections")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-h1">Halaman Jelajah</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Atur section yang tampil di halaman /jelajah
          </p>
        </div>
      </div>
      <JelajahSectionsClient initialSections={(sections ?? []) as JelajahSection[]} />
    </div>
  );
}
