import Link from "next/link";
import type { ChallengeWithStatus } from "@/lib/challenges";

export default function ChallengeWidget({
  active,
  available,
}: {
  active: ChallengeWithStatus[];
  available: ChallengeWithStatus[];
}) {
  const total = active.length + available.length;
  if (total === 0) return null;

  return (
    <section>
      <div className="section-header">
        <h2 className="text-xs font-black uppercase tracking-widest text-ink-muted">
          Tantangan
        </h2>
        <Link href="/tantangan" className="section-link">Lihat semua →</Link>
      </div>

      <div className="space-y-2.5">
        {/* Active challenges (compact) */}
        {active.slice(0, 2).map((c) => {
          const pct = Math.min(Math.round((c.progress / c.goal_value) * 100), 100);
          return (
            <Link
              key={c.id}
              href={`/tantangan/${c.id}`}
              className="flex items-center gap-3 bg-surface rounded-xl border border-border p-3 hover:border-amber/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-soft text-lg">
                {c.badge_icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-ink-secondary truncate">{c.title}</span>
                  <span className="text-xs font-bold text-ink">{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </Link>
          );
        })}

        {/* Available count */}
        {available.length > 0 && active.length < 2 && (
          <Link
            href="/tantangan"
            className="flex items-center gap-3 bg-parchment rounded-xl border border-dashed border-border p-3 hover:border-amber/40 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-surface text-ink-muted text-lg border border-border">
              +
            </div>
            <p className="text-xs font-semibold text-ink-muted">
              {available.length} tantangan tersedia untuk diikuti
            </p>
          </Link>
        )}
      </div>
    </section>
  );
}
