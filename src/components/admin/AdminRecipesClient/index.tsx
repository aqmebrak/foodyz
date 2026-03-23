"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getRecipeForAdmin } from "@/actions/recipe";
import type { Ingredient, Tag, Unit } from "@/components/admin/RecipeForm/types";
import { Button } from "@/components/ui/button";
import { cn, normalizeStr } from "@/lib/utils";

import { RecipeEditModal } from "./RecipeEditModal";
import { RecipeEditPanel } from "./RecipeEditPanel";
import { RecipeFilters } from "./RecipeFilters";
import { RecipeTable } from "./RecipeTable";
import type { Recipe, SelectedRecipe } from "./types";

interface AdminRecipesClientProps {
  recipes: Recipe[];
  tags: Tag[];
  ingredients: Ingredient[];
  units: Unit[];
}

export function AdminRecipesClient({ recipes, tags, ingredients, units }: AdminRecipesClientProps) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [maxCookTime, setMaxCookTime] = useState("");
  const [maxServings, setMaxServings] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<SelectedRecipe | null>(null);
  const [loadingPanel, setLoadingPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const uniqueTags = [...new Set(recipes.flatMap((r) => r.tags.map((rt) => rt.tag.name)))].sort();

  const filtered = recipes.filter((r) => {
    if (query.trim() && !normalizeStr(r.title).includes(normalizeStr(query))) return false;
    if (selectedTag && !r.tags.some((rt) => rt.tag.name === selectedTag)) return false;
    if (difficulty && r.difficulty !== difficulty) return false;
    if (status === "published" && !r.published) return false;
    if (status === "draft" && r.published) return false;
    if (maxPrepTime && r.prepTime > Number(maxPrepTime)) return false;
    if (maxCookTime && r.cookTime > Number(maxCookTime)) return false;
    if (maxServings && r.servings > Number(maxServings)) return false;
    return true;
  });

  const hasFilters = !!(query || selectedTag || difficulty || status || maxPrepTime || maxCookTime || maxServings);

  async function handleRowClick(id: string) {
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedRecipe(null);
      return;
    }
    setSelectedId(id);
    setLoadingPanel(true);
    const recipe = await getRecipeForAdmin(id);
    setSelectedRecipe(recipe);
    setLoadingPanel(false);
  }

  function closePanel() {
    setSelectedId(null);
    setSelectedRecipe(null);
  }

  return (
    <div className={cn("p-6 sm:p-8", selectedId ? "flex gap-6 max-w-full" : "max-w-6xl")}>
      {/* Left panel */}
      <div className={cn("min-w-0", selectedId ? "lg:w-125 lg:flex-none lg:border-r lg:pr-6" : "w-full")}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
            <p className="text-sm text-gray-500 mt-0.5">{recipes.length} total</p>
          </div>
          <Button asChild>
            <Link href="/admin/recipes/new">
              <Plus className="w-4 h-4 mr-1.5" />
              New recipe
            </Link>
          </Button>
        </div>

        <RecipeFilters
          query={query}
          selectedTag={selectedTag}
          difficulty={difficulty}
          status={status}
          maxPrepTime={maxPrepTime}
          maxCookTime={maxCookTime}
          maxServings={maxServings}
          uniqueTags={uniqueTags}
          onQueryChange={setQuery}
          onTagChange={setSelectedTag}
          onDifficultyChange={setDifficulty}
          onStatusChange={setStatus}
          onMaxPrepTimeChange={setMaxPrepTime}
          onMaxCookTimeChange={setMaxCookTime}
          onMaxServingsChange={setMaxServings}
        />

        <RecipeTable
          allCount={recipes.length}
          filtered={filtered}
          selectedId={selectedId}
          hasFilters={hasFilters}
          onRowClick={handleRowClick}
        />
      </div>

      {selectedId && !isMobile && (
        <RecipeEditPanel
          recipe={selectedRecipe}
          recipeId={selectedId}
          loading={loadingPanel}
          tags={tags}
          ingredients={ingredients}
          units={units}
          onClose={closePanel}
        />
      )}

      <RecipeEditModal
        open={!!selectedId && isMobile}
        recipe={selectedRecipe}
        recipeId={selectedId}
        loading={loadingPanel}
        tags={tags}
        ingredients={ingredients}
        units={units}
        onClose={closePanel}
      />
    </div>
  );
}
