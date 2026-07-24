import { createClient } from "@supabase/supabase-js";

const OL_SEARCH = "https://openlibrary.org/search.json";
const GB_SEARCH = "https://www.googleapis.com/books/v1/volumes";

function buildSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function cleanISBN(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/^="|"$|="|"/g, "").trim();
  if (!cleaned || cleaned === '""' || cleaned === "=\"\"") return null;
  if (/^\d{10}(\d{3})?$/.test(cleaned)) return cleaned;
  return null;
}

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
  books: { title: string; author: string; status: "imported" | "skipped" | "error"; error?: string }[];
};

type GoodreadsData = {
  isbn: string | null;
  title: string | null;
  author: string | null;
  coverUrl: string | null;
};

type BookData = {
  title: string;
  author: string;
  cover_url: string | null;
  isbn: string | null;
  open_library_id: string | null;
  total_pages: number | null;
  published_year: number | null;
  description: string | null;
  language: string | null;
};

export async function extractISBNFromGoodreads(url: string): Promise<GoodreadsData> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return { isbn: null, title: null, author: null, coverUrl: null };
    }

    const html = await res.text();

    let isbn: string | null = null;
    let title: string | null = null;
    let author: string | null = null;
    let coverUrl: string | null = null;

    const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const ld = JSON.parse(jsonLdMatch[1]);
        isbn = cleanISBN(ld.isbn);
        title = ld.name ?? null;
        author = typeof ld.author === "string" ? ld.author : (ld.author?.name ?? null);
      } catch {
        // JSON parse error, continue with other methods
      }
    }

    if (!title) {
      const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"/i);
      if (ogTitle) title = ogTitle[1];
    }

    if (!author) {
      const authorMeta = html.match(/<meta[^>]*name="author"[^>]*content="([^"]*)"/i);
      if (authorMeta) author = authorMeta[1];
    }

    if (!coverUrl) {
      const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i);
      if (ogImage) coverUrl = ogImage[1];
    }

    if (!isbn) {
      const isbnMatch = html.match(/isbn(?:13)?["\s:=]+(\d{10,13})/i);
      if (isbnMatch) isbn = cleanISBN(isbnMatch[1]);
    }

    return { isbn, title, author, coverUrl };
  } catch {
    return { isbn: null, title: null, author: null, coverUrl: null };
  }
}

async function lookupByISBNOL(isbn: string): Promise<BookData | null> {
  const fields = "key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median";
  const url = `${OL_SEARCH}?isbn=${isbn}&fields=${fields}&limit=1`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = await res.json();
    const doc = data.docs?.[0];
    if (!doc) return null;

    return {
      title: doc.title,
      author: doc.author_name?.[0] ?? "Unknown",
      cover_url: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      isbn: isbn,
      open_library_id: doc.key.replace("/works/", ""),
      total_pages: doc.number_of_pages_median ?? null,
      published_year: doc.first_publish_year ?? null,
      description: null,
      language: "id",
    };
  } catch {
    return null;
  }
}

async function lookupByISBNGB(isbn: string): Promise<BookData | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = `${GB_SEARCH}?q=isbn:${isbn}&maxResults=1${apiKey ? `&key=${apiKey}` : ""}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    const vi = item.volumeInfo;
    return {
      title: vi.title ?? "Unknown",
      author: vi.authors?.[0] ?? "Unknown",
      cover_url: vi.imageLinks?.thumbnail ?? null,
      isbn: isbn,
      open_library_id: null,
      total_pages: vi.pageCount ?? null,
      published_year: parseInt(vi.publishedDate) || null,
      description: vi.description ?? null,
      language: vi.language ?? "id",
    };
  } catch {
    return null;
  }
}

async function lookupByTitleOL(title: string, author: string | null): Promise<BookData | null> {
  const q = author ? `${title} ${author}` : title;
  const fields = "key,title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median";
  const url = `${OL_SEARCH}?q=${encodeURIComponent(q)}&fields=${fields}&limit=1`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = await res.json();
    const doc = data.docs?.[0];
    if (!doc) return null;

    const isbn = doc.isbn?.[0] ?? null;
    return {
      title: doc.title,
      author: doc.author_name?.[0] ?? "Unknown",
      cover_url: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
      isbn: isbn,
      open_library_id: doc.key.replace("/works/", ""),
      total_pages: doc.number_of_pages_median ?? null,
      published_year: doc.first_publish_year ?? null,
      description: null,
      language: "id",
    };
  } catch {
    return null;
  }
}

async function lookupByTitleGB(title: string, author: string | null): Promise<BookData | null> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const q = author ? `intitle:${title}+inauthor:${author}` : `intitle:${title}`;
  const url = `${GB_SEARCH}?q=${encodeURIComponent(q)}&maxResults=1${apiKey ? `&key=${apiKey}` : ""}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    const vi = item.volumeInfo;
    const isbn13 = vi.industryIdentifiers?.find((i: { type: string }) => i.type === "ISBN_13")?.identifier;
    const isbn10 = vi.industryIdentifiers?.find((i: { type: string }) => i.type === "ISBN_10")?.identifier;

    return {
      title: vi.title ?? "Unknown",
      author: vi.authors?.[0] ?? "Unknown",
      cover_url: vi.imageLinks?.thumbnail ?? null,
      isbn: isbn13 ?? isbn10 ?? null,
      open_library_id: null,
      total_pages: vi.pageCount ?? null,
      published_year: parseInt(vi.publishedDate) || null,
      description: vi.description ?? null,
      language: vi.language ?? "id",
    };
  } catch {
    return null;
  }
}

export async function importGoodreadsUrls(urls: string[]): Promise<ImportResult> {
  const supabase = buildSupabase();

  const { data: existingIsbnRows } = await supabase
    .from("books")
    .select("isbn")
    .not("isbn", "is", null);
  const existingIsbns = new Set((existingIsbnRows ?? []).map((r) => r.isbn));

  const { data: existingOlRows } = await supabase
    .from("books")
    .select("open_library_id")
    .not("open_library_id", "is", null);
  const existingOlIds = new Set((existingOlRows ?? []).map((r) => r.open_library_id));

  const { data: existingTaRows } = await supabase
    .from("books")
    .select("title,author");
  const existingTaKeys = new Set(
    (existingTaRows ?? []).map((r) => `${r.title?.toLowerCase().trim()}|${r.author?.toLowerCase().trim()}`)
  );
  const existingTitleKeys = new Set(
    (existingTaRows ?? []).map((r) => r.title?.toLowerCase().trim())
  );

  const result: ImportResult = { imported: 0, skipped: 0, errors: [], books: [] };

  for (const rawUrl of urls) {
    const url = rawUrl.trim();
    if (!url) continue;

    const isISBN = /^\d{10}(\d{3})?$/.test(url);

    let bookData: BookData | null = null;
    let grData: GoodreadsData | null = null;

    if (isISBN) {
      bookData = await lookupByISBNOL(url);
      if (!bookData) bookData = await lookupByISBNGB(url);
      if (bookData && existingIsbns.has(bookData.isbn)) {
        result.skipped++;
        result.books.push({ title: bookData.title, author: bookData.author, status: "skipped", error: "Sudah ada di catalog" });
        await sleep(500);
        continue;
      }
    } else {
      grData = await extractISBNFromGoodreads(url);

      if (grData.isbn && existingIsbns.has(grData.isbn)) {
        result.skipped++;
        result.books.push({ title: grData.title ?? "Unknown", author: grData.author ?? "Unknown", status: "skipped", error: "Sudah ada di catalog" });
        await sleep(500);
        continue;
      }

      if (grData.isbn) {
        bookData = await lookupByISBNOL(grData.isbn);
        if (!bookData) bookData = await lookupByISBNGB(grData.isbn);
      }

      if (!bookData && grData.title) {
        bookData = await lookupByTitleOL(grData.title, grData.author);
        if (!bookData) bookData = await lookupByTitleGB(grData.title, grData.author);
      }

      if (!bookData && !grData.isbn && !grData.title) {
        result.errors.push(`${url}: Tidak dapat mengambil data dari Goodreads`);
        result.books.push({ title: "Unknown", author: "Unknown", status: "error", error: "Gagal ekstrak data dari Goodreads" });
        await sleep(500);
        continue;
      }

      if (!bookData && grData.title) {
        bookData = {
          title: grData.title,
          author: grData.author ?? "Unknown",
          cover_url: grData.coverUrl,
          isbn: grData.isbn,
          open_library_id: null,
          total_pages: null,
          published_year: null,
          description: null,
          language: "id",
        };
      }
    }

    if (!bookData) {
      result.errors.push(`${url}: Buku tidak ditemukan di OpenLibrary/Google Books`);
      result.books.push({ title: grData?.title ?? "Unknown", author: grData?.author ?? "Unknown", status: "error", error: "Buku tidak ditemukan" });
      await sleep(500);
      continue;
    }

    if (bookData.open_library_id && existingOlIds.has(bookData.open_library_id)) {
      result.skipped++;
      result.books.push({ title: bookData.title, author: bookData.author, status: "skipped", error: "Sudah ada di catalog" });
      await sleep(500);
      continue;
    }

    const taKey = `${bookData.title.toLowerCase().trim()}|${bookData.author.toLowerCase().trim()}`;
    if (existingTaKeys.has(taKey)) {
      result.skipped++;
      result.books.push({ title: bookData.title, author: bookData.author, status: "skipped", error: "Judul+pengarang sudah ada" });
      await sleep(500);
      continue;
    }

    const unknownAuthor = /^(pengarang tidak diketahui|unknown|anonim|anonymous|n\/a|-)$/i;
    const titleKey = bookData.title.toLowerCase().trim();
    if (existingTitleKeys.has(titleKey) && unknownAuthor.test(bookData.author.trim())) {
      result.skipped++;
      result.books.push({ title: bookData.title, author: bookData.author, status: "skipped", error: "Judul sudah ada (pengarang tidak dikenal)" });
      await sleep(500);
      continue;
    }

    const { error: insertErr } = await supabase.from("books").insert({
      title: bookData.title,
      author: bookData.author,
      cover_url: bookData.cover_url,
      isbn: bookData.isbn,
      open_library_id: bookData.open_library_id,
      total_pages: bookData.total_pages,
      published_year: bookData.published_year,
      description: bookData.description,
      language: bookData.language ?? "id",
      enrichment_status: bookData.open_library_id ? "pending" : "failed",
      is_active: true,
      source: "import",
    });

    if (insertErr) {
      result.errors.push(`${url}: ${insertErr.message}`);
      result.books.push({ title: bookData.title, author: bookData.author, status: "error", error: insertErr.message });
    } else {
      result.imported++;
      result.books.push({ title: bookData.title, author: bookData.author, status: "imported" });
      if (bookData.isbn) existingIsbns.add(bookData.isbn);
      if (bookData.open_library_id) existingOlIds.add(bookData.open_library_id);
      existingTaKeys.add(taKey);
      existingTitleKeys.add(titleKey);
    }

    await sleep(500);
  }

  return result;
}
