"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface Ingredient {
  id: string;
  quantity: number;
  notes: string | null;
  ingredient: { name: string };
  unit: { abbreviation: string } | null;
}

interface IngredientChecklistProps {
  ingredients: Ingredient[];
  formatQty?: (n: number) => string;
}

export function IngredientChecklist({ ingredients, formatQty }: IngredientChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const checkedCount = checked.size;

  return (
    <div>
      {checkedCount > 0 && (
        <p className="text-sm text-emerald-600 mb-4 font-medium">
          {checkedCount} of {ingredients.length} checked
        </p>
      )}
      <ul className="space-y-2">
        {ingredients.map((item) => {
          const isChecked = checked.has(item.id);
          const quantity = formatQty
            ? formatQty(item.quantity)
            : parseFloat(item.quantity.toFixed(2)).toString();
          const unitLabel = item.unit ? ` ${item.unit.abbreviation}` : "";
          return (
            <li key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-lg text-left cursor-pointer transition-colors",
                  isChecked
                    ? "bg-emerald-50 text-gray-400"
                    : "hover:bg-gray-50 text-gray-800"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    isChecked
                      ? "bg-emerald-600 border-emerald-600"
                      : "border-gray-300"
                  )}
                >
                  {isChecked && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className={cn(
                    "text-base leading-snug",
                    isChecked && "line-through opacity-60"
                  )}
                >
                  {item.quantity !== 0 && (
                    <><span className="font-semibold">{quantity}{unitLabel}</span>{" "}</>
                  )}
                  {item.ingredient.name}
                  {item.notes && (
                    <span className="text-sm text-gray-400 ml-1">
                      ({item.notes})
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
