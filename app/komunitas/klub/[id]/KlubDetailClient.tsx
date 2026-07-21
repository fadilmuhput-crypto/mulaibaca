"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, BookOpen, Copy, ChevronLeft, Check } from "lucide-react";
import type { Club, ClubMember } from "@/lib/clubs";

type Props = {
  club: Club & { member_count: number };
  members: ClubMember[];
  memberId: string;
};

export default function KlubDetailClient({ club, members, memberId }: Props) {
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isAdmin = members.some((m) => m.member_id === memberId && m.role === "admin");
  const isMember = members.some((m) => m.member_id === memberId);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(club.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function handleLeave() {
    if (!confirm("Yakin mau keluar dari klub ini?")) return;
    setLeaving(true);
    try {
      await fetch(`/api/clubs/${club.id}/leave`, { method: "POST" });
      window.location.href = "/komunitas";
    } catch {}
    setLeaving(false);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      <Link href="/komunitas" className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 mb-4 transition-colors">
        <ChevronLeft size={14} /> Kembali
      </Link>

      {/* Header */}
      <div className="bg-surface rounded-2xl border border-border p-5 mb-4">
        <h1 className="font-display text-xl font-bold text-ink mb-1">{club.name}</h1>
        {club.description && <p className="text-sm text-ink-muted">{club.description}</p>}

        <div className="flex items-center gap-4 mt-4 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1"><Users size={13} /> {club.member_count} anggota</span>
        </div>

        {isAdmin && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={copyCode}
              className="btn-secondary-sm flex items-center gap-1.5 text-xs"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Tersalin!" : `Salin Kode: ${club.invite_code}`}
            </button>
          </div>
        )}
      </div>

      {/* Members */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-ink-muted mb-3 flex items-center gap-1.5">
          <Users size={12} /> Anggota
        </h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3">
              <div className="w-9 h-9 rounded-full bg-parchment border border-border flex items-center justify-center text-base flex-shrink-0">
                {m.members?.avatar ?? "📖"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">
                  {m.members?.name ?? "Anggota"}
                  {m.role === "admin" && (
                    <span className="ml-1.5 text-[10px] font-bold text-amber uppercase tracking-wider">Admin</span>
                  )}
                </p>
                {m.members?.username && (
                  <p className="text-[11px] text-ink-muted">@{m.members.username}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leave button */}
      {isMember && !isAdmin && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="text-xs text-red-400 hover:text-red-500 transition-colors"
          >
            {leaving ? "…" : "Keluar dari klub"}
          </button>
        </div>
      )}
    </main>
  );
}
