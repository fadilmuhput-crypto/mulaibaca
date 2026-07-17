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

  const progress = book.total_pages && book.total_pages > 0
    ? Math.min(Math.round((pagesRead / book.total_pages) * 100), 100)
    : null;

  const progressLabel = book.total_pages
    ? `${pagesRead} / ${book.total_pages} halaman`
    : `${pagesRead} halaman`;

  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#0F2A1E", padding: "32px" }}>
      <div style={{ display: "flex", flex: 1, background: "#FAF7F2", borderRadius: "20px", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "35%", background: "#1E4530", alignItems: "center", justifyContent: "center", padding: "28px" }}>
          <div style={{ display: "flex", width: "100%", height: "85%", background: "rgba(255,255,255,0.1)", borderRadius: "8px", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "40px", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>{book.title?.charAt(0) ?? "B"}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "32px 32px", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", width: "32px", height: "32px", borderRadius: "50%", background: "#1E4530", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>{memberName.charAt(0)}</span>
              </div>
              <span style={{ fontSize: "15px", fontWeight: 600, color: "#3D4E45" }}>{memberName}</span>
            </div>
            <span style={{ fontSize: "13px", color: "#7A8E83" }}>{formattedDate}</span>
          </div>
          <span style={{ fontSize: "26px", fontWeight: 800, color: "#0C0C0A", marginBottom: "2px" }}>{book.title}</span>
          {book.author && <span style={{ fontSize: "15px", color: "#5A7164", marginBottom: "14px" }}>{book.author}</span>}
          {/* Progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ display: "flex", flex: 1, height: "6px", background: "#EDE0CB", borderRadius: "3px", overflow: "hidden" }}>
              {progress !== null && (
                <div style={{ display: "flex", width: `${progress}%`, height: "100%", background: "#C26E2A", borderRadius: "3px" }} />
              )}
            </div>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#5A7164" }}>{progressLabel}</span>
          </div>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#FDF0E4", borderRadius: "10px", padding: "12px 20px" }}>
              <span style={{ fontSize: "24px", fontWeight: 800, color: "#C26E2A" }}>{pagesRead}</span>
              <span style={{ fontSize: "11px", color: "#A35920", fontWeight: 600 }}>hlm</span>
            </div>
            {duration && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#EAF4EE", borderRadius: "10px", padding: "12px 20px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#1E4530" }}>{duration}</span>
                <span style={{ fontSize: "11px", color: "#1E4530", fontWeight: 600 }}>mnt</span>
              </div>
            )}
            {currentStreak > 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#FEF2F2", borderRadius: "10px", padding: "12px 20px" }}>
                <span style={{ fontSize: "24px", fontWeight: 800, color: "#DC2626" }}>{currentStreak}</span>
                <span style={{ fontSize: "11px", color: "#991B1B", fontWeight: 600 }}>streak</span>
              </div>
            )}
          </div>
          {noteText && (
            <div style={{ display: "flex", background: "#FAF7F2", borderRadius: "8px", padding: "10px 14px", borderLeft: "3px solid #C26E2A", marginTop: "12px" }}>
              <span style={{ fontSize: "13px", color: "#3D4E45", fontStyle: "italic" }}>{noteText}</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 0 0 0", gap: "4px" }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>mulaibaca</span>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>·</span>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>baca, catat, review</span>
      </div>
    </div>,
    { width: 1080, height: 540 }
  );
}
