"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

interface NumberStepperProps {
  id?: string;
  value: number | "";
  onChange: (value: number | "") => void;
  label: string;
  min?: number;
  step?: number;
  suffix?: string;
  ref?: React.Ref<HTMLInputElement>;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
  onBlur?: () => void;
  name?: string;
}

const buttonClass =
  "flex size-11 shrink-0 items-center justify-center rounded-lg border border-steam bg-card text-ink transition-colors hover:bg-enamel active:bg-steam disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil";

export function NumberStepper({
  id,
  value,
  onChange,
  label,
  min = 0,
  step = 1,
  suffix,
  ref,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  onBlur,
  name,
}: NumberStepperProps) {
  const current = typeof value === "number" && !Number.isNaN(value) ? value : 0;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        className={buttonClass}
        disabled={current <= min}
        onClick={() => onChange(Math.max(min, current - step))}
      >
        <Minus className="size-4" />
      </button>
      <div className="relative min-w-0 flex-1">
        <input
          ref={ref}
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          enterKeyHint="next"
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          value={value === "" || Number.isNaN(value) ? "" : value}
          onBlur={onBlur}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            onChange(digits === "" ? "" : Number(digits));
          }}
          className={cn(
            "h-11 w-full rounded-lg border border-steam bg-card px-2 text-center text-base tabular-nums text-ink outline-none focus-visible:ring-2 focus-visible:ring-basil",
            suffix && "pr-9",
            "aria-invalid:border-paprika",
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-ink/50">
            {suffix}
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        className={buttonClass}
        onClick={() => onChange(current + step)}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
