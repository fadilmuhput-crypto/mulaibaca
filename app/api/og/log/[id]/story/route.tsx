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

  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "linear-gradient(180deg, #0F2A1E 0%, #1A3D2B 50%, #0F2A1E 100%)", fontFamily: '"Geist", "Inter", sans-serif' }}>
      {/* Top spacing */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "60px 48px 40px", alignItems: "center", justifyContent: "center" }}>
        {/* Book cover — large and centered */}
        <div style={{ display: "flex", width: "360px", height: "540px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}>
          {coverUrl ? (
            <img src={coverUrl} alt="" style={{ display: "flex", width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ display: "flex", width: "100%", height: "100%", background: "linear-gradient(135deg, #1E4530, #2A5E40)", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "100px", fontWeight: 800, color: "rgba(255,255,255,0.15)" }}>{book.title?.charAt(0) ?? "B"}</span>
            </div>
          )}
        </div>

        {/* Book info */}
        <span style={{ fontSize: "30px", fontWeight: 800, color: "#FAF7F2", textAlign: "center", lineHeight: 1.25, marginTop: "28px", maxWidth: "600px" }}>{book.title}</span>
        {book.author && <span style={{ fontSize: "18px", color: "#BFE040", marginTop: "6px" }}>{book.author}</span>}

        {/* Stats row */}
        <div style={{ display: "flex", gap: "14px", marginTop: "28px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px 28px" }}>
            <span style={{ fontSize: "34px", fontWeight: 800, color: "#C26E2A" }}>{pagesRead}</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.5px" }}>HALAMAN</span>
            {progress !== null && (
              <div style={{ display: "flex", width: "100%", minWidth: "80px", height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
                <div style={{ display: "flex", width: `${progress}%`, height: "100%", background: "#C26E2A", borderRadius: "2px" }} />
              </div>
            )}
          </div>
          {duration && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px 28px" }}>
              <span style={{ fontSize: "34px", fontWeight: 800, color: "#BFE040" }}>{duration}</span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.5px" }}>MENIT</span>
            </div>
          )}
          {currentStreak > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: "16px", padding: "16px 28px" }}>
              <span style={{ fontSize: "34px", fontWeight: 800, color: "#FF6B6B" }}>{currentStreak}</span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: "0.5px" }}>STREAK</span>
            </div>
          )}
        </div>

        {/* Note */}
        {noteText && (
          <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: "14px", padding: "16px 24px", marginTop: "24px", maxWidth: "560px" }}>
            <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.65)", fontStyle: "italic", textAlign: "center", lineHeight: 1.4 }}>"{noteText}"</span>
          </div>
        )}

        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "auto", paddingTop: "32px" }}>
          <div style={{ display: "flex", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{memberName.charAt(0)}</span>
          </div>
          <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.4)" }}>{memberName} via mulaibaca</span>
        </div>
      </div>

      {/* Bottom branding */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 0 48px" }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", letterSpacing: "2px" }}>MULAIBACA.ID</span>
      </div>
    </div>,
    { width: 1080, height: 1920 }
  );
}
