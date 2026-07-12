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

  const BG_COLOR = "#1a1a2e";
  const CARD_COLOR = "#ffffff";
  const ACCENT = "#f59e0b";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${BG_COLOR} 0%, #16213e 50%, #0f3460 100%)`,
          padding: "48px",
        }}
      >
        {/* Main card */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: CARD_COLOR,
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* Left: Book Cover with rating */}
          <div
            style={{
              display: "flex",
              width: "35%",
              background: "#f3f4f6",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px",
              position: "relative",
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
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "80%",
                  height: "80%",
                  background: "#e5e7eb",
                  borderRadius: "12px",
                  fontSize: "64px",
                  color: "#9ca3af",
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
                background: "#fef3c7",
                borderRadius: "24px",
                padding: "6px 16px",
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
              padding: "40px",
              justifyContent: "center",
            }}
          >
            {/* Reviewer info */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: ACCENT,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
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
              <span style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e" }}>
                {reviewerName}
              </span>
            </div>

            {/* Book title */}
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#1a1a2e",
                margin: "0 0 4px 0",
                lineHeight: 1.2,
              }}
            >
              {book.title}
            </h2>
            {book.author && (
              <p style={{ fontSize: "18px", color: "#6b7280", margin: "0 0 20px 0" }}>
                {book.author}
              </p>
            )}

            {/* Quote */}
            {quote && (
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  borderLeft: `4px solid ${ACCENT}`,
                  display: "flex",
                  flex: 1,
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "18px",
                    color: "#4b5563",
                    margin: 0,
                    fontStyle: "italic",
                    lineHeight: 1.5,
                  }}
                >
                  &ldquo;{quote.slice(0, 280)}{quote.length > 280 ? "…" : ""}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "16px 0 0 0",
            color: "#9ca3af",
            fontSize: "14px",
          }}
        >
          <span style={{ fontWeight: 700, letterSpacing: "1px", color: "#fff" }}>mulaibaca</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ opacity: 0.7 }}>Baca bareng, tumbuh bareng</span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 540,
    }
  );
}
