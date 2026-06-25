"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, BellDot, Info, Trophy, Megaphone, X } from "lucide-react";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === "achievement") return <Trophy size={14} strokeWidth={2} className="text-amber" />;
  if (type === "system") return <Megaphone size={14} strokeWidth={2} className="text-forest" />;
  return <Info size={14} strokeWidth={2} className="text-ink-muted" />;
}

export default function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.is_read).length;

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.ok ? r.json() : [])
      .then(setNotifs)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function markAllRead() {
    if (unread === 0) return;
    setLoading(true);
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setLoading(false);
  }

  function handleOpen() {
    setOpen((v) => !v);
    if (!open && unread > 0) markAllRead();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-parchment transition-colors"
        aria-label="Notifikasi"
      >
        {unread > 0 ? (
          <BellDot size={20} strokeWidth={1.75} className="text-ink" />
        ) : (
          <Bell size={20} strokeWidth={1.75} className="text-ink-secondary" />
        )}
        {unread > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-error text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 bg-surface rounded-2xl border border-border overflow-hidden z-30"
          style={{ boxShadow: "var(--shadow-dropdown)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-parchment/60">
            <p className="font-semibold text-sm text-ink">Notifikasi</p>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="text-xs text-amber hover:text-amber-hover font-medium disabled:opacity-50"
                >
                  Tandai dibaca
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-ink-muted hover:text-ink min-h-[32px] min-w-[32px] flex items-center justify-center">
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifs.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={28} strokeWidth={1.25} className="text-ink-muted mx-auto mb-2" />
                <p className="text-xs text-ink-muted">Belum ada notifikasi</p>
              </div>
            ) : (
              notifs.map((n) => {
                const content = (
                  <div className={`flex gap-3 px-4 py-3 transition-colors hover:bg-parchment/60 ${!n.is_read ? "bg-amber-soft/30" : ""}`}>
                    <div className="w-7 h-7 rounded-full bg-parchment border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      <NotifIcon type={n.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.is_read ? "font-semibold text-ink" : "text-ink-secondary"}`}>
                        {n.title}
                      </p>
                      {n.body && <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-ink-muted mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-amber flex-shrink-0 mt-2" />
                    )}
                  </div>
                );

                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
