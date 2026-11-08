"use client";

import { Minus, Plus } from "lucide-react";

interface ServingsStepperProps {
  value: number;
  onChange: (value: number) => void;
}

const buttonClass =
  "flex size-11 shrink-0 items-center justify-center rounded-full border border-steam bg-white text-ink transition-colors hover:bg-enamel active:bg-steam disabled:opacity-40";

export function ServingsStepper({ value, onChange }: ServingsStepperProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Decrease servings"
        className={buttonClass}
      >
        <Minus className="size-4" />
      </button>
      <div className="min-w-14 text-center leading-tight">
        <div className="text-lg font-bold tabular-nums text-ink">{value}</div>
        <div className="text-xs text-ink/60">servings</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Increase servings"
        className={buttonClass}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
