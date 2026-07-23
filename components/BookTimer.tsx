"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Square } from "lucide-react";

const TIMER_KEY = "mulaibaca:book-timer";

function loadTimerState() {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { elapsed: number; savedAt: number };
    const elapsedSinceSave = Math.floor((Date.now() - saved.savedAt) / 1000);
    return { elapsed: saved.elapsed + elapsedSinceSave };
  } catch {
    return null;
  }
}

function saveTimerState(elapsed: number) {
  try {
    localStorage.setItem(TIMER_KEY, JSON.stringify({ elapsed, savedAt: Date.now() }));
  } catch { /* ignore */ }
}

function clearTimerState() {
  try { localStorage.removeItem(TIMER_KEY); } catch { /* ignore */ }
}

export default function BookTimer({
  onDuration,
}: {
  onDuration: (minutes: number) => void;
}) {
  const saved = useRef(loadTimerState());
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(!!saved.current);
  const [elapsed, setElapsed] = useState(saved.current?.elapsed ?? 0);
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
    setPaused(false);
    setRunning(true);
    clearTimerState();
    intervalRef.current = setInterval(() => {
      const now = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(now);
      saveTimerState(now);
    }, 1000);
  }

  function togglePause() {
    if (paused) {
      start();
    } else {
      clear();
      setPaused(true);
      saveTimerState(elapsed);
    }
  }

  function stop() {
    clear();
    setRunning(false);
    setPaused(false);
    clearTimerState();
    const minutes = Math.round(elapsed / 60);
    if (minutes > 0) onDuration(minutes);
    setElapsed(0);
    saved.current = null;
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
      <div className="flex items-center gap-2">
        {running || paused ? (
          <>
            <button
              type="button"
              onClick={togglePause}
              className="flex items-center gap-1.5 bg-amber text-white text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-amber/90 transition-colors"
            >
              {paused ? (
                <Play size={12} strokeWidth={2.5} fill="currentColor" />
              ) : (
                <Pause size={12} strokeWidth={2.5} fill="currentColor" />
              )}
              {paused ? "Lanjut" : "Jeda"}
            </button>
            <button
              type="button"
              onClick={stop}
              className="flex items-center gap-1.5 bg-error text-white text-sm font-semibold px-3 py-1.5 rounded-xl hover:bg-error/90 transition-colors"
            >
              <Square size={12} strokeWidth={2.5} fill="currentColor" />
              Stop
            </button>
          </>
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
    </div>
  );
}
