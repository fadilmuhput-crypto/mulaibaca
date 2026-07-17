import { ImageResponse } from "@vercel/og";
import { createAdminClient } from "@/lib/supabase-route";

export const runtime = "edge";

const BG_DARK = "linear-gradient(160deg, #0A1E14 0%, #143A26 35%, #0F2A1E 70%, #081A10 100%)";
const BG_LIGHT = "linear-gradient(160deg, #FAF7F2 0%, #F5EDE2 40%, #F0E6D6 70%, #FAF7F2 100%)";
const CIRCLE_DARK = "rgba(255,255,255,0.04)";
const CIRCLE_LIGHT = "rgba(194,110,42,0.06)";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const url = new URL(_request.url);
  const bgParam = url.searchParams.get("bg") ?? "dark";
  const isTransparent = bgParam === "transparent";
  const isLight = bgParam === "light";

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

  if (!log) return new Response("Log not found", { status: 404 });

  const shelfRow = log.shelf_items as unknown as {
    member_id: string;
    books: { id: string; title: string; author: string | null; cover_url: string | null; total_pages: number | null };
  };
  const book = shelfRow.books;

  const [{ data: member }, { data: streak }] = await Promise.all([
    admin.from("members").select("id, name, avatar").eq("id", shelfRow.member_id).single(),
    admin.from("streaks").select("current_streak").eq("member_id", shelfRow.member_id).maybeSingle(),
  ]);

  const memberName = member?.name ?? "Pembaca";
  const currentStreak = streak?.current_streak ?? 0;
  const pagesRead = log.pages_read;
  const duration = log.duration_minutes;
  const noteText = log.note
    ? log.note.slice(0, 150) + (log.note.length > 150 ? "..." : "")
    : null;

  const progress = book.total_pages && book.total_pages > 0
    ? Math.min(Math.round((pagesRead / book.total_pages) * 100), 100)
    : null;

  const coverUrl = book.cover_url?.startsWith("http") ? book.cover_url : null;

  const textColor = isTransparent ? "#1A1A1A" : "#FAF7F2";
  const textMuted = isTransparent ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";
  const textMuted2 = isTransparent ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.3)";
  const authorColor = isTransparent ? "#8B6F47" : "#BFE040";
  const bgBase = isTransparent ? "transparent" : isLight ? BG_LIGHT : BG_DARK;
  const accentColor = isTransparent ? "rgba(0,0,0,0.05)" : isLight ? "rgba(194,110,42,0.08)" : "rgba(255,255,255,0.06)";
  const circleColor = isLight ? CIRCLE_LIGHT : CIRCLE_DARK;

  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: bgBase, fontFamily: '"Geist", "Inter", sans-serif', position: "relative", overflow: "hidden" }}>
      {/* Decorative circles (skip for transparent) */}
      {!isTransparent && (
        <>
          <div style={{ display: "flex", position: "absolute", top: "-120px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: isLight ? "rgba(194,110,42,0.05)" : "rgba(191, 224, 64, 0.04)" }} />
          <div style={{ display: "flex", position: "absolute", bottom: "200px", left: "-100px", width: "300px", height: "300px", borderRadius: "50%", background: isLight ? "rgba(194,110,42,0.05)" : "rgba(194, 110, 42, 0.04)" }} />
          <div style={{ display: "flex", position: "absolute", top: "500px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: isLight ? "rgba(194,110,42,0.04)" : "rgba(255, 255, 255, 0.03)" }} />
        </>
      )}

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "48px 48px 0" }}>
        <div style={{ display: "flex", width: "40px", height: "40px", borderRadius: "50%", background: isTransparent ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)", border: `1px solid ${isTransparent ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"}`, alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: textMuted }}>{memberName.charAt(0)}</span>
        </div>
        <span style={{ fontSize: "16px", color: textMuted, fontWeight: 500 }}>{memberName}</span>
      </div>

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "40px 48px 32px", alignItems: "center", justifyContent: "flex-start" }}>
        {/* Book cover — 2:3 aspect */}
        <div style={{ display: "flex", width: "280px", height: "420px", borderRadius: "16px", overflow: "hidden", boxShadow: isTransparent ? "none" : "0 20px 60px rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {coverUrl ? (
            <img src={coverUrl} alt="" style={{ display: "flex", width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ display: "flex", width: "100%", height: "100%", background: isTransparent ? "rgba(0,0,0,0.06)" : "linear-gradient(135deg, #1E4530, #2A5E40)", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "80px", fontWeight: 800, color: isTransparent ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.12)" }}>{book.title?.charAt(0) ?? "B"}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <span style={{ fontSize: "32px", fontWeight: 800, color: textColor, textAlign: "center", lineHeight: 1.3, marginTop: "28px", maxWidth: "600px" }}>{book.title}</span>
        {book.author && <span style={{ fontSize: "18px", color: authorColor, marginTop: "6px", opacity: isTransparent ? 0.8 : 0.9 }}>{book.author}</span>}

        {/* Stats row */}
        <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: accentColor, borderRadius: "14px", padding: "16px 28px", minWidth: "100px" }}>
            <span style={{ fontSize: "36px", fontWeight: 800, color: isTransparent ? "#C26E2A" : "#C26E2A" }}>{pagesRead}</span>
            <span style={{ fontSize: "10px", color: textMuted2, fontWeight: 600, letterSpacing: "1px" }}>HALAMAN</span>
            {progress !== null && (
              <div style={{ display: "flex", width: "100%", minWidth: "80px", height: "2px", background: isTransparent ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)", borderRadius: "1px", marginTop: "6px", overflow: "hidden" }}>
                <div style={{ display: "flex", width: `${progress}%`, height: "100%", background: "#C26E2A", borderRadius: "1px" }} />
              </div>
            )}
          </div>
          {duration && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: accentColor, borderRadius: "14px", padding: "16px 28px", minWidth: "100px" }}>
              <span style={{ fontSize: "36px", fontWeight: 800, color: isTransparent ? "#1E4530" : "#BFE040" }}>{duration}</span>
              <span style={{ fontSize: "10px", color: textMuted2, fontWeight: 600, letterSpacing: "1px" }}>MENIT</span>
            </div>
          )}
          {currentStreak > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: accentColor, borderRadius: "14px", padding: "16px 28px", minWidth: "100px" }}>
              <span style={{ fontSize: "36px", fontWeight: 800, color: isTransparent ? "#DC2626" : "#FF6B6B" }}>{currentStreak}</span>
              <span style={{ fontSize: "10px", color: textMuted2, fontWeight: 600, letterSpacing: "1px" }}>STREAK</span>
            </div>
          )}
        </div>

        {/* Note */}
        {noteText && (
          <div style={{ display: "flex", background: isTransparent ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px 22px", marginTop: "24px", maxWidth: "560px" }}>
            <span style={{ fontSize: "15px", color: textMuted, fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>"{noteText}"</span>
          </div>
        )}
      </div>

      {/* Bottom branding */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 0 40px" }}>
        <span style={{ color: textMuted2, fontSize: "11px", letterSpacing: "3px", fontWeight: 600 }}>MULAIBACA.ID</span>
      </div>
    </div>,
    { width: 1080, height: 1920 }
  );
}
