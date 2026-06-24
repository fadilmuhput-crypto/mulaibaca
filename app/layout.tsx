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

export const metadata: Metadata = {
  title: "Mulaibaca — Platform Membaca Keluarga",
  description:
    "Bangun kebiasaan membaca bersama keluarga. Track progres harian, tulis review buku, dan jadilah bagian dari gerakan literasi Indonesia.",
  metadataBase: new URL("https://mulaibaca.my.id"),
  openGraph: {
    type: "website",
    title: "Mulaibaca — Platform Membaca Keluarga",
    description:
      "Bangun kebiasaan membaca bersama keluarga. Track progres harian, tulis review buku.",
    siteName: "Mulaibaca",
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
