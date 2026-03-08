"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { IngredientChecklist } from "./IngredientChecklist";

interface Ingredient {
  id: string;
  quantity: number;
  notes: string | null;
  ingredient: { name: string };
  unit: { abbreviation: string } | null;
}

interface RecipeClientContentProps {
  ingredients: Ingredient[];
  steps: string[];
  originalServings: number;
  recipeSlug: string;
}

function formatQty(n: number): string {
  return parseFloat(n.toFixed(2)).toString();
}

export function RecipeClientContent({
  ingredients,
  steps,
  originalServings,
  recipeSlug,
}: RecipeClientContentProps) {
  const [currentServings, setCurrentServings] = useState(originalServings);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  const storageKey = `recipe-steps-${recipeSlug}`;

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setCheckedSteps(new Set(JSON.parse(stored) as number[]));
    } catch {
      // ignore
    }
  }, [storageKey]);

  function toggleStep(index: number) {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  }

  const ratio = currentServings / originalServings;
  const scaledIngredients = ingredients.map((ing) => ({
    ...ing,
    quantity: ing.quantity * ratio,
  }));

  const allDone = mounted && steps.length > 0 && checkedSteps.size === steps.length;

  return (
    <>
      {/* Ingredients */}
      <section id="ingredients" className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Ingredients
            <span className="ml-2 text-sm font-normal text-gray-400">
              for {currentServings} serving{currentServings !== 1 ? "s" : ""}
            </span>
          </h2>

          {/* Servings control */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentServings((s) => Math.max(1, s - 1))}
              disabled={currentServings <= 1}
              aria-label="Decrease servings"
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-gray-900 tabular-nums">
              {currentServings}
            </span>
            <button
              type="button"
              onClick={() => setCurrentServings((s) => s + 1)}
              aria-label="Increase servings"
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <IngredientChecklist ingredients={scaledIngredients} formatQty={formatQty} />
      </section>

      <hr className="border-gray-100 mb-10" />

      {/* Instructions */}
      <section id="instructions">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Instructions
          {mounted && checkedSteps.size > 0 && !allDone && (
            <span className="ml-2 text-sm font-normal text-emerald-600">
              {checkedSteps.size}/{steps.length} done
            </span>
          )}
        </h2>
        <ol className="space-y-3">
          {steps.map((step, i) => {
            const isDone = mounted && checkedSteps.has(i);
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => toggleStep(i)}
                  className={cn(
                    "w-full flex gap-4 text-left rounded-xl px-3 py-3 cursor-pointer transition-colors",
                    isDone ? "opacity-50" : "hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "shrink-0 w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center mt-0.5 transition-colors",
                      isDone ? "bg-emerald-300" : "bg-emerald-600"
                    )}
                  >
                    {isDone ? (
                      <svg className="w-4 h-4" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <p
                    className={cn(
                      "text-gray-800 text-base leading-relaxed pt-1",
                      isDone && "line-through text-gray-400"
                    )}
                  >
                    {step}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
        {allDone && (
          <p className="mt-6 text-center text-emerald-600 font-medium">
            All steps complete! Enjoy your meal.
          </p>
        )}
      </section>
    </>
  );
}
