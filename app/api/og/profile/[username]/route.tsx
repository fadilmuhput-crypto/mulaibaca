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

  const BG_FROM = "#C26E2A";
  const BG_TO = "#8B4513";
  const BG_END = "#1E4530";
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
            background: "#FAF7F2",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
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
              boxShadow: "0 4px 12px rgba(194,110,42,0.3)",
            }}
          >
            {member.avatar?.startsWith("http") ? (
              <img src={member.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              firstLetter
            )}
          </div>

          {/* Name */}
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: TEXT_PRIMARY,
              margin: "0 0 2px 0",
            }}
          >
            {displayName}
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: TEXT_MUTED,
              margin: "0 0 28px 0",
            }}
          >
            @{username}
          </p>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#FDF0E4",
                borderRadius: "12px",
                padding: "16px 28px",
                minWidth: "100px",
              }}
            >
              <span style={{ fontSize: "32px", fontWeight: 800, color: ACCENT }}>
                {totalPages}
              </span>
              <span style={{ fontSize: "13px", color: "#A35920", fontWeight: 600 }}>
                halaman
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#FEF2F2",
                borderRadius: "12px",
                padding: "16px 28px",
                minWidth: "100px",
              }}
            >
              <span style={{ fontSize: "32px", fontWeight: 800, color: "#DC2626" }}>
                {currentStreak}
              </span>
              <span style={{ fontSize: "13px", color: "#991B1B", fontWeight: 600 }}>
                streak 🔥
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#EAF4EE",
                borderRadius: "12px",
                padding: "16px 28px",
                minWidth: "100px",
              }}
            >
              <span style={{ fontSize: "32px", fontWeight: 800, color: "#1E4530" }}>
                {reviewCount}
              </span>
              <span style={{ fontSize: "13px", color: "#1E4530", fontWeight: 600 }}>
                review
              </span>
            </div>
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
      emoji: "noto",
    }
  );
}
