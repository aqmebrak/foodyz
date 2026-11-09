"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { getRecipeForAdmin } from "@/actions/recipe";
import { Button } from "@/components/ui/button";
import { useRecentRecipes } from "@/hooks/use-recent-recipes";
import {
  clearSheetFilters,
  countVisible,
  filterRecipes,
  hasAnyFilter,
  parseFilters,
  type RecipeFilterState,
  serializeFilters,
} from "@/lib/recipe-filters";

import { RecentRecipes } from "./RecentRecipes";
import { RecipeFilters } from "./RecipeFilters";
import { RecipeRow } from "./RecipeRow";
import { RecipeViewDrawer } from "./RecipeViewDrawer";
import type { Recipe, SelectedRecipe } from "./types";

interface AdminRecipesClientProps {
  recipes: Recipe[];
}

export function AdminRecipesClient({ recipes }: AdminRecipesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<RecipeFilterState>(() => parseFilters(searchParams));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<SelectedRecipe | null>(null);
  const [loadingDrawer, setLoadingDrawer] = useState(false);

  const recentSlugs = useRecentRecipes();

  const uniqueTags = useMemo(
    () => [...new Set(recipes.flatMap((r) => r.tags.map((rt) => rt.tag.name)))].sort(),
    [recipes],
  );
  const filtered = useMemo(() => filterRecipes(recipes, filters), [recipes, filters]);
  const filtersActive = hasAnyFilter(filters);
  const recent = useMemo(
    () =>
      recentSlugs
        .map((slug) => recipes.find((r) => r.slug === slug && r.published))
        .filter((r): r is Recipe => !!r),
    [recentSlugs, recipes],
  );

  // Mirror filters into the URL (debounced), without a server round-trip, so back-navigation restores them.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      const params = new URLSearchParams(serializeFilters(filters));
      const recipe = new URLSearchParams(window.location.search).get("recipe");
      if (recipe) params.set("recipe", recipe);
      const qs = params.toString();
      window.history.replaceState(window.history.state, "", qs ? `${pathname}?${qs}` : pathname);
    }, 300);
    return () => clearTimeout(t);
  }, [filters, pathname]);

  function patchFilters(patch: Partial<RecipeFilterState>) {
    setFilters((f) => ({ ...f, ...patch }));
  }

  function clearSheet() {
    setFilters(clearSheetFilters);
  }

  function clearFilters() {
    setFilters({ q: "", tag: "", diff: "", time: 0, serv: "", drafts: false });
  }

  async function openRecipe(id: string) {
    setSelectedId(id);
    setLoadingDrawer(true);
    const recipe = await getRecipeForAdmin(id);
    setSelectedRecipe(recipe);
    setLoadingDrawer(false);
  }

  // Open the recipe named in the URL (?recipe=<slug>) on desktop, so drawer links are shareable
  useEffect(() => {
    const slug = searchParams.get("recipe");
    if (!slug || !window.matchMedia("(min-width: 768px)").matches) return;
    const match = recipes.find((r) => r.slug === slug);
    if (match) queueMicrotask(() => void openRecipe(match.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function withRecipeParam(slug: string | null) {
    const params = new URLSearchParams(serializeFilters(filters));
    if (slug) params.set("recipe", slug);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  async function handleOpenDrawer(id: string) {
    if (selectedId === id) {
      closeDrawer();
      return;
    }
    const slug = recipes.find((r) => r.id === id)?.slug ?? null;
    router.replace(withRecipeParam(slug), { scroll: false });
    await openRecipe(id);
  }

  function closeDrawer() {
    setSelectedId(null);
    setSelectedRecipe(null);
    router.replace(withRecipeParam(null), { scroll: false });
  }

  const newRecipeButton = (
    <Button asChild className="hidden bg-basil hover:bg-basil/90 md:inline-flex">
      <Link href="/recipes/new">
        <Plus className="mr-1.5 size-4" />
        New recipe
      </Link>
    </Button>
  );

  return (
    <div className="w-full px-4 pb-6 md:p-8">
      <div className="flex items-end justify-between pt-5 md:mb-2 md:pt-0">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Recipes</h1>
          <p className="mt-0.5 text-sm text-ink/60">{countVisible(recipes, filters.drafts)} total</p>
        </div>
        {newRecipeButton}
      </div>

      <RecipeFilters
        filters={filters}
        tags={uniqueTags}
        resultCount={filtered.length}
        onChange={patchFilters}
        onClear={clearSheet}
      />

      {recipes.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-xl font-semibold text-ink">No recipes yet</p>
          <Button asChild className="mt-4 h-12 rounded-full bg-basil px-6 text-base hover:bg-basil/90">
            <Link href="/recipes/new">Create a recipe</Link>
          </Button>
        </div>
      ) : (
        <>
          {!filtersActive && <div className="mt-2"><RecentRecipes recipes={recent} /></div>}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-base text-ink/70">
                {filters.q.trim() ? `No recipes match “${filters.q.trim()}”` : "No recipes match these filters"}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 h-12 rounded-full px-6 text-base"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <ul className="-mx-2 mt-1 grid gap-x-3 gap-y-0.5 md:mx-0 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
              {filtered.map((recipe) => (
                <RecipeRow
                  key={recipe.id}
                  recipe={recipe}
                  selected={selectedId === recipe.id}
                  onOpenDrawer={handleOpenDrawer}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <RecipeViewDrawer
        open={!!selectedId}
        recipe={selectedRecipe}
        loading={loadingDrawer}
        onClose={closeDrawer}
      />
    </div>
  );
}
