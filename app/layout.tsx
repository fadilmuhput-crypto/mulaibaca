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
  title: "Mulaibaca — Platform Membaca Keluarga",
  description:
    "Bangun kebiasaan membaca bersama keluarga. Track progres harian, tulis review buku, dan jadilah bagian dari gerakan literasi Indonesia.",
  metadataBase: new URL(ROOT),
  alternates: {
    canonical: ROOT,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: ROOT,
    siteName: "Mulaibaca",
    title: "Mulaibaca — Platform Membaca Keluarga",
    description:
      "Bangun kebiasaan membaca bersama keluarga. Track progres harian, tulis review buku.",
  },
  twitter: {
    card: "summary",
    title: "Mulaibaca — Platform Membaca Keluarga",
    description:
      "Bangun kebiasaan membaca bersama keluarga. Track progres harian, tulis review buku.",
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
