import { ImageResponse } from "@vercel/og";
import { createAdminClient } from "@/lib/supabase-route";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: log } = await admin
    .from("reading_logs")
    .select(`
      id, pages_read, from_page, to_page, duration_minutes, note, log_date, created_at,
      member_id,
      shelf_items!inner(
        member_id,
        books!inner(id, title, author, cover_url, total_pages)
      )
    `)
    .eq("id", id)
    .single();

  if (!log) {
    return new Response("Log not found", { status: 404 });
  }

  const shelfRow = log.shelf_items as unknown as {
    member_id: string;
    books: { id: string; title: string; author: string | null; cover_url: string | null; total_pages: number | null };
  };
  const book = shelfRow.books;

  const { data: member } = await admin
    .from("members")
    .select("id, name, avatar")
    .eq("id", shelfRow.member_id)
    .single();

  const { data: streak } = await admin
    .from("streaks")
    .select("current_streak")
    .eq("member_id", shelfRow.member_id)
    .maybeSingle();

  const memberName = member?.name ?? "Pembaca";
  const memberAvatar = member?.avatar;
  const currentStreak = streak?.current_streak ?? 0;
  const pagesRead = log.pages_read;
  const duration = log.duration_minutes;
  const note = log.note;
  const logDate = log.log_date || log.created_at?.split("T")[0];
  const formattedDate = logDate
    ? new Date(logDate + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const coverUrl = book.cover_url
    ? book.cover_url.replace("http://", "https://")
    : null;

  // Background: warm orange gradient like Strava
  const BG_COLOR = "#1a1a2e";
  const CARD_COLOR = "#ffffff";
  const ACCENT = "#f59e0b";
  const TEXT_PRIMARY = "#1a1a2e";
  const TEXT_SECONDARY = "#6b7280";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${BG_COLOR} 0%, #16213e 50%, #0f3460 100%)`,
          fontFamily: '"Inter", sans-serif',
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
          {/* Left: Book Cover */}
          <div
            style={{
              display: "flex",
              width: "40%",
              background: "#f3f4f6",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px",
            }}
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={book.title}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "85%",
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
                  fontSize: "48px",
                  color: "#9ca3af",
                }}
              >
                📚
              </div>
            )}
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
            {/* Member info */}
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
                {memberAvatar ? (
                  <img src={memberAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  memberName.charAt(0)
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "24px", fontWeight: 700, color: TEXT_PRIMARY }}>
                  {memberName}
                </span>
                <span style={{ fontSize: "16px", color: TEXT_SECONDARY }}>
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Book title */}
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: TEXT_PRIMARY,
                margin: "0 0 8px 0",
                lineHeight: 1.2,
              }}
            >
              {book.title}
            </h2>
            {book.author && (
              <p style={{ fontSize: "18px", color: TEXT_SECONDARY, margin: "0 0 24px 0" }}>
                {book.author}
              </p>
            )}

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "#fef3c7",
                  borderRadius: "16px",
                  padding: "16px 24px",
                  minWidth: "100px",
                }}
              >
                <span style={{ fontSize: "32px", fontWeight: 800, color: ACCENT }}>
                  {pagesRead}
                </span>
                <span style={{ fontSize: "14px", color: "#92400e", fontWeight: 500 }}>
                  halaman
                </span>
              </div>

              {duration && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "#dbeafe",
                    borderRadius: "16px",
                    padding: "16px 24px",
                    minWidth: "100px",
                  }}
                >
                  <span style={{ fontSize: "32px", fontWeight: 800, color: "#2563eb" }}>
                    {duration}
                  </span>
                  <span style={{ fontSize: "14px", color: "#1e40af", fontWeight: 500 }}>
                    menit
                  </span>
                </div>
              )}

              {currentStreak > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "#fce7f3",
                    borderRadius: "16px",
                    padding: "16px 24px",
                    minWidth: "100px",
                  }}
                >
                  <span style={{ fontSize: "32px", fontWeight: 800, color: "#db2777" }}>
                    {currentStreak}
                  </span>
                  <span style={{ fontSize: "14px", color: "#9d174d", fontWeight: 500 }}>
                    streak 🔥
                  </span>
                </div>
              )}
            </div>

            {/* Note / reflection */}
            {note && (
              <div
                style={{
                  background: "#f9fafb",
                  borderRadius: "12px",
                  padding: "16px",
                  borderLeft: `4px solid ${ACCENT}`,
                }}
              >
                <p style={{ fontSize: "16px", color: TEXT_SECONDARY, margin: 0, fontStyle: "italic", lineHeight: 1.4 }}>
                  &ldquo;{note.slice(0, 200)}{note.length > 200 ? "…" : ""}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer: mulaibaca branding */}
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
