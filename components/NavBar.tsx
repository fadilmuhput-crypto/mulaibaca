"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Beranda", icon: "🏠" },
  { href: "/rak", label: "Rak Buku", icon: "📚" },
  { href: "/log", label: "Log Baca", icon: "📝" },
  { href: "/review", label: "Review", icon: "⭐" },
];

export default function NavBar({ session }: { session: Session }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/keluar", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Top header */}
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/dashboard" className="text-lg font-display font-bold text-forest">
          mulaibaca
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-ink-secondary hover:text-ink transition-colors"
        >
          <span className="text-xl">{session.memberAvatar}</span>
          <span className="hidden sm:block">{session.memberName}</span>
        </button>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-10 sm:hidden">
        <div className="flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
                  active ? "text-amber" : "text-ink-muted"
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
