"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Square } from "lucide-react";

export default function BookTimer({
  onDuration,
}: {
  onDuration: (minutes: number) => void;
}) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clear;
  }, [clear]);

  function start() {
    startRef.current = Date.now() - elapsed * 1000;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
  }

  function stop() {
    clear();
    setRunning(false);
    const minutes = Math.round(elapsed / 60);
    if (minutes > 0) onDuration(minutes);
    setElapsed(0);
  }

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <div className="flex items-center justify-between bg-parchment rounded-xl border border-border p-3">
      <div className="flex items-center gap-2">
        <div className="font-display text-lg font-black text-ink tabular-nums min-w-[3.5rem]">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <span className="text-xs text-ink-muted">book time</span>
      </div>
      {running ? (
        <button
          type="button"
          onClick={stop}
          className="flex items-center gap-1.5 bg-error text-white text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-error/90 transition-colors"
        >
          <Square size={12} strokeWidth={2.5} fill="currentColor" />
          Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={start}
          className="flex items-center gap-1.5 bg-forest text-white text-sm font-semibold px-4 py-1.5 rounded-xl hover:bg-forest/90 transition-colors"
        >
          <Play size={12} strokeWidth={2.5} fill="currentColor" />
          Mulai
        </button>
      )}
    </div>
  );
}
