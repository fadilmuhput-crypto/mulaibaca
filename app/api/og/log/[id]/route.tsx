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
  const logDate = log.log_date || log.created_at?.split("T")[0];
  const formattedDate = logDate
    ? new Date(logDate + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric",
      })
    : "";

  const noteText = log.note
    ? '"' + log.note.slice(0, 200) + (log.note.length > 200 ? "..." : "") + '"'
    : null;

  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "linear-gradient(160deg, #C26E2A 0%, #8B4513 40%, #1E4530 100%)", padding: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <span style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px", color: "#fff" }}>mulaibaca</span>
        <span style={{ fontSize: "14px", color: "#fff" }}>mulaibaca.id</span>
      </div>
      <div style={{ display: "flex", flex: 1, background: "#FAF7F2", borderRadius: "20px", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "35%", background: "#EDE0CB", alignItems: "center", justifyContent: "center", padding: "28px" }}>
          <div style={{ display: "flex", width: "100%", height: "85%", background: "#E0D8CE", borderRadius: "8px", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "40px", fontWeight: 700, color: "#7A8E83" }}>{book.title?.charAt(0) ?? "B"}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "36px 40px", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ display: "flex", width: "36px", height: "36px", borderRadius: "50%", background: "#C26E2A", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#fff" }}>{memberName.charAt(0)}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "18px", fontWeight: 600, color: "#0C0C0A" }}>{memberName}</span>
              <span style={{ fontSize: "13px", color: "#7A8E83" }}>{formattedDate}</span>
            </div>
          </div>
          <span style={{ fontSize: "26px", fontWeight: 700, color: "#0C0C0A", marginBottom: "4px" }}>{book.title}</span>
          {book.author && <span style={{ fontSize: "16px", color: "#3D4E45", marginBottom: "20px" }}>{book.author}</span>}
          <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#FDF0E4", borderRadius: "12px", padding: "14px 22px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#C26E2A" }}>{pagesRead}</span>
              <span style={{ fontSize: "12px", color: "#A35920", fontWeight: 600 }}>halaman</span>
            </div>
            {duration && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#EAF4EE", borderRadius: "12px", padding: "14px 22px" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "#1E4530" }}>{duration}</span>
                <span style={{ fontSize: "12px", color: "#1E4530", fontWeight: 600 }}>menit</span>
              </div>
            )}
            {currentStreak > 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#FEF2F2", borderRadius: "12px", padding: "14px 22px" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "#DC2626" }}>{currentStreak}</span>
                <span style={{ fontSize: "12px", color: "#991B1B", fontWeight: 600 }}>streak</span>
              </div>
            )}
          </div>
          {noteText && (
            <div style={{ display: "flex", background: "#FAF7F2", borderRadius: "10px", padding: "14px 16px", borderLeft: "3px solid #C26E2A" }}>
              <span style={{ fontSize: "14px", color: "#3D4E45", fontStyle: "italic" }}>{noteText}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0 0 0" }}>
        <span style={{ color: "#fff", fontSize: "13px" }}>Baca bareng, tumbuh bareng</span>
      </div>
    </div>,
    { width: 1080, height: 540 }
  );
}
