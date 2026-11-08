"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface QuantityInputProps {
  id?: string;
  name?: string;
  value: number | string | undefined;
  onChange: (value: number) => void;
  onBlur?: () => void;
  ref?: React.Ref<HTMLInputElement>;
  "aria-label"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
}

function toNumber(v: number | string | undefined): number {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** Decimal input that accepts "1,5" and "1.5"; emits a number to the form. */
export function QuantityInput({
  id,
  name,
  value,
  onChange,
  onBlur,
  ref,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: QuantityInputProps) {
  const external = toNumber(value);
  const [text, setText] = useState(external === 0 ? "" : String(external));
  const [lastEmitted, setLastEmitted] = useState(external);

  // External change (e.g. form reset) -> resync the text.
  if (external !== lastEmitted) {
    setLastEmitted(external);
    setText(external === 0 ? "" : String(external));
  }

  return (
    <input
      ref={ref}
      id={id}
      name={name}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      enterKeyHint="next"
      placeholder="Qty"
      aria-label={ariaLabel ?? "Quantity"}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
      value={text}
      onBlur={onBlur}
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const next = e.target.value.replace(",", ".");
        if (!/^\d*\.?\d*$/.test(next)) return;
        setText(next);
        const n = next === "" || next === "." ? 0 : Number(next);
        setLastEmitted(n);
        onChange(n);
      }}
      className={cn(
        "h-11 w-full rounded-lg border border-steam bg-white px-3 text-base tabular-nums text-ink outline-none focus-visible:ring-2 focus-visible:ring-basil",
        "aria-invalid:border-paprika",
      )}
    />
  );
}
