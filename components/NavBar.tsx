"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { Session } from "@/lib/session";
import { createClient } from "@/lib/supabase";
import AvatarIcon from "@/components/AvatarIcon";
import FeedbackModal from "@/components/FeedbackModal";
import FindFriendsModal from "@/components/FindFriendsModal";
import NotificationBell from "@/components/NotificationBell";
import GuestBanner from "@/components/GuestBanner";

/* ── SVG icon components (Heroicons outline 24px) ── */
function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      {active
        ? <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-1.72-1.72V5.25a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v1.79l-3.3-3.3a2.25 2.25 0 00-3.18 0l-7.5 7.5a.75.75 0 001.06 1.06l.94-.94V19.5a1.5 1.5 0 001.5 1.5h4.5a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v4.5c0 .414.336.75.75.75h4.5a1.5 1.5 0 001.5-1.5v-7.44l.94.94a.75.75 0 001.06-1.06l-8.69-8.69z" />
        : <path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      }
    </svg>
  );
}

function IconBooks({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      {active
        ? <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
        : <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      }
    </svg>
  );
}

function IconPencil({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      {active
        ? <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
        : <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      }
    </svg>
  );
}

function IconSearch({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      {active
        ? <path d="M21 21l-5.197-5.197a7.5 7.5 0 10-1.414 1.414L21 21zM10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" fill="currentColor" />
        : <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      }
    </svg>
  );
}

function IconChart({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      {active
        ? <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        : <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      }
    </svg>
  );
}

function IconBlog({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.75} strokeLinecap="round" strokeLinejoin="round">
      {active
        ? <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        : <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      }
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4l4 4 4-4" />
    </svg>
  );
}

const NAV = [
  { href: "/dashboard", label: "Beranda",  Icon: IconHome },
  { href: "/rak",       label: "Rak Buku", Icon: IconBooks },
  { href: "/log",       label: "Catat",    Icon: IconPencil },
  { href: "/jelajah",   label: "Jelajah",  Icon: IconSearch },
  { href: "/profil",    label: "Progress", Icon: IconChart },
];

export default function NavBar({ session }: { session: Session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [findFriendsOpen, setFindFriendsOpen] = useState(false);
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
    // Also clear acting_as cookie
    await fetch("/api/anggota-switch", { method: "DELETE" });
    router.push("/masuk");
    router.refresh();
  }

  async function handleExitSwitch() {
    await fetch("/api/anggota-switch", { method: "DELETE" });
    await new Promise((r) => setTimeout(r, 100));
    window.location.href = "/dashboard";
  }

  return (
    <>
      {session.isAnonymous && <GuestBanner />}
      {session.actingAs && (
        <div className="bg-amber px-4 py-2 flex items-center justify-between border-b-2 border-ink">
          <p className="text-sm font-semibold text-white">
            Mengelola sebagai <strong>{session.memberName}</strong>
          </p>
          <button
            onClick={handleExitSwitch}
            className="text-xs text-white/90 font-semibold hover:text-white underline underline-offset-2 min-h-[32px] px-1"
          >
            Kembali ke akunmu
          </button>
        </div>
      )}
      {/* ── Top header ──────────────────────── */}
      <header className="bg-surface border-b-2 border-ink px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <Link href="/dashboard" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Mulaibaca" width={28} height={28} className="rounded-full" />
          <span className="font-display font-black text-ink tracking-tight" style={{ fontSize: "1.1875rem", letterSpacing: "-0.03em" }}>
            mulaibaca
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors rounded-sm ${
                  active
                    ? "bg-amber text-white nav-active"
                    : "text-ink-secondary hover:text-ink hover:bg-cream"
                }`}
              >
                <Icon active={active} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
        <NotificationBell />

        {/* Profile dropdown */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-parchment transition-colors min-h-[44px]"
            aria-label="Menu profil"
            aria-expanded={open}
          >
            <span className="w-8 h-8 rounded-full bg-amber-soft border border-amber/20 flex items-center justify-center text-amber">
              <AvatarIcon avatar={session.memberAvatar} size={16} />
            </span>
            <span className="hidden sm:block text-sm font-medium text-ink max-w-[100px] truncate">
              {session.memberName}
            </span>
            <IconChevronDown className={`text-ink-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-2xl border border-border overflow-hidden z-30 brutal-shadow"
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-border bg-parchment/60">
                <p className="font-medium text-ink text-sm">{session.memberName}</p>
                <p className="text-xs text-ink-muted truncate mt-0.5">{session.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <Link
                  href="/profil"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-parchment transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Progress
                </Link>
                <button
                  onClick={() => { setOpen(false); setFindFriendsOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-parchment transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    <path d="M19.5 21v-4.5a2.25 2.25 0 00-2.25-2.25h-1.5" />
                  </svg>
                  Cari Teman
                </button>
                <Link
                  href="/bantuan"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-parchment transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>
                  </svg>
                  Bantuan
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-parchment transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Blog
                </Link>
                <button
                  onClick={() => { setOpen(false); setFeedbackOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-parchment transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  Beri Masukan
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error-soft transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
        </div>{/* end flex items-center gap-1 */}
      </header>

      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
      {findFriendsOpen && <FindFriendsModal memberId={session.memberId} onClose={() => setFindFriendsOpen(false)} />}

      {/* ── Bottom nav (mobile) ──────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t-2 border-ink z-20 sm:hidden">
        <div className="flex pb-safe">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors ${
                  active ? "text-amber" : "text-ink-muted"
                }`}
                aria-label={label}
              >
                <Icon active={active} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
