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

  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#0F2A1E", fontFamily: '"Geist", "Inter", sans-serif' }}>
      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "60px 40px", alignItems: "center", justifyContent: "center" }}>
        {/* Cover placeholder */}
        <div style={{ display: "flex", width: "260px", height: "390px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", marginBottom: "32px", background: "linear-gradient(135deg, #1E4530, #2A5E40)", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: "80px", fontWeight: 800, color: "rgba(255,255,255,0.2)" }}>{book.title?.charAt(0) ?? "B"}</span>
        </div>
        {/* Book title */}
        <span style={{ fontSize: "34px", fontWeight: 800, color: "#FAF7F2", textAlign: "center", lineHeight: 1.2, marginBottom: "6px" }}>{book.title}</span>
        {book.author && <span style={{ fontSize: "18px", color: "#BFE040", marginBottom: "28px" }}>{book.author}</span>}
        {/* Stats row */}
        <div style={{ display: "flex", gap: "16px", marginBottom: noteText ? "20px" : "28px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: "16px", padding: "18px 28px" }}>
            <span style={{ fontSize: "38px", fontWeight: 800, color: "#C26E2A" }}>{pagesRead}</span>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>halaman</span>
            {progress !== null && (
              <div style={{ display: "flex", width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", marginTop: "8px", overflow: "hidden" }}>
                <div style={{ display: "flex", width: `${progress}%`, height: "100%", background: "#C26E2A", borderRadius: "2px" }} />
              </div>
            )}
          </div>
          {duration && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: "16px", padding: "18px 28px" }}>
              <span style={{ fontSize: "38px", fontWeight: 800, color: "#BFE040" }}>{duration}</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>menit</span>
            </div>
          )}
          {currentStreak > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.08)", borderRadius: "16px", padding: "18px 28px" }}>
              <span style={{ fontSize: "38px", fontWeight: 800, color: "#FF6B6B" }}>{currentStreak}</span>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>streak</span>
            </div>
          )}
        </div>
        {/* Note */}
        {noteText && (
          <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", maxWidth: "520px" }}>
            <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", fontStyle: "italic", textAlign: "center" }}>"{noteText}"</span>
          </div>
        )}
        {/* User info */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{memberName.charAt(0)}</span>
          </div>
          <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)" }}>{memberName} via mulaibaca</span>
        </div>
      </div>
      {/* Bottom branding */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0 36px" }}>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", letterSpacing: "1px" }}>MULAIBACA.ID</span>
      </div>
    </div>,
    { width: 1080, height: 1920 }
  );
}
