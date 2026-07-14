import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-route";
import FaqAccordion from "./FaqAccordion";
import BackButton from "@/components/BackButton";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "FAQ — Mulaibaca",
  description: "Pertanyaan yang sering diajukan tentang Mulaibaca. Pelajari cara membuat ruang keluarga, menambahkan anggota, dan memantau progres bacaan bersama.",
  alternates: { canonical: "https://mulaibaca.id/faq" },
  openGraph: {
    title: "FAQ — Mulaibaca",
    description: "Pertanyaan yang sering diajukan tentang Mulaibaca.",
    url: "https://mulaibaca.id/faq",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Mulaibaca",
    description: "Pertanyaan yang sering diajukan tentang Mulaibaca.",
  },
};

const FALLBACK_FAQS = [
  {
    id: "1",
    question: "Apa perbedaan Lingkar Keluarga dan Lingkar Teman?",
    answer:
      "Lingkar Keluarga memiliki peran (Ayah, Ibu, Anak, Dewasa), mendukung akun anak tanpa email, dan admin bisa switch untuk mengelola profil anggota lain. Maksimal 8 anggota. Lingkar Teman lebih sederhana — semua anggota setara, maksimal 20 anggota. Cocok untuk pasangan, teman, atau komunitas.",
  },
  {
    id: "2",
    question: "Bagaimana cara mengajak anggota keluarga bergabung?",
    answer:
      "Buka halaman Lingkar Baca, salin kode undangan atau bagikan langsung lewat WhatsApp. Anggota baru bisa bergabung lewat mulaibaca.id/lingkar-baca/gabung dengan memasukkan kode tersebut. Untuk Lingkar Keluarga, admin juga bisa menambah akun anak langsung tanpa perlu email.",
  },
  {
    id: "3",
    question: "Apa itu streak dan bagaimana cara menjaganya?",
    answer:
      "Streak adalah jumlah hari berturut-turut kamu mencatat bacaan. Cukup catat minimal 1 halaman per hari untuk menjaga streak. Streak terputus jika ada hari tanpa catatan, tapi jangan khawatir — streak bisa dimulai lagi kapan saja.",
  },
  {
    id: "4",
    question: "Bagaimana cara mengganti username?",
    answer:
      "Username hanya bisa diatur sekali. Saat pertama kali mengisi di halaman Edit Profil, username akan langsung tersimpan dan tidak bisa diubah lagi. Username digunakan untuk profil publik di mulaibaca.id/u/username.",
  },
  {
    id: "5",
    question: "Apakah data saya aman?",
    answer:
      "Ya. Data bacaanmu bersifat pribadi dan hanya bisa dilihat oleh anggota Lingkar Baca yang sama. Review yang kamu set Publik akan muncul di halaman Review dan profil publikmu (jika username diisi). Kamu bisa mengatur anonimitas review kapan saja.",
  },
  {
    id: "6",
    question: "Bisakah menggunakan Mulaibaca sendirian tanpa bergabung Lingkar Baca?",
    answer:
      "Bisa. Kamu tetap bisa mencatat bacaan, menjaga streak, dan mengatur target mingguan tanpa bergabung ke Lingkar Baca mana pun. Fitur Lingkar Baca bersifat opsional — digunakan saat kamu ingin membaca bersama orang lain.",
  },
];

export default async function FAQPage() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("help_faqs")
    .select("id, question, answer")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const dbFaqs = (data ?? []) as { id: string; question: string; answer: string }[];
  const faqs = dbFaqs.length > 0 ? dbFaqs : FALLBACK_FAQS;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="min-h-dvh bg-parchment">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <header className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-1">
          <BackButton />
          <span className="font-display font-bold text-xl text-forest">mulaibaca</span>
          <span className="text-xs text-ink-muted">/ faq</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-h1">FAQ</h1>
          <p className="text-sm text-ink-muted mt-1">Pertanyaan yang sering diajukan</p>
        </div>

        <FaqAccordion faqs={faqs} />

        <div className="bg-amber-soft rounded-2xl border border-amber/30 p-5 text-center space-y-3">
          <p className="font-semibold text-ink">Tidak menemukan jawaban?</p>
          <Link href="/bantuan" className="btn-primary inline-flex">Hubungi kami</Link>
        </div>
      </main>
    </div>
  );
}
