import { ImageResponse } from "@vercel/og";
import { createAdminClient } from "@/lib/supabase-route";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: review } = await admin
    .from("reviews")
    .select(`
      rating, q_about, is_anonymous,
      shelf_items!inner(
        books!inner(id, title, author, cover_url)
      ),
      members!inner(name, avatar)
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!review) {
    return new Response("Review not found", { status: 404 });
  }

  const shelfItems = review.shelf_items as unknown as {
    books: { id: string; title: string; author: string | null; cover_url: string | null };
  };
  const book = shelfItems.books;
  const member = review.members as unknown as { name: string; avatar: string | null };

  const reviewerName = review.is_anonymous ? "Anonim" : (member?.name ?? "Pembaca");
  const coverUrl = book.cover_url
    ? book.cover_url.replace("http://", "https://")
    : null;
  const quote = review.q_about ?? "";

  const BG_FROM = "#C26E2A";
  const BG_TO = "#8B4513";
  const BG_END = "#1E4530";
  const CARD_COLOR = "#FAF7F2";
  const ACCENT = "#C26E2A";
  const TEXT_PRIMARY = "#0C0C0A";
  const TEXT_SECONDARY = "#3D4E45";
  const TEXT_MUTED = "#7A8E83";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(160deg, ${BG_FROM} 0%, ${BG_TO} 40%, ${BG_END} 100%)`,
          fontFamily: '"Geist", "Inter", sans-serif',
          padding: "40px",
        }}
      >
        {/* Header brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            padding: "0 4px",
          }}
        >
          <span style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: "#fff", opacity: 0.9 }}>
            mulaibaca
          </span>
          <span style={{ fontSize: "14px", color: "#fff", opacity: 0.6 }}>
            mulaibaca.id
          </span>
        </div>

        {/* Main card */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: CARD_COLOR,
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
          }}
        >
          {/* Left: Book Cover with rating */}
          <div
            style={{
              display: "flex",
              width: "35%",
              background: "#EDE0CB",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "28px",
            }}
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={book.title}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "75%",
                  objectFit: "contain",
                  borderRadius: "8px",
                  boxShadow: "4px 4px 0 rgba(12,12,10,0.15)",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "70%",
                  height: "70%",
                  background: "#E0D8CE",
                  borderRadius: "8px",
                  fontSize: "56px",
                  color: "#7A8E83",
                }}
              >
                📚
              </div>
            )}
            {/* Rating badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "16px",
                background: "#FDF0E4",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "20px",
              }}
            >
              {'⭐'.repeat(review.rating ?? 0)}
            </div>
          </div>

          {/* Right: Details */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "36px 40px",
              justifyContent: "center",
            }}
          >
            {/* Reviewer info */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#fff",
                  overflow: "hidden",
                }}
              >
                {member?.avatar ? (
                  <img src={member.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  reviewerName.charAt(0)
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "18px", fontWeight: 600, color: TEXT_PRIMARY }}>
                  {reviewerName}
                </span>
                <span style={{ fontSize: "13px", color: TEXT_MUTED }}>
                  mereview buku
                </span>
              </div>
            </div>

            {/* Book title */}
            <h2
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: TEXT_PRIMARY,
                margin: "0 0 4px 0",
                lineHeight: 1.2,
              }}
            >
              {book.title}
            </h2>
            {book.author && (
              <p style={{ fontSize: "16px", color: TEXT_SECONDARY, margin: "0 0 16px 0" }}>
                {book.author}
              </p>
            )}

            {/* Quote */}
            {quote && (
              <div
                style={{
                  background: "#FAF7F2",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  borderLeft: `3px solid ${ACCENT}`,
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: TEXT_SECONDARY,
                    margin: 0,
                    fontStyle: "italic",
                    lineHeight: 1.4,
                  }}
                >
                  &ldquo;{quote.slice(0, 280)}{quote.length > 280 ? "…" : ""}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "16px 0 0 0",
            color: "#fff",
            fontSize: "13px",
            opacity: 0.7,
          }}
        >
          <span>Baca bareng, tumbuh bareng</span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 540,
    }
  );
}
