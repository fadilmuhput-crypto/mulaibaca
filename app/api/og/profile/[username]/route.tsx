import { ImageResponse } from "@vercel/og";
import { createAdminClient } from "@/lib/supabase-route";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const admin = createAdminClient();

  const { data: member } = await admin
    .from("members")
    .select("id, name, avatar")
    .eq("username", username.toLowerCase())
    .maybeSingle();

  if (!member) {
    return new Response("Member not found", { status: 404 });
  }

  const [logResult, streakResult, reviewResult] = await Promise.all([
    admin.from("reading_logs").select("pages_read").eq("member_id", member.id),
    admin.from("streaks").select("current_streak, longest_streak").eq("member_id", member.id).maybeSingle(),
    admin.from("reviews").select("id", { count: "exact", head: true }).eq("member_id", member.id).eq("is_public", true),
  ]);

  const totalPages = (logResult.data ?? []).reduce((sum, l) => sum + (l.pages_read ?? 0), 0);
  const currentStreak = streakResult.data?.current_streak ?? 0;
  const reviewCount = reviewResult.count ?? 0;

  const displayName = member.name ?? `@${username}`;
  const firstLetter = displayName.charAt(0).toUpperCase();

  const BG = "#1a1a2e";
  const ACCENT = "#f59e0b";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${BG} 0%, #16213e 50%, #0f3460 100%)`,
          padding: "48px",
        }}
      >
        {/* Main card */}
        <div
          style={{
            display: "flex",
            flex: 1,
            background: "#ffffff",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: ACCENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontWeight: 700,
              color: "#fff",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            {member.avatar ? (
              <img src={member.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              firstLetter
            )}
          </div>

          {/* Name */}
          <h1
            style={{
              fontSize: "40px",
              fontWeight: 700,
              color: "#1a1a2e",
              margin: "0 0 4px 0",
            }}
          >
            {displayName}
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#6b7280",
              margin: "0 0 32px 0",
            }}
          >
            @{username}
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#fef3c7",
                borderRadius: "16px",
                padding: "16px 28px",
                minWidth: "100px",
              }}
            >
              <span style={{ fontSize: "36px", fontWeight: 800, color: ACCENT }}>
                {totalPages}
              </span>
              <span style={{ fontSize: "14px", color: "#92400e", fontWeight: 500 }}>
                halaman
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#fce7f3",
                borderRadius: "16px",
                padding: "16px 28px",
                minWidth: "100px",
              }}
            >
              <span style={{ fontSize: "36px", fontWeight: 800, color: "#db2777" }}>
                {currentStreak}
              </span>
              <span style={{ fontSize: "14px", color: "#9d174d", fontWeight: 500 }}>
                streak 🔥
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#dbeafe",
                borderRadius: "16px",
                padding: "16px 28px",
                minWidth: "100px",
              }}
            >
              <span style={{ fontSize: "36px", fontWeight: 800, color: "#2563eb" }}>
                {reviewCount}
              </span>
              <span style={{ fontSize: "14px", color: "#1e40af", fontWeight: 500 }}>
                review
              </span>
            </div>
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
