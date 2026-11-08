"use client";

import { Check } from "lucide-react";

import { cn, unitLabel } from "@/lib/utils";

export interface ChecklistIngredient {
  id: string;
  quantity: number;
  notes: string | null;
  ingredient: { name: string };
  unit: { abbreviation: string } | null;
}

interface IngredientChecklistProps {
  ingredients: ChecklistIngredient[];
  checked: Set<string>;
  onToggle: (id: string) => void;
  formatQty: (n: number) => string;
}

export function IngredientChecklist({
  ingredients,
  checked,
  onToggle,
  formatQty,
}: IngredientChecklistProps) {
  return (
    <ul className="flex flex-col divide-y divide-steam">
      {ingredients.map((item) => {
        const isChecked = checked.has(item.id);
        const unit = unitLabel(item.unit);
        const quantity =
          item.quantity !== 0 ? `${formatQty(item.quantity)}${unit ? ` ${unit}` : ""}` : "";
        return (
          <li key={item.id}>
            <button
              type="button"
              role="checkbox"
              aria-checked={isChecked}
              onClick={() => onToggle(item.id)}
              className="flex min-h-12 w-full cursor-pointer items-start gap-3 py-3 text-left"
            >
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                  isChecked ? "border-basil bg-basil text-on-basil" : "border-ink/30 bg-card",
                )}
              >
                {isChecked && <Check className="size-4" strokeWidth={3} />}
              </span>
              <span
                className={cn(
                  "w-20 shrink-0 text-right text-base font-semibold tabular-nums text-ink",
                  isChecked && "text-ink/40 line-through",
                )}
              >
                {quantity}
              </span>
              <span className={cn("min-w-0 flex-1 text-base leading-snug text-ink", isChecked && "text-ink/40")}>
                <span className={cn(isChecked && "line-through")}>{item.ingredient.name}</span>
                {item.notes && (
                  <span className="block text-sm text-ink/60">{item.notes}</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
