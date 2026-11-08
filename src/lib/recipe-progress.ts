export const PROGRESS_TTL_MS = 12 * 60 * 60 * 1000;

export interface RecipeProgress {
  ingredients: string[];
  steps: number[];
}

const EMPTY: RecipeProgress = { ingredients: [], steps: [] };

export function progressKey(slug: string): string {
  return `recipe-progress-${slug}`;
}

export function legacyKey(slug: string): string {
  return `recipe-steps-${slug}`;
}

export function serializeProgress(progress: RecipeProgress, now: number): string {
  return JSON.stringify({
    ingredients: progress.ingredients,
    steps: [...progress.steps].sort((a, b) => a - b),
    updatedAt: now,
  });
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function isNumberArray(v: unknown): v is number[] {
  return Array.isArray(v) && v.every((x) => Number.isInteger(x) && x >= 0);
}

function parseCurrent(raw: string, now: number): RecipeProgress | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown> | null;
    if (!data || typeof data !== "object") return null;
    if (!isStringArray(data.ingredients) || !isNumberArray(data.steps)) return null;
    if (typeof data.updatedAt !== "number") return null;
    if (now - data.updatedAt > PROGRESS_TTL_MS) return null;
    return { ingredients: data.ingredients, steps: data.steps };
  } catch {
    return null;
  }
}

function parseLegacy(raw: string): RecipeProgress | null {
  try {
    const data: unknown = JSON.parse(raw);
    if (!isNumberArray(data)) return null;
    return { ingredients: [], steps: data };
  } catch {
    return null;
  }
}

/** Reads progress via `read`, migrating the legacy steps-only key when needed. */
export function loadProgress(
  read: (key: string) => string | null,
  slug: string,
  now: number,
): RecipeProgress {
  try {
    const current = read(progressKey(slug));
    if (current !== null) return parseCurrent(current, now) ?? EMPTY;
    const legacy = read(legacyKey(slug));
    if (legacy !== null) return parseLegacy(legacy) ?? EMPTY;
  } catch {
    // storage unavailable
  }
  return EMPTY;
}
