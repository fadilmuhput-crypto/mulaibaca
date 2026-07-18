import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: "#1E4530",
        borderRadius: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <svg width="100" height="80" viewBox="0 0 22 17" fill="none">
        <path d="M11 14.5V2C9 0.5 5.5 0.5 2 1.5v12c3.5-1 7-0.5 9 1z" fill="#FAF7F2" />
        <path d="M11 14.5V2C13 0.5 16.5 0.5 20 1.5v12c-3.5-1-7-0.5-9 1z" fill="#FAF7F2" opacity="0.85" />
        <path d="M11 2v12.5" stroke="#C26E2A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>,
    { ...size }
  );
}
