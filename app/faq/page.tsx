"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Apa itu Mulaibaca?",
    a: "Mulaibaca adalah aplikasi pencatat bacaan untuk keluarga. Kamu bisa melacak buku yang sedang dibaca, mau dibaca, dan sudah selesai — semua dalam satu ruang keluarga.",
  },
  {
    q: "Apakah Mulaibaca gratis?",
    a: "Ya, Mulaibaca gratis digunakan. Tidak ada biaya berlangganan untuk fitur dasar seperti mencatat buku, membuat keluarga, dan melihat statistik bacaan.",
  },
  {
    q: "Bagaimana cara menambahkan anggota keluarga?",
    a: "Buka halaman Keluarga, lalu klik tombol \"Tambah Anggota\". Kamu bisa mengundang lewat link undangan, kode undangan, atau menambahkan langsung untuk anak kecil.",
  },
  {
    q: "Apa bedanya peran anggota (Ayah, Ibu, Anak, Dewasa)?",
    a: "Peran membantu mengelompokkan anggota keluarga dan personalisasi rekomendasi buku. Anak mendapat rekomendasi buku yang sesuai dengan usianya. Peran bisa diubah di halaman Profil.",
  },
  {
    q: "Apa yang dimaksud dengan Rak Buku?",
    a: "Rak Buku adalah halaman pribadi yang berisi semua buku yang kamu tandai — baik yang sedang dibaca, mau dibaca, atau sudah selesai. Kamu bisa mengelola status dan melihat review di sini.",
  },
  {
    q: "Bagaimana cara menambahkan buku ke rak?",
    a: "Cari buku di halaman Jelajah, lalu tekan tombol \"Mau Baca\" atau \"Sedang Baca\". Buku akan otomatis masuk ke Rak Bukumu.",
  },
  {
    q: "Bisakah saya menambahkan buku yang tidak ada di koleksi?",
    a: "Ya. Kamu bisa menambahkan buku manual lewat halaman Jelajah dengan menekan \"Tambah manual\". Cukup isi judul dan pengarang.",
  },
  {
    q: "Apa itu target mingguan?",
    a: "Target mingguan adalah jumlah halaman yang ingin kamu baca dalam seminggu. Kamu bisa atur target di halaman Profil dan lihat perkembangannya di Dashboard.",
  },
  {
    q: "Bagaimana cara memberi review buku?",
    a: "Dari Rak Buku, klik buku yang sudah selesai kamu baca. Di halaman detail, kamu bisa menulis review dan memberi rating.",
  },
  {
    q: "Apa itu 'acting as'?",
    a: "Fitur 'acting as' memungkinkan orang tua melihat dashboard dan rak buku anak. Cukup pilih nama anak dari halaman Keluarga untuk beralih.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Kami menggunakan enkripsi standar industri untuk melindungi data kamu. Informasi pribadi tidak dibagikan ke pihak ketiga tanpa persetujuan.",
  },
  {
    q: "Bagaimana cara menghubungi tim Mulaibaca?",
    a: "Kunjungi halaman Bantuan untuk mengirim pesan langsung ke tim kami. Kami akan merespon secepatnya.",
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-ink">{q}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={`flex-shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-sm text-ink-secondary leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-dvh bg-parchment">
      <header className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="text-xl font-display font-bold text-forest">mulaibaca</Link>
          <span className="text-xs text-ink-muted">/ faq</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-h1">FAQ</h1>
          <p className="text-sm text-ink-muted mt-1">Pertanyaan yang sering diajukan</p>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q} {...faq} />
          ))}
        </div>

        <div className="bg-amber-soft rounded-2xl border border-amber/30 p-5 text-center space-y-3">
          <p className="font-semibold text-ink">Tidak menemukan jawaban?</p>
          <Link href="/bantuan" className="btn-primary inline-flex">Hubungi kami</Link>
        </div>
      </main>
    </div>
  );
}
