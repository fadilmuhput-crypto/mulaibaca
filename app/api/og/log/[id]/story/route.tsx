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
    admin.from("members").select("id, name").eq("id", shelfRow.member_id).single(),
    admin.from("streaks").select("current_streak").eq("member_id", shelfRow.member_id).maybeSingle(),
  ]);

  const memberName = member?.name ?? "Pembaca";
  const currentStreak = streak?.current_streak ?? 0;
  const pagesRead = log.pages_read;
  const duration = log.duration_minutes;

  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "linear-gradient(180deg, #1E4530 0%, #0F2A1E 50%, #1A1A1A 100%)", padding: "48px 40px", fontFamily: '"Geist", "Inter", sans-serif' }}>
      <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", width: "240px", height: "360px", background: "#EDE0CB", borderRadius: "16px", alignItems: "center", justifyContent: "center", marginBottom: "32px", boxShadow: "0 16px 48px rgba(0,0,0,0.4)" }}>
          <span style={{ fontSize: "64px", fontWeight: 700, color: "#7A8E83" }}>{book.title?.charAt(0) ?? "B"}</span>
        </div>
        <span style={{ fontSize: "32px", fontWeight: 700, color: "#FAF7F2", textAlign: "center", marginBottom: "8px" }}>{book.title}</span>
        {book.author && <span style={{ fontSize: "18px", color: "#BFE040", marginBottom: "24px" }}>{book.author}</span>}
        <div style={{ display: "flex", gap: "24px", marginBottom: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.1)", borderRadius: "16px", padding: "16px 24px" }}>
            <span style={{ fontSize: "36px", fontWeight: 800, color: "#C26E2A" }}>{pagesRead}</span>
            <span style={{ fontSize: "14px", color: "#EDE0CB", fontWeight: 600 }}>halaman</span>
          </div>
          {duration && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.1)", borderRadius: "16px", padding: "16px 24px" }}>
              <span style={{ fontSize: "36px", fontWeight: 800, color: "#BFE040" }}>{duration}</span>
              <span style={{ fontSize: "14px", color: "#EDE0CB", fontWeight: 600 }}>menit</span>
            </div>
          )}
          {currentStreak > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(255,255,255,0.1)", borderRadius: "16px", padding: "16px 24px" }}>
              <span style={{ fontSize: "36px", fontWeight: 800, color: "#FF6B6B" }}>{currentStreak}</span>
              <span style={{ fontSize: "14px", color: "#EDE0CB", fontWeight: 600 }}>streak</span>
            </div>
          )}
        </div>
        <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.5)", marginTop: "8px" }}>{memberName} via mulaibaca.id</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 0 0 0" }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>mulaibaca — baca, catat, review</span>
      </div>
    </div>,
    { width: 1080, height: 1920 }
  );
}
