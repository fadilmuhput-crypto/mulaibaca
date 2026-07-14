"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check, Loader2, ChevronDown, ChevronRight,
  HelpCircle, BookOpen, MessageSquare,
  AlertTriangle, Lightbulb, Bug, Mail, Info,
} from "lucide-react";
import BackButton from "@/components/BackButton";

const CATEGORIES = [
  { key: "komplain",  label: "Komplain",   icon: AlertTriangle },
  { key: "inquiry",   label: "Pertanyaan", icon: HelpCircle },
  { key: "saran",     label: "Saran",      icon: Lightbulb },
  { key: "bug",       label: "Lapor Bug",  icon: Bug },
  { key: "lainnya",   label: "Lainnya",    icon: Mail },
];

function FaqItem({ q, a }: { q: string; a: string }) {
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

const SAMPLE_FAQ = [
  { q: "Apa itu Mulaibaca?", a: "Mulaibaca adalah aplikasi pencatat bacaan yang dirancang untuk keluarga. Setiap keluarga punya Lingkar Baca — ruang bersama untuk saling memantau progres bacaan, berbagi rekomendasi buku, dan bertumbuh bersama." },
  { q: "Apa itu Lingkar Baca?", a: "Lingkar Baca adalah ruang bersama antar anggota. Kamu bisa membuat lingkar sendiri, mengundang anggota lain (pasangan, anak, saudara) dengan kode undangan, dan melihat progres bacaan satu sama lain. Cocok untuk membangun kebiasaan membaca bersama." },
  { q: "Bagaimana cara menambahkan anggota ke Lingkar Baca?", a: "Buka halaman Lingkar Baca, bagikan kode undangan ke orang terdekatmu. Mereka tinggal masuk ke mulaibaca.id/lingkar-baca/gabung, masukkan kode, dan langsung bergabung ke lingkar bacamu." },
  { q: "Apa perbedaan peran Ayah, Ibu, Anak, dan Dewasa?", a: "Peran ini membantu menyesuaikan rekomendasi buku berdasarkan usia. Misalnya, anak akan dapat rekomendasi buku anak-anak, sementara Ayah/Ibu/Dewasa dapat rekomendasi yang lebih umum. Peran bisa diubah kapan saja di halaman Profil." },
  { q: "Bagaimana cara menambahkan buku ke rak?", a: "Cari buku di halaman Jelajah, lalu tekan tombol 'Mau Baca' atau 'Sedang Baca'. Buku akan otomatis masuk ke Rak Bukumu. Kamu juga bisa tambah buku manual lewat halaman Rak." },
  { q: "Apakah Mulaibaca gratis?", a: "Ya, Mulaibaca gratis digunakan. Tidak ada biaya berlangganan untuk fitur dasar seperti mencatat buku, membuat ruang keluarga, mengundang anggota, dan melihat statistik bacaan." },
];

export default function BantuanPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || null, email: email || null, category, subject: subject || null, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-dvh bg-parchment flex items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
            <Check size={28} strokeWidth={2} className="text-forest" />
          </div>
          <h1 className="text-h1 mb-2">Pesan terkirim!</h1>
          <p className="text-sm text-ink-muted mb-6">Tim kami akan merespon secepatnya.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="btn-primary">Ke Beranda</Link>
            <button
              onClick={() => { setDone(false); setMessage(""); setSubject(""); setCategory(""); setName(""); setEmail(""); }}
              className="btn-secondary"
            >
              Kirim lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-parchment">
      <header className="bg-surface border-b border-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-1">
          <BackButton />
          <span className="font-display font-bold text-xl text-forest">mulaibaca</span>
          <span className="text-xs text-ink-muted">/ bantuan</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-10">

        {/* Hero */}
        <div>
          <h1 className="text-h1">Bantuan</h1>
          <p className="text-sm text-ink-muted mt-1">Temukan jawaban atau hubungi tim kami</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/panduan"
            className="bg-surface rounded-2xl border border-border p-4 flex flex-col items-center text-center gap-2 hover:border-amber/40 transition-colors"
          >
            <BookOpen size={22} strokeWidth={1.75} className="text-amber" />
            <span className="text-sm font-semibold text-ink">Panduan</span>
            <span className="text-[11px] text-ink-muted">Cara menggunakan Mulaibaca</span>
          </Link>
          <Link
            href="/faq"
            className="bg-surface rounded-2xl border border-border p-4 flex flex-col items-center text-center gap-2 hover:border-amber/40 transition-colors"
          >
            <HelpCircle size={22} strokeWidth={1.75} className="text-amber" />
            <span className="text-sm font-semibold text-ink">FAQ</span>
            <span className="text-[11px] text-ink-muted">Pertanyaan umum</span>
          </Link>
        </div>

        {/* FAQ preview */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-h2">FAQ</h2>
            <Link href="/faq" className="text-xs text-amber font-semibold flex items-center gap-0.5 hover:text-amber-hover transition-colors">
              Lihat semua <ChevronRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
          <div className="space-y-2">
            {SAMPLE_FAQ.map((faq) => (
              <FaqItem key={faq.q} {...faq} />
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section id="hubungi">
          <h2 className="text-h2 mb-1">Hubungi Kami</h2>
          <p className="text-sm text-ink-muted mb-5">Ada pertanyaan atau masalah? Isi form di bawah.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="input-label">Nama</label>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama kamu" className="input" />
              </div>
              <div>
                <label htmlFor="email" className="input-label">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" className="input" />
              </div>
            </div>

            <div>
              <label className="input-label">Kategori</label>
              <div className="flex gap-2 flex-wrap mt-2">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const active = category === c.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCategory(active ? "" : c.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm transition-all ${
                        active
                          ? "border-amber bg-amber-soft text-amber font-semibold"
                          : "border-border text-ink-secondary hover:border-amber/40"
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.75} />
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="input-label">Subjek</label>
              <input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Inti pesan kamu" className="input" />
            </div>

            <div>
              <label htmlFor="message" className="input-label">Pesan *</label>
              <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Ceritakan detailnya…" className="input resize-none mt-1 w-full" required />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-error text-sm bg-error-soft rounded-xl px-4 py-3">
                <Info size={15} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={sending || !message.trim()} className="btn-primary-full-lg flex items-center justify-center gap-2">
              {sending ? (
                <><Loader2 size={16} className="animate-spin" /> Mengirim…</>
              ) : (
                <><MessageSquare size={16} strokeWidth={1.75} /> Kirim Pesan</>
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
