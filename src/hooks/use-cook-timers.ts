"use client";

import { useCallback, useEffect, useState } from "react";

export interface CookTimer {
  id: string;
  label: string;
  endsAt: number;
  durationMs: number;
}

export interface TimerView extends CookTimer {
  remainingSeconds: number;
  done: boolean;
}

let audioCtx: AudioContext | null = null;

/** Create/resume the AudioContext. Must be called from a user gesture (iOS). */
function unlockAudio() {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    audioCtx ??= new Ctor();
    if (audioCtx.state === "suspended") void audioCtx.resume();
  } catch {
    // audio unavailable
  }
}

export function beep() {
  const ctx = audioCtx;
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      const start = t0 + i * 0.3;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.4, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.22);
    }
  } catch {
    // ignore
  }
}

/** Static timer list: changes only on start/cancel. Ticking lives in `useNow` consumers. */
export function useCookTimers() {
  const [timers, setTimers] = useState<CookTimer[]>([]);

  const start = useCallback((id: string, label: string, seconds: number) => {
    unlockAudio();
    const t = Date.now();
    setTimers((cur) =>
      cur.some((x) => x.id === id)
        ? cur
        : [...cur, { id, label, endsAt: t + seconds * 1000, durationMs: seconds * 1000 }],
    );
  }, []);

  const cancel = useCallback((id: string) => {
    setTimers((cur) => cur.filter((x) => x.id !== id));
  }, []);

  return { timers, start, cancel };
}

export type CookTimers = ReturnType<typeof useCookTimers>;

/** Re-renders only the calling component every 250ms while `active`. */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const first = setTimeout(() => setNow(Date.now()), 0);
    const h = setInterval(() => setNow(Date.now()), 250);
    return () => {
      clearTimeout(first);
      clearInterval(h);
    };
  }, [active]);
  return now;
}

export function timerView(t: CookTimer, now: number): TimerView {
  // `now` may predate the timer's start (stale tick): never count that as elapsed or done.
  const remainingMs = t.endsAt - Math.max(now, t.endsAt - t.durationMs);
  return { ...t, remainingSeconds: Math.max(0, Math.ceil(remainingMs / 1000)), done: remainingMs <= 0 };
}
