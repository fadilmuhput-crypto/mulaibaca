import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Fraunces } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
  return (
    <html lang="id" className={`${geist.variable} ${fraunces.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
      <GoogleAnalytics gaId="G-5KPFNZF5PW" />
    </html>
  );
}
