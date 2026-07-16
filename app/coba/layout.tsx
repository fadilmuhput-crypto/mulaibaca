import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coba Mulaibaca Gratis — Tanpa Daftar",
  description: "Coba Mulaibaca langsung tanpa perlu daftar. Rasakan pengalaman mencatat bacaan, menjaga streak, dan eksplorasi fitur — gratis.",
  alternates: { canonical: "https://mulaibaca.id/coba" },
  openGraph: {
    title: "Coba Mulaibaca Gratis — Tanpa Daftar",
    description: "Coba Mulaibaca langsung tanpa perlu daftar.",
    url: "https://mulaibaca.id/coba",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coba Mulaibaca Gratis — Tanpa Daftar",
    description: "Coba Mulaibaca langsung tanpa perlu daftar.",
  },
};

export default function CobaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
