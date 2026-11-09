"use client";

import { useSyncExternalStore } from "react";

import { pushRecent } from "@/lib/recipe-filters";

const KEY = "foodyz:recent-recipes";
const listeners = new Set<() => void>();
const EMPTY: string[] = [];
let cache: { raw: string | null; value: string[] } = { raw: null, value: EMPTY };

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const value = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : EMPTY;
    cache = { raw, value };
    return value;
  } catch {
    return EMPTY;
  }
}

function subscribe(l: () => void) {
  listeners.add(l);
  window.addEventListener("storage", l);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", l);
  };
}

/** Last opened recipe slugs, newest first. */
export function useRecentRecipes(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function recordRecentRecipe(slug: string) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(pushRecent(read(), slug)));
    listeners.forEach((l) => l());
  } catch {
    // storage unavailable — recents are a nicety
  }
}
