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
          {/* Left: Book Cover */}
          <div
            style={{
              display: "flex",
              width: "35%",
              background: "#EDE0CB",
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
                  maxHeight: "85%",
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
            {/* Member + date */}
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
                {memberAvatar ? (
                  <img src={memberAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  memberName.charAt(0)
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "18px", fontWeight: 600, color: TEXT_PRIMARY }}>
                  {memberName}
                </span>
                <span style={{ fontSize: "13px", color: TEXT_MUTED }}>
                  {formattedDate}
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
              <p style={{ fontSize: "16px", color: TEXT_SECONDARY, margin: "0 0 20px 0" }}>
                {book.author}
              </p>
            )}

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  background: "#FDF0E4",
                  borderRadius: "12px",
                  padding: "14px 22px",
                  minWidth: "90px",
                }}
              >
                <span style={{ fontSize: "28px", fontWeight: 800, color: ACCENT }}>
                  {pagesRead}
                </span>
                <span style={{ fontSize: "12px", color: "#A35920", fontWeight: 600 }}>
                  halaman
                </span>
              </div>

              {duration && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "#EAF4EE",
                    borderRadius: "12px",
                    padding: "14px 22px",
                    minWidth: "90px",
                  }}
                >
                  <span style={{ fontSize: "28px", fontWeight: 800, color: "#1E4530" }}>
                    {duration}
                  </span>
                  <span style={{ fontSize: "12px", color: "#1E4530", fontWeight: 600 }}>
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
                    background: "#FEF2F2",
                    borderRadius: "12px",
                    padding: "14px 22px",
                    minWidth: "90px",
                  }}
                >
                  <span style={{ fontSize: "28px", fontWeight: 800, color: "#DC2626" }}>
                    {currentStreak}
                  </span>
                  <span style={{ fontSize: "12px", color: "#991B1B", fontWeight: 600 }}>
                    streak 🔥
                  </span>
                </div>
              )}
            </div>

            {/* Note */}
            {note && (
              <div
                style={{
                  background: "#FAF7F2",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  borderLeft: `3px solid ${ACCENT}`,
                }}
              >
                <p style={{ fontSize: "14px", color: TEXT_SECONDARY, margin: 0, fontStyle: "italic", lineHeight: 1.4 }}>
                  &ldquo;{note.slice(0, 200)}{note.length > 200 ? "…" : ""}&rdquo;
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
