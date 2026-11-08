"use client";

import { useCallback, useEffect, useState } from "react";

import { type Draft, parseDraft, serializeDraft } from "@/lib/form-draft";

interface UseFormDraftOptions<T> {
  storageKey: string;
  /** Current form values (only changes should matter; compared by JSON). */
  values: T;
  /** Whether autosave is active (create mode, not submitting). */
  enabled: boolean;
  /** Only write when the form differs from its defaults. */
  dirty: boolean;
  delay?: number;
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Debounced localStorage autosave. Exposes an existing draft found on mount. */
export function useFormDraft<T extends object>({
  storageKey,
  values,
  enabled,
  dirty,
  delay = 800,
}: UseFormDraftOptions<T>) {
  const [pending, setPending] = useState<Draft<T> | null>(null);

  useEffect(() => {
    // Reading localStorage must happen after mount (SSR-safe).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPending(parseDraft<T>(readStorage(storageKey)));
  }, [storageKey]);

  const save = useCallback(
    (v: T) => {
      try {
        window.localStorage.setItem(storageKey, serializeDraft(v, Date.now()));
      } catch {
        /* storage unavailable or full */
      }
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  const serialized = JSON.stringify(values);
  const bannerOpen = pending !== null;

  useEffect(() => {
    if (!enabled || !dirty || bannerOpen) return;
    const t = setTimeout(() => save(JSON.parse(serialized) as T), delay);
    return () => clearTimeout(t);
  }, [serialized, enabled, dirty, bannerOpen, delay, save]);

  const dismiss = useCallback(() => setPending(null), []);

  return { pending, dismiss, save, clear };
}
