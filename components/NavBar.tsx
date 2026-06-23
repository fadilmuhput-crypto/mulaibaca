"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { Session } from "@/lib/session";
import { createClient } from "@/lib/supabase";

const NAV = [
  { href: "/dashboard", label: "Beranda", icon: "🏠" },
  { href: "/rak", label: "Rak Buku", icon: "📚" },
  { href: "/log", label: "Log Baca", icon: "📝" },
  { href: "/review", label: "Review", icon: "⭐" },
];

export default function NavBar({ session }: { session: Session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/masuk");
    router.refresh();
  }

  return (
    <>
      {/* Top header */}
      <header className="bg-surface/80 backdrop-blur-md border-b border-border/60 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/dashboard" className="text-lg font-display font-bold text-forest tracking-tight">
          mulaibaca
        </Link>

        {/* Profile button + dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-parchment transition-colors"
          >
            <span className="w-8 h-8 rounded-full bg-amber-soft border border-amber/20 flex items-center justify-center text-lg leading-none">
              {session.memberAvatar}
            </span>
            <span className="hidden sm:block text-sm font-medium text-ink max-w-[100px] truncate">
              {session.memberName}
            </span>
            <svg className={`w-3.5 h-3.5 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl border border-border shadow-lg shadow-ink/5 overflow-hidden z-30">
              {/* User info */}
              <div className="px-4 py-3 border-b border-border bg-parchment/50">
                <p className="font-medium text-ink text-sm">{session.memberName}</p>
                <p className="text-xs text-ink-muted truncate">{session.email}</p>
              </div>

              {/* Family */}
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide mb-1">Keluarga</p>
                <p className="text-sm text-ink font-medium truncate">{session.familyName}</p>
                {session.inviteCode && (
                  <p className="text-xs text-ink-muted font-mono mt-0.5 tracking-widest uppercase">
                    {session.inviteCode}
                  </p>
                )}
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/profil"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-parchment transition-colors"
                >
                  <span className="text-base">👤</span> Profil & Keluarga
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <span className="text-base">🚪</span> Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-border/60 z-20 sm:hidden">
        <div className="flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? "text-amber" : "text-ink-muted"
                }`}
              >
                <span className={`text-xl leading-none transition-transform ${active ? "scale-110" : ""}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
