import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const size = Math.min(Math.max(parseInt(url.searchParams.get("size") ?? "192"), 64), 1024);

  const iconSize = Math.round(size * 0.6);
  const radius = Math.round(size * 0.22);

  return new ImageResponse(
    <div
      style={{
        width: size,
        height: size,
        background: "#1E4530",
        borderRadius: radius,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={iconSize} height={Math.round(iconSize * 0.78)} viewBox="0 0 22 17" fill="none">
        <path d="M11 14.5V2C9 0.5 5.5 0.5 2 1.5v12c3.5-1 7-0.5 9 1z" fill="#FAF7F2" />
        <path d="M11 14.5V2C13 0.5 16.5 0.5 20 1.5v12c-3.5-1-7-0.5-9 1z" fill="#FAF7F2" opacity="0.85" />
        <path d="M11 2v12.5" stroke="#C26E2A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>,
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable" } }
  );
}
