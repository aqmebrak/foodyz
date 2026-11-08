"use client";

import { ArrowLeft, ArrowRight, Check, ListChecks, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import type { CookTimers } from "@/hooks/use-cook-timers";
import type { UseRecipeProgress } from "@/hooks/use-recipe-progress";
import { useWakeLock } from "@/hooks/use-wake-lock";
import { parseTimers } from "@/lib/timers";
import { cn } from "@/lib/utils";

import { type ChecklistIngredient, IngredientChecklist } from "./IngredientChecklist";
import { StepTimerChip, TimerStack } from "./TimerViews";

interface CookModeProps {
  steps: string[];
  ingredients: ChecklistIngredient[];
  formatQty: (n: number) => string;
  progress: UseRecipeProgress;
  timers: CookTimers;
  onClose: () => void;
}

const SWIPE_PX = 50;
const TAP_PX = 10;
const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function CookMode({ steps, ingredients, formatQty, progress, timers, onClose }: CookModeProps) {
  const [current, setCurrent] = useState(() => progress.firstUncheckedStep ?? 0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const pointer = useRef<{ x: number; y: number; id: number } | null>(null);

  useWakeLock(true);

  // Scroll lock + focus restore
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      opener?.focus?.();
    };
  }, []);

  useEffect(() => {
    nextRef.current?.focus();
  }, []);

  const last = steps.length - 1;
  const step = steps[current] ?? "";
  const stepTimers = useMemo(() => parseTimers(step), [step]);

  function goNext() {
    progress.setStepDone(current, true);
    if (current >= last) {
      for (let i = 0; i <= last; i++) progress.setStepDone(i, true);
      onClose();
      return;
    }
    setDirection("next");
    setCurrent(current + 1);
  }

  function goPrev() {
    if (current === 0) return;
    setDirection("prev");
    setCurrent(current - 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // the sheet owns the keyboard while open (and while it animates out, so Esc doesn't also close cooking)
      if (ingredientsOpen || document.querySelector('[data-slot="drawer-content"]')) return;
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
      else if (e.key === "Tab" && rootRef.current) {
        const els = [...rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (els.length === 0) return;
        const first = els[0];
        const lastEl = els[els.length - 1];
        const active = document.activeElement;
        if (!rootRef.current.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && active === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function onPointerDown(e: React.PointerEvent) {
    pointer.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== e.pointerId) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) goNext();
      else goPrev();
      return;
    }
    if (Math.abs(dx) > TAP_PX || Math.abs(dy) > TAP_PX) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    if (rel < 1 / 3) goPrev();
    else if (rel > 2 / 3) goNext();
  }

  const timerIdFor = (index: number) => `${current}:${index}`;

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Cooking mode"
      className="fixed inset-0 z-[45] flex flex-col overscroll-contain bg-enamel pt-[env(safe-area-inset-top)] text-ink"
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 pt-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close cooking mode"
          className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-steam focus-visible:outline-2 focus-visible:outline-basil"
        >
          <X className="size-6" />
        </button>
        <p className="flex-1 text-center text-base font-semibold tabular-nums" aria-live="polite">
          Step {current + 1} of {steps.length}
        </p>
        <button
          type="button"
          onClick={() => setIngredientsOpen(true)}
          aria-label="Show ingredients"
          className="flex h-11 shrink-0 items-center gap-2 rounded-full px-3 text-base font-semibold text-basil hover:bg-steam focus-visible:outline-2 focus-visible:outline-basil"
        >
          <ListChecks className="size-5" />
          Ingredients
        </button>
      </div>

      <TimerStack timers={timers.timers} onCancel={timers.cancel} />

      {/* Step text: swipe + tap zones */}
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (pointer.current = null)}
        className="flex min-h-0 flex-1 touch-pan-y overflow-y-auto px-6 py-6 select-none"
      >
        <div
          key={current}
          className={cn(
            "m-auto flex w-full max-w-[60ch] flex-col gap-6",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150",
            direction === "next"
              ? "motion-safe:slide-in-from-right-8"
              : "motion-safe:slide-in-from-left-8",
          )}
        >
          <p className="text-[clamp(22px,6.2vw,28px)] leading-[1.45]">{step}</p>
        </div>
      </div>

      {/* Timer chips stay pinned above the nav so long steps never hide them */}
      {stepTimers.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6 pb-3">
          {stepTimers.map((t) => {
            const id = timerIdFor(t.index);
            return (
              <StepTimerChip
                key={id}
                label={t.label}
                timer={timers.timers.find((x) => x.id === id)}
                onStart={() => timers.start(id, t.label, t.seconds)}
              />
            );
          })}
        </div>
      )}

      {/* Bottom: progress + nav */}
      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div
          className="mb-3 flex gap-1"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={current + 1}
          aria-label="Recipe progress"
        >
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i === current ? "bg-yolk" : i < current || progress.checkedSteps.has(i) ? "bg-basil" : "bg-steam",
              )}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={current === 0}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-steam bg-white text-lg font-semibold disabled:opacity-40"
          >
            <ArrowLeft className="size-5" />
            Previous
          </button>
          <button
            ref={nextRef}
            type="button"
            onClick={goNext}
            className="flex h-14 flex-[1.6] items-center justify-center gap-2 rounded-xl bg-basil text-lg font-bold text-white active:bg-basil/80"
          >
            {current >= last ? (
              <>
                <Check className="size-5" /> Finish
              </>
            ) : (
              <>
                Next <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </div>
      </div>

      <Drawer open={ingredientsOpen} onOpenChange={setIngredientsOpen} direction="bottom">
        <DrawerContent className="max-h-[85dvh] bg-enamel">
          <DrawerHeader className="pb-0">
            <DrawerTitle className="font-display text-xl text-ink">Ingredients</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <IngredientChecklist
              ingredients={ingredients}
              checked={progress.checkedIngredients}
              onToggle={progress.toggleIngredient}
              formatQty={formatQty}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>,
    document.body,
  );
}
