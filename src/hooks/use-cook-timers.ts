"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

function beep() {
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

/** In-memory countdown timers (lost on reload by design). */
export function useCookTimers() {
  const [timers, setTimers] = useState<CookTimer[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const fired = useRef(new Set<string>());

  useEffect(() => {
    if (timers.length === 0) return;
    const h = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(h);
  }, [timers.length]);

  const views: TimerView[] = timers.map((t) => {
    const remainingMs = t.endsAt - now;
    return { ...t, remainingSeconds: Math.max(0, Math.ceil(remainingMs / 1000)), done: remainingMs <= 0 };
  });

  const doneIds = views.filter((v) => v.done).map((v) => v.id).join(",");
  useEffect(() => {
    const fresh = doneIds.split(",").filter((id) => id && !fired.current.has(id));
    if (fresh.length === 0) return;
    fresh.forEach((id) => fired.current.add(id));
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      // unsupported
    }
    beep();
  }, [doneIds]);

  const start = useCallback((id: string, label: string, seconds: number) => {
    unlockAudio();
    const t = Date.now();
    setNow(t);
    setTimers((cur) =>
      cur.some((x) => x.id === id)
        ? cur
        : [...cur, { id, label, endsAt: t + seconds * 1000, durationMs: seconds * 1000 }],
    );
  }, []);

  const cancel = useCallback((id: string) => {
    fired.current.delete(id);
    setTimers((cur) => cur.filter((x) => x.id !== id));
  }, []);

  return { timers: views, start, cancel };
}

export type CookTimers = ReturnType<typeof useCookTimers>;
