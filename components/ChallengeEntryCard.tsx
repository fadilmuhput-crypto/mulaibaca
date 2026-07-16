"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Award, ChevronRight } from "lucide-react";

export default function ChallengeEntryCard() {
  const [active, setActive] = useState(0);
  const [badges, setBadges] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/challenges/summary")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d) { setActive(d.active); setBadges(d.badges); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <Link
      href="/komunitas"
      className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3 hover:border-amber/40 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-amber-soft flex items-center justify-center flex-shrink-0">
        <Award size={16} strokeWidth={1.75} className="text-amber" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">Tantangan Membaca</p>
        {active > 0 ? (
          <p className="text-xs text-ink-muted">{active} tantangan aktif · {badges} lencana</p>
        ) : (
          <p className="text-xs text-ink-muted">Ikuti tantangan dan dapatkan lencana</p>
        )}
      </div>
      <ChevronRight size={16} className="text-ink-muted flex-shrink-0" />
    </Link>
  );
}
