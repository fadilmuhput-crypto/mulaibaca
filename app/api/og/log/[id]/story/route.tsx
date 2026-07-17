import { ImageResponse } from "@vercel/og";
import { createAdminClient } from "@/lib/supabase-route";

export const runtime = "edge";

const BG_DARK = "linear-gradient(160deg, #0A1E14 0%, #143A26 35%, #0F2A1E 70%, #081A10 100%)";
const BG_LIGHT = "linear-gradient(160deg, #FAF7F2 0%, #F5EDE2 40%, #F0E6D6 70%, #FAF7F2 100%)";

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

  // Colors
  const textColor = isTransparent ? "#FFFFFF" : isLight ? "#1A1A1A" : "#FAF7F2";
  const textMuted = isTransparent ? "rgba(255,255,255,0.55)" : isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)";
  const textMuted2 = isTransparent ? "rgba(255,255,255,0.35)" : isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)";
  const authorColor = isTransparent ? "#FFFFFF" : isLight ? "#8B6F47" : "#BFE040";
  const bgBase = isTransparent ? "transparent" : isLight ? BG_LIGHT : BG_DARK;

  const statColors = {
    pages: isTransparent ? "#FFFFFF" : isLight ? "#C26E2A" : "#C26E2A",
    minutes: isTransparent ? "#FFFFFF" : isLight ? "#1A6B3C" : "#BFE040",
    streak: isTransparent ? "#FFFFFF" : isLight ? "#DC2626" : "#FF6B6B",
  };

  const accentPill = isTransparent
    ? "rgba(0,0,0,0.2)"
    : isLight
    ? "rgba(0,0,0,0.04)"
    : "rgba(255,255,255,0.06)";

  const notePill = isTransparent
    ? "rgba(0,0,0,0.12)"
    : isLight
    ? "rgba(0,0,0,0.04)"
    : "rgba(255,255,255,0.04)";

  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: bgBase, fontFamily: '"Geist", "Inter", sans-serif', position: "relative", overflow: "hidden" }}>
      {/* Decorative circles (skip for transparent) */}
      {!isTransparent && (
        <>
          <div style={{ display: "flex", position: "absolute", top: "-100px", right: "-60px", width: "360px", height: "360px", borderRadius: "50%", background: isLight ? "rgba(194,110,42,0.05)" : "rgba(191, 224, 64, 0.04)" }} />
          <div style={{ display: "flex", position: "absolute", bottom: "180px", left: "-80px", width: "260px", height: "260px", borderRadius: "50%", background: isLight ? "rgba(194,110,42,0.04)" : "rgba(194, 110, 42, 0.04)" }} />
        </>
      )}

      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "40px 48px 0" }}>
        <div style={{ display: "flex", width: "38px", height: "38px", borderRadius: "50%", background: accentPill, border: `1px solid ${isTransparent ? "rgba(255,255,255,0.15)" : isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}`, alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "15px", fontWeight: 700, color: textMuted }}>{memberName.charAt(0)}</span>
        </div>
        <span style={{ fontSize: "15px", color: textMuted, fontWeight: 500 }}>{memberName}</span>
      </div>

      {/* Centered content */}
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", padding: "20px 48px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Book cover */}
          <div style={{ display: "flex", width: "340px", height: "510px", borderRadius: "18px", overflow: "hidden", boxShadow: isTransparent ? "0 8px 32px rgba(0,0,0,0.25)" : "0 20px 60px rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {coverUrl ? (
              <img src={coverUrl} alt="" style={{ display: "flex", width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ display: "flex", width: "100%", height: "100%", background: accentPill, alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "100px", fontWeight: 800, color: textMuted2 }}>{book.title?.charAt(0) ?? "B"}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <span style={{ fontSize: "42px", fontWeight: 800, color: textColor, textAlign: "center", lineHeight: 1.3, marginTop: "32px", maxWidth: "700px" }}>{book.title}</span>
          {book.author && <span style={{ fontSize: "22px", color: authorColor, marginTop: "8px", fontWeight: 500, opacity: isTransparent ? 0.9 : 1 }}>{book.author}</span>}

          {/* Stats row */}
          <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: accentPill, borderRadius: "18px", padding: "22px 36px", minWidth: "130px" }}>
              <span style={{ fontSize: "48px", fontWeight: 800, color: statColors.pages }}>{pagesRead}</span>
              <span style={{ fontSize: "13px", color: textMuted2, fontWeight: 700, letterSpacing: "2px" }}>HALAMAN</span>
              {progress !== null && (
                <div style={{ display: "flex", width: "100%", minWidth: "90px", height: "3px", background: isTransparent ? "rgba(255,255,255,0.12)" : isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)", borderRadius: "2px", marginTop: "10px", overflow: "hidden" }}>
                  <div style={{ display: "flex", width: `${progress}%`, height: "100%", background: "#C26E2A", borderRadius: "2px" }} />
                </div>
              )}
            </div>
            {duration && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: accentPill, borderRadius: "18px", padding: "22px 36px", minWidth: "130px" }}>
                <span style={{ fontSize: "48px", fontWeight: 800, color: statColors.minutes }}>{duration}</span>
                <span style={{ fontSize: "13px", color: textMuted2, fontWeight: 700, letterSpacing: "2px" }}>MENIT</span>
              </div>
            )}
            {currentStreak > 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: accentPill, borderRadius: "18px", padding: "22px 36px", minWidth: "130px" }}>
                <span style={{ fontSize: "48px", fontWeight: 800, color: statColors.streak }}>{currentStreak}</span>
                <span style={{ fontSize: "13px", color: textMuted2, fontWeight: 700, letterSpacing: "2px" }}>STREAK</span>
              </div>
            )}
          </div>

          {/* Note */}
          {noteText && (
            <div style={{ display: "flex", background: notePill, borderRadius: "14px", padding: "16px 26px", marginTop: "28px", maxWidth: "600px" }}>
              <span style={{ fontSize: "17px", color: textMuted, fontStyle: "italic", textAlign: "center", lineHeight: 1.5 }}>"{noteText}"</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom branding */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 0 40px" }}>
        <span style={{ color: textMuted2, fontSize: "12px", letterSpacing: "4px", fontWeight: 600 }}>MULAIBACA.ID</span>
      </div>
    </div>,
    { width: 1080, height: 1920 }
  );
}
