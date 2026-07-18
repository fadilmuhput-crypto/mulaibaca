import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Fraunces } from "next/font/google";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import AnalyticsWithConsent from "@/components/AnalyticsWithConsent";
import ReadingModeProvider from "@/components/ReadingModeProvider";
import ReadingModeToggle from "@/components/ReadingModeToggle";
import ThemeProvider from "@/components/ThemeProvider";
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
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
        <ThemeProvider>
          <ReadingModeProvider>
            {children}
            <ReadingModeToggle />
            <CookieConsentBanner />
            <AnalyticsWithConsent />
            <PwaRegister />
          </ReadingModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
