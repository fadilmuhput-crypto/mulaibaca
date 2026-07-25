import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Fraunces } from "next/font/google";
import AnalyticsWithConsent from "@/components/AnalyticsWithConsent";
import ReadingModeProvider from "@/components/ReadingModeProvider";
import ReadingModeToggle from "@/components/ReadingModeToggle";
import ThemeProvider from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/Toast";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const ROOT = "https://mulaibaca.id";

export const metadata: Metadata = {
  title: "Mulaibaca — Bangun Kebiasaan Membaca",
  description:
    "Bangun kebiasaan membaca dari satu halaman per hari. Catat progres, jaga streak, dan tulis review buku. Mulai dari dirimu, bertumbuh bersama orang terdekat.",
  metadataBase: new URL(ROOT),
  alternates: {
    canonical: ROOT,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: ROOT,
    siteName: "Mulaibaca",
    title: "Mulaibaca — Bangun Kebiasaan Membaca",
    description:
      "Bangun kebiasaan membaca dari satu halaman per hari. Catat progres, jaga streak, tulis review.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mulaibaca — Bangun Kebiasaan Membaca",
    description:
      "Bangun kebiasaan membaca dari satu halaman per hari. Catat progres, jaga streak, tulis review.",
    images: ["/opengraph-image"],
  },
  verification: {
    google: "iVM6wykx3g3g3pTQ86zRJ6ut6cjWYK5-detLwmk-dvM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Mulaibaca",
        url: ROOT,
        description: "Bangun kebiasaan membaca dari satu halaman per hari.",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${ROOT}/cari?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: "Mulaibaca",
        url: ROOT,
        logo: `${ROOT}/icon.png`,
      },
    ],
  };

  return (
    <html lang="id" className={`${geist.variable} ${fraunces.variable}`}>
      <head>
        <meta name="theme-color" content="#1E4530" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
        <div
          id="splash"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#1E4530",
            transition: "opacity 0.4s ease",
          }}
        >
          <div style={{ width: 96, height: 96, borderRadius: 28, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", marginBottom: 20, overflow: "hidden" }}>
            <img src="/logo.png" alt="" width={80} height={80} style={{ objectFit: "cover" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>Mulaibaca</h1>
          <p style={{ color: "#C26E2A", fontSize: "0.875rem", fontWeight: 500, marginTop: 6, letterSpacing: "0.05em" }}>baca, catat, review</p>
        </div>
        <div id="cookie-banner-root" dangerouslySetInnerHTML={{ __html: '<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:0;right:0;z-index:50;padding:16px"><div style="max-width:32rem;margin:0 auto;background:#1a1a1a;color:#f5f0e8;border-radius:12px;border:2px solid #1a1a1a;padding:20px;box-shadow:4px 4px 0 #1a1a1a"><p style="font-size:14px;line-height:1.6;margin:0 0 16px 0">Kami menggunakan cookie untuk analitik (Google Analytics) guna memahami pola penggunaan dan meningkatkan aplikasi. Data dikirim secara anonim. Detail lengkap di <a href="/kebijakan-privasi" style="text-decoration:underline;text-underline-offset:2px;color:#a3be8c">Kebijakan Privasi</a>.</p><div style="display:flex;gap:8px"><button id="cookie-accept" style="flex:1;padding:8px 16px;background:#a3be8c;color:#1a1a1a;font-weight:600;font-size:14px;border-radius:8px;border:2px solid #1a1a1a;box-shadow:2px 2px 0 #1a1a1a;cursor:pointer;min-height:44px">Setuju</button><button id="cookie-reject" style="padding:8px 16px;background:transparent;color:rgba(245,240,232,0.7);font-weight:500;font-size:14px;border-radius:8px;border:2px solid rgba(245,240,232,0.2);cursor:pointer;min-height:44px">Tolak</button></div></div></div>' }} />
        <script dangerouslySetInnerHTML={{ __html: "(function(){setTimeout(function(){var s=document.getElementById('splash');if(s){s.style.pointerEvents='none';s.remove()}},1400);var c=document.getElementById('cookie-banner');var k='mulaibaca_cookie_consent';if(localStorage.getItem(k)||!c){if(c)c.remove();return}c.style.display='block';document.getElementById('cookie-accept').addEventListener('click',function(){localStorage.setItem(k,'accepted');c.remove();window.dispatchEvent(new CustomEvent('consent-update'))});document.getElementById('cookie-reject').addEventListener('click',function(){localStorage.setItem(k,'rejected');c.remove();window.dispatchEvent(new CustomEvent('consent-update'))})})()" }} />
        <ThemeProvider>
          <ReadingModeProvider>
            <ToastProvider>
              {children}
              <ReadingModeToggle />
              <AnalyticsWithConsent />
              <PwaRegister />
            </ToastProvider>
          </ReadingModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
