import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase-route";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type ReviewOG = {
  rating: number;
  q_about: string | null;
  is_anonymous: boolean;
  member: { name: string; avatar: string } | null;
  book: { title: string; author: string | null; cover_url: string | null } | null;
};

export default async function ReviewOGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: review } = await supabase
    .from("reviews")
    .select(`
      rating, q_about, is_anonymous,
      members(name, avatar),
      shelf_items(books(title, author, cover_url))
    `)
    .eq("slug", slug)
    .maybeSingle();

  const book = (review as any)?.shelf_items?.[0]?.books ?? null;
  const member = (review as any)?.members?.[0] ?? null;
  const isAnon = (review as any)?.is_anonymous ?? false;
  const rating = (review as any)?.rating ?? 0;
  const qAbout = (review as any)?.q_about ?? null;
  const reviewer = isAnon ? "Anonim" : member?.name ?? "Pembaca";
  const title = book?.title ?? "Mulaibaca";

  if (!book) {
    // Fallback: generic OG when review not found
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            background: "#1E4530",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "ui-serif, Georgia, serif",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#BFE040">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
          </svg>
          <span style={{ fontSize: 64, fontWeight: 700, color: "#FAF7F2", letterSpacing: "-0.02em", marginTop: 16 }}>
            mulaibaca
          </span>
          <p style={{ fontSize: 28, color: "#EDE0CB", textAlign: "center", maxWidth: 600, lineHeight: 1.4, marginTop: 24 }}>
            Review Buku — Mulaibaca
          </p>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#1E4530",
          display: "flex",
          flexDirection: "column",
          fontFamily: "ui-serif, Georgia, serif",
          overflow: "hidden",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "32px 56px 0",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#BFE040">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
          </svg>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#BFE040", letterSpacing: "-0.02em" }}>
            mulaibaca
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", padding: "24px 56px 40px", gap: 40 }}>
          {/* Left: book cover */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {book?.cover_url ? (
              <img
                src={book.cover_url}
                alt=""
                width={160}
                height={240}
                style={{ borderRadius: 12, objectFit: "cover", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
              />
            ) : (
              <div style={{ width: 160, height: 240, borderRadius: 12, background: "#2A5C40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#BFE040" }}>
                📚
              </div>
            )}
          </div>

          {/* Right: review content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {/* Book title */}
            <h1 style={{ fontSize: 36, fontWeight: 700, color: "#FAF7F2", lineHeight: 1.2, marginBottom: 4 }}>
              {title}
            </h1>
            {book?.author && (
              <p style={{ fontSize: 18, color: "#EDE0CB", marginBottom: 12 }}>
                {book.author}
              </p>
            )}

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: "#E8A838" }}>{rating}</span>
              <span style={{ fontSize: 16, color: "#CDC0AB" }}>/ 5</span>
            </div>

            {/* Reviewer */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: "#C26E2A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#FAF7F2" }}>
                {isAnon ? "?" : (member?.avatar ?? "📖").charAt(0)}
              </div>
              <span style={{ fontSize: 16, color: "#EDE0CB" }}>{reviewer}</span>
            </div>

            {/* Review excerpt */}
            {qAbout && (
              <div style={{ background: "rgba(250,247,242,0.08)", borderRadius: 12, padding: "16px 20px", maxWidth: 520 }}>
                <p style={{ fontSize: 15, color: "#CDC0AB", lineHeight: 1.6, fontStyle: "italic" }}>
                  "{qAbout.length > 200 ? qAbout.slice(0, 200) + "…" : qAbout}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
