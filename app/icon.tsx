import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#1E4530",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
          {/* Left page */}
          <path
            d="M11 14.5V2C9 0.5 5.5 0.5 2 1.5v12c3.5-1 7-0.5 9 1z"
            fill="#FAF7F2"
          />
          {/* Right page */}
          <path
            d="M11 14.5V2C13 0.5 16.5 0.5 20 1.5v12c-3.5-1-7-0.5-9 1z"
            fill="#FAF7F2"
            opacity="0.85"
          />
          {/* Spine */}
          <path d="M11 2v12.5" stroke="#C26E2A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
