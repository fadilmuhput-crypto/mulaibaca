import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase-route";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 60);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const OL_RE = /^OL\d+[A-Z]+$/;

function extractOLIdFromSlug(id: string): string | null {
  const match = id.match(/-(ol\d+[a-z]+)$/i);
  return match ? match[1].toUpperCase() : null;
}

function extractUUIDFromSlug(id: string): string | null {
  const match = id.match(/-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  return match ? match[1].toLowerCase() : null;
}

type BookOG = {
  title: string;
  author: string | null;
  cover_url: string | null;
  total_pages: number | null;
  publisher: string | null;
  published_year: number | null;
  description: string | null;
};

async function fetchBook(id: string): Promise<BookOG | null> {
  const supabase = createAdminClient();
  const FIELDS = "title, author, cover_url, total_pages, publisher, published_year, description";

  // Strategy 1: slug lookup
  const { data: bySlug } = await supabase.from("books").select(FIELDS).eq("slug", id).maybeSingle();
  if (bySlug) return bySlug as BookOG;

  // Strategy 2: UUID
  const uuid = UUID_RE.test(id) ? id : extractUUIDFromSlug(id);
  if (uuid) {
    const { data: byId } = await supabase.from("books").select(FIELDS).eq("id", uuid).maybeSingle();
    if (byId) return byId as BookOG;
  }

  // Strategy 3: OL ID
  const olId = OL_RE.test(id) ? id : extractOLIdFromSlug(id);
  if (olId) {
    const { data: byOl } = await supabase.from("books").select(FIELDS).eq("open_library_id", olId).maybeSingle();
    if (byOl) return byOl as BookOG;
    // Fallback: fetch from OpenLibrary
    try {
      const res = await fetch(`https://openlibrary.org/works/${olId}.json`);
      if (res.ok) {
        const work = await res.json();
        let author: string | null = null;
        try {
          const authorRef = work.authors?.[0]?.author?.key;
          if (authorRef) {
            const aRes = await fetch(`https://openlibrary.org${authorRef}.json`);
            if (aRes.ok) { const aData = await aRes.json(); author = aData.name; }
          }
        } catch { /* skip */ }
        let description: string | null = null;
        if (typeof work.description === "string") description = work.description;
        else if (work.description?.value) description = work.description.value;
        return {
          title: work.title ?? "Tanpa Judul",
          author,
          cover_url: work.covers?.[0] ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg` : null,
          total_pages: null,
          publisher: null,
          published_year: work.first_publish_date ? parseInt(work.first_publish_date) : null,
          description: description?.replace(/\([^)]*Wikipedia[^)]*\)/g, "").trim().slice(0, 300) ?? null,
        };
      }
    } catch { /* ignore */ }
  }

  return null;
}

export default async function BookOGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await fetchBook(id);

  const title = book?.title ?? "Mulaibaca";
  const author = book?.author;
  const pages = book?.total_pages;
  const publisher = book?.publisher;
  const year = book?.published_year;
  const cover = book?.cover_url;
  const desc = book?.description;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#1E4530",
          display: "flex",
          fontFamily: "ui-serif, Georgia, serif",
          overflow: "hidden",
        }}
      >
        {/* Left: book cover */}
        <div
          style={{
            width: 320,
            height: 630,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.15)",
            flexShrink: 0,
          }}
        >
          {cover ? (
            <img
              src={cover}
              alt=""
              width={200}
              height={300}
              style={{ borderRadius: 12, objectFit: "cover", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
            />
          ) : (
            <div
              style={{
                width: 200,
                height: 300,
                borderRadius: 12,
                background: "#2A5C40",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                color: "#BFE040",
              }}
            >
              📚
            </div>
          )}
        </div>

        {/* Right: book info */}
        <div
          style={{
            flex: 1,
            padding: "48px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#BFE040">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
            </svg>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#BFE040", letterSpacing: "-0.02em" }}>
              mulaibaca
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: "#FAF7F2",
              lineHeight: 1.2,
              marginBottom: 8,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h1>

          {/* Author */}
          {author && (
            <p style={{ fontSize: 22, color: "#EDE0CB", marginBottom: 16 }}>
              {author}
            </p>
          )}

          {/* Metadata badges */}
          <div style={{ display: "flex", gap: 10, marginBottom: desc ? 16 : 0, flexWrap: "wrap" }}>
            {pages && (
              <span style={{ background: "#C26E2A", color: "#FAF7F2", padding: "6px 16px", borderRadius: 8, fontSize: 16, fontWeight: 600 }}>
                {pages} hlm
              </span>
            )}
            {publisher && (
              <span style={{ background: "rgba(250,247,242,0.12)", color: "#EDE0CB", padding: "6px 16px", borderRadius: 8, fontSize: 16 }}>
                {publisher}
              </span>
            )}
            {year && (
              <span style={{ background: "rgba(250,247,242,0.12)", color: "#EDE0CB", padding: "6px 16px", borderRadius: 8, fontSize: 16 }}>
                {year}
              </span>
            )}
          </div>

          {/* Description */}
          {desc && (
            <p
              style={{
                fontSize: 16,
                color: "#CDC0AB",
                lineHeight: 1.5,
                maxWidth: 560,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {desc}
            </p>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
