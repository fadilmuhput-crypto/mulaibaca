import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bantuan — Mulaibaca",
  description:
    "Hubungi tim Mulaibaca atau temukan jawaban dari pertanyaan umum seputar platform membaca keluarga.",
  alternates: { canonical: "https://mulaibaca.id/bantuan" },
  openGraph: {
    title: "Bantuan — Mulaibaca",
    description: "Hubungi tim Mulaibaca atau temukan jawaban dari pertanyaan umum.",
    url: "https://mulaibaca.id/bantuan",
  },
  twitter: {
    card: "summary",
    title: "Bantuan — Mulaibaca",
    description: "Hubungi tim Mulaibaca atau temukan jawaban dari pertanyaan umum.",
  },
};

export default function BantuanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
