"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { getRecipeForAdmin } from "@/actions/recipe";
import type { Ingredient, Tag, Unit } from "@/components/admin/RecipeForm/types";
import { Button } from "@/components/ui/button";
import { normalizeStr } from "@/lib/utils";

import { RecipeFilters } from "./RecipeFilters";
import { RecipeTable } from "./RecipeTable";
import { RecipeViewDrawer } from "./RecipeViewDrawer";
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
  const [loadingDrawer, setLoadingDrawer] = useState(false);

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
    setLoadingDrawer(true);
    const recipe = await getRecipeForAdmin(id);
    setSelectedRecipe(recipe);
    setLoadingDrawer(false);
  }

  function closeDrawer() {
    setSelectedId(null);
    setSelectedRecipe(null);
  }

  return (
    <div className="p-6 sm:p-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{recipes.length} total</p>
        </div>
        <Button asChild>
          <Link href="/recipes/new">
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

      <RecipeViewDrawer
        open={!!selectedId}
        recipe={selectedRecipe}
        recipeId={selectedId}
        loading={loadingDrawer}
        tags={tags}
        ingredients={ingredients}
        units={units}
        onClose={closeDrawer}
      />
    </div>
  );
}
