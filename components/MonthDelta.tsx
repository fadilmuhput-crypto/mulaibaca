"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MonthDelta() {
  const [delta, setDelta] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/insights/monthly")
      .then((r) => r.ok && r.json())
      .then((d) => { if (d) setDelta(d.pagesDelta); })
      .catch(() => {});
  }, []);

  if (delta === null) return null;

  const up = delta >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ml-2 ${up ? "text-forest" : "text-error"}`}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {Math.abs(delta)}%
    </span>
  );
}
