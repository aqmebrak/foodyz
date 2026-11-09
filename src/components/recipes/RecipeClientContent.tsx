"use client";

import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCookTimers } from "@/hooks/use-cook-timers";
import { recordRecentRecipe } from "@/hooks/use-recent-recipes";
import { useRecipeProgress } from "@/hooks/use-recipe-progress";
import { cn } from "@/lib/utils";

import { CookMode } from "./CookMode";
import { type ChecklistIngredient,IngredientChecklist } from "./IngredientChecklist";
import { ServingsStepper } from "./ServingsStepper";
import { TimerAlarm, TimerBarChip } from "./TimerViews";

interface RecipeClientContentProps {
  ingredients: ChecklistIngredient[];
  steps: string[];
  originalServings: number;
  recipeSlug: string;
}

type Panel = "ingredients" | "steps";

function formatQty(n: number): string {
  return parseFloat(n.toFixed(2)).toString();
}

export function RecipeClientContent({
  ingredients,
  steps,
  originalServings,
  recipeSlug,
}: RecipeClientContentProps) {
  const ingredientIds = useMemo(() => ingredients.map((i) => i.id), [ingredients]);
  const [currentServings, setCurrentServings] = useState(originalServings);
  const [panel, setPanel] = useState<Panel>("ingredients");
  const [cookModeOpen, setCookModeOpen] = useState(false);
  const progress = useRecipeProgress(recipeSlug, steps.length, ingredientIds);
  const timers = useCookTimers();

  useEffect(() => {
    recordRecentRecipe(recipeSlug);
  }, [recipeSlug]);
  const { checkedSteps, firstUncheckedStep } = progress;

  const ratio = currentServings / originalServings;
  const scaledIngredients = ingredients.map((ing) => ({
    ...ing,
    quantity: ing.quantity * ratio,
  }));

  const allDone = steps.length > 0 && firstUncheckedStep === null;
  const tabs: { id: Panel; label: string; count: number }[] = [
    { id: "ingredients", label: "Ingredients", count: ingredients.length },
    { id: "steps", label: "Steps", count: steps.length },
  ];

  const resetButton = (
    <button
      type="button"
      onClick={progress.reset}
      className="min-h-11 text-sm font-medium text-basil underline-offset-4 hover:underline"
    >
      Reset progress
    </button>
  );

  return (
    <>
      {/* Mobile tab switcher */}
      <div
        role="tablist"
        aria-label="Recipe sections"
        className="sticky top-0 z-30 -mx-4 flex gap-1 border-b border-steam bg-enamel/95 px-4 py-2 backdrop-blur md:hidden"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={panel === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setPanel(tab.id)}
            className={cn(
              "h-11 flex-1 rounded-lg text-base font-semibold transition-colors",
              panel === tab.id ? "bg-basil text-on-basil" : "text-ink/70 hover:bg-steam",
            )}
          >
            {tab.label} · {tab.count}
          </button>
        ))}
      </div>

      <div className="mt-5 md:mt-8 md:grid md:grid-cols-[minmax(280px,360px)_1fr] md:gap-12">
        {/* Ingredients */}
        <section
          id="panel-ingredients"
          role="tabpanel"
          aria-labelledby="tab-ingredients"
          className={cn(
            panel === "ingredients" ? "block" : "hidden",
            "md:block md:sticky md:top-6 md:self-start",
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink">Ingredients</h2>
            <ServingsStepper value={currentServings} onChange={setCurrentServings} />
          </div>
          <IngredientChecklist
            ingredients={scaledIngredients}
            checked={progress.checkedIngredients}
            onToggle={progress.toggleIngredient}
            formatQty={formatQty}
          />
          {progress.hasProgress && <div className="mt-2 md:hidden">{resetButton}</div>}
        </section>

        {/* Steps */}
        <section
          id="panel-steps"
          role="tabpanel"
          aria-labelledby="tab-steps"
          className={cn(panel === "steps" ? "block" : "hidden", "md:block")}
        >
          <div className="mb-3 flex min-h-11 items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink">
              Steps
              {checkedSteps.size > 0 && !allDone && (
                <span className="ml-2 text-sm font-normal text-ink/60">
                  {checkedSteps.size}/{steps.length} done
                </span>
              )}
            </h2>
            {progress.hasProgress && resetButton}
          </div>
          <ol className="flex flex-col gap-2">
            {steps.map((step, i) => {
              const isDone = checkedSteps.has(i);
              const isCurrent = i === firstUncheckedStep;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => progress.toggleStep(i)}
                    aria-pressed={isDone}
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "flex min-h-12 w-full cursor-pointer items-start gap-3 rounded-r-xl border-l-4 py-3 pl-3 pr-2 text-left transition-colors",
                      isCurrent ? "border-yolk bg-yolk/10" : "border-transparent",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-on-basil",
                        isDone ? "bg-basil/40" : "bg-basil",
                      )}
                    >
                      {isDone ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                    </span>
                    <p
                      className={cn(
                        "text-[17px] leading-[1.6] text-ink md:text-lg md:leading-[1.6]",
                        isDone && "text-ink/50 line-through",
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
            <p className="mt-6 text-center font-medium text-basil">
              All steps complete! Enjoy your meal.
            </p>
          )}
        </section>
      </div>

      {cookModeOpen && (
        <CookMode
          steps={steps}
          ingredients={scaledIngredients}
          formatQty={formatQty}
          progress={progress}
          timers={timers}
          onClose={() => setCookModeOpen(false)}
        />
      )}

      {/* Sticky start-cooking bar: sits above the mobile tab bar */}
      {steps.length > 0 && (
        <div className="sticky bottom-[var(--tabbar-h)] z-20 -mx-4 mt-6 border-t border-steam bg-enamel/95 px-4 py-3 backdrop-blur md:bottom-0 md:mx-0 md:rounded-t-2xl md:border-x">
          <div className="flex gap-3">
          {!cookModeOpen && (
            <TimerBarChip timers={timers.timers} onOpen={() => setCookModeOpen(true)} />
          )}
          <button
            type="button"
            onClick={() => setCookModeOpen(true)}
            className="flex h-14 min-w-0 flex-1 items-center justify-center rounded-xl bg-basil text-lg font-bold text-on-basil transition-colors hover:bg-basil/90 active:bg-basil/80"
          >
            {checkedSteps.size > 0 && !allDone ? "Resume cooking" : "Start cooking"}
          </button>
          </div>
        </div>
      )}
      <TimerAlarm timers={timers.timers} />
    </>
  );
}
