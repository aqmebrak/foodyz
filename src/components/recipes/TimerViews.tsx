"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { beep, type CookTimer, timerView, useNow } from "@/hooks/use-cook-timers";
import { formatCountdown } from "@/lib/timers";
import { cn } from "@/lib/utils";

/** Fires vibrate + beep once per timer that finishes. Owns its own tick; renders nothing. */
export function TimerAlarm({ timers }: { timers: CookTimer[] }) {
  const now = useNow(timers.length > 0);
  const fired = useRef(new Set<string>());
  const doneIds = timers
    .filter((t) => timerView(t, now).done)
    .map((t) => t.id)
    .join(",");
  useEffect(() => {
    const live = new Set(timers.map((t) => t.id));
    fired.current.forEach((id) => live.has(id) || fired.current.delete(id));
    const fresh = doneIds.split(",").filter((id) => id && !fired.current.has(id));
    if (fresh.length === 0) return;
    fresh.forEach((id) => fired.current.add(id));
    try {
      navigator.vibrate?.([200, 100, 200]);
    } catch {
      // unsupported
    }
    beep();
  }, [doneIds, timers]);
  return null;
}

export function TimerStack({ timers, onCancel }: { timers: CookTimer[]; onCancel: (id: string) => void }) {
  const now = useNow(timers.length > 0);
  if (timers.length === 0) return null;
  return (
    <ul className="flex gap-2 overflow-x-auto px-4 pb-1 pt-2" aria-label="Timers">
      {timers.map((t) => {
        const v = timerView(t, now);
        return (
          <li
            key={t.id}
            role={v.done ? "alert" : undefined}
            className={cn(
              "flex h-12 shrink-0 items-center gap-1 rounded-full border pl-4 pr-0.5 text-base font-semibold tabular-nums",
              v.done ? "border-yolk bg-yolk text-ink motion-safe:animate-pulse" : "border-steam bg-white",
            )}
          >
            <span>{v.done ? `${t.label} done` : formatCountdown(v.remainingSeconds)}</span>
            <button
              type="button"
              onClick={() => onCancel(t.id)}
              aria-label={`${v.done ? "Dismiss" : "Cancel"} ${t.label} timer`}
              className="flex size-11 items-center justify-center rounded-full hover:bg-black/10"
            >
              <X className="size-5" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Step chip: label, or live countdown once started. */
export function StepTimerChip({
  label,
  timer,
  onStart,
}: {
  label: string;
  timer: CookTimer | undefined;
  onStart: () => void;
}) {
  const now = useNow(!!timer);
  const v = timer ? timerView(timer, now) : null;
  return (
    <button
      type="button"
      onClick={onStart}
      disabled={!!v}
      className={cn(
        "flex h-12 items-center gap-2 rounded-full border-2 px-5 text-lg font-semibold tabular-nums",
        v
          ? v.done
            ? "border-yolk bg-yolk text-ink motion-safe:animate-pulse"
            : "border-basil bg-basil text-white"
          : "border-basil bg-white text-basil",
      )}
    >
      <span aria-hidden>⏲</span>
      {v ? (v.done ? "Done" : formatCountdown(v.remainingSeconds)) : label}
    </button>
  );
}

/** Compact chip for the page's sticky bar: soonest timer; tap reopens cook mode. */
export function TimerBarChip({ timers, onOpen }: { timers: CookTimer[]; onOpen: () => void }) {
  const now = useNow(timers.length > 0);
  if (timers.length === 0) return null;
  const views = timers.map((t) => timerView(t, now)).sort((a, b) => a.endsAt - b.endsAt);
  const first = views[0];
  const anyDone = views.some((v) => v.done);
  const shown = anyDone ? views.find((v) => v.done)! : first;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={anyDone ? "Timer done, open cooking mode" : "Timer running, open cooking mode"}
      className={cn(
        "flex h-14 shrink-0 items-center gap-2 rounded-xl border-2 px-4 text-lg font-bold tabular-nums",
        anyDone
          ? "border-yolk bg-yolk text-ink motion-safe:animate-pulse"
          : "border-basil bg-white text-basil",
      )}
    >
      <span aria-hidden>⏲</span>
      {anyDone ? "Done" : formatCountdown(shown.remainingSeconds)}
      {views.length > 1 && <span className="text-sm font-semibold">+{views.length - 1}</span>}
    </button>
  );
}
