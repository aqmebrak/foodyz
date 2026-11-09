import { normalizeStr } from "@/lib/utils";

export interface FilterableRecipe {
  slug: string;
  title: string;
  published: boolean;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: Array<{ tag: { name: string } }>;
  ingredients: Array<{ ingredient: { name: string } }>;
}

export const TIME_OPTIONS = [20, 30, 45, 60] as const;
export const SERVINGS_OPTIONS = ["1-2", "3-4", "5+"] as const;
export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export const MAX_RECENT = 5;

export interface RecipeFilterState {
  q: string;
  tag: string;
  diff: string;
  /** Max total minutes; 0 = any. */
  time: number;
  /** One of SERVINGS_OPTIONS or "" = any. */
  serv: string;
  drafts: boolean;
}

export function parseFilters(params: URLSearchParams): RecipeFilterState {
  const diff = params.get("diff") ?? "";
  const time = Number(params.get("time"));
  const serv = params.get("serv") ?? "";
  return {
    q: params.get("q") ?? "",
    tag: params.get("tag") ?? "",
    diff: (DIFFICULTIES as readonly string[]).includes(diff) ? diff : "",
    time: (TIME_OPTIONS as readonly number[]).includes(time) ? time : 0,
    serv: (SERVINGS_OPTIONS as readonly string[]).includes(serv) ? serv : "",
    drafts: params.get("drafts") === "1",
  };
}

export function serializeFilters(f: RecipeFilterState): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q);
  if (f.tag) p.set("tag", f.tag);
  if (f.diff) p.set("diff", f.diff);
  if (f.time) p.set("time", String(f.time));
  if (f.serv) p.set("serv", f.serv);
  if (f.drafts) p.set("drafts", "1");
  return p.toString();
}

/** Active filters inside the Filters sheet (search and tag live outside it). */
export function countActiveFilters(f: RecipeFilterState): number {
  return [f.diff, f.time, f.serv, f.drafts].filter(Boolean).length;
}

/** Resets only what the Filters sheet controls; search text and tag stay. */
export function clearSheetFilters(f: RecipeFilterState): RecipeFilterState {
  return { ...f, diff: "", time: 0, serv: "", drafts: false };
}

/** Recipes visible under the drafts setting, ignoring search/tag/sheet filters. */
export function countVisible(recipes: Array<{ published: boolean }>, drafts: boolean): number {
  return drafts ? recipes.length : recipes.filter((r) => r.published).length;
}

export function hasAnyFilter(f: RecipeFilterState): boolean {
  return !!f.q.trim() || !!f.tag || countActiveFilters(f) > 0;
}

function matchesServings(servings: number, serv: string): boolean {
  if (serv === "1-2") return servings <= 2;
  if (serv === "3-4") return servings >= 3 && servings <= 4;
  if (serv === "5+") return servings >= 5;
  return true;
}

export function filterRecipes<T extends FilterableRecipe>(recipes: T[], f: RecipeFilterState): T[] {
  const q = normalizeStr(f.q.trim());
  return recipes.filter((r) => {
    if (!f.drafts && !r.published) return false;
    if (q) {
      const hit =
        normalizeStr(r.title).includes(q) ||
        r.ingredients.some((i) => normalizeStr(i.ingredient.name).includes(q));
      if (!hit) return false;
    }
    if (f.tag && !r.tags.some((t) => t.tag.name === f.tag)) return false;
    if (f.diff && r.difficulty !== f.diff) return false;
    if (f.time && r.prepTime + r.cookTime > f.time) return false;
    if (!matchesServings(r.servings, f.serv)) return false;
    return true;
  });
}

export function pushRecent(list: string[], slug: string): string[] {
  return [slug, ...list.filter((s) => s !== slug)].slice(0, MAX_RECENT);
}
