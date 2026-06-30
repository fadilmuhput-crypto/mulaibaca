import { ImageResponse } from "next/og";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#1E4530",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-serif, Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#BFE040">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
          </svg>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#FAF7F2",
              letterSpacing: "-0.02em",
            }}
          >
            mulaibaca
          </span>
        </div>
        <p
          style={{
            fontSize: 28,
            color: "#EDE0CB",
            textAlign: "center",
            maxWidth: 600,
            lineHeight: 1.4,
          }}
        >
          Bangun kebiasaan membaca dari satu halaman per hari
        </p>
        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
          }}
        >
          <span
            style={{
              background: "#C26E2A",
              color: "#FAF7F2",
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Catat progres
          </span>
          <span
            style={{
              background: "#C26E2A",
              color: "#FAF7F2",
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Jaga streak
          </span>
          <span
            style={{
              background: "#C26E2A",
              color: "#FAF7F2",
              padding: "8px 20px",
              borderRadius: 8,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Tulis review
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
