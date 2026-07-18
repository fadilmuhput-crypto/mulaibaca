"use client";

import { useState, useEffect, useRef } from "react";

const FOREST = "#1E4530";
const AMBER = "#C26E2A";
const WHITE = "#FFFFFF";

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"visible" | "fading" | "hidden">("visible");
  const hidden = useRef(false);

  useEffect(() => {
    if (hidden.current) return;
    hidden.current = true;

    const minDisplay = 1000;
    const start = Date.now();

    function dismiss() {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minDisplay - elapsed);
      setTimeout(() => {
        setPhase("fading");
        setTimeout(() => setPhase("hidden"), 400);
      }, remaining);
    }

    if (document.readyState === "complete") {
      dismiss();
    } else {
      window.addEventListener("load", dismiss);
      return () => window.removeEventListener("load", dismiss);
    }
  }, []);

  if (phase === "hidden") return <>{children}</>;

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: FOREST,
          transition: "opacity 0.4s ease",
          opacity: phase === "fading" ? 0 : 1,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            background: WHITE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <img src="/logo.png" alt="" width={80} height={80} style={{ objectFit: "cover" }} />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.75rem",
            fontWeight: 800,
            color: WHITE,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Mulaibaca
        </h1>
        <p
          style={{
            color: AMBER,
            fontSize: "0.875rem",
            fontWeight: 500,
            marginTop: 6,
            letterSpacing: "0.05em",
          }}
        >
          baca, catat, review
        </p>
        <div style={{ display: "flex", gap: 6, marginTop: 40 }}>
          {[0, 0.15, 0.3].map((delay) => (
            <span
              key={delay}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: AMBER,
                opacity: 0.6,
                animation: "pulse 1.4s ease-in-out infinite",
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
      </div>
      <div style={phase === "visible" ? { visibility: "hidden" } : undefined}>{children}</div>
    </>
  );
}
