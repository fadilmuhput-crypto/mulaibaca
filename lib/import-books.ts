import { createClient } from "@supabase/supabase-js";

const OL_SEARCH = "https://openlibrary.org/search.json";

const SEARCH_QUERIES = [
  // ── Anak & Pendidikan ──
  { q: "buku anak indonesia", limit: 20 },
  { q: "cerita rakyat indonesia", limit: 20 },
  { q: "dongeng nusantara", limit: 20 },
  { q: "buku islami anak", limit: 15 },
  { q: "komik anak indonesia", limit: 15 },
  { q: "ensiklopedia anak", limit: 15 },
  { q: "buku paud", limit: 15 },
  { q: "cerita bergambar anak", limit: 20 },
  { q: "buku cerita sebelum tidur", limit: 15 },
  { q: "fabel nusantara", limit: 15 },
  { q: "buku motivasi anak", limit: 15 },
  { q: "buku pendidikan anak", limit: 15 },
  { q: "mitos legenda indonesia", limit: 15 },

  // ── Novel & Fiksi Indonesia ──
  { q: "novel indonesia", limit: 20 },
  { q: "fiksi indonesia sastra", limit: 20 },
  { q: "cerpen indonesia", limit: 15 },
  { q: "novel terjemahan best seller", limit: 15 },
  { q: "sastra indonesia klasik", limit: 15 },

  // ── Penulis Populer Indonesia ──
  { q: "Tere Liye novel", limit: 10 },
  { q: "Andrea Hirata", limit: 10 },
  { q: "Dewi Lestari novel", limit: 10 },
  { q: "Eka Kurniawan", limit: 10 },
  { q: "Habiburrahman Shirazy", limit: 10 },
  { q: "Pramoedya Ananta Toer", limit: 10 },
  { q: "Ahmad Tohari", limit: 10 },
  { q: "Leila S. Chudori", limit: 10 },

  // ── Non-Fiksi Populer ──
  { q: "pengembangan diri", limit: 15 },
  { q: "self help indonesia", limit: 15 },
  { q: "psikologi populer", limit: 15 },
  { q: "bisnis indonesia", limit: 15 },
  { q: "parenting indonesia", limit: 15 },
  { q: "kesehatan mental", limit: 10 },
  { q: "keuangan pribadi", limit: 10 },
  { q: "produktivitas", limit: 10 },

  // ── Agama & Spiritualitas ──
  { q: "islam indonesia", limit: 15 },
  { q: "doa anak muslim", limit: 10 },
  { q: "kisah nabi anak", limit: 10 },
  { q: "christianity indonesia", limit: 10 },

  // ── Referensi & Pendidikan ──
  { q: "bahasa inggris pemula", limit: 10 },
  { q: "matematika anak", limit: 10 },
  { q: "sains anak", limit: 10 },
  { q: "sejarah indonesia", limit: 15 },

  // ── Genre Spesifik ──
  { q: "komik manga terjemahan", limit: 10 },
  { q: "fantasi indonesia", limit: 10 },
  { q: "horor indonesia", limit: 10 },
  { q: "romance indonesia", limit: 10 },
  { q: "thriller indonesia", limit: 10 },

  // ── Buku Dunia (Terjemahan) ──
  { q: "children classic literature", limit: 15 },
  { q: "young adult fiction", limit: 15 },
  { q: "science fiction classic", limit: 10 },
  { q: "fantasy novel bestseller", limit: 10 },
];

type OLSeachDoc = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function importBooksFromOL(queries?: { q: string; limit: number }[]) {
  const list = queries ?? SEARCH_QUERIES;
  const supabase = buildSupabase();

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Pre-fetch existing OL IDs to skip early
  const { data: existingRows } = await supabase
    .from("books")
    .select("open_library_id")
    .not("open_library_id", "is", null);
  const existingOlIds = new Set((existingRows ?? []).map((r) => r.open_library_id));

  for (const sq of list) {
    const fields = "key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median";
    const url = `${OL_SEARCH}?q=${encodeURIComponent(sq.q)}&limit=${sq.limit}&fields=${fields}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        errors.push(`OL search "${sq.q}" returned ${res.status}`);
        await sleep(600);
        continue;
      }

      const data = await res.json();
      const docs: OLSeachDoc[] = data.docs ?? [];

      for (const doc of docs) {
        const olId = doc.key.replace("/works/", "");

        if (existingOlIds.has(olId)) {
          skipped++;
          continue;
        }

        const book = {
          title: doc.title,
          author: doc.author_name?.[0] ?? "Unknown",
          cover_url: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : null,
          isbn: doc.isbn?.[0] ?? null,
          open_library_id: olId,
          total_pages: doc.number_of_pages_median ?? null,
          published_year: doc.first_publish_year ?? null,
          enrichment_status: "pending",
          language: "id",
          is_active: true,
          source: "cron",
        };

        const { error: insertErr } = await supabase.from("books").insert(book);
        if (insertErr) {
          errors.push(`Insert "${doc.title}": ${insertErr.message}`);
        } else {
          imported++;
          existingOlIds.add(olId);
        }
      }

      await sleep(600);
    } catch (err) {
      errors.push(`Error searching "${sq.q}": ${err instanceof Error ? err.message : String(err)}`);
      await sleep(600);
    }
  }

  return { imported, skipped, errors };
}
