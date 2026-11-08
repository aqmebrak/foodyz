"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import {
  legacyKey,
  loadProgress,
  progressKey,
  type RecipeProgress,
  serializeProgress,
} from "@/lib/recipe-progress";

export interface UseRecipeProgress {
  checkedIngredients: Set<string>;
  checkedSteps: Set<number>;
  hasProgress: boolean;
  toggleIngredient: (id: string) => void;
  toggleStep: (index: number) => void;
  setStepDone: (index: number, done: boolean) => void;
  /** Index of the first step not yet done, or null when every step is done. */
  firstUncheckedStep: number | null;
  reset: () => void;
}

// Fallback when localStorage is unavailable or full: progress lasts for the session only.
const memory = new Map<string, RecipeProgress>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function read(slug: string): RecipeProgress {
  const fromMemory = memory.get(slug);
  if (fromMemory) return fromMemory;
  return loadProgress((k) => localStorage.getItem(k), slug, Date.now());
}

function write(slug: string, next: RecipeProgress) {
  const empty = next.ingredients.length === 0 && next.steps.length === 0;
  try {
    if (empty) localStorage.removeItem(progressKey(slug));
    else localStorage.setItem(progressKey(slug), serializeProgress(next, Date.now()));
    localStorage.removeItem(legacyKey(slug)); // legacy steps key is migrated on first write
    memory.delete(slug);
  } catch {
    memory.set(slug, next);
  }
  notify();
}

export function useRecipeProgress(slug: string, stepCount: number): UseRecipeProgress {
  // The snapshot is a normalized string so useSyncExternalStore sees stable values.
  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      const p = read(slug);
      return JSON.stringify([[...p.ingredients], [...p.steps].sort((a, b) => a - b)]);
    },
    () => "[[],[]]",
  );

  const { checkedIngredients, checkedSteps } = useMemo(() => {
    const [ingredients, steps] = JSON.parse(snapshot) as [string[], number[]];
    return { checkedIngredients: new Set(ingredients), checkedSteps: new Set(steps) };
  }, [snapshot]);

  const toggleIngredient = useCallback(
    (id: string) => {
      const cur = read(slug);
      const set = new Set(cur.ingredients);
      if (!set.delete(id)) set.add(id);
      write(slug, { ...cur, ingredients: [...set] });
    },
    [slug],
  );

  const setStepDone = useCallback(
    (index: number, done: boolean) => {
      const cur = read(slug);
      const set = new Set(cur.steps);
      if (done) set.add(index);
      else set.delete(index);
      write(slug, { ...cur, steps: [...set] });
    },
    [slug],
  );

  const toggleStep = useCallback(
    (index: number) => {
      const cur = read(slug);
      setStepDone(index, !cur.steps.includes(index));
    },
    [slug, setStepDone],
  );

  const reset = useCallback(() => write(slug, { ingredients: [], steps: [] }), [slug]);

  const firstUncheckedStep = useMemo(() => {
    for (let i = 0; i < stepCount; i++) if (!checkedSteps.has(i)) return i;
    return null;
  }, [checkedSteps, stepCount]);

  return {
    checkedIngredients,
    checkedSteps,
    hasProgress: checkedIngredients.size > 0 || checkedSteps.size > 0,
    toggleIngredient,
    toggleStep,
    setStepDone,
    firstUncheckedStep,
    reset,
  };
}
